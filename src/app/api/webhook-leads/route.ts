import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { prisma } from "@/lib/prisma"
import { sendEvolutionText, buscarAvisos, saudacao } from "@/lib/usedata"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const FlowState = {
  APRESENTACAO: "apresentacao",
  COLETANDO_NOME: "coletando_nome",
  COLETANDO_TELEFONE: "coletando_telefone",
  CONVERSANDO: "conversando",
} as const

type FlowStateValues = (typeof FlowState)[keyof typeof FlowState]

type UserSession = {
  state: FlowStateValues
  nome?: string
  telefone?: string
  cpf?: string
  empresa?: string
  lastInteraction: number
  apresentouForm?: boolean
}

const sessions = new Map<string, UserSession>()
const FEIRA_NOME = process.env.PUBLIC_NAME_EMPRESA || "Nolevel"

function gerarPromptSistema(session: UserSession, avisos: string, userInput: string): string {
  return `
Você é um atendente virtual animado e simpático da ${FEIRA_NOME}. 
Sua missão é divulgar o evento/feira e cadastrar leads interessados.

PERSONA: Entusiasmada, acolhedora e direta. Use a saudação: ${saudacao()}.

REGRAS:
- Seja objetiva e não invente informações.
- Apresente o evento com entusiasmo.
- Se o usuário perguntar algo sobre o evento, responda com base nos avisos abaixo.
- NÃO trave o atendimento pedindo CPF. A conversa deve ser fluida.
- Se o usuário demonstrar interesse, colete o nome e telefone para cadastrar.
- Se ja tiver nome e telefone, confirme o cadastro e finalize.
- Se o usuario nao quiser se cadastrar, respeite e encerre amigavelmente.
- Se o usuario encerrar, confirme o encerramento.

CONTEXTO:
- Nome: ${session.nome || "Nao informado"}
- Telefone: ${session.telefone || "Nao informado"}
- Estado atual: ${session.state}

AVISOS SOBRE O EVENTO:
${avisos}

INSTRUÇÃO DA ETAPA:
${session.state === "apresentacao" ? "Apresente o evento de forma animada e pergunte o nome do usuario." : ""}
${session.state === "coletando_nome" ? "O usuario acabou de informar o nome. Confirme e pergunte o telefone dele." : ""}
${session.state === "coletando_telefone" ? "O usuario informou o telefone. Confirme os dados (nome + telefone) e pergunte se pode cadastrar." : ""}
${session.state === "conversando" ? "Converse naturalmente. Responda perguntas sobre o evento. Se ja tiver dados suficientes, pergunte se pode cadastrar. Se nao tiver, colete nome e telefone de forma natural." : ""}

UPLOAD DE ARQUIVOS:
Se o usuario precisar enviar algo, forneça o link do portal.

ENCERRAMENTO:
Se o usuario quiser encerrar, confirme e finalize de forma amigavel.
`
}

function extrairDadosResposta(texto: string) {
  const dados: { nome?: string; telefone?: string; cpf?: string; empresa?: string } = {}

  const matchNome = texto.match(/\[NOME:\s*(.+?)\]/)
  if (matchNome) dados.nome = matchNome[1].trim()

  const matchTel = texto.match(/\[TELEFONE:\s*(.+?)\]/)
  if (matchTel) dados.telefone = matchTel[1].trim()

  const matchCpf = texto.match(/\[CPF:\s*(.+?)\]/)
  if (matchCpf) dados.cpf = matchCpf[1].trim()

  const matchEmpresa = texto.match(/\[EMPRESA:\s*(.+?)\]/)
  if (matchEmpresa) dados.empresa = matchEmpresa[1].trim()

  return dados
}

function limparResposta(texto: string): string {
  return texto.replace(/\[NOME:.*?\]|\[TELEFONE:.*?\]|\[CPF:.*?\]|\[EMPRESA:.*?\]/g, "").trim()
}

async function salvarLead(session: UserSession): Promise<boolean> {
  if (!session.nome || !session.telefone) return false

  try {
    await prisma.cpfsLeads.create({
      data: {
        nome: session.nome,
        telefone: session.telefone,
        cpf: session.cpf || `${Date.now()}`,
        empresa: session.empresa || FEIRA_NOME,
      },
    })
    return true
  } catch {
    try {
      await prisma.cpfsLeads.create({
        data: {
          nome: session.nome,
          telefone: session.telefone,
          cpf: `lead-${Date.now()}`,
          empresa: session.empresa || FEIRA_NOME,
        },
      })
      return true
    } catch {
      return false
    }
  }
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
      session = { state: FlowState.APRESENTACAO, lastInteraction: Date.now(), apresentouForm: false }
      sessions.set(number, session)
    }

    session.lastInteraction = Date.now()

    const avisos = await buscarAvisos(undefined, req)

    if (["sair", "encerrar", "cancelar", "tchau"].some(v => lowerInput.includes(v))) {
      await sendEvolutionText(instance, number, "Atendimento encerrado! Se quiser saber mais sobre o evento depois, é só chamar. 😊")
      sessions.delete(number)
      return NextResponse.json({ ok: true })
    }

    const promptSistema = gerarPromptSistema(session, avisos, userInput)

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: promptSistema },
        { role: "user", content: userInput },
      ],
      temperature: 0.7,
    })

    let resposta = response.choices[0].message.content || "Pode repetir, por favor?"

    const dadosExtraidos = extrairDadosResposta(resposta)
    resposta = limparResposta(resposta)

    if (dadosExtraidos.nome) session.nome = dadosExtraidos.nome
    if (dadosExtraidos.telefone) session.telefone = dadosExtraidos.telefone
    if (dadosExtraidos.cpf) session.cpf = dadosExtraidos.cpf
    if (dadosExtraidos.empresa) session.empresa = dadosExtraidos.empresa

    if (session.state === FlowState.APRESENTACAO) {
      session.state = FlowState.COLETANDO_NOME
    } else if (session.state === FlowState.COLETANDO_NOME && dadosExtraidos.nome) {
      session.state = FlowState.COLETANDO_TELEFONE
    }

    if (session.nome && session.telefone && !session.apresentouForm) {
      session.apresentouForm = true

      const salvou = await salvarLead(session)

      if (salvou) {
        resposta += `\n\n✅ ${session.nome}, seu cadastro foi realizado com sucesso! Em breve entraremos em contato.`
      }

      session.state = FlowState.CONVERSANDO
    }

    sessions.set(number, session)
    await sendEvolutionText(instance, number, resposta)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Erro no webhook-leads:", error)
    return NextResponse.json({ ok: true })
  }
}
