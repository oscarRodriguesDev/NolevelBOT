import { NextRequest, NextResponse } from "next/server"

type FlowState =
    | "menu"
    | "abrir_setor"
    | "abrir_descricao"
    | "consultar_andamento"

type UserSession = {
    messages: { role: "user" | "system"; content: string }[]
    state: FlowState
    chamado?: {
        setor?: string
        descricao?: string
    }
}

const sessions = new Map<string, UserSession>()

function getSession(userId: string): UserSession {
    if (!sessions.has(userId)) {
        sessions.set(userId, {
            messages: [],
            state: "menu"
        })
    }
    return sessions.get(userId)!
}

function getMenuText() {
    return `Olá, Meu nome ´Hevelyn, sou uma assistente virtual da empresa.
    

Escolha uma opção digitando o número:

1 - Abrir chamado
2 - Consultar andamento`
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
        if (data.message.extendedTextMessage?.text)
            text = data.message.extendedTextMessage.text

        if (!text) return NextResponse.json({ ok: true })

        text = text.trim()

        const number: string = data.key.senderPn || data.key.remoteJid
        const instance: string = body.instance || data.instance
        if (!instance)
            return NextResponse.json({ ok: false, reason: "No instance" })

        const session = getSession(number)

        let responseText = ""

        // Voltar para menu
        if (text === "0") {
            session.state = "menu"
            session.chamado = {}
            responseText = getMenuText()
        }

        else if (session.state === "menu") {
            if (text === "1") {
                session.state = "abrir_setor"
                session.chamado = {}
                responseText = "Informe o setor do chamado."
            } else if (text === "2") {
                session.state = "consultar_andamento"
                responseText = "Informe o número do chamado."
            } else {
                responseText = getMenuText()
            }
        }

        else if (session.state === "abrir_setor") {
            session.chamado = { setor: text }
            session.state = "abrir_descricao"
            responseText = "Descreva o problema."
        }

        else if (session.state === "abrir_descricao") {
            session.chamado = {
                ...session.chamado,
                descricao: text
            }

            const protocolo = Math.floor(Math.random() * 100000)

            responseText = `Chamado aberto com sucesso.

Protocolo: ${protocolo}
Setor: ${session.chamado?.setor}
Descrição: ${session.chamado?.descricao}

Digite 0 para voltar ao menu.`

            session.state = "menu"
            session.chamado = {}
        }

        else if (session.state === "consultar_andamento") {
            responseText = `Consulta do chamado ${text}:

Status: Em atendimento.

Digite 0 para voltar ao menu.`

            session.state = "menu"
        }

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