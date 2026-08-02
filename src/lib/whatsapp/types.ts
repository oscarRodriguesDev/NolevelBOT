import { NextRequest } from "next/server";

// ─────────────────────────────────────────────────────────────
// Tipos do domínio de integração WhatsApp — agnósticos de provedor
// O fluxo de negócio (chamados + IA) conversa apenas com estas interfaces.
// ─────────────────────────────────────────────────────────────

export interface WhatsAppMediaInfo {
  mimeType: string;
  fileName?: string;
}

export interface WhatsAppMessage {
  /** remoteJid do remetente (ex: 5511999999999@s.whatsapp.net) */
  number: string;
  /** instância/conexão declarada pelo cliente no payload */
  instance: string;
  userInput: string;
  lowerInput: string;
  hasImage: boolean;
  hasDocument: boolean;
  hasMedia: boolean;
  media?: WhatsAppMediaInfo | null;
  /** payload bruto do provedor — necessário para download de mídia */
  raw: unknown;
}

export interface ProviderContext {
  provider: string;
  instance: string;
  /** base URL da API de WhatsApp do cliente (ex: URL da Evolution self-hosted) */
  serverUrl?: string;
  /** credencial de ENVIO do provedor do cliente */
  apiKey?: string;
}

export interface WhatsAppProvider {
  name: string;

  /** Normaliza o payload do provedor para o formato interno. Retorna null p/ eventos ignoráveis. */
  parseEvent(body: unknown): { message: WhatsAppMessage | null; ctx: ProviderContext } | null;

  /** Envia mensagem de texto de volta ao cliente. */
  sendText(ctx: ProviderContext, number: string, text: string): Promise<void>;

  /** Baixa a mídia (imagem/documento) da mensagem e devolve o buffer. */
  downloadMedia(ctx: ProviderContext, message: WhatsAppMessage): Promise<Buffer | null>;

  /** Extrai o token/credencial que identifica a empresa no webhook. */
  extractToken(body: unknown, req: NextRequest): string | null;
}
