import { NextRequest, NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { getServerSessionRBAC } from "@/lib/rbac-server"
import { getPlanoPorSlug } from "@/lib/planos-server"
import {
  consultarAssinatura,
  isAsaasConfigured,
  type StatusPagamento,
} from "@/lib/asaas"
import { montarResumoAssinatura } from "@/lib/assinatura"

// Resumo de assinatura/financeiro da empresa (plano, trial, vencimento da recorrência)
// VISÍVEL APENAS para o ADMIN da própria empresa (quem comprou) ou GOD.
export async function GET(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "empresa-assinatura", 30, 60 * 1000)
  if (rateLimit) return rateLimit

  const { session, error } = await getServerSessionRBAC(["ADMIN", "GOD"])
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id") || session!.empresaId

    if (session!.role !== "GOD" && session!.empresaId !== id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const empresa = await prisma.empresa.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        plano: true,
        statusPagamento: true,
        trialAtivo: true,
        createdAt: true,
        asaasSubscriptionId: true,
        asaasCustomerId: true,
      },
    })
    if (!empresa) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })
    }

    // Nome do plano (tabela dinâmica planos)
    const planoRegistro = await getPlanoPorSlug(empresa.plano).catch(() => null)
    const nomePlano = planoRegistro?.nome || null

    // Próximo vencimento da recorrência (via Asaas, quando configurado)
    let dataVencimento: string | null = null
    let ciclo: string | null = null
    const asaasConfigurado = isAsaasConfigured()
    if (empresa.asaasSubscriptionId) {
      try {
        const assinatura = await consultarAssinatura(empresa.asaasSubscriptionId)
        dataVencimento = assinatura.nextDueDate
        ciclo = assinatura.cycle
      } catch (e) {
        console.error("Falha ao consultar assinatura Asaas:", e)
      }
    }

    const resumo = montarResumoAssinatura({
      plano: empresa.plano,
      nomePlano,
      statusPagamento: empresa.statusPagamento as StatusPagamento,
      trialAtivo: empresa.trialAtivo,
      createdAt: empresa.createdAt,
      dataVencimento,
      ciclo,
      asaasSubscriptionId: empresa.asaasSubscriptionId,
      asaasCustomerId: empresa.asaasCustomerId,
      asaasConfigurado,
    })

    return NextResponse.json({ empresaId: empresa.id, ...resumo })
  } catch (err) {
    console.error("Erro ao buscar assinatura:", err)
    return NextResponse.json({ error: "Erro ao buscar assinatura" }, { status: 500 })
  }
}
