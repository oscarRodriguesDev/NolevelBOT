// src/app/api/auth/verificar-acesso/route.ts
// Pré-verificação ANTES do login: informa o motivo do bloqueio (pagamento/trial)
// quando o usuário NÃO consegue entrar. Não revela existência de conta.
import { NextRequest, NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"

const MOTIVOS: Record<string, { motivo: string; mensagem: string }> = {
  ATRASADO: {
    motivo: "ATRASADO",
    mensagem:
      "Seu pagamento está em atraso. Regularize para liberar o acesso da sua empresa.",
  },
  CANCELADO: {
    motivo: "CANCELADO",
    mensagem:
      "Sua assinatura foi cancelada. Renove o plano para continuar usando a plataforma.",
  },
  REEMBOLSADO: {
    motivo: "REEMBOLSADO",
    mensagem:
      "O pagamento foi reembolsado e sua assinatura está inativa. Contrate novamente para voltar a usar.",
  },
  PENDENTE: {
    motivo: "PENDENTE",
    mensagem:
      "Seu pagamento ainda não foi confirmado. Assim que confirmarmos, seu acesso será liberado automaticamente.",
  },
}

const BLOQUEIO_GENERICO = {
  motivo: "BLOQUEADO",
  mensagem:
    "Seu acesso está bloqueado no momento. Entre em contato com o suporte para resolver.",
}

export async function POST(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "verificar-acesso", 20, 60 * 1000)
  if (rateLimit) return rateLimit

  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body?.email || "").trim().toLowerCase()
    if (!email) {
      // Sem email não dá para verificar — deixa o fluxo normal seguir
      return NextResponse.json({ acessivel: true })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true, empresaId: true },
    })

    // Conta inexistente / GOD: não revela nada, o signIn decide
    if (!user || user.role === "GOD") {
      return NextResponse.json({ acessivel: true })
    }

    const empresa = await prisma.empresa.findUnique({
      where: { id: user.empresaId },
      select: { statusPagamento: true, trialAtivo: true },
    })
    if (!empresa) {
      return NextResponse.json({ acessivel: true })
    }

    const acessoOk =
      empresa.statusPagamento === "PAGO" || empresa.trialAtivo === true

    if (acessoOk) {
      return NextResponse.json({ acessivel: true })
    }

    const info =
      MOTIVOS[empresa.statusPagamento] || BLOQUEIO_GENERICO

    return NextResponse.json({ acessivel: false, ...info })
  } catch (err) {
    console.error("Erro ao verificar acesso:", err)
    // Em falha, não bloqueia o fluxo normal do login
    return NextResponse.json({ acessivel: true })
  }
}
