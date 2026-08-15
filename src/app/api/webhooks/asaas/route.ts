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
  const tokenHeader = req.headers.get("authorization") || ""
  const token =
    tokenHeader.replace(/^Bearer\s+/i, "") || req.headers.get("x-asaas-token") || ""

  const expected = getWebhookToken()
  if (!expected || token !== expected) {
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
  // Health check do webhook
  return NextResponse.json({ ok: true, service: "asaas-webhook" })
}
