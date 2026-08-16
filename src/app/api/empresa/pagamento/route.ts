import { NextRequest, NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { limparCPF } from "@/util/limparcpfs"
import { getPlanoPorSlug } from "@/lib/planos-server"
import {
  criarAssinatura,
  getAsaasModo,
  isAsaasConfigured,
  TRIAL_DIAS,
} from "@/lib/asaas"
import { storeError } from "@/lib/error-store"
import { validarTokenPagamento } from "@/lib/token-pagamento"

// Página própria de pagamento (pós-signup, sem sessão):
// - GET  ?t=<token>  → dados da cobrança (plano, valor) para montar a página
// - POST body        → tokeniza o cartão e cria a assinatura real no Asaas
//
// PCI: o número do cartão é usado UMA única vez para tokenizar no Asaas.
// NUNCA é persistido no banco e nunca entra em logs/erros.

async function empresaPeloToken(token: string) {
  const empresaId = validarTokenPagamento(token)
  if (!empresaId) return null
  return prisma.empresa.findUnique({
    where: { id: empresaId },
    select: {
      id: true,
      nome: true,
      plano: true,
      cnpj: true,
      statusPagamento: true,
      trialAtivo: true,
      trialUsado: true,
    },
  })
}

export async function GET(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "empresa-pagamento-get", 60, 60 * 1000)
  if (rateLimit) return rateLimit

  const { searchParams } = new URL(req.url)
  const token = searchParams.get("t") || ""

  const empresa = await empresaPeloToken(token)
  if (!empresa) {
    return NextResponse.json({ error: "Link de pagamento inválido ou expirado" }, { status: 400 })
  }

  const planoRegistro = await getPlanoPorSlug(empresa.plano).catch(() => null)
  if (!planoRegistro) {
    return NextResponse.json({ error: "Plano da empresa não encontrado" }, { status: 500 })
  }

  return NextResponse.json({
    empresa: empresa.nome,
    plano: planoRegistro.nome,
    valor: planoRegistro.preco,
    modo: getAsaasModo(),
    asaasConfigurado: isAsaasConfigured(),
    trialDias: TRIAL_DIAS,
    statusPagamento: empresa.statusPagamento,
    trialAtivo: empresa.trialAtivo,
    trialUsado: empresa.trialUsado,
    trialDisponivel: !empresa.trialUsado,
  })
}

export async function POST(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "empresa-pagamento-post", 15, 5 * 60 * 1000)
  if (rateLimit) return rateLimit

  try {
    const body = await req.json()
    const { token, cartao, titular } = body || {}

    if (!token || !cartao?.number || !cartao?.holderName || !cartao?.expiryMonth || !cartao?.expiryYear || !cartao?.ccv) {
      return NextResponse.json({ error: "Dados do cartão incompletos" }, { status: 400 })
    }

    // Dados do titular são obrigatórios na tokenização do Asaas
    const titularPostalCode = String(titular?.postalCode || "").replace(/\D/g, "")
    const titularAddressNumber = String(titular?.addressNumber || "").trim()
    const titularPhone = String(titular?.phone || "").replace(/\D/g, "")
    if (titularPostalCode.length !== 8) {
      return NextResponse.json({ error: "CEP do titular é obrigatório (8 dígitos)" }, { status: 400 })
    }
    if (!titularAddressNumber) {
      return NextResponse.json({ error: "Número do endereço do titular é obrigatório" }, { status: 400 })
    }
    if (titularPhone.length < 10) {
      return NextResponse.json({ error: "Telefone do titular é obrigatório (com DDD)" }, { status: 400 })
    }

    const empresa = await empresaPeloToken(String(token))
    if (!empresa) {
      return NextResponse.json({ error: "Link de pagamento inválido ou expirado. Crie sua conta novamente." }, { status: 400 })
    }

    // Validações do cartão
    const numero = String(cartao.number).replace(/\D/g, "")
    const ccv = String(cartao.ccv).replace(/\D/g, "")
    const mes = Number(cartao.expiryMonth)
    const ano = Number(String(cartao.expiryYear).slice(-4))
    if (numero.length < 13 || numero.length > 19) {
      return NextResponse.json({ error: "Número do cartão inválido" }, { status: 400 })
    }
    if (ccv.length < 3 || ccv.length > 4) {
      return NextResponse.json({ error: "CVV inválido" }, { status: 400 })
    }
    if (mes < 1 || mes > 12 || !Number.isInteger(ano) || ano < new Date().getFullYear()) {
      return NextResponse.json({ error: "Validade do cartão inválida" }, { status: 400 })
    }

    const planoRegistro = await getPlanoPorSlug(empresa.plano).catch(() => null)
    if (!planoRegistro) {
      return NextResponse.json({ error: "Plano da empresa não encontrado" }, { status: 500 })
    }

    // Titular/customer: usa o CPF do admin da empresa quando disponível
    const admin = await prisma.user.findFirst({
      where: { empresaId: empresa.id, role: "ADMIN" },
      select: { email: true, cpf: true },
    })
    const cpfAdmin = admin?.cpf ? limparCPF(admin.cpf) : ""

    let assinatura
    try {
      // IP real do cliente (obrigatório na tokenização do cartão no Asaas).
      // Nunca usar o IP do servidor.
      const remoteIp =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
        ""
      // Quem chega nesta rota optou por PAGAMENTO IMEDIATO (trial não usado aqui).
      // `trial: 0` → primeira cobrança é imediata (sem paymentDelay no Asaas).
      assinatura = await criarAssinatura({
        trial: 0,
        cycle: "MONTHLY",
        externalReference: empresa.id,
        nome: empresa.nome,
        cpfCnpj: empresa.cnpj,
        email: admin?.email,
        valor: planoRegistro.preco,
        cartao: {
          number: numero,
          holderName: String(cartao.holderName),
          expiryMonth: mes,
          expiryYear: ano,
          ccv,
        },
        titularCpfCnpj: cpfAdmin,
        titularPostalCode,
        titularAddressNumber,
        titularPhone,
        remoteIp,
      })
    } catch (e) {
      const code = storeError(e, `asaas:pagar:${empresa.id}`)
      console.error(`[${code}] Falha ao processar pagamento Asaas (empresa ${empresa.id})`)
      const msg = e instanceof Error ? e.message : String(e)
      return NextResponse.json(
        {
          error: "Não foi possível processar o pagamento. Tente novamente.",
          codigo: code,
          detalhe: msg.slice(0, 200),
        },
        { status: 502 }
      )
    }

    await prisma.empresa.update({
      where: { id: empresa.id },
      data: {
        asaasCustomerId: assinatura.customerId,
        asaasSubscriptionId: assinatura.subscriptionId,
        asaasPaymentId: assinatura.paymentId,
        // Pagamento imediato: não está mais em trial (acesso só após confirmação PAGO).
        trialAtivo: false,
      },
    })

    return NextResponse.json({
      ok: true,
      status: assinatura.status,
      mock: assinatura.mock,
      valor: assinatura.valor,
    })
  } catch (error: any) {
    console.error("Erro ao processar pagamento:", error)
    return NextResponse.json({ error: "Erro ao processar pagamento" }, { status: 500 })
  }
}
