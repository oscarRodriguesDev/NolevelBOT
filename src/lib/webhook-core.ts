import { NextRequest, NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/rate-limit"
import { TTLMap } from "@/lib/ttl-map"
import { sendEvolutionText, downloadEvolutionMedia } from "@/lib/usedata"
import { uploadBuffer } from "@/lib/upload"

export interface WebhookMessage {
  number: string
  instance: string
  userInput: string
  lowerInput: string
  hasImage: boolean
  hasDocument: boolean
  hasMedia: boolean
}

export function parseWebhookMessage(body: any): WebhookMessage | null {
  if (body.event !== "messages.upsert") return null

  const data = body.data
  if (!data?.message || data.key?.fromMe) return null

  const hasImage = !!data.message.imageMessage
  const hasDocument = !!data.message.documentMessage
  const caption = data.message.imageMessage?.caption || data.message.documentMessage?.caption || ""
  const userInput = (
    data.message.conversation ||
    data.message.extendedTextMessage?.text ||
    caption ||
    ""
  ).trim()

  return {
    number: data.key.remoteJid,
    instance: body.instance,
    userInput,
    lowerInput: userInput.toLowerCase(),
    hasImage,
    hasDocument,
    hasMedia: hasImage || hasDocument,
  }
}

export async function rateLimited(req: NextRequest, key: string): Promise<NextResponse | null> {
  return await applyRateLimit(req, key, 60, 60 * 1000)
}

export function getOrCreateSession<T extends { state: string; lastInteraction: number }>(
  sessions: TTLMap<string, T>,
  key: string,
  initialState: T
): T {
  let session = sessions.get(key)
  if (!session) {
    session = initialState
    sessions.set(key, session)
  }
  session.lastInteraction = Date.now()
  sessions.set(key, session)
  return session
}

export async function handleExit(
  userInput: string,
  instance: string,
  number: string,
  sessions: TTLMap<string, any>,
  sessionKey: string
): Promise<NextResponse | null> {
  if (["sair", "encerrar", "cancelar"].includes(userInput.toLowerCase())) {
    await sendEvolutionText(instance, number, "Atendimento encerrado. Quando precisar, é só me chamar!")
    sessions.delete(sessionKey)
    return NextResponse.json({ ok: true })
  }
  return null
}

export async function processWebhookMedia(
  data: any,
  instance: string,
  number: string,
  hasImage: boolean,
  hasDocument: boolean,
  folder: string
): Promise<string | undefined> {
  const mediaMsg = data.message.imageMessage || data.message.documentMessage
  if (!mediaMsg) return undefined

  const mimeType = mediaMsg.mimetype || "application/octet-stream"
  const ext = (mimeType.split("/").pop() || "bin").replace(/[^a-z0-9]/g, "")
  const nomeArquivo = data.message.documentMessage?.fileName || `anexo_${Date.now()}.${ext}`

  const buffer = await downloadEvolutionMedia(instance, data.key, data.message?.base64, mediaMsg)

  if (buffer) {
    const url = await uploadBuffer({ buffer, fileName: nomeArquivo, mimeType, folder })
    if (url) {
      const tipo = hasImage ? "foto" : "documento"
      await sendEvolutionText(instance, number, `Recebi ${tipo === "foto" ? "a foto" : "o documento"}! ✅`)
    } else {
      await sendEvolutionText(instance, number, "Ops, tive um problema ao salvar o arquivo. Mas vou seguir mesmo assim.")
    }
    return url || undefined
  }

  const link = `${process.env.NEXT_PUBLIC_BASE_URL_WP || ""}/chamado`
  await sendEvolutionText(instance, number, `Não consegui baixar o arquivo. Se for essencial, acesse: ${link}`)
  return undefined
}

export function saveSession<T>(sessions: TTLMap<string, T>, key: string, session: T): void {
  sessions.set(key, session)
}

export function webhookError(name: string): (error: unknown) => NextResponse {
  return (error: unknown) => {
    console.error(`Erro crítico no ${name}:`, error)
    return NextResponse.json({ ok: true })
  }
}
