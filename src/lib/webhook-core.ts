/* eslint-disable @typescript-eslint/no-explicit-any -- payload e sessões de webhook são dinâmicos */
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/rate-limit";
import { TTLMap } from "@/lib/ttl-map";
import { sendEvolutionText } from "@/lib/usedata";
import { uploadBuffer } from "@/lib/upload";
import { evolutionProvider } from "@/lib/whatsapp/evolution-provider";
import type { WhatsAppMessage, WhatsAppProvider, ProviderContext } from "@/lib/whatsapp/types";

// compat: alias mantido para não quebrar imports existentes
export type WebhookMessage = WhatsAppMessage;

//extrai dados da mensagem do webhook do WhatsApp (delega ao provider Evolution)
export function parseWebhookMessage(body: any): WhatsAppMessage | null {
  const parsed = evolutionProvider.parseEvent(body);
  if (!parsed) return null;
  return parsed.message;
}

//aplica limite de taxa na requisicao
export async function rateLimited(req: NextRequest, key: string): Promise<NextResponse | null> {
  return await applyRateLimit(req, key, 60, 60 * 1000)
}

//obtem sessao existente ou cria uma nova
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

//encerra atendimento se usuario digitar sair/cancelar
export async function handleExit(
  userInput: string,
  instance: string,
  number: string,
  sessions: TTLMap<string, any>,
  sessionKey: string,
  sendText?: (text: string) => Promise<void>
): Promise<NextResponse | null> {
  if (["sair", "encerrar", "cancelar"].includes(userInput.toLowerCase())) {
    const send = sendText || ((text: string) => sendEvolutionText(instance, number, text))
    await send("Atendimento encerrado. Quando precisar, é só me chamar!")
    sessions.delete(sessionKey)
    return NextResponse.json({ ok: true })
  }
  return null
}

//processa e faz upload de midia recebida pelo webhook (provider-agnostic)
export async function processWebhookMedia(
  provider: WhatsAppProvider,
  ctx: ProviderContext,
  message: WhatsAppMessage,
  folder: string
): Promise<string | undefined> {
  const data = message.raw as any
  const mediaMsg = data?.message?.imageMessage || data?.message?.documentMessage
  if (!mediaMsg) return undefined

  const mimeType = mediaMsg.mimetype || "application/octet-stream"
  const ext = (mimeType.split("/").pop() || "bin").replace(/[^a-z0-9]/g, "")
  const nomeArquivo = mediaMsg.fileName || `anexo_${Date.now()}.${ext}`

  const buffer = await provider.downloadMedia(ctx, message)

  if (buffer) {
    const url = await uploadBuffer({ buffer, fileName: nomeArquivo, mimeType, folder })
    if (url) {
      const tipo = message.hasImage ? "foto" : "documento"
      await provider.sendText(ctx, message.number, `Recebi ${tipo === "foto" ? "a foto" : "o documento"}! ✅`)
    } else {
      await provider.sendText(ctx, message.number, "Ops, tive um problema ao salvar o arquivo. Mas vou seguir mesmo assim.")
    }
    return url || undefined
  }

  const link = `${process.env.NEXT_PUBLIC_BASE_URL_WP || ""}/chamado`
  await provider.sendText(ctx, message.number, `Não consegui baixar o arquivo. Se for essencial, acesse: ${link}`)
  return undefined
}

//persiste sessao no mapa TTL
export function saveSession<T>(sessions: TTLMap<string, T>, key: string, session: T): void {
  sessions.set(key, session)
}

//retorna funcao de tratamento de erro para webhooks
export function webhookError(name: string): (error: unknown) => NextResponse {
  return (error: unknown) => {
    console.error(`Erro crítico no ${name}:`, error)
    return NextResponse.json({ ok: true })
  }
}
