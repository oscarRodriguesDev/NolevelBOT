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
const ESTANDE_NOME = 'NoLevel na ESX 2026'

const STOP_WORDS = new Set([
  'de', 'da', 'do', 'das', 'dos', 'para', 'pra', 'com', 'sem', 'sob', 'sobre',
  'uma', 'um', 'uns', 'umas', 'o', 'a', 'os', 'as', 'no', 'na', 'nos', 'nas',
  'em', 'por', 'pela', 'pelas', 'pelo', 'pelos', 'que', 'qual', 'quais', 'como',
  'vai', 'vem', 'tem', 'sao', 'esta', 'esse', 'essa', 'isso', 'isto', 'aquele',
  'se', 'seu', 'sua', 'seus', 'suas', 'meu', 'minha', 'meus', 'minhas', 'teu',
  'e', 'mas', 'ou', 'nem', 'tambem', 'mais', 'menos', 'muito', 'pouco',
  'ja', 'nao', 'sim', 'talvez', 'quando', 'onde', 'porque', 'pois',
  'so', 'apenas', 'ate', 'depois', 'antes', 'sempre', 'nunca', 'agora',
  'voce', 'ele', 'ela', 'eles', 'elas', 'nos', 'vos', 'eu', 'tu',
  'pode', 'poderia', 'podem', 'poderiao', 'quero', 'gostaria', 'preciso',
  'ser', 'estar', 'ter', 'ha', 'existir', 'ficar',
  'obrigado', 'obrigada', 'valeu', 'brigado',
  'bom', 'boa', 'bem', 'mal', 'legal', 'top', 'show',
])

function extrairPalavras(texto: string): string[] {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(p => p.length > 3 && !STOP_WORDS.has(p))
}

function parseAvisos(raw: string): { titulo: string; conteudo: string }[] {
  if (!raw || raw.includes("Sem avisos")) return []

  const linhas = raw.split("\n").filter(l => l.trim())
  const avisos: { titulo: string; conteudo: string }[] = []
  let tituloAtual = ''
  let conteudoParts: string[] = []

  for (const linha of linhas) {
    const match = linha.match(/\*([^*]+)\*:\s*(.+)/)
    if (match) {
      if (tituloAtual) {
        avisos.push({ titulo: tituloAtual, conteudo: conteudoParts.join(' ') })
      }
      tituloAtual = match[1].trim()
      conteudoParts = [match[2].trim()]
    } else if (tituloAtual) {
      conteudoParts.push(linha.trim())
    }
  }
  if (tituloAtual) {
    avisos.push({ titulo: tituloAtual, conteudo: conteudoParts.join(' ') })
  }

  return avisos
}

function encontrarAvisoRelevante(pergunta: string, avisos: { titulo: string; conteudo: string }[]): { titulo: string; conteudo: string } | null {
  if (avisos.length === 0) return null

  const palavrasPergunta = extrairPalavras(pergunta)
  if (palavrasPergunta.length === 0) return null

  let melhorScore = 0
  let melhorAviso: typeof avisos[0] | null = null

  for (const aviso of avisos) {
    const palavrasTitulo = extrairPalavras(aviso.titulo)
    const palavrasConteudo = extrairPalavras(aviso.conteudo)
    const todasPalavras = [...new Set([...palavrasTitulo, ...palavrasConteudo])]

    let score = 0
    for (const pp of palavrasPergunta) {
      if (palavrasTitulo.some(pt => pt.includes(pp) || pp.includes(pt))) {
        score += 2
      } else if (todasPalavras.some(p => p.includes(pp) || pp.includes(p))) {
        score += 1
      }
    }

    score = Math.round(score * (1 + 0.3 * (palavrasTitulo.length / Math.max(palavrasPergunta.length, 1))))

    if (score > melhorScore) {
      melhorScore = score
      melhorAviso = aviso
    }
  }

  return melhorScore > 0 ? melhorAviso : null
}

async function gerarRespostaComAviso(pergunta: string, nome: string, aviso: { titulo: string; conteudo: string }): Promise<string> {
  const prompt = `Você é um atendente simpatico da NoLevel no estande da ESX 2026.

O visitante ${nome} perguntou: "${pergunta}"

Achei esta informacao no material da NoLevel:
TITULO: ${aviso.titulo}
CONTEUDO: ${aviso.conteudo}

Com base SOMENTE nessa informacao, responda de forma natural, resumida e conversacional (max 3 frases). Nao leia o texto literalmente -- resuma com suas palavras.`

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 180,
  })

  return response.choices[0].message.content || `${aviso.conteudo}`
}

