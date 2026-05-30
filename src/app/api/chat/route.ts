import { Chamado } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { getSetores } from "@/lib/setores"
import { botIA } from "@/lib/useIA"
import { validarCpf, StatusChamado, enviarChamado, buscarAvisos, generateRandomTicket } from "@/lib/usedata"

const BOT_NAME = process.env.BOT_NAME || "Hevelyn"

const menuString = "1. Abrir Chamado, 2. Consultar Chamado"

const statusLabels: Record<string, string> = {
  novo: "📌 Novo",
  aberto: "📂 Aberto",
  em_atendimento: "🔄 Em Atendimento",
  aguardando: "⏳ Aguardando",
  concluido: "✅ Concluído",
  fechado: "🔒 Fechado",
  NOVO: "📌 Novo",
  EM_ANDAMENTO: "🔄 Em Andamento",
  FECHADO: "🔒 Fechado",
}

type FlowState = "inicio" | "identificacao_cpf" | "identificacao_nome" | "menu_principal" | "coletar_motivo" | "verificar_aviso" | "coletar_setor"

type UserSession = {
  state: FlowState
  nome?: string
  cpf?: string
  resumoHistorico?: string
  motivoAtual?: string
  lastInteraction: number
}

const sessions = new Map<string, UserSession>()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const userInput = body.message?.trim() || ""
    const sessionId = body.sessionId || "web-user"
    const lowerInput = userInput.toLowerCase()

    let session = sessions.get(sessionId)
    if (!session || (Date.now() - session.lastInteraction > 1000 * 60 * 60 * 2)) {
      session = { state: "inicio", lastInteraction: Date.now() }
      sessions.set(sessionId, session)
    }
    session.lastInteraction = Date.now()

    let avisos = "Sem avisos no momento."
    if (session.cpf) {
      avisos = await buscarAvisos(session.cpf, req)
    }

    if (["sair", "encerrar", "cancelar"].includes(lowerInput)) {
      sessions.delete(sessionId)
      return NextResponse.json({ reply: "Atendimento encerrado. Se precisar de novo, é só chamar!" })
    }

    switch (session.state) {
      case "inicio": {
        const resp = await botIA(
          session,
          userInput,
          "O usuário acabou de chegar. Dê as boas-vindas e peça OBRIGATORIAMENTE o CPF para começar o atendimento.",
          avisos,
          BOT_NAME
        )
        session.state = "identificacao_cpf"
        return NextResponse.json({ reply: resp })
      }

      case "identificacao_cpf": {
        const cleanCPF = userInput.replace(/\D/g, "")
        if (cleanCPF.length !== 11) {
          return NextResponse.json({ reply: "Por favor, informe um CPF válido (apenas os 11 números)." })
        }

        const resCpf = await validarCpf(cleanCPF)
        if (resCpf && resCpf.valido) {
          session.cpf = cleanCPF
          session.nome = resCpf.nome

          avisos = await buscarAvisos(cleanCPF, req)

          const instrucao = session.nome
            ? `CPF ${cleanCPF} validado. O nome dele é ${session.nome}. Saude-o e apresente as opções: ${menuString}`
            : `CPF ${cleanCPF} encontrado. Pergunte como o usuário gostaria de ser chamado.`

          const resposta = await botIA(session, userInput, instrucao, avisos, BOT_NAME)
          session.state = session.nome ? "menu_principal" : "identificacao_nome"
          return NextResponse.json({ reply: resposta })
        } else {
          return NextResponse.json({ reply: "Hum, não consegui validar esse CPF! Por favor, tente novamente." })
        }
      }

      case "identificacao_nome": {
        session.nome = userInput
        const resposta = await botIA(
          session,
          userInput,
          `Agora que já sabe o nome (${userInput}), apresente o menu: ${menuString}`,
          avisos,
          BOT_NAME
        )
        session.state = "menu_principal"
        return NextResponse.json({ reply: resposta })
      }

      case "menu_principal": {
        if (["1", "abrir", "chamado"].some(v => lowerInput.includes(v))) {
          session.state = "coletar_motivo"
          return NextResponse.json({ reply: "Com certeza! Me conta o que está acontecendo? (Pode descrever o problema detalhadamente)" })
        }

        if (["2", "status", "consultar", "ver"].some(v => lowerInput.includes(v))) {
          const chamados = await StatusChamado(session.cpf || "")
          const lista = chamados.length > 0
            ? chamados.map((t: any) => {
                const label = statusLabels[t.status] || t.status
                const atendente = t.atendente?.name ? `🧑‍💻 *Atendente:* ${t.atendente.name}` : ''
                const dataCriacao = new Date(t.createdAt).toLocaleDateString('pt-BR')
                const descricao = t.descricao ? `📄 *Descrição:* ${t.descricao.substring(0, 100)}${t.descricao.length > 100 ? '...' : ''}` : ''
                const ultimoHistorico = t.historico ? (() => {
                  try {
                    const h = JSON.parse(t.historico)
                    return h.length > 0 ? `📋 *Última ação:* ${statusLabels[h[h.length - 1].acao] || h[h.length - 1].acao}${h[h.length - 1].observacao ? ` — ${h[h.length - 1].observacao}` : ''}` : ''
                  } catch { return '' }
                })() : ''

                return [
                  `🎫 *${t.ticket}* — ${label}`,
                  `📅 *Abertura:* ${dataCriacao}`,
                  `📍 *Setor:* ${t.setor}`,
                  atendente,
                  ultimoHistorico,
                  descricao,
                ].filter(Boolean).join('\n')
              }).join('\n\n━━━━━━━━━━━━━━━━\n\n')
            : "Não encontrei chamados abertos no seu CPF."

          return NextResponse.json({ reply: `📋 *SEUS CHAMADOS*\n\n${lista}\n\nPosso ajudar com algo mais?\n\n${menuString}` })
        }

        const resposta = await botIA(
          session,
          userInput,
          `Tente identificar o que ele quer, caso não consiga encerre amigavelmente. Não faça suposições, apenas encerre o atendimento.`,
          avisos,
          BOT_NAME
        )
        return NextResponse.json({ reply: resposta })
      }

      case "coletar_motivo": {
        session.motivoAtual = userInput

        // Se o motivo envolve envio de documentos, redireciona para o portal
        const palavrasDocumento = ["foto", "fotos", "comprovante", "comprovantes", "documento", "documentos", "anexo", "anexos", "pdf", "imagem", "imagens", "print",
           "printar", "scan", "scanner", "digitalizar", "doc", "docs","arquivo", "arquivos", "enviar", "subir", "upload","atestatado", 
           "atestados", "laudo", "laudos", "receita", "receitas","printscreen", "print screens", "printscreens", "foto do problema", 
           "fotos do problema", "comprovante do problema", "comprovantes do problema", "documento do problema", "documentos do problema", 
           "anexo do problema", "anexos do problema"];
        if (palavrasDocumento.some(p => userInput.toLowerCase().includes(p))) {
          const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
          session.state = "menu_principal"
          return NextResponse.json({
            reply: `Para este tipo de serviço, você precisa abrir um chamado pelo nosso portal para anexar os documentos necessários. Acesse: ${baseUrl}/chamado e preencha o formulário com a descrição do problema e os arquivos.`
          })
        }

        if (!avisos || avisos.includes("Sem avisos")) {
          const setores = await getSetores(session.cpf || '')
          session.state = "coletar_setor"
          return NextResponse.json({
            reply: `Entendido. Para qual setor devo enviar?\n\n📍 *Setores:* ${setores.join(", ")}`
          })
        }

        const analiseIA = await botIA(
          session,
          userInput,
          "INSTRUÇÃO: Verifique se o problema relatado bate com os 'Avisos' do sistema. Se bater, explique o aviso e pergunte se quer abrir o chamado mesmo assim. Se NÃO bater, responda apenas: PROSSEGUIR_FLUXO.",
          avisos,
          BOT_NAME
        )

        if (analiseIA.includes("PROSSEGUIR_FLUXO")) {
          const setores = await getSetores(session.cpf || '')
          session.state = "coletar_setor"
          return NextResponse.json({
            reply: `Entendido. Para qual setor devo enviar?\n\n📍 *Setores:* ${setores.join(", ")}`
          })
        } else {
          session.state = "verificar_aviso"
          return NextResponse.json({ reply: analiseIA })
        }
      }

      case "verificar_aviso": {
        if (["1", "sim", "quero", "continuar", "prosseguir"].some(v => lowerInput.includes(v))) {
          const setores = await getSetores(session.cpf || '')
          session.state = "coletar_setor"
          return NextResponse.json({
            reply: `Perfeito, vou dar seguimento. Para qual setor deseja enviar?\n\n📍 *Setores:* ${setores.join(", ")}`
          })
        } else {
          session.state = "menu_principal"
          return NextResponse.json({
            reply: `Sem problemas! Se precisar de outra coisa, é só escolher uma opção do menu.\n\n${menuString}`
          })
        }
      }

      case "coletar_setor": {
        const setores = await getSetores(session.cpf || "")
        const input = lowerInput.trim()
        const setor = setores.find(s => {
          const nomeSetor = s.toLowerCase()
          return nomeSetor.includes(input) || input.includes(nomeSetor)
        })

        if (!setor) {
          return NextResponse.json({
            reply: `Não reconheci esse setor. Por favor, escolha um destes: ${setores.join(", ")}`
          })
        }

        const ok = await enviarChamado(session.nome || "Usuário", session.cpf || "", setor, session.motivoAtual || "")

        if (ok) {
          session.state = "menu_principal"
          return NextResponse.json({
            reply: `✅ Tudo pronto! Seu chamado para *${setor}* foi registrado.\n\nDeseja tratar de mais algum assunto?\n\n${menuString}`
          })
        } else {
          const ticketErr = generateRandomTicket()
          return NextResponse.json({
            reply: `O sistema de registro automático oscilou, mas seu protocolo é *${ticketErr}*. Nossa equipe já está ciente.`
          })
        }
      }
    }

    return NextResponse.json({ reply: "Desculpe, ocorreu um erro no fluxo. Como posso ajudar?" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ reply: "Houve um erro interno." }, { status: 500 })
  }
}
