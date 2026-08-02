import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, checkRateLimit } from "@/lib/rate-limit";
import type { WhatsAppProvider, WhatsAppMessage, ProviderContext } from "./types";
import { evolutionProvider } from "./evolution-provider";

// ─────────────────────────────────────────────────────────────
// Registry de provedores + rota comum dos webhooks
// Centraliza: rate limit → parse → autenticação (401) → despacho
// O contexto de ENVIO vem da configuração cadastrada na empresa
// (evolution_url/api_key) — NUNCA do corpo do webhook (anti-SSRF).
// ─────────────────────────────────────────────────────────────

const registry = new Map<string, WhatsAppProvider>();

export function registerProvider(provider: WhatsAppProvider): void {
  registry.set(provider.name, provider);
}

export function getProvider(name: string): WhatsAppProvider | undefined {
  return registry.get(name.toLowerCase());
}

// registra os providers padrão (idempotente no carregamento)
if (!registry.has(evolutionProvider.name)) {
  registerProvider(evolutionProvider);
}

export interface WebhookHandleResult {
  ok: boolean;
  response?: NextResponse;
  message?: WhatsAppMessage;
  ctx?: ProviderContext;
  provider?: WhatsAppProvider;
  empresaId?: string;
}

/**
 * Rota comum dos webhooks do sistema (BYO API).
 * - Eventos ignoráveis (status, fromMe, etc.) respondem 200 { ok: true } sem processar.
 * - Mensagens reais exigem token válido da empresa (401 em ausente/inválido).
 * - O envio de resposta usa a configuração da EMPRESA, não o corpo do request.
 */
export async function handleWebhook(
  req: NextRequest,
  route: string
): Promise<WebhookHandleResult> {
  // proteção anti-abuso por IP
  const ipLimit = await applyRateLimit(req, `webhook:${route}`, 60, 60 * 1000);
  if (ipLimit) return { ok: false, response: ipLimit };

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    // body inválido: responde ok para o provedor não fazer retry
    return { ok: false, response: NextResponse.json({ ok: true }) };
  }

  // detecta o provedor pelo header (opcional); default: evolution
  const headerProvider = (req.headers.get("x-whatsapp-provider") || "evolution").toLowerCase();
  const provider = getProvider(headerProvider) || getProvider("evolution")!;

  // parse inicial — eventos ignoráveis respondem ok sem exigir token
  const parsed = provider.parseEvent(body);
  if (!parsed || !parsed.message) {
    return { ok: false, response: NextResponse.json({ ok: true }) };
  }

  // autenticação: identifica a empresa pelo token do webhook
  const token = provider.extractToken(body, req);
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Token de webhook ausente." }, { status: 401 }),
    };
  }

  const empresa = await prisma.empresa.findFirst({
    where: { evolution_token: token },
    select: { id: true, provider: true, evolution_url: true, api_key: true },
  });
  if (!empresa) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Token de webhook inválido." }, { status: 401 }),
    };
  }

  // rate limit por empresa (anti-abuso multi-tenant)
  const rl = await checkRateLimit(`empresa:${empresa.id}:${route}`, 240, 60 * 1000);
  if (!rl.allowed) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Muitas requisições." }, { status: 429 }),
    };
  }

  // provider efetivo conforme configurado na empresa (futuro: META, etc.)
  const providerName = (empresa.provider || "EVOLUTION").toLowerCase();
  const effectiveProvider = getProvider(providerName) || provider;

  // contexto de ENVIO vindo da configuração da empresa (não do body)
  const ctx: ProviderContext = {
    provider: providerName,
    instance: parsed.ctx.instance,
    serverUrl: empresa.evolution_url || undefined,
    apiKey: empresa.api_key || undefined,
  };

  return {
    ok: true,
    message: parsed.message,
    ctx,
    provider: effectiveProvider,
    empresaId: empresa.id,
  };
}
