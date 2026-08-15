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

// Dias de trial padrão concedidos no signup (primeira cobrança após este período)
export const TRIAL_DIAS = 7

export interface DadosCartao {
  number: string
  holderName: string
  expiryMonth: string | number
  expiryYear: string | number
  ccv: string
}

export interface DadosCriarAssinatura {
  trial: number // dias de trial (primeira cobrança após este período)
  cycle: CicloAsaas
  externalReference: string // empresaId
  nome: string
  cpfCnpj: string // CPF/CNPJ da empresa (customer)
  email?: string
  valor: number // valor real do plano (em reais)
  cartao?: DadosCartao // dados do cartão do cliente (nunca persistidos)
  creditCardToken?: string // token já tokenizado no Asaas (dispensa `cartao`)
  titularCpfCnpj?: string // CPF/CNPJ do titular do cartão
  titularPostalCode?: string
  titularPhone?: string
}

export interface AssinaturaCriada {
  subscriptionId: string
  customerId: string
  paymentId: string | null
  status: string
  valor: number
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

// Modo de operação atual: "mock" (sem chave), "sandbox" ou "producao"
export function getAsaasModo(): "mock" | "sandbox" | "producao" {
  if (!isAsaasConfigured()) return "mock"
  return getAsaasBaseUrl().includes("sandbox") ? "sandbox" : "producao"
}

// Exibe a chave mascarada (nunca expõe a chave completa em logs/UI)
export function mascararChave(chave?: string): string {
  const k = chave || process.env.ASAAS_API_KEY || ""
  if (!k) return "(não configurada)"
  if (k.length <= 10) return `${k.slice(0, 3)}...`
  return `${k.slice(0, 6)}...${k.slice(-4)}`
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

// Cria (ou reutiliza) o cliente no Asaas, tokeniza o cartão e cria a assinatura
// com o valor REAL do plano e período de trial.
// externalReference = empresaId, usado pelo webhook para localizar a empresa.
// ATENÇÃO PCI: `dados.cartao` é usado APENAS para tokenizar no Asaas —
// o número do cartão NUNCA é persistido nem logado por este módulo.
export async function criarAssinatura(
  dados: DadosCriarAssinatura
): Promise<AssinaturaCriada> {
  // Fallback dev: sem API key configurada, retorna mock que mantém o fluxo local
  if (!isAsaasConfigured()) {
    const paymentId = `pay_mock_${dados.externalReference.slice(0, 8)}_${Date.now()}`
    return {
      subscriptionId: `sub_mock_${dados.externalReference.slice(0, 8)}_${Date.now()}`,
      customerId: `cus_mock_${dados.externalReference.slice(0, 8)}`,
      paymentId,
      status: "PENDING",
      valor: dados.valor,
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

  // 2) Garante um token de cartão (fluxo real: página própria de pagamento)
  let creditCardToken = dados.creditCardToken
  if (!creditCardToken) {
    if (!dados.cartao?.number) {
      throw new Error(
        "Dados de cartão obrigatórios para criar assinatura real no Asaas (modo: " +
          getAsaasModo() +
          ")"
      )
    }
    const card = await asaasFetch("/creditCards", {
      method: "POST",
      body: JSON.stringify({
        customer: customer.id,
        creditCard: {
          holderName: dados.cartao.holderName,
          number: dados.cartao.number.replace(/\D/g, ""),
          expiryMonth: String(dados.cartao.expiryMonth).padStart(2, "0"),
          expiryYear: String(dados.cartao.expiryYear).slice(-4),
          ccv: dados.cartao.ccv.replace(/\D/g, ""),
        },
        creditCardHolderInfo: {
          name: dados.cartao.holderName,
          email: dados.email,
          cpfCnpj: dados.titularCpfCnpj || dados.cpfCnpj,
          postalCode: dados.titularPostalCode || "",
          addressNumber: "",
          phone: dados.titularPhone || "",
          mobilePhone: dados.titularPhone || "",
        },
      }),
    })
    creditCardToken = card?.id
    if (!creditCardToken) {
      throw new Error("Asaas não retornou token de cartão ao tokenizar")
    }
  }

  // 3) Cria assinatura com trial e valor real do plano
  const assinatura = await asaasFetch("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      customer: customer.id,
      billingType: "CREDIT_CARD",
      creditCardToken,
      value: dados.valor,
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
    valor: dados.valor,
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

export interface AssinaturaConsultada {
  id: string
  status: string
  cycle: string | null
  nextDueDate: string | null // próximo vencimento da recorrência
  value: number
  mock: boolean
}

// Consulta uma assinatura no Asaas (usada para exibir vencimento no financeiro)
export async function consultarAssinatura(
  subscriptionId: string
): Promise<AssinaturaConsultada> {
  if (!isAsaasConfigured()) {
    return {
      id: subscriptionId,
      status: "ACTIVE",
      cycle: "MONTHLY",
      nextDueDate: null,
      value: 0,
      mock: true,
    }
  }

  const s = await asaasFetch(`/subscriptions/${subscriptionId}`)
  return {
    id: s.id,
    status: s.status,
    cycle: s.cycle || null,
    nextDueDate: s.nextDueDate || null,
    value: Number(s.value) || 0,
    mock: false,
  }
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
