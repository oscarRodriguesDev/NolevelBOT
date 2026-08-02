import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, checkRateLimit } from "@/lib/rate-limit";
import type { WhatsAppProvider, WhatsAppMessage, ProviderContext } from "./types";
import { evolutionProvider } from "./evolution-provider";

// ─────────────────────────────────────────────────────────────
// Registry de provedores + rota comum dos webhooks
// Centraliza: rate limit → parse → autenticação (401) → despacho
// ─────────────────────────────────────────────────────────────

const registry = new Map<string, WhatsAppProvider>();

export function registerProvider(provider: WhatsAppProvider): void {
  registry.set(provider.name, provider);
}

export function getProvider(name: string): WhatsAppProvider | undefined {
  return registry.get(name);
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
 * Rota comum dos webhooks do sistema.
 * Fase 1: provedor Evolution (o cliente usa a própria instância e envia o token da empresa).
 * O webhook só processa mensagens de empresas com token válido (401 em token ausente/inválido).
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

  // Fase 1: provedor Evolution. Futuros provedores serão detectados por header/heurística.
  const provider = getProvider("evolution")!;
  const parsed = provider.parseEvent(body);
  if (!parsed || !parsed.message) {
    // evento ignorável (status, fromMe, etc.)
    return { ok: false, response: NextResponse.json({ ok: true }) };
  }

  // Autenticação: identifica a empresa pelo token do webhook.
  const token = provider.extractToken(body, req);
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Token de webhook ausente." }, { status: 401 }),
    };
  }

  const empresa = await prisma.empresa.findFirst({
    where: { evolution_token: token },
    select: { id: true },
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

  return {
    ok: true,
    message: parsed.message,
    ctx: parsed.ctx,
    provider,
    empresaId: empresa.id,
  };
}
