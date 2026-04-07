// app/api/dashboard/route.ts

import { NextRequest, NextResponse } from "next/server"
import { getSessionOrFail } from "@/util/permission"
import { cookies } from "next/headers"

import { PrismaClient as PrismaMaster } from "@/lib/prisma/master"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

import { PrismaClient } from "@prisma/client"

export const dynamic = "force-dynamic"

function getWeek(date: Date) {
  const first = new Date(date.getFullYear(), 0, 1)
  const diff = (date.getTime() - first.getTime()) / 86400000
  return Math.ceil((diff + first.getDay() + 1) / 7)
}

// ===== MASTER =====
const poolMaster = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapterMaster = new PrismaPg(poolMaster)

const prismaMaster = new PrismaMaster({
  adapter: adapterMaster,
})

// ===== TENANT HELPER =====
async function getTenantPrisma() {
  const cookieStore = await cookies()
  const tenantSlug = cookieStore.get("tenant")?.value

  if (!tenantSlug) throw new Error("Tenant não identificado")

  const empresa = await prismaMaster.empresa.findFirst({
    where: { slug: tenantSlug },
  })

  if (!empresa) throw new Error("Empresa não encontrada")

  const poolTenant = new Pool({
    connectionString: empresa.databaseUrl,
  })

  const adapterTenant = new PrismaPg(poolTenant)

  const prisma = new PrismaClient({
    adapter: adapterTenant,
  } as any)

  return prisma
}

// ===== GET =====
export async function GET(req: NextRequest) {
  const session = await getSessionOrFail(["ADMIN", "GESTOR", "GOD"])

  if (!session) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    const prisma = await getTenantPrisma()

    const { searchParams } = new URL(req.url)
    const periodo = searchParams.get("periodo") || "mes"

    const chamados = await prisma.chamado.findMany({
      select: {
        id: true,
        setor: true,
        descricao: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const chamadosPorSetorMap: Record<string, number> = {}

    chamados.forEach((c) => {
      if (c.status !== "FECHADO") {
        chamadosPorSetorMap[c.setor] =
          (chamadosPorSetorMap[c.setor] || 0) + 1
      }
    })

    const chamadosPorSetor = Object.entries(chamadosPorSetorMap).map(
      ([setor, total]) => ({ setor, total })
    )

    const chamadosPeriodoMap: Record<string, number> = {}

    chamados.forEach((c) => {
      const d = new Date(c.createdAt)
      let key = ""

      if (periodo === "dia") key = d.toISOString().slice(0, 10)
      if (periodo === "semana") key = `S${getWeek(d)}`
      if (periodo === "mes") key = `${d.getMonth() + 1}/${d.getFullYear()}`
      if (periodo === "ano") key = `${d.getFullYear()}`

      chamadosPeriodoMap[key] =
        (chamadosPeriodoMap[key] || 0) + 1
    })

    const chamadosPeriodo = Object.entries(chamadosPeriodoMap).map(
      ([periodo, total]) => ({ periodo, total })
    )

    const motivosMap: Record<string, number> = {}

    chamados.forEach((c) => {
      const motivo = c.descricao || "Outros"
      motivosMap[motivo] = (motivosMap[motivo] || 0) + 1
    })

    const motivosStats = Object.entries(motivosMap)
      .map(([motivo, total]) => ({ motivo, total }))
      .sort((a, b) => b.total - a.total)

    let totalTempo = 0
    let count = 0

    chamados.forEach((c) => {
      if (c.status === "FECHADO") {
        const inicio = new Date(c.createdAt).getTime()
        const fim = new Date(c.updatedAt).getTime()

        totalTempo += fim - inicio
        count++
      }
    })

    const tempoMedio = count
      ? Math.round(totalTempo / count / 3600000)
      : 0

    return NextResponse.json({
      chamadosPorSetor,
      chamadosPeriodo,
      motivosStats,
      tempoMedio,
    })
  } catch {
    return NextResponse.json(
      { error: "Erro ao gerar dashboard" },
      { status: 500 }
    )
  }
}