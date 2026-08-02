/* eslint-disable @typescript-eslint/no-explicit-any -- payload de webhook de provedores externos é dinâmico */
import { sendEvolutionText, downloadEvolutionMedia } from "@/lib/usedata";
import type { WhatsAppProvider, WhatsAppMessage, ProviderContext } from "./types";

// ─────────────────────────────────────────────────────────────
// Provider Evolution API (formato Baileys `messages.upsert`)
// Comportamento idêntico ao código original, agora isolado atrás
// da interface WhatsAppProvider.
// ─────────────────────────────────────────────────────────────

// extrai o texto/legenda da mensagem Baileys
function extractUserInput(message: any): string {
  const caption =
    message.imageMessage?.caption || message.documentMessage?.caption || "";
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    caption ||
    ""
  ).trim();
}

export const evolutionProvider: WhatsAppProvider = {
  name: "evolution",

  parseEvent(body: any) {
    if (!body || body.event !== "messages.upsert") return null;

    const data = body.data;
    if (!data?.message || data.key?.fromMe) return null;

    const hasImage = !!data.message.imageMessage;
    const hasDocument = !!data.message.documentMessage;
    const userInput = extractUserInput(data.message);

    const message: WhatsAppMessage = {
      number: data.key.remoteJid,
      instance: body.instance || "",
      userInput,
      lowerInput: userInput.toLowerCase(),
      hasImage,
      hasDocument,
      hasMedia: hasImage || hasDocument,
      media:
        hasImage || hasDocument
          ? {
              mimeType:
                data.message.imageMessage?.mimetype ||
                data.message.documentMessage?.mimetype ||
                "application/octet-stream",
              fileName: data.message.documentMessage?.fileName || undefined,
            }
          : null,
      raw: data,
    };

    const ctx: ProviderContext = {
      provider: "evolution",
      instance: body.instance || "",
      serverUrl: body.server_url || undefined,
      apiKey: body.apikey || undefined,
    };

    return { message, ctx };
  },

  async sendText(ctx, number, text) {
    return sendEvolutionText(ctx.instance, number, text, ctx.serverUrl, ctx.apiKey);
  },

  async downloadMedia(ctx, message) {
    const data = message.raw as any;
    const mediaMsg = data?.message?.imageMessage || data?.message?.documentMessage;
    return downloadEvolutionMedia(ctx.instance, data?.key, data?.message?.base64, mediaMsg);
  },

  extractToken(body: any): string | null {
    const token = body?.apikey;
    return typeof token === "string" && token.length > 0 ? token : null;
  },
};
