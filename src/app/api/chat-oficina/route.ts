import { NextRequest, NextResponse } from "next/server"
import { TTLMap } from "@/lib/ttl-map"
import { prisma } from "@/lib/prisma"
import { checkEmpresaModule } from "@/lib/usedata"
import { getSetores } from "@/lib/setores"

const FlowState = {
  INICIO: "inicio",
  IDENTIFICACAO_MATRICULA: "identificacao_matricula",
  COLETAR_FUNCAO: "coletar_funcao",
  COLETAR_ONIBUS: "coletar_onibus",
  COLETAR_DEFEITO: "coletar_defeito",
  PERGUNTAR_ANEXO: "perguntar_anexo",
  COLETAR_MIDIA: "coletar_midia",
  CONFIRMAR: "confirmar",
  COLETAR_SETOR: "coletar_setor",
} as const

type Session = {
  state: string
  nome?: string
  matricula?: string
  funcao?: string
  numeroOnibus?: string
  data?: string
  defeito?: string
  empresaId?: string
  anexoUrl?: string
  lastInteraction: number
}

const sessions = new TTLMap<string, Session>(120 * 60 * 1000)

// Busca avisos especificos para a matricula do usuario
async function buscarAvisosEspecificos(empresaId: string, matricula: string): Promise<string> {
  try {
    const avisos = await prisma.avisos.findMany({
      where: { empresaId },
      orderBy: { createdAt: "desc" },
    })

    if (avisos.length === 0) return ""

    const agora = new Date()
    const relevantes: string[] = []
    const matLower = matricula.toLowerCase()

    for (const aviso of avisos) {
      if (aviso.duracao) {
        const dias = Number(aviso.duracao)
        if (!isNaN(dias)) {
          const expiracao = new Date(aviso.createdAt)
          expiracao.setDate(expiracao.getDate() + dias)
          if (agora > expiracao) continue
        }
      }

      const titulo = aviso.titulo.toLowerCase()
      const conteudo = aviso.conteudo.toLowerCase()

      if (titulo.includes(matLower) || conteudo.includes(matLower)) {
        relevantes.push(`📢 *${aviso.titulo}*: ${aviso.conteudo}`)
      }
    }

    return relevantes.length > 0 ? relevantes.join("\n\n") : ""
  } catch {
    return ""
  }
}

// Busca avisos relacionados ao veiculo informado
async function buscarAvisosDoVeiculo(empresaId: string, numeroOnibus: string): Promise<string> {
  try {
    const avisos = await prisma.avisos.findMany({
      where: { empresaId },
      orderBy: { createdAt: "desc" },
    })

    if (avisos.length === 0) return ""

    const agora = new Date()
    const relevantes: string[] = []
    const onibusLower = numeroOnibus.toLowerCase()

    for (const aviso of avisos) {
      if (aviso.duracao) {
        const dias = Number(aviso.duracao)
        if (!isNaN(dias)) {
          const expiracao = new Date(aviso.createdAt)
          expiracao.setDate(expiracao.getDate() + dias)
          if (agora > expiracao) continue
        }
      }

      const titulo = aviso.titulo.toLowerCase()
      const conteudo = aviso.conteudo.toLowerCase()

      if (titulo.includes(onibusLower) || conteudo.includes(onibusLower)) {
        relevantes.push(`📢 *${aviso.titulo}*: ${aviso.conteudo}`)
      }
    }

    return relevantes.length > 0 ? relevantes.join("\n\n") : ""
  } catch {
    return ""
  }
}

// Monta o resumo formatado do registro de defeito
function montarResumo(session: Session): string {
  let resumo =
    `*Resumo do Registro:*\n\n` +
    `👤 Nome: ${session.nome}\n` +
    `🔢 Matrícula: ${session.matricula}\n` +
    `📋 Função: ${session.funcao}\n` +
    `🚌 Ônibus: ${session.numeroOnibus}\n` +
    `📅 Data: ${session.data}\n` +
    `🔧 Defeito: ${session.defeito}\n`

  if (session.anexoUrl) {
    resumo += `📎 Foto anexada: ✅\n`
  }

  resumo += `\nOs dados estão corretos? (sim/não)`
  return resumo
}

