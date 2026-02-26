import { NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"
import type { ChatCompletionMessageParam } from "openai/resources/chat"

const fakeAviso = [
  {
    titulo: "Pagamento da Folha",
    setor: "DP",
    descricao: "Informamos que o pagamento do salario, devido aos feriados do mês serão adiantados"
  },
  {
    titulo: "Manutenção no Servidor",
    setor: "TI",
    descricao: "Havera indisponibilidade do sistema interno no sabado das 22h as 02h para atualizacao de seguranca"
  },
  {
    titulo: "Atualização de Política Comercial",
    setor: "Comercial",
    descricao: "A partir do proximo mes os descontos para novos contratos serao limitados conforme nova diretriz interna"
  },
  {
    titulo: "Inventário de Estoque",
    setor: "Logistica",
    descricao: "Sera realizado inventario geral no dia 25, solicitamos que todas as movimentacoes sejam registradas corretamente"
  },
  {
    titulo: "Campanha Interna de Endomarketing",
    setor: "Marketing",
    descricao: "Iniciamos hoje a campanha interna de engajamento com foco em cultura organizacional"
  },
  {
    titulo: "Revisão de Contratos",
    setor: "Juridico",
    descricao: "Todos os novos contratos deverao passar por revisao previa antes de assinatura"
  },
  {
    titulo: "Treinamento Obrigatório de Segurança",
    setor: "RH",
    descricao: "Colaboradores devem concluir o treinamento online ate o final do mes"
  },
  {
    titulo: "Auditoria Financeira",
    setor: "Financeiro",
    descricao: "A auditoria externa iniciara na proxima semana, manter documentos organizados"
  },
  {
    titulo: "Nova Política de Compras",
    setor: "Compras",
    descricao: "Pedidos acima de determinado valor deverao ter aprovacao da diretoria"
  },
  {
    titulo: "Atualização no Processo de Produção",
    setor: "Producao",
    descricao: "Sera implementado novo fluxo para reduzir retrabalho e aumentar eficiencia"
  },
  {
    titulo: "Mudança no Layout do Escritorio",
    setor: "Administrativo",
    descricao: "Alguns setores serao realocados para melhor distribuicao do espaco fisico"
  }
]

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

type UserSession = { messages: { role: 'user' | 'system'; content: string }[] }
const sessions = new Map<string, UserSession>()

function getSession(userId: string): UserSession {
  if (!sessions.has(userId)) {
    sessions.set(userId, { messages: [] })
  }
  return sessions.get(userId)!
}

function buildAvisosContext() {
  return fakeAviso
    .map(
      (a, index) =>
        `${index + 1}. Titulo: ${a.titulo}\nSetor: ${a.setor}\nDescricao: ${a.descricao}`
    )
    .join("\n\n")
}

function getChatbotPrompt(message: string, session: UserSession) {
  const avisosContext = buildAvisosContext()

  const promptMessage = {
    role: 'system' as const,
    content: `
Você é uma atendente virtual da empresa Hiskra chamada Hevelyn.

Você tem acesso ao quadro de avisos interno da empresa listado abaixo:

${avisosContext}

Regras:
- Sempre verifique primeiro se a pergunta do colaborador está relacionada a algum aviso.
- Se estiver relacionada, responda usando exclusivamente as informações do aviso correspondente.
- Se não estiver relacionada a nenhum aviso, responda normalmente.
- Se não souber a resposta, informe que não possui essa informação e oriente procurar o setor responsável.
- Não invente informações que não estejam nos avisos.
`
  }

  const history = session.messages
    .slice(-10)
    .map(m => ({ role: m.role, content: m.content }))

  return [
    promptMessage,
    ...history,
    { role: 'user' as const, content: message }
  ]
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.event !== "messages.upsert") {
      return NextResponse.json({ ok: true })
    }

    const data = body.data
    if (!data || !data.message || data.key?.fromMe) {
      return NextResponse.json({ ok: true })
    }

    let text: string | null = null
    if (data.message.conversation) text = data.message.conversation
    if (data.message.extendedTextMessage?.text) text = data.message.extendedTextMessage.text
    if (!text) return NextResponse.json({ ok: true })

    const number: string = data.key.senderPn || data.key.remoteJid
    const instance: string = body.instance || data.instance
    if (!instance) return NextResponse.json({ ok: false, reason: "No instance" })

    const session = getSession(number)
    const messages = getChatbotPrompt(text, session)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      messages: messages as ChatCompletionMessageParam[],
    })

    const responseText =
      completion.choices[0]?.message?.content ?? "Não entendi."

    session.messages.push({ role: 'user', content: text })
    session.messages.push({ role: 'system', content: responseText })

    const res = await fetch(
      `${process.env.EVOLUTION_API_URL}/message/sendText/${instance}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.EVOLUTION_API_KEY as string
        },
        body: JSON.stringify({
          number,
          text: responseText
        })
      }
    )

    if (!res.ok) {
      return NextResponse.json({ sent: false, status: res.status })
    }

    return NextResponse.json({ sent: true })
  } catch {
    return NextResponse.json({ error: true }, { status: 500 })
  }
}
