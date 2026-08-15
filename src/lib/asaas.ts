// src/lib/asaas.ts
// Integração com a API do Asaas para assinaturas SaaS.
// - Em produção: usa ASAAS_API_KEY + ASAAS_BASE_URL (API real)
// - Em dev (sem ASAAS_API_KEY): fallback mock para não quebrar o fluxo local

export type CicloAsaas =
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "SEMIANNUALLY"
  | "YEARLY"

export type StatusPagamento =
  | "PENDENTE"
  | "PAGO"
  | "ATRASADO"
  | "CANCELADO"
  | "REEMBOLSADO"

export interface DadosCriarAssinatura {
  trial: number // dias de trial
  cycle: CicloAsaas
  externalReference: string // empresaId
  nome: string
  cpfCnpj: string
  email?: string
}

export interface AssinaturaCriada {
  subscriptionId: string
  customerId: string
  paymentId: string | null
  status: string
  mock: boolean
}

export interface CobrancaConsultada {
  id: string
  status: string
  amount: number
  dueDate: string | null
  externalReference: string | null
  subscription: string | null
  mock: boolean
}

// Base URL: sandbox por padrão, prod via env
export function getAsaasBaseUrl(): string {
  return (
    process.env.ASAAS_BASE_URL?.replace(/\/$/, "") ||
    "https://sandbox.asaas.com/api/v3"
  )
}

export function isAsaasConfigured(): boolean {
  return Boolean(process.env.ASAAS_API_KEY)
}

async function asaasFetch(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const res = await fetch(`${getAsaasBaseUrl()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      access_token: process.env.ASAAS_API_KEY || "",
      ...(options.headers || {}),
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Asaas API ${res.status}: ${text.slice(0, 300)}`)
  }

  return res.json()
}

// Cria (ou reutiliza) o cliente no Asaas e a assinatura com período de trial.
// externalReference = empresaId, usado pelo webhook para localizar a empresa.
export async function criarAssinatura(
  dados: DadosCriarAssinatura
): Promise<AssinaturaCriada> {
  // Fallback dev: sem API key configurada, retorna mock que mantém o fluxo atual
  if (!isAsaasConfigured()) {
    const paymentId = `pay_mock_${dados.externalReference.slice(0, 8)}_${Date.now()}`
    return {
      subscriptionId: `sub_mock_${dados.externalReference.slice(0, 8)}_${Date.now()}`,
      customerId: `cus_mock_${dados.externalReference.slice(0, 8)}`,
      paymentId,
      status: "PENDING",
      mock: true,
    }
  }

  // 1) Busca cliente por CPF/CNPJ (evita duplicar)
  let customer = await asaasFetch(
    `/customers?cpfCnpj=${encodeURIComponent(dados.cpfCnpj)}`
  )
    .then((r) => r?.data?.[0])
    .catch(() => null)

  if (!customer) {
    customer = await asaasFetch("/customers", {
      method: "POST",
      body: JSON.stringify({
        name: dados.nome,
        cpfCnpj: dados.cpfCnpj,
        email: dados.email,
        externalReference: dados.externalReference,
      }),
    })
  }

  // 2) Cria assinatura com trial
  const assinatura = await asaasFetch("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      customer: customer.id,
      billingType: "CREDIT_CARD",
      value: 0, // valor ajustado pelo plano/checkout no Asaas
      cycle: dados.cycle,
      externalReference: dados.externalReference,
      description: `Assinatura NoLevel - ${dados.nome}`,
      // Trial em dias (primeira cobrança só após o período)
      paymentDelay: dados.trial,
    }),
  })

  return {
    subscriptionId: assinatura.id,
    customerId: customer.id,
    paymentId: assinatura.paymentId || null,
    status: assinatura.status || "PENDING",
    mock: false,
  }
}

// Consulta uma cobrança no Asaas (usada pelo webhook p/ validação reversa)
export async function consultarCobranca(
  paymentId: string
): Promise<CobrancaConsultada> {
  if (!isAsaasConfigured()) {
    return {
      id: paymentId,
      status: "PENDING",
      amount: 0,
      dueDate: null,
      externalReference: null,
      subscription: null,
      mock: true,
    }
  }

  const p = await asaasFetch(`/payments/${paymentId}`)
  return {
    id: p.id,
    status: p.status,
    amount: Number(p.value) || 0,
    dueDate: p.dueDate || null,
    externalReference: p.externalReference || null,
    subscription: p.subscription || null,
    mock: false,
  }
}

// Cancela uma assinatura (ex: cancelamento de plano)
export async function cancelarAssinatura(
  subscriptionId: string
): Promise<void> {
  if (!isAsaasConfigured()) return
  await asaasFetch(`/subscriptions/${subscriptionId}`, {
    method: "DELETE",
  })
}

// Mapeia o status do Asaas para o enum do schema
export function mapearStatusAsaas(statusAsaas: string): StatusPagamento {
  switch (statusAsaas) {
    case "RECEIVED":
    case "CONFIRMED":
    case "PAID":
      return "PAGO"
    case "OVERDUE":
      return "ATRASADO"
    case "REFUNDED":
      return "REEMBOLSADO"
    case "CANCELLED":
    case "CANCELED":
      return "CANCELADO"
    case "PENDING":
    case "AWAITING_RISK_ANALYSIS":
    default:
      return "PENDENTE"
  }
}
