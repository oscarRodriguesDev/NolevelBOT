import { Chamado } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SETORES = ["RH","TI","Financeiro","Comercial","Vendas","Suporte","Manutenção","Logística","Medicina","Segurança","Limpeza","Juridico"]

type FlowState = "inicio" | "identificacao_cpf" | "identificacao_nome" | "menu_principal" | "coletar_motivo" | "escolher_abertura" | "coletar_setor"

type UserSession = {
  state: FlowState
  nome?: string
  cpf?: string
  resumoHistorico?: string
  motivoAtual?: string
  lastInteraction: number
}

const sessions = new Map<string, UserSession>()

interface Colaborador {
  nome: string;
  cpf: string;
}


async function validarCPF(cpfDigitado: string): Promise<boolean> {
      try {

    const response = await fetch(`https://nolevel-bot.vercel.app/api/cpfs`, { cache: 'no-store' });
    
    if (!response.ok) return false;
    
    const listaDeCpfs: Colaborador[] = await response.json();
    const cpfLimpo = cpfDigitado.replace(/\D/g, "");

    return listaDeCpfs.some((item: Colaborador) => {
      const cpfItemLimpo = item.cpf.replace(/\D/g, "");
      return cpfItemLimpo === cpfLimpo;
    });
  } catch (error) {
    console.error("Erro ao validar CPF:", error);
    return false;
  }
}

function saudacao() {
  const hora = new Date().getHours()
  if (hora >= 5 && hora < 12) return "Bom dia"
  if (hora >= 12 && hora < 18) return "Boa tarde"
  return "Boa noite"
}

async function buscarAvisos() {
  try {
    const res = await fetch(`https://nolevel-bot.vercel.app/api/quadro-avisos`, { cache: "no-store" })
    const data = await res.json()
    return data.map((a: { titulo: string; conteudo: string }) => `📢 *${a.titulo}*: ${a.conteudo}`).join("\n") || "Sem avisos no momento."
  } catch { return "Sem avisos." }
}

async function getMemoria(cpf: string) {
  try {
    const res = await fetch(`https://nolevel-bot.vercel.app/api/memories?cpf=${cpf}`, { cache: 'no-store' })
    return res.ok ? (await res.json())?.resumo : null
  } catch { return null }
}



//validar cpfs:


async function hevelynIA(session: UserSession, userInput: string, instrucaoEtapa: string, avisos: string = "") {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Você é a Hevelyn, assistente virtual da Nolevel.
          - Tom: Empática, direta e resolutiva.
          - Regra: Máximo 4 linhas. 
          - Se a dúvida estiver nos [AVISOS] ${avisos}, responda e encerre, a menos que ele solicite a abertura de chamado.
          - Contexto: Colaborador ${session.nome || "Novo"}, Histórico: ${session.resumoHistorico || "Vazio"}.
          - Avisos: ${avisos}
          - Missão Atual: ${instrucaoEtapa}
          - Inicie sempre com ${saudacao()}.`
        },
        { role: "user", content: userInput }
      ],
      temperature: 0.7
    })
    return response.choices[0].message.content || "Pode repetir, por favor?"
  } catch { return "Tive um probleminha técnico, mas pode continuar." }
}

async function enviarChamado(nome: string, cpf: string, setor: string, descricao: string) {
  try {
    const formData = new FormData()
    formData.append("nome", nome); formData.append("cpf", cpf);
    formData.append("setor", setor); formData.append("descricao", descricao);
    const res = await fetch(`https://nolevel-bot.vercel.app/api/tickets`, { method: "POST", body: formData });
    return res.ok
  } catch { return false }
}

