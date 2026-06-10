import { NextRequest, NextResponse } from "next/server"
import { getSetores } from "@/lib/setores"
import { botIA4 as botIA, FlowState, UserSession, detectFileIntent } from "@/lib/useIA4" 
import { validarCpf, StatusChamado, enviarChamado, buscarAvisos, buscarAvisosPorCpf, generateRandomTicket } from "@/lib/usedata"

const menuString = "1. Abrir Chamado, 2. Consultar Chamado, 3. Sair"

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

const sessions = new Map<string, UserSession & { pendingState?: string }>()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const userInput = body.message?.trim() || ""
    const sessionId = body.sessionId || "web-user"
    const lowerInput = userInput.toLowerCase()

    let session = sessions.get(sessionId)
    if (!session || (Date.now() - session.lastInteraction > 1000 * 60 * 60 * 2)) {
      session = { state: FlowState.INICIO, lastInteraction: Date.now() }
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
 case FlowState.INICIO: {
        const resp = await botIA(
          session,
          userInput,
          `O usuário acabou de chegar. Dê as boas-vindas e peça OBRIGATORIAMENTE o CPF para começar o 
          atendimento. IMPORTANTE: Não se apresente e não diga nenhum nome ainda.`,
          avisos
        )
        session.state = FlowState.IDENTIFICACAO_CPF
        return NextResponse.json({ reply: resp })
      }
case FlowState.IDENTIFICACAO_CPF: {
        const cleanCPF = userInput.replace(/\D/g, "")
        if (cleanCPF.length !== 11) {
          return NextResponse.json({ reply: "Por favor, informe um CPF válido (apenas os 11 números)." })
        }

        const resCpf = await validarCpf(cleanCPF)
        if (resCpf && resCpf.valido) {
          session.cpf = cleanCPF
          session.nome = resCpf.nome

          avisos = await buscarAvisosPorCpf(cleanCPF)

          if (avisos && !avisos.includes("Sem avisos")) {
            const instrucaoAviso = session.nome
              ? `CPF ${cleanCPF} validado. Nome: ${session.nome}. Existe um aviso importante específico para você:\n${avisos}\n\nAção OBRIGATÓRIA: Apresente-se com seu nome e o nome da sua empresa. Em seguida, informe o aviso de forma HUMANIZADA e ACOLHEDORA. Depois, apresente as opções: ${menuString}. Tudo em uma única mensagem.`
              : `CPF ${cleanCPF} encontrado. Existe um aviso importante:\n${avisos}\n\nAção OBRIGATÓRIA: Apresente-se com seu nome e o nome da sua empresa. Em seguida, informe o aviso de forma HUMANIZADA e ACOLHEDORA. Depois, pergunte educadamente como o usuário gostaria de ser chamado. Tudo em uma única mensagem.`;

            const apresentacao = await botIA(session, userInput, instrucaoAviso, avisos)
            session.state = session.nome ? FlowState.MENU_PRINCIPAL : FlowState.IDENTIFICACAO_NOME
            return NextResponse.json({ reply: apresentacao })
          }

          const instrucao = session.nome
            ? `CPF ${cleanCPF} validado. O nome dele é ${session.nome}. OBRIGATÓRIO: Apresente-se com seu nome e o nome da sua empresa. Depois, saude o usuário e apresente as opções: ${menuString}`
            : `CPF ${cleanCPF} encontrado. OBRIGATÓRIO: Apresente-se com seu nome e o nome da sua empresa. Depois, pergunte como o usuário gostaria de ser chamado.`;

          const resposta = await botIA(session, userInput, instrucao, avisos)
          session.state = session.nome ? FlowState.MENU_PRINCIPAL : FlowState.IDENTIFICACAO_NOME
          return NextResponse.json({ reply: resposta })
        } else {
          return NextResponse.json({ reply: "Hum, não consegui validar esse CPF! Por favor, tente novamente." })
        }
      }
      case FlowState.IDENTIFICACAO_NOME: {
        session.nome = userInput
        const resposta = await botIA(
          session,
          userInput,
          `Agora que já sabe o nome (${userInput}), apresente o menu: ${menuString}`,
          avisos
        )
        session.state = FlowState.MENU_PRINCIPAL
        return NextResponse.json({ reply: resposta })
      }

      case FlowState.MENU_PRINCIPAL: {
        if (["1", "abrir", "chamado"].some(v => lowerInput.includes(v))) {
          session.state = FlowState.COLETAR_MOTIVO
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
          avisos
        )
        return NextResponse.json({ reply: resposta })
      }

      case FlowState.COLETAR_MOTIVO: {
        session.motivoAtual = userInput

        const fileIntent = detectFileIntent(userInput);
        
        if (fileIntent === "send_file") {
          const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
          session.state = FlowState.MENU_PRINCIPAL
          return NextResponse.json({
            reply: `Para este tipo de serviço, você precisa abrir um chamado pelo nosso portal para anexar os documentos necessários. Acesse: ${baseUrl}/chamado e preencha o formulário com a descrição do problema e os arquivos.`
          })
        }

        let todosAvisos = await buscarAvisos(session.cpf, req)
        if (todosAvisos.includes("Sem avisos")) {
          todosAvisos = await buscarAvisosPorCpf(session.cpf!)
        }

        const analiseIA = await botIA(
          session,
          userInput,
          `Analise o motivo relatado e os avisos disponíveis seguindo as instruções do sistema.`,
          todosAvisos
        )

        if (analiseIA.startsWith("AVISO_RESOLVE:")) {
          const msg = analiseIA.replace("AVISO_RESOLVE:", "").trim()
          sessions.delete(sessionId)
          return NextResponse.json({ reply: msg })
        }

        if (analiseIA.includes("PROSSEGUIR_FLUXO")) {
          const setores = await getSetores(session.cpf || '')
          session.state = FlowState.COLETAR_SETOR
          return NextResponse.json({
            reply: `Entendido. Para qual setor devo enviar?\n\n📍 *Setores:* ${setores.join(", ")}`
          })
        } else {
          session.state = FlowState.MENU_PRINCIPAL
          return NextResponse.json({ reply: analiseIA })
        }
      }

      case FlowState.VERIFICAR_AVISOS: {
        const todosAvisos = await buscarAvisos(session.cpf, req)
        const analiseIA = await botIA(
          session,
          userInput,
          `O usuário respondeu após ter sido informado sobre um aviso. Verifique a resposta.
           Se ele quiser continuar/prosseguir com a abertura do chamado: retorne apenas PROSSEGUIR_FLUXO.
           Se ele desistir ou concordar com o aviso: encerre o atendimento de forma amigável e retorne APENAS "AVISO_RESOLVE:" seguido da mensagem de encerramento.
           Se a resposta do usuário indicar que o aviso já resolveu o problema: encerre com AVISO_RESOLVE.`,
          todosAvisos
        )

        if (analiseIA.startsWith("AVISO_RESOLVE:")) {
          const msg = analiseIA.replace("AVISO_RESOLVE:", "").trim()
          sessions.delete(sessionId)
          return NextResponse.json({ reply: msg })
        }

        if (analiseIA.includes("PROSSEGUIR_FLUXO")) {
          const setores = await getSetores(session.cpf || '')
          session.state = FlowState.COLETAR_SETOR
          return NextResponse.json({
            reply: `Perfeito, vou dar seguimento. Para qual setor deseja enviar?\n\n📍 *Setores:* ${setores.join(", ")}`
          })
        } else {
          return NextResponse.json({ reply: analiseIA })
        }
      }

      case FlowState.MOSTRAR_AVISO: {
        if (session.pendingState === FlowState.IDENTIFICACAO_NOME && !session.nome) {
          session.nome = userInput
        }

        const resposta = await botIA(
          session,
          userInput,
          `Apresente-se com o SEU NOME e o NOME DA SUA EMPRESA e apresente as opções: ${menuString}`,
          avisos
        )
        session.state = FlowState.MENU_PRINCIPAL
        return NextResponse.json({ reply: resposta })
      }

      case FlowState.COLETAR_SETOR: {
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
          session.state = FlowState.MENU_PRINCIPAL
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