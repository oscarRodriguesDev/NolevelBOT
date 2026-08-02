/* eslint-disable @typescript-eslint/no-explicit-any -- payload de webhook de provedores externos é dinâmico */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { WhatsAppProvider, WhatsAppMessage, ProviderContext } from "./types";

// ─────────────────────────────────────────────────────────────
// Provider Meta Cloud API (WhatsApp Business Platform)
// - Payload: entry[].changes[].value.messages[]
// - Verificação do webhook: GET com hub.mode/hub.verify_token/hub.challenge
// - Envio: POST https://graph.facebook.com/{v}/{phone_number_id}/messages
// - Download de mídia: GET /{v}/{media_id} resolve URL temporária → bytes
//
// Autenticação do webhook NoLevel: o cliente configura a URL do webhook
// com ?token=SEU_TOKEN (query param) — sem token, responde 401.
// ─────────────────────────────────────────────────────────────

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || "v21.0";
const GRAPH_BASE = "https://graph.facebook.com";

// normaliza número: a Meta envia sem sufixo @s.whatsapp.net
function normalizeNumber(number: string): string {
  return number.replace("@s.whatsapp.net", "").trim();
}

// extrai texto/legenda da mensagem da Meta
function extractUserInput(msg: any): string {
  return (
    msg?.text?.body ||
    msg?.image?.caption ||
    msg?.document?.caption ||
    ""
  ).trim();
}

export const metaProvider: WhatsAppProvider = {
  name: "meta",

  parseEvent(body: any) {
    if (!body || body.object !== "whatsapp_business_account" || !Array.isArray(body.entry)) {
      return null;
    }

    // procura o primeiro change com mensagens de entrada (ignora status/outros fields)
    const value = body.entry
      .flatMap((entry: any) => entry?.changes || [])
      .find((change: any) => change?.field === "messages")?.value;

    const msgs = value?.messages;
    if (!Array.isArray(msgs) || msgs.length === 0) return null;

    // usa a primeira mensagem (a Meta envia 1 por webhook, em geral)
    const msg = msgs[0];
    const hasImage = msg?.type === "image";
    const hasDocument = msg?.type === "document";
    const userInput = extractUserInput(msg);

    const message: WhatsAppMessage = {
      number: normalizeNumber(msg?.from || ""),
      instance: value?.metadata?.phone_number_id || "",
      userInput,
      lowerInput: userInput.toLowerCase(),
      hasImage,
      hasDocument,
      hasMedia: hasImage || hasDocument,
      media:
        hasImage || hasDocument
          ? {
              mimeType:
                msg?.image?.mime_type ||
                msg?.document?.mime_type ||
                "application/octet-stream",
              fileName: msg?.document?.filename || undefined,
            }
          : null,
      // guarda o value (contém messages[0]) para download de mídia
      raw: value,
    };

    const ctx: ProviderContext = {
      provider: "meta",
      instance: value?.metadata?.phone_number_id || "",
      // serverUrl não se aplica (a Meta tem base fixa); apiKey vem da config da empresa
    };

    return { message, ctx };
  },

  async sendText(ctx, number, text) {
    const phoneNumberId = ctx.instance;
    const token = ctx.apiKey;
    if (!phoneNumberId || !token) return;

    try {
      await fetch(`${GRAPH_BASE}/${GRAPH_VERSION}/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: normalizeNumber(number),
          type: "text",
          text: { body: text },
        }),
      });
    } catch {
      // falha de envio não deve derrubar o processamento da mensagem
    }
  },

  async downloadMedia(ctx, message) {
    const token = ctx.apiKey;
    const value = message.raw as any;
    const msg = value?.messages?.[0];
    const mediaId = msg?.image?.id || msg?.document?.id;
    if (!mediaId || !token) return null;

    try {
      // 1. resolve a URL assinada da mídia
      const res = await fetch(`${GRAPH_BASE}/${GRAPH_VERSION}/${mediaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const data = (await res.json()) as any;
      if (!data?.url) return null;

      // 2. baixa os bytes
      const dl = await fetch(data.url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!dl.ok) return null;
      return Buffer.from(await dl.arrayBuffer());
    } catch {
      return null;
    }
  },

  async verifyWebhook(req: NextRequest) {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const verifyToken = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    // só se aplica a requisições de assinatura da Meta
    if (mode !== "subscribe" || !verifyToken || !challenge) return null;

    const empresa = await prisma.empresa.findFirst({
      where: { evolution_token: verifyToken },
      select: { id: true },
    });
    if (!empresa) return new Response("forbidden", { status: 403 });

    // devolve o challenge como texto puro, conforme esperado pela Meta
    return new Response(challenge);
  },

  extractToken(body: any, req: NextRequest): string | null {
    // a Meta não permite headers custom no webhook → token vai na URL (?token=)
    // (aceita também o header x-webhook-token para integrações que consigam enviar)
    const url = new URL(req.url);
    const queryToken = url.searchParams.get("token");
    if (queryToken) return queryToken;
    const headerToken = req.headers.get("x-webhook-token");
    if (headerToken) return headerToken;
    return null;
  },
};
