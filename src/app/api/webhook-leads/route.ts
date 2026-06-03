import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { sendEvolutionText, saudacao, getMemoria, saveMemoria } from "@/lib/usedata"
import { obterBaseDeConhecimento } from "@/lib/smartSearch"

function getOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

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
const ESTANDE_NOME = 'NoLevel na ESX 2026'

async function gerarRespostaInteligente(pergunta: string, nome: string, baseDeConhecimento: string, historico?: string, botName?: string): Promise<string> {
  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Você é ${botName || "Hevelyn"}, a assistente virtual super carismática, empática e humana da NoLevel. Você está atendendo no estande da ESX 2026.

Aqui estão as informações e regras do produto que você domina:
---
${baseDeConhecimento}
---

REGRAS ESTRITAS DE COMPORTAMENTO:
1. INTERNALIZE A INFORMAÇÃO: Leia as informações acima, entenda a pergunta do visitante e formule uma resposta 100% autoral.
2. NUNCA REPITA TÍTULOS: É terminantemente proibido usar frases como "Sobre o aviso X", "📢", ou "De acordo com as informações".
3. TOM DE VOZ: Fale como uma pessoa real em um bate-papo de WhatsApp. Seja direta, amigável e prestativa. Não soe como um robô lendo um manual.
4. RESUMO CLARO: Se a explicação for longa, resuma de forma simples. Use no máximo 2 a 3 parágrafos curtos.
5. OBJETIVIDADE: Vá direto à resposta da pergunta. Se a informação não estiver na base, diga que não sabe de cabeça mas que a equipe presencial no estande pode ajudar.
6. ZERO SAUDAÇÕES REPETITIVAS: Como vocês já estão no meio de um bate-papo contínuo, NUNCA inicie sua resposta com "Oi", "Olá", "Bom dia", nem repita o nome do visitante no início da frase. Vá direto para a resposta da pergunta de forma natural.

Contexto da conversa atual:
${historico ? historico : "Início da conversa."}`
      },
      {
        role: "user",
        content: `O visitante ${nome} perguntou: "${pergunta}". Responda de forma natural e conversacional seguindo estritamente as regras.`
      },
    ],
    temperature: 0.6,
    max_tokens: 250,
  })

  return response.choices[0].message.content || "Me desculpe, deu um errinho aqui! Você pode repetir a pergunta?"
}

async function consultarLeadPorCpf(cpf: string) {
  try {
    const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) return null
    const res = await fetch(`${baseUrl}/api/leads-network?cpf=${cpf}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

const saudacoes = new Set(['oi', 'ola', 'olá', 'bom', 'boa', 'oie', 'opa', 'hey', 'alo', 'alô', 'salve'])

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

    // Lógica de encerramento
    if (["sair", "encerrar", "cancelar", "tchau", "obrigado", "vlw"].some(v => lowerInput.includes(v))) {
      if (session.cpf && session.ultimoResumo) {
        await saveMemoria(session.cpf, session.nome || "", session.ultimoResumo)
      }
      await sendEvolutionText(
        instance, number,
        `${saudacao()}! Foi um prazer falar com você, ${session.nome || "visitante"}. Se quiser saber mais sobre as soluções, é só chamar ou passar aqui no estande! 😊`
      )
      sessions.delete(number)
      return NextResponse.json({ ok: true })
    }

    // Fluxo de captura e validação de CPF
    if (session.state === FlowState.AGUARDANDO_CPF) {
      const cleanCPF = userInput.replace(/\D/g, "")

      if (cleanCPF.length !== 11) {
        await sendEvolutionText(
          instance, number,
          `${saudacao()}! 👋 Bem-vindo ao estande virtual da ${ESTANDE_NOME}! Para eu te atender de forma personalizada, digite seu CPF (apenas números).`
        )
        return NextResponse.json({ ok: true })
      }

      const lead = await consultarLeadPorCpf(cleanCPF)

      if (!lead) {
        await sendEvolutionText(
          instance, number,
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
        ? `Que bom te ver de novo!`
        : `Que legal ter você por aqui!`

      await sendEvolutionText(
        instance, number,
        `${saudacao()}, ${lead.nome}! ${cumprimentoMemoria} 👋 Sou a ${instance}, assistente virtual da NoLevel. Posso tirar suas dúvidas sobre nosso produto, funcionalidades, planos ou integrações. O que você gostaria de saber hoje?`
      )

      session.state = FlowState.CONVERSANDO
      sessions.set(number, session)
      return NextResponse.json({ ok: true })
    }

    // Respostas rápidas a saudações isoladas
    if (saudacoes.has(lowerInput)) {
      await sendEvolutionText(
        instance, number,
        `${saudacao()}, ${session.nome}! Como posso te ajudar com as soluções hoje?`
      )
      sessions.set(number, session)
      return NextResponse.json({ ok: true })
    }

    const baseDeConhecimento = await obterBaseDeConhecimento()

    // 2. A Hevelyn analisa a pergunta e a base de dados de forma semântica
    const resposta = await gerarRespostaInteligente(
        userInput, 
        session.nome || "Visitante", 
        baseDeConhecimento, 
        session.ultimoResumo,
        instance
    )
    
    // 3. Salva na memória e envia
    session.ultimoResumo = `Visitante perguntou: "${userInput}". Você respondeu: "${resposta}"`
    
    await sendEvolutionText(instance, number, resposta)
    sessions.set(number, session)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Erro no webhook-leads:", error)
    return NextResponse.json({ ok: true })
  }
}