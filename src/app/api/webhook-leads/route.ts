import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { sendEvolutionText, buscarAvisos, saudacao, getMemoria, saveMemoria } from "@/lib/usedata"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const FlowState = {
  AGUARDANDO_CPF: "aguardando_cpf",
  CONVERSANDO: "conversando",
} as const

type FlowStateValues = (typeof FlowState)[keyof typeof FlowState]

type UserSession = {
  state: FlowStateValues
  cpf?: string
  nome?: string
  lastInteraction: number
  ultimoResumo?: string
}

const sessions = new Map<string, UserSession>()
const FEIRA_NOME = process.env.PUBLIC_NAME_EMPRESA || "Nolevel"

function gerarPromptSistema(nome: string | undefined, avisos: string, memoria: string | null): string {
  return `
Você é um atendente virtual animado e simpático da ${FEIRA_NOME}, atuando em um evento/feira presencial.
Sua missão é interagir com os visitantes que estão nos stands, tirar dúvidas e proporcionar uma experiência agradável.

PERSONA: Entusiasmada, acolhedora e direta. Use a saudação: ${saudacao()}.

REGRAS:
- Seja objetiva e não invente informações.
- Responda APENAS com base nos AVISOS abaixo. Se não tiver a informação nos avisos, diga que não sabe.
- NÃO peça cadastro, NÃO colete dados — o visitante já está cadastrado no evento.
- Sempre chame o visitante pelo nome.
- Respostas curtas e diretas, máximo 3 frases.
- Se o usuário encerrar, apenas confirme amigavelmente.

CONTEXTO:
- Nome: ${nome || "Visitante"}

AVISOS SOBRE O EVENTO:
${avisos}

${memoria ? `HISTÓRICO DA CONVERSA ANTERIOR:\n${memoria}` : ""}

INSTRUÇÃO:
Converse naturalmente sobre o evento. Use os avisos como fonte ÚNICA de informação.
`
}

async function consultarLeadPorCpf(cpf: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    const res = await fetch(`${baseUrl}/api/leads-network?cpf=${cpf}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

function encontrarRespostaNosAvisos(pergunta: string, avisos: string): string | null {
  if (!avisos || avisos.includes("Sem avisos")) return null

  const palavrasChave = pergunta.toLowerCase().split(/\s+/).filter(p => p.length > 3)
  if (palavrasChave.length === 0) return null

  const linhas = avisos.split("\n")
  let melhorMatch: { texto: string; score: number } | null = null

  for (const linha of linhas) {
    const match = linha.match(/\*([^*]+)\*:\s*(.+)/)
    if (!match) continue

    const linhaLower = linha.toLowerCase()
    const score = palavrasChave.filter(p => linhaLower.includes(p)).length
    if (score > 0 && (!melhorMatch || score > melhorMatch.score)) {
      melhorMatch = { texto: `📢 Sobre *${match[1]}*:\n\n${match[2]}`, score }
    }
  }

  return melhorMatch?.texto || null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (body.event !== "messages.upsert") return NextResponse.json({ ok: true })

    const data = body.data
    if (!data?.message || data.key?.fromMe) return NextResponse.json({ ok: true })

    const number = data.key.remoteJid
    const instance = body.instance
    const userInput = (data.message.conversation || data.message.extendedTextMessage?.text || "").trim()
    const lowerInput = userInput.toLowerCase()

    let session = sessions.get(number)
    if (!session || Date.now() - session.lastInteraction > 1000 * 60 * 60 * 2) {
      session = { state: FlowState.AGUARDANDO_CPF, lastInteraction: Date.now() }
      sessions.set(number, session)
    }

    session.lastInteraction = Date.now()

    if (["sair", "encerrar", "cancelar", "tchau", "obrigado"].some(v => lowerInput.includes(v))) {
      if (session.cpf && session.ultimoResumo) {
        await saveMemoria(session.cpf, session.nome || "", session.ultimoResumo)
      }
      await sendEvolutionText(instance, number, `${saudacao()}! Foi um prazer falar com você, ${session.nome || "visitante"}. Aproveite o evento! 😊`)
      sessions.delete(number)
      return NextResponse.json({ ok: true })
    }

    if (session.state === FlowState.AGUARDANDO_CPF) {
      const cleanCPF = userInput.replace(/\D/g, "")

      if (cleanCPF.length !== 11) {
        await sendEvolutionText(
          instance,
          number,
          `${saudacao()}! 👋 Bem-vindo ao estande da ${FEIRA_NOME}! Para eu te atender melhor, me informe seu CPF (apenas números).`
        )
        return NextResponse.json({ ok: true })
      }

      const lead = await consultarLeadPorCpf(cleanCPF)

      if (!lead) {
        await sendEvolutionText(
          instance,
          number,
          `Não encontrei seu cadastro, ${session.nome || "visitante"}. Você já preencheu o formulário de visitante do evento? Se sim, tente novamente com o CPF usado no cadastro.`
        )
        return NextResponse.json({ ok: true })
      }

      session.cpf = cleanCPF
      session.nome = lead.nome

      const memoria = await getMemoria(cleanCPF)
      if (memoria) {
        session.ultimoResumo = memoria
      }

      const cumprimentoMemoria = memoria
        ? `Que bom te ver de novo! 👋`
        : `Que bom te ver por aqui! 😊`

      await sendEvolutionText(
        instance,
        number,
        `${saudacao()}, ${lead.nome}! ${cumprimentoMemoria} Estou aqui para ajudar com qualquer dúvida sobre o evento: programação, palestras, stands, horários... É só perguntar!`
      )

      session.state = FlowState.CONVERSANDO
      sessions.set(number, session)
      return NextResponse.json({ ok: true })
    }

    const avisos = await buscarAvisos(undefined, req)

    const respostaDireta = encontrarRespostaNosAvisos(userInput, avisos)
    if (respostaDireta) {
      session.ultimoResumo = `${session.nome} perguntou: "${userInput}". Recebeu info sobre o evento.`
      await sendEvolutionText(instance, number, respostaDireta + "\n\nMais alguma dúvida?")
      sessions.set(number, session)
      return NextResponse.json({ ok: true })
    }

    const promptSistema = gerarPromptSistema(session.nome, avisos, session.ultimoResumo || null)

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: promptSistema },
        { role: "user", content: userInput },
      ],
      temperature: 0.3,
      max_tokens: 150,
    })

    const resposta = response.choices[0].message.content || "Pode repetir, por favor?"
    session.ultimoResumo = `Interagiu sobre: "${userInput}". Resposta: "${resposta.substring(0, 100)}..."`

    await sendEvolutionText(instance, number, resposta)
    sessions.set(number, session)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Erro no webhook-leads:", error)
    return NextResponse.json({ ok: true })
  }
}