// Manipula o fluxo de atendimento da oficina
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

    // Envia resposta e atualiza a sessao
    async function reply(text: string) {
      sessions.set(sid, session!)
      return NextResponse.json({ reply: text, sessionId: sid })
    }

    const hasMedia = !!fileUrl

    switch (session.state) {
      case FlowState.INICIO: {
        session.state = FlowState.IDENTIFICACAO_MATRICULA
        return reply(" - Registro de Defeito*\n\nBem-vindo! Para começar, digite sua *matrícula* (apenas números).")
      }

      case FlowState.IDENTIFICACAO_MATRICULA: {
        const matricula = userInput.replace(/\D/g, "")
        if (!matricula) return reply("Digite sua matrícula com apenas números.")

        const registro = await prisma.cpfs.findFirst({ where: { cpf: matricula } })
        if (!registro) return reply("Matrícula não encontrada. Verifique e tente novamente.")

        session.matricula = matricula
        session.nome = registro.nome
        session.empresaId = registro.empresaId

        if (session.empresaId) {
          const { hasModule, activeModules } = await checkEmpresaModule(session.empresaId, "OFICINA")
          if (!hasModule) {
            const modulosMsg = activeModules.length > 0
              ? `Sua empresa possui o(s) módulo(s): ${activeModules.join(", ")}.`
              : "Sua empresa não possui módulos de atendimento ativos."
            sessions.delete(sid)
            return reply(`Olá, ${registro.nome}! Sua matrícula foi encontrada ✅, mas sua empresa não possui o módulo *Operacional* ativo.\n\n${modulosMsg}\n\nPor favor, utilize o canal de atendimento correto para o módulo desejado. Se precisar de ajuda, entre em contato com a administração da sua empresa.`)
          }
        }

        let msg = `Olá, *${registro.nome}!* 😊`

        const avisosEspecificos = session.empresaId
          ? await buscarAvisosEspecificos(session.empresaId, matricula)
          : ""

        if (avisosEspecificos) {
          msg += `\n\n*📢 Aviso importante para você:*\n\n${avisosEspecificos}`
        }

        msg += `\n\nQual a sua *função*? `
        session.state = FlowState.COLETAR_FUNCAO
        return reply(msg)
      }

      case FlowState.COLETAR_FUNCAO: {
        session.funcao = userInput
        session.state = FlowState.COLETAR_ONIBUS
        return reply("Qual a identificação do veículo?")
      }

      case FlowState.COLETAR_ONIBUS: {
        session.numeroOnibus = userInput
        session.data = new Date().toLocaleDateString("pt-BR", {
          timeZone: "America/Sao_Paulo",
        })

        let msg = "Descreva o *defeito* encontrado no veículo com detalhes:"

        const avisosVeiculo = session.empresaId
          ? await buscarAvisosDoVeiculo(session.empresaId, userInput)
          : ""

        if (avisosVeiculo) {
          msg = `*📢 Aviso referente a este veículo:*\n\n${avisosVeiculo}\n\n---\n\n` + msg
        }

        session.state = FlowState.COLETAR_DEFEITO
        return reply(msg)
      }

      case FlowState.COLETAR_DEFEITO: {
        if (hasMedia) {
          session.anexoUrl = fileUrl
          if (session.defeito) {
            return reply(montarResumo(session))
          } else {
            return reply("Recebi! Agora me conte qual é o *defeito* para eu registrar.")
          }
        }

        session.defeito = userInput
        if (!session.defeito) {
          return reply("Descreva o *defeito* encontrado no veículo com detalhes:")
        }

        session.state = FlowState.PERGUNTAR_ANEXO
        return reply("Deseja enviar uma *foto* do problema? (sim/não)")
      }

      case FlowState.PERGUNTAR_ANEXO: {
        if (hasMedia) {
          session.anexoUrl = fileUrl
          session.state = FlowState.CONFIRMAR
          return reply(montarResumo(session))
        }

        if (["sim", "s", "quero", "ok"].some(v => lowerInput.includes(v))) {
          session.state = FlowState.COLETAR_MIDIA
          return reply("Pode enviar a *foto* aqui mesmo! 📎")
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

        return reply("Pode enviar a *foto* por aqui mesmo! 📎\n\nSe não quiser, digite *não*.")
      }

      case FlowState.CONFIRMAR: {
        if (hasMedia) {
          session.anexoUrl = fileUrl
          return reply("Os dados estão corretos? (sim/não)")
        }

        if (["sim", "s", "confirmar", "correto"].some(v => lowerInput.includes(v))) {
          const setores = await getSetores(session.matricula || "")
          if (setores.length === 0) {
            return reply("Nenhum setor disponível para encaminhamento. Entre em contato com a administração.")
          }
          session.state = FlowState.COLETAR_SETOR
          return reply(`Pra qual *setor* devo encaminhar?\n\n📍 *Setores disponíveis:* ${setores.join(", ")}`)
        }

        session.anexoUrl = undefined
        session.state = FlowState.IDENTIFICACAO_MATRICULA
        return reply("Tudo bem! Vamos recomeçar. Digite sua matrícula:")
      }

      case FlowState.COLETAR_SETOR: {
        const setores = await getSetores(session.matricula || "")
        const setor = setores.find(s => {
          const nomeSetor = s.toLowerCase()
          return nomeSetor.includes(lowerInput) || lowerInput.includes(nomeSetor)
        })

        if (setor) {
          const descricao = JSON.stringify({
            funcao: session.funcao,
            numeroOnibus: session.numeroOnibus,
            data: session.data,
            defeito: session.defeito,
          })

          const ticket = `TKT-${Date.now()}`

          try {
            await prisma.chamado.create({
              data: {
                ticket,
                nome: session.nome || "",
                cpf: session.matricula || "",
                setor,
                descricao,
                prioridade: "normal",
                empresaId: session.empresaId || "",
                anexoUrl: session.anexoUrl || null,
              },
            })

            let msg = `✅ *Registro concluído!*\n\nSeu chamado *${ticket}* foi criado e encaminhado para *${setor}*.`
            if (session.anexoUrl) {
              msg += `\n📎 A foto foi anexada automaticamente.`
            }
            msg += `\n\nNossa equipe vai analisar o mais breve possível.\n\nObrigado pelo relato! 🚌`

            sessions.delete(sid)
            return NextResponse.json({ reply: msg, sessionId: sid, done: true })
          } catch {
            sessions.delete(sid)
            return NextResponse.json({ reply: "Ops, tive um problema ao registrar. Nossa equipe foi notificada. Tente novamente mais tarde.", sessionId: sid, done: true })
          }
        }

        return reply(`Não encontrei esse setor. Os disponíveis são: ${setores.join(", ")}. Qual deles atende seu caso?`)
      }

      default:
        return reply("Não entendi. Pode repetir?")
    }
  } catch (error) {
    console.error("Erro no chat-oficina:", error)
    return NextResponse.json({ reply: "Ocorreu um erro. Tente novamente." })
  }
}