async function gerarRespostaFallback(pergunta: string, nome: string, avisos: { titulo: string; conteudo: string }[]): Promise<string> {
  const avisosTexto = avisos.map(a => `*${a.titulo}*: ${a.conteudo}`).join("\n")

  const prompt = `Você é um atendente simpatico da NoLevel no estande da ESX 2026.

O visitante ${nome} perguntou: "${pergunta}"

Temos estas informacoes sobre o produto NoLevel:
${avisosTexto}

Regras:
- Responda APENAS com base nas informacoes acima.
- Se nao encontrar resposta, diga que nao sabe e ofereca anotar o contato.
- Resposta curta, max 3 frases.
- Nao invente informacoes.`

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 180,
  })

  return response.choices[0].message.content || "Pode repetir, por favor?"
}

async function consultarLeadPorCpf(cpf: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL
    if (!baseUrl) return null
    const res = await fetch(`${baseUrl}/api/leads-network?cpf=${cpf}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

const saudacoes = new Set(['oi', 'ola', 'olá', 'bom', 'boa', 'oie', 'opa', 'hey', 'alo', 'alô'])

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

    if (["sair", "encerrar", "cancelar", "tchau", "obrigado", "vlw"].some(v => lowerInput.includes(v))) {
      if (session.cpf && session.ultimoResumo) {
        await saveMemoria(session.cpf, session.nome || "", session.ultimoResumo)
      }
      await sendEvolutionText(
        instance, number,
        `${saudacao()}! Foi um prazer falar com voce, ${session.nome || "visitante"}. Se quiser saber mais sobre a NoLevel, e so chamar! 😊`
      )
      sessions.delete(number)
      return NextResponse.json({ ok: true })
    }

    if (session.state === FlowState.AGUARDANDO_CPF) {
      const cleanCPF = userInput.replace(/\D/g, "")

      if (cleanCPF.length !== 11) {
        await sendEvolutionText(
          instance, number,
          `${saudacao()}! 👋 Bem-vindo ao estande da ${ESTANDE_NOME}! Para eu te atender melhor, me informe seu CPF (apenas numeros).`
        )
        return NextResponse.json({ ok: true })
      }

      const lead = await consultarLeadPorCpf(cleanCPF)

      if (!lead) {
        await sendEvolutionText(
          instance, number,
          `Nao encontrei seu cadastro, ${session.nome || "visitante"}. Voce ja preencheu o formulario de visitante do evento? Se sim, tente novamente com o CPF usado no cadastro.`
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
        instance, number,
        `${saudacao()}, ${lead.nome}! ${cumprimentoMemoria} Aqui no estande da NoLevel, posso tirar duvidas sobre nosso produto! Pergunte sobre funcionalidades, integracoes, planos... O que voce gostaria de saber?`
      )

      session.state = FlowState.CONVERSANDO
      sessions.set(number, session)
      return NextResponse.json({ ok: true })
    }

    if (saudacoes.has(lowerInput)) {
      await sendEvolutionText(
        instance, number,
        `${saudacao()}! Em que posso ajudar sobre a NoLevel hoje?`
      )
      sessions.set(number, session)
      return NextResponse.json({ ok: true })
    }

    const avisosRaw = await buscarAvisos(undefined, req)
    const avisos = parseAvisos(avisosRaw)
    const avisoMatch = encontrarAvisoRelevante(userInput, avisos)

    let resposta: string

    if (avisoMatch) {
      resposta = await gerarRespostaComAviso(userInput, session.nome || "Visitante", avisoMatch)
      session.ultimoResumo = `Perguntou: "${userInput}". Respondido com aviso: ${avisoMatch.titulo}`
    } else {
      resposta = await gerarRespostaFallback(userInput, session.nome || "Visitante", avisos)
      session.ultimoResumo = `Perguntou: "${userInput}". Fallback - sem aviso especifico.`
    }

    await sendEvolutionText(instance, number, resposta)
    sessions.set(number, session)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Erro no webhook-leads:", error)
    return NextResponse.json({ ok: true })
  }
}
