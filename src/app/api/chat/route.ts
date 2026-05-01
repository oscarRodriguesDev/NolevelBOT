import { Chamado } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { getSetores } from "@/lib/setores"
import { botIA } from "@/lib/useIA";
import { validarCpf, getMemoria, StatusChamado, enviarChamado,buscarAvisos } from "@/lib/usedata";


//recupera os setores da empresa usando o cnpj da mesma,podemos usar uma key ou uma autenticaçaço




type FlowState = "inicio" | "identificacao_cpf" | "identificacao_nome" | "menu_principal" | "coletar_motivo" | "verificar_aviso" | "escolher_abertura" | "coletar_setor"

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

    let session = sessions.get(sessionId)
    if (!session || (Date.now() - session.lastInteraction > 1000 * 60 * 60)) {
      session = { state: "inicio", lastInteraction: Date.now() }
      sessions.set(sessionId, session)
    }
    session.lastInteraction = Date.now()

    let avisos = "Sem avisos no momento."
    if (session.cpf) {
      avisos = await buscarAvisos(session.cpf, req)
    }

    const lowerInput = userInput.toLowerCase()

    if (["obrigado", "tchau", "sair", "encerrar", "cancelar"].some(w => lowerInput.includes(w))) {
      const tchau = await botIA(
        session,
        userInput,
        "Despeça-se amigavelmente, sem dizer boa noite, ou boa tarde, apenas  informando que o atendimento foi encerrado.",
        avisos
      )
      sessions.delete(sessionId)
      return NextResponse.json({ reply: tchau })
    }

    switch (session.state) {
      case "inicio": {
        const resp = await botIA(
          session,
          userInput,
          `O usuário acabou de chegar. 
          Dê as boas-vindas se apresente,   e peça OBRIGATORIAMENTE o CPF para começar o atendimento.`,
          avisos
        )
        session.state = "identificacao_cpf"
        sessions.set(sessionId, session)
        return NextResponse.json({ reply: resp })
      }

      case "identificacao_cpf": {
        const cleanCPF = userInput.replace(/\D/g, "")
        if (cleanCPF.length !== 11) {
          return NextResponse.json({ reply: "Por favor, informe um CPF válido (apenas os 11 números)." })
        }

        const resCpf = await validarCpf(cleanCPF)
        if (resCpf.valido) {
          session.cpf = cleanCPF
          session.nome = resCpf.nome
          session.resumoHistorico = await getMemoria(cleanCPF)

          avisos = await buscarAvisos(cleanCPF, req)

          const instrucao = session.nome
            ? `CPF ${cleanCPF} validado. O nome dele é ${session.nome}. Saude-o e apresente as opções: 1. Abrir Chamado, 2. Consultar Chamado`
            : `CPF ${cleanCPF} validado. Pergunte como o usuário gostaria de ser chamado.`

          const resposta = await botIA(session, userInput, instrucao, avisos)
          session.state = session.nome ? "menu_principal" : "identificacao_nome"
          sessions.set(sessionId, session)
          return NextResponse.json({ reply: resposta })
        } else {
          return NextResponse.json({ reply: "Infelizmente não encontrei seu CPF na nossa base de colaboradores. Pode digitar novamente?" })
        }
      }

      case "identificacao_nome": {
        session.nome = userInput
        session.state = "menu_principal"
        const resp = await botIA(
          session,
          userInput,
          "Agora que já sabe o nome, apresente as opções: 1. Abrir Chamado, 2. Consultar Chamado",
          avisos
        )
        sessions.set(sessionId, session)
        return NextResponse.json({ reply: resp })
      }

      case "menu_principal": {
        if (["1", "abrir", "chamado"].some(v => lowerInput.includes(v))) {
          session.state = "coletar_motivo"
          sessions.set(sessionId, session)
          return NextResponse.json({ reply: "Com certeza! Me conta o que está acontecendo? (Pode descrever o problema detalhadamente)" })
        }

        if (["2", "status", "consultar"].some(v => lowerInput.includes(v))) {
          const status = await StatusChamado(session.cpf || "", req)
          const lista =
            status.length > 0
              ? status.map((t: Chamado) => `🎫 *Ticket:* ${t.ticket} - Status: ${t.status}`).join("\n")
              : "Não encontrei chamados abertos para você."
          return NextResponse.json({ reply: `${lista}\n\nPosso ajudar com algo mais?` })
        }

        const resposta = await botIA(
          session,
          userInput,
          `Tente identificar o que ele quer, caso não consiga encerre 
          amigavelmente.Não faça suposições, apenas encerre o atendimento, ao finalizar não precisa dizer boa tarde, bom dia ou boa noite,
          apenas encerre o atendimento de forma cordial.`,
          avisos
        )
        return NextResponse.json({ reply: resposta })
      }

  case "coletar_motivo": {
  session.motivoAtual = userInput

  // se não há avisos reais, pula direto o fluxo de IA
  if (!avisos || avisos.includes("Sem avisos")) {
    session.state = "coletar_setor"
    sessions.set(sessionId, session)

    const setores = await getSetores(session.cpf || '')
    return NextResponse.json({
      reply: `Entendido. Para qual setor devo enviar?\n\n📍 *Setores:* ${setores.join(", ")}`
    })
  }

  const analiseIA = await botIA(
    session,
    userInput,
    "INSTRUÇÃO: Verifique se o problema relatado bate com os 'Avisos' do sistema. Se bater, explique o aviso e pergunte se quer abrir o chamado mesmo assim. Se NÃO bater, responda apenas: PROSSEGUIR_FLUXO!",
    avisos
  )

  if (analiseIA.includes("PROSSEGUIR_FLUXO")) {
    session.state = "coletar_setor"
    sessions.set(sessionId, session)

    const setores = await getSetores(session.cpf || '')
    return NextResponse.json({
      reply: `Entendido. Para qual setor devo enviar?\n\n📍 *Setores:* ${setores.join(", ")}`
    })
  } else {
    session.state = "verificar_aviso"
    sessions.set(sessionId, session)
    return NextResponse.json({ reply: analiseIA })
  }
}

      case "verificar_aviso": {
        if (["1", "sim", "quero", "continuar", "prosseguir"].some(v => lowerInput.includes(v))) {
          session.state = "coletar_setor"
          sessions.set(sessionId, session)

          const setores = await getSetores(session.cpf || "")
          return NextResponse.json({
            reply: `Entendido. Para qual setor devo enviar?\n\n📍 *Setores:* ${setores.join(", ")}`
          })
        } else {
          session.state = "menu_principal"
          sessions.set(sessionId, session)
          return NextResponse.json({
            reply: "Sem problemas! Como posso ajudar agora?\n\n1. Abrir Chamado\n2. Consultar Chamado"
          })
        }
      }

      case "coletar_setor": {
        const setores = await getSetores(session.cpf || "")
        const setor = setores.find(s => lowerInput.includes(s.toLowerCase()))

        if (!setor) {
          return NextResponse.json({
            reply: `Não reconheci esse setor. Escolha um destes: ${setores.join(", ")}`
          })
        }

        const ok = await enviarChamado(session.nome!, session.cpf!, setor, session.motivoAtual!)
        session.state = "menu_principal"
        sessions.set(sessionId, session)

        return NextResponse.json({
          reply: ok
            ? `✅ Tudo pronto! Seu chamado para *${setor}* foi registrado. Deseja tratar de mais algum assunto?`
            : "Erro ao criar chamado. Tente novamente mais tarde."
        })
      }
    }

    return NextResponse.json({ reply: "Desculpe, ocorreu um erro no fluxo. Como posso ajudar?" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ reply: "Houve um erro interno." }, { status: 500 })
  }
}