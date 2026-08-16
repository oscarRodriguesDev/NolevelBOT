// src/app/api/webhooks/asaas/route.ts
// Webhook de pagamentos do Asaas.
// Fluxo: valida token -> consulta reversa GET /payments/{id} (evita spoofing) -> atualiza empresa
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  consultarCobranca,
  isAsaasConfigured,
} from "@/lib/asaas"
import { TTLMap } from "@/lib/ttl-map"

// Idempotência: evita processar o mesmo evento 2x (cache de 24h)
const eventosProcessados = new TTLMap<string, boolean>(24 * 60 * 60 * 1000)

function getWebhookToken(): string | undefined {
  return (
    process.env.ASAAS_WEBHOOK_TOKEN ||
    process.env.ASAAS_TOKEN_WEBHOOK ||
    undefined
  )
}

// Hash p/ diagnóstico SEM expor o token (nunca logar o valor real)
function hashSegredo(v: string): string {
  let h = 5381
  for (let i = 0; i < v.length; i++) h = ((h << 5) + h + v.charCodeAt(i)) >>> 0
  return h.toString(16).padStart(8, "0")
}

function amostraSegredo(v: string): string {
  if (v.length <= 8) return "***"
  return `${v.slice(0, 4)}...${v.slice(-4)}`
}

// Extrai o evento do payload (formato atual do Asaas e formato legado)
function extrairEvento(body: any): {
  event: string
  paymentId: string
  eventId: string
} {
  const event =
    body?.event || body?.eventType || body?.type || "UNKNOWN"
  const payment =
    body?.payment || body?.paymentData || body?.data?.payment || {}
  const paymentId =
    body?.paymentId ||
    payment?.id ||
    body?.data?.id ||
    payment?.paymentId ||
    ""
  const eventId = body?.id || body?.eventId || `${event}-${paymentId}`
  return { event: String(event).toUpperCase(), paymentId: String(paymentId), eventId: String(eventId) }
}

// Localiza a empresa pelo externalReference / ids salvos do Asaas
async function localizarEmpresa(ext: string | null, payment: any) {
  if (!ext) return null
  return prisma.empresa.findUnique({
    where: { id: ext },
    select: {
      id: true,
      nome: true,
      statusPagamento: true,
      trialAtivo: true,
      asaasSubscriptionId: true,
      asaasCustomerId: true,
      asaasPaymentId: true,
    },
  })
}

export async function POST(req: NextRequest) {
  // 1) Validação de token (header)
  // O Asaas envia o token de autenticação do webhook no header "asaas-access-token"
  // (também aceitamos Authorization Bearer / x-asaas-token / asaas_access_token por compatibilidade)
  const headers = req.headers
  const tokenHeader = headers.get("authorization") || ""
  const token =
    (tokenHeader.replace(/^Bearer\s+/i, "") ||
      headers.get("x-asaas-token") ||
      headers.get("asaas-access-token") ||
      headers.get("asaas_access_token") ||
      "")
      .trim()

  const expected = (getWebhookToken() || "").trim()
  const temTokenConfigurado = Boolean(expected)

  if (!temTokenConfigurado || token !== expected) {
    // Diagnóstico SEM expor segredos: loga hashes para comparar no Vercel.
    // `token` vazio = o header não foi lido (código antigo em produção) ou o Asaas não enviou.
    console.warn("[webhook-asaas] token inválido", {
      tokenRecebidoHash: token ? hashSegredo(token) : "vazio",
      tokenEsperadoHash: expected ? hashSegredo(expected) : "nao-configurado",
      headersRecebidos: [
        headers.get("asaas-access-token") ? "asaas-access-token" : null,
        headers.get("asaas_access_token") ? "asaas_access_token" : null,
        headers.get("x-asaas-token") ? "x-asaas-token" : null,
        tokenHeader ? "authorization" : null,
      ].filter(Boolean),
    })
    if (!temTokenConfigurado) {
      return NextResponse.json({ error: "Token do webhook não configurado no servidor" }, { status: 401 })
    }
    if (!token) {
      return NextResponse.json({ error: "Token não enviado (header asaas-access-token ausente)" }, { status: 401 })
    }
    return NextResponse.json({ error: "Token inválido" }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 })
  }

  const { event, paymentId, eventId } = extrairEvento(body)

  // 2) Idempotência
  const chaveIdempotencia = `${event}:${paymentId || eventId}`
  if (eventosProcessados.get(chaveIdempotencia)) {
    return NextResponse.json({ ok: true, idempotent: true })
  }

  // 3) Consulta reversa (evita spoofing) — só quando o Asaas está configurado
  if (isAsaasConfigured() && paymentId) {
    try {
      const cobranca = await consultarCobranca(paymentId)
      if (!cobranca || !cobranca.id) {
        return NextResponse.json({ error: "Cobrança não encontrada no Asaas" }, { status: 404 })
      }
      body = { ...body, payment: { ...(body?.payment || {}), ...cobranca } }
    } catch {
      return NextResponse.json({ error: "Falha na validação reversa" }, { status: 502 })
    }
  }

  // 4) Mapeia evento -> novo status
  let novoStatus:
    | "PAGO"
    | "ATRASADO"
    | "CANCELADO"
    | "REEMBOLSADO"
    | "PENDENTE" | null = null

  if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED" || event === "PAYMENT_CREDIT_CARD_CONFIRMED") {
    novoStatus = "PAGO"
  } else if (event === "PAYMENT_OVERDUE" || event === "PAYMENT_DUNNING_RECEIVED") {
    novoStatus = "ATRASADO"
  } else if (event === "PAYMENT_REFUNDED") {
    novoStatus = "REEMBOLSADO"
  } else if (event === "PAYMENT_CANCELLED" || event === "SUBSCRIPTION_CANCELLED" || event === "PAYMENT_DELETED") {
    novoStatus = "CANCELADO"
  } else if (event === "PAYMENT_PENDING" || event === "PAYMENT_CREATED") {
    novoStatus = "PENDENTE"
  }

  const externalReference =
    body?.payment?.externalReference || body?.externalReference || null
  const subscriptionId =
    body?.payment?.subscription || body?.subscription || null
  const customerId = body?.payment?.customer || body?.customer || null

  // 5) Localiza a empresa
  let empresa =
    (externalReference ? await localizarEmpresa(String(externalReference), body.payment) : null) ||
    (subscriptionId
      ? await prisma.empresa.findFirst({ where: { asaasSubscriptionId: String(subscriptionId) } })
      : null) ||
    (customerId
      ? await prisma.empresa.findFirst({ where: { asaasCustomerId: String(customerId) } })
      : null) ||
    (paymentId
      ? await prisma.empresa.findFirst({ where: { asaasPaymentId: paymentId } })
      : null)

  if (!empresa) {
    return NextResponse.json({ ok: true, ignored: "empresa não encontrada" })
  }

  // 6) Atualiza a empresa
  if (novoStatus) {
    await prisma.empresa.update({
      where: { id: empresa.id },
      data: {
        statusPagamento: novoStatus,
        // Pagamento confirmado = trial encerrado e acesso liberado
        trialAtivo: novoStatus === "PAGO" ? false : empresa.trialAtivo,
        asaasSubscriptionId: subscriptionId || empresa.asaasSubscriptionId,
        asaasCustomerId: customerId || empresa.asaasCustomerId,
        asaasPaymentId: paymentId || empresa.asaasPaymentId,
      },
    })

    // 7) Invalida cache de módulos/acesso da empresa
    try {
      await prisma.cache.deleteMany({ where: { key: { startsWith: `empresa:modulos:${empresa.id}` } } })
    } catch {
      // cache ausente, ok
    }
  }

  eventosProcessados.set(chaveIdempotencia, true)

  return NextResponse.json({ ok: true, status: novoStatus })
}

export async function GET() {
  // Health check + diagnóstico (nunca expõe o token real)
  const token = getWebhookToken() || ""
  const headersAceitos = ["asaas-access-token", "asaas_access_token", "x-asaas-token", "authorization (Bearer)"]
  return NextResponse.json({
    ok: true,
    service: "asaas-webhook",
    codigoVersao: "v2-header-asaas-access-token", // presente apenas no código novo (>= 479a670)
    tokenConfigurado: Boolean(token),
    tokenAmostra: token ? amostraSegredo(token) : null,
    tokenHash: token ? hashSegredo(token) : null,
    headersAceitos,
  })
}