async function StatusChamado(cpf: string) {
  try {
    const res = await fetch(`https://nolevel-bot.vercel.app/api/tickets?cpf=${cpf}`)
    return res.ok ? await res.json() : null
  } catch { return null }
}

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

    const lowerInput = userInput.toLowerCase()
    const avisos = await buscarAvisos()

    if (["obrigado", "tchau", "sair", "encerrar"].some(w => lowerInput.includes(w))) {
      const tchau = await hevelynIA(session, userInput, "Despeça-se amigavelmente.")
      sessions.delete(sessionId)
      return NextResponse.json({ reply: tchau })
    }

    switch (session.state) {
      case "inicio": {
        const resp = await hevelynIA(session, userInput, "Dê as boas-vindas e peça o CPF para começar.")
        session.state = "identificacao_cpf"
        sessions.set(sessionId, session)
        return NextResponse.json({ reply: resp })
      }

      case "identificacao_cpf": {
        const cleanCPF = userInput.replace(/\D/g, "")
        
        // CORREÇÃO: Validação de CPF acontece aqui, no input do usuário
        const autorizado = await validarCPF(cleanCPF)
        
        if (!autorizado) {
          return NextResponse.json({ reply: "Infelizmente não encontrei seu CPF na nossa base de colaboradores. Por favor, digite os 11 números corretamente ou entre em contato com o RH." })
        }

        session.cpf = cleanCPF
        const memoria = await getMemoria(cleanCPF)
        
        if (memoria) {
          session.resumoHistorico = memoria
          const nomeExtraido = memoria.match(/Nome: ([^.|\n]+)/)
          session.nome = nomeExtraido ? nomeExtraido[1].trim() : undefined
        }

        if (session.nome) {
          session.state = "menu_principal"
          const resp = await hevelynIA(session, userInput, "Dê as boas-vindas de volta pelo nome e pergunte em que pode ajudar.") 
          sessions.set(sessionId, session)
          return NextResponse.json({ reply: resp })
        } else {
          session.state = "identificacao_nome"
          sessions.set(sessionId, session)
          return NextResponse.json({ reply: "CPF validado com sucesso! Como devo te chamar?" })
        }
      }

      case "identificacao_nome": {
        session.nome = userInput
        session.state = "menu_principal"
        const resp = await hevelynIA(session, userInput, "Pergunte em que pode ajudar")
        sessions.set(sessionId, session)
        return NextResponse.json({ reply: resp })
      }

      case "menu_principal": {
        if (userInput === "1") {
          session.state = "coletar_motivo"
          sessions.set(sessionId, session)
          return NextResponse.json({ reply: "Tudo bem. Pode me descrever detalhadamente o que está acontecendo?" })
        }
        if (userInput === "2") {
          const status = await StatusChamado(session.cpf!)
          if (status?.length) {
            const lista = status.map((t:Chamado) => `🎫 *${t.ticket}* - Status: ${t.status}`).join("\n")
            return NextResponse.json({ reply: `Aqui estão seus chamados:\n\n${lista}` })
          }
          return NextResponse.json({ reply: "Não encontrei chamados abertos para você." })
        }
        if (userInput === "3") {
          return NextResponse.json({ reply: `Aqui estão os avisos recentes:\n\n${avisos}\n\nPosso ajudar em algo mais?` })
        }
        
        const conversaLivre = await hevelynIA(session, userInput, "Responda a dúvida usando os avisos se possível, ou peça para escolher 1, 2 ou 3.", avisos)
        return NextResponse.json({ reply: conversaLivre })
      }

      case "coletar_motivo": {
        session.motivoAtual = userInput
        session.state = "escolher_abertura"
        const confirma = await hevelynIA(session, userInput, "Confirme que entendeu o problema e pergunte se quer abrir o chamado agora.")
        sessions.set(sessionId, session)
        return NextResponse.json({ reply: `${confirma}\n\n1️⃣ Sim, abrir\n2️⃣ Não, cancelar` })
      }

      case "escolher_abertura": {
        if (userInput === "1" || lowerInput.includes("sim")) {
          session.state = "coletar_setor"
          sessions.set(sessionId, session)
          return NextResponse.json({ reply: `Perfeito. Para qual setor devemos enviar? \n(${SETORES.join(", ")})` })
        }
        session.state = "menu_principal"
        sessions.set(sessionId, session)
        return NextResponse.json({ reply: "Sem problemas, chamado cancelado. Como posso ajudar agora? (1. Abrir, 2. Status, 3. Avisos)" })
      }

      case "coletar_setor": {
        const setor = SETORES.find(s => lowerInput.includes(s.toLowerCase()))
        if (!setor) return NextResponse.json({ reply: `Não reconheci esse setor. Escolha um destes: ${SETORES.join(", ")}` })

        const ok = await enviarChamado(session.nome!, session.cpf!, setor, session.motivoAtual!)
        session.state = "menu_principal"
        sessions.set(sessionId, session)
        return NextResponse.json({ 
          reply: ok ? `✅ Tudo pronto! Seu chamado foi enviado para o setor ${setor}.` : "Erro ao criar chamado. Tente novamente mais tarde." 
        })
      }
    }

    return NextResponse.json({ reply: "Desculpe, ocorreu um erro no fluxo. Como posso ajudar?" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ reply: "Houve um erro interno. Tente novamente em alguns instantes." }, { status: 500 })
  }
}