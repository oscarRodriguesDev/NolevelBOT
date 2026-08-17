import { NextRequest, NextResponse } from "next/server"
import { TTLMap } from "@/lib/ttl-map"
import { prisma } from "@/lib/prisma"
import { checkEmpresaModule, buscarAvisosPorCpf, buscarAvisos } from "@/lib/usedata"
import { analisarAvisoPorMotivo } from "@/lib/analisar-aviso"
import { getSetores } from "@/lib/setores"

const FlowState = {
  INICIO: "inicio",
  IDENTIFICACAO_CPF: "identificacao_cpf",
  COLETAR_DESCRICAO: "coletar_descricao",
  CONFIRMAR_AVISO: "confirmar_aviso",
  PERGUNTAR_ANEXO: "perguntar_anexo",
  COLETAR_MIDIA: "coletar_midia",
  CONFIRMAR: "confirmar",
  COLETAR_SETOR: "coletar_setor",
} as const

type Session = {
  state: string
  nome?: string
  cpf?: string
  descricao?: string
  empresaId?: string
  anexoUrl?: string
  lastInteraction: number
}

const sessions = new TTLMap<string, Session>(120 * 60 * 1000)

// Monta o resumo formatado do chamado para confirmacao
function montarResumo(session: Session): string {
  let resumo =
    `*Resumo do Registro:*\n\n` +
    `👤 Nome: ${session.nome}\n` +
    `🔢 CPF: ${session.cpf}\n` +
    `📝 Motivo: ${session.descricao}\n`

  if (session.anexoUrl) {
    resumo += `📎 Anexo: ✅\n`
  }

  resumo += `\nOs dados estão corretos? (sim/não)`
  return resumo
}

// Manipula o fluxo de atendimento corporativo
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, sessionId, fileUrl } = body
    const userInput = (message || "").trim()
    const lowerInput = userInput.toLowerCase()
    const sid = sessionId || "anon"

    let session = sessions.get(sid)
    if (!session) {
      session = { state: FlowState.INICIO, lastInteraction: Date.now() }
      sessions.set(sid, session)
    }

    if (["sair", "encerrar", "cancelar"].includes(lowerInput)) {
      sessions.delete(sid)
      return NextResponse.json({ reply: "Atendimento encerrado. Quando precisar, é só voltar!", sessionId: sid })
    }

    const hasMedia = !!fileUrl

    // Envia resposta e atualiza a sessao
    async function reply(text: string) {
      sessions.set(sid, session!)
      return NextResponse.json({ reply: text, sessionId: sid })
    }

    switch (session.state) {
      case FlowState.INICIO: {
        session.state = FlowState.IDENTIFICACAO_CPF
        return reply("💼 *Atendimento Corporativo*\n\nBem-vindo! Para começar, digite seu *CPF* (apenas números).")
      }

      case FlowState.IDENTIFICACAO_CPF: {
        const cpf = userInput.replace(/\D/g, "")
        if (!cpf || cpf.length < 11) {
          return reply("Digite um CPF válido com 11 dígitos (apenas números).")
        }

        const registro = await prisma.cpfs.findFirst({ where: { cpf } })
        if (!registro) {
          return reply("CPF não encontrado. Verifique e tente novamente.")
        }

        session.cpf = cpf
        session.nome = registro.nome
        session.empresaId = registro.empresaId

        if (session.empresaId) {
          const { hasModule, activeModules } = await checkEmpresaModule(session.empresaId, "CORPORATIVO")
          if (!hasModule) {
            const modulosMsg = activeModules.length > 0
              ? `Sua empresa possui o(s) módulo(s): ${activeModules.join(", ")}.`
              : "Sua empresa não possui módulos de atendimento ativos."
            sessions.delete(sid)
            return NextResponse.json({
              reply: `Olá, ${registro.nome}! Seu CPF foi encontrado ✅, mas sua empresa não possui o módulo *CORPORATIVO* ativo.\n\n${modulosMsg}\n\nPor favor, utilize o canal de atendimento correto para o módulo desejado. Se precisar de ajuda, entre em contato com a administração da sua empresa.`,
              sessionId: sid, done: true,
            })
          }
        }

        session.state = FlowState.COLETAR_DESCRICAO

        let msg = `Olá, *${registro.nome}!* 😊`

        const avisosEspecificos = await buscarAvisosPorCpf(cpf)

        if (avisosEspecificos && !avisosEspecificos.includes("Sem avisos")) {
          msg += `\n\n*📢 Aviso importante para você:*\n\n${avisosEspecificos}`
        }

        msg += `\n\nDescreva o *motivo* do seu contato com detalhes:`
        return reply(msg)
      }

      case FlowState.COLETAR_DESCRICAO: {
        if (hasMedia) {
          session.anexoUrl = fileUrl
          if (session.descricao) {
            return reply(montarResumo(session))
          }
          return reply("Recebi! Agora me conte qual é o *motivo* do seu contato.")
        }

        session.descricao = userInput
        if (!session.descricao) {
          return reply("Descreva o *motivo* do seu contato com detalhes:")
        }

        // Analisa os avisos para ver se ha algo relacionado ao motivo relatado
        const avisosGeral = await buscarAvisos(session.cpf)
        const avisosEspecificos = await buscarAvisosPorCpf(session.cpf || "")

        const avisosDisponiveis = [
          avisosGeral.includes("Sem avisos") ? "" : avisosGeral,
          avisosEspecificos.includes("Sem avisos") ? "" : avisosEspecificos,
        ].filter(Boolean).join("\n\n")

        if (avisosDisponiveis) {
          const analise = await analisarAvisoPorMotivo(session.descricao, avisosDisponiveis)

          if (analise.corresponde && analise.mensagem) {
            session.state = FlowState.CONFIRMAR_AVISO
            return reply(
              `*📢 Encontrei um aviso relacionado ao seu problema:*\n\n${analise.mensagem}\n\nSe for só isso, você pode *encerrar* o atendimento. Se mesmo assim quiser abrir um chamado, é só me avisar (digite *abrir chamado*).`
            )
          }
        }

        session.state = FlowState.PERGUNTAR_ANEXO
        return reply("Deseja enviar um *anexo* (foto, documento)? (sim/não)")
      }

      case FlowState.CONFIRMAR_AVISO: {
        if (hasMedia) {
          session.anexoUrl = fileUrl
          return reply("Recebi! Se quiser abrir o chamado mesmo assim, é só confirmar (*abrir chamado*).")
        }

        const querAbrir = [
          "abrir", "quero abrir", "sim", "s", "quero", "continuar", "mesmo assim",
          "abrir chamado", "abrir mesmo", "vou querer", "quero o chamado",
        ].some(v => lowerInput.includes(v))

        if (querAbrir) {
          session.state = FlowState.PERGUNTAR_ANEXO
          return reply("Deseja enviar um *anexo* (foto, documento)? (sim/não)")
        }

        if (["sair", "encerrar", "não", "nao", "so isso", "só isso", "obrigado", "era isso", "não quero", "nao quero"].some(v => lowerInput.includes(v))) {
          sessions.delete(sid)
          return NextResponse.json({ reply: "Sem problemas! Se precisar de algo, estou por aqui. Até mais! 👋", sessionId: sid, done: true })
        }

        return reply("Entendi. Se for só isso, pode digitar *sair*. Se quiser abrir o chamado, digite *abrir chamado*.")
      }

      case FlowState.PERGUNTAR_ANEXO: {
        if (hasMedia) {
          session.anexoUrl = fileUrl
          session.state = FlowState.CONFIRMAR
          return reply(montarResumo(session))
        }

        if (["sim", "s", "quero", "ok"].some(v => lowerInput.includes(v))) {
          session.state = FlowState.COLETAR_MIDIA
          return reply("Pode enviar o *arquivo* aqui mesmo! 📎")
        }

        session.state = FlowState.CONFIRMAR
        return reply(montarResumo(session))
      }

      case FlowState.COLETAR_MIDIA: {
        if (hasMedia) {
          session.anexoUrl = fileUrl
          session.state = FlowState.CONFIRMAR
          return reply(montarResumo(session))
        }

        if (["não", "nao", "n", "sem foto", "sem arquivo"].some(v => lowerInput.includes(v))) {
          session.state = FlowState.CONFIRMAR
          return reply(montarResumo(session))
        }

        return reply("Pode enviar o *arquivo* por aqui mesmo! 📎\n\nSe não quiser, digite *não*.")
      }

      case FlowState.CONFIRMAR: {
        if (hasMedia) {
          session.anexoUrl = fileUrl
          return reply("Os dados estão corretos? (sim/não)")
        }

        if (["sim", "s", "confirmar", "correto"].some(v => lowerInput.includes(v))) {
          const setores = await getSetores(session.cpf || "")
          if (setores.length === 0) {
            return reply("Nenhum setor disponível para encaminhamento. Entre em contato com a administração.")
          }
          session.state = FlowState.COLETAR_SETOR
          return reply(`Pra qual *setor* devo encaminhar?\n\n📍 *Setores disponíveis:* ${setores.join(", ")}`)
        }

        session.anexoUrl = undefined
        session.state = FlowState.IDENTIFICACAO_CPF
        return reply("Tudo bem! Vamos recomeçar. Digite seu CPF:")
      }

      case FlowState.COLETAR_SETOR: {
        const setores = await getSetores(session.cpf || "")
        const setor = setores.find(s => {
          const nomeSetor = s.toLowerCase()
          return nomeSetor.includes(lowerInput) || lowerInput.includes(nomeSetor)
        })

        if (setor) {
          const ticket = `TKT-${Date.now()}`

          try {
            await prisma.chamado.create({
              data: {
                ticket,
                nome: session.nome || "",
                cpf: session.cpf || "",
                setor,
                descricao: session.descricao || "",
                prioridade: "normal",
                empresaId: session.empresaId || "",
                anexoUrl: session.anexoUrl || null,
              },
            })

            let msg = `✅ *Registro concluído!*\n\nSeu chamado *${ticket}* foi criado e encaminhado para *${setor}*.`
            if (session.anexoUrl) {
              msg += `\n📎 O anexo foi salvo automaticamente.`
            }
            msg += `\n\nNossa equipe vai analisar o mais breve possível.\n\nObrigado pelo contato! 💼`

            sessions.delete(sid)
            return NextResponse.json({ reply: msg, sessionId: sid, done: true, ticket })
          } catch {
            sessions.delete(sid)
            return NextResponse.json({ reply: "Ops, tive um problema ao registrar. Nossa equipe foi notificada. Tente novamente mais tarde.", sessionId: sid, done: true, error: true })
          }
        }

        return reply(`Não encontrei esse setor. Os disponíveis são: ${setores.join(", ")}. Qual deles atende seu caso?`)
      }

      default:
        return reply("Não entendi. Pode repetir?")
    }
  } catch (error) {
    console.error("Erro no chat-corporativo:", error)
    return NextResponse.json({ reply: "Ocorreu um erro. Tente novamente." })
  }
}
