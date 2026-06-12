import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionOrFail } from "@/util/permission"

function getWeek(date: Date) {
  const first = new Date(date.getFullYear(), 0, 1)
  const diff = (date.getTime() - first.getTime()) / 86400000
  return Math.ceil((diff + first.getDay() + 1) / 7)
}

export async function GET() {
  const session = await getSessionOrFail(["GOD"])
  if (!session) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    const godEmpresaId = session.user.empresaId

    const empresas = await prisma.empresa.findMany({
      select: {
        id: true,
        nome: true,
        modulos: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            chamados: true,
            cpfs: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const totalEmpresas = empresas.length
    const totalUsuarios = empresas.reduce((acc, e) => acc + e._count.users, 0)
    const totalChamados = empresas.reduce((acc, e) => acc + e._count.chamados, 0)
    const totalCpfs = empresas.reduce((acc, e) => acc + e._count.cpfs, 0)

    const totalLeads = await prisma.cpfsLeads.count()

    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    })

    const roleDistribution = usersByRole.map((r) => ({
      role: r.role,
      total: r._count.id,
    }))

    const globalChamados = await prisma.chamado.findMany({
      select: {
        id: true,
        status: true,
        setor: true,
        empresaId: true,
        createdAt: true,
        updatedAt: true,
        prioridade: true,
      },
    })

    const statusMap: Record<string, number> = {}
    const moduloMap: Record<string, number> = {}
    const periodoMap: Record<string, number> = {}
    const empresaChamadosMap: Record<string, number> = {}
    const setorMap: Record<string, number> = {}
    let totalAbertosGlobal = 0
    let totalFechadosGlobal = 0
    let somaTempoGlobal = 0
    let countTempoGlobal = 0

    globalChamados.forEach((c) => {
      const aberto = c.status !== "CONCLUIDO" && c.status !== "CANCELADO" && c.status !== "FECHADO"
      if (aberto) totalAbertosGlobal++
      else totalFechadosGlobal++

      const statusLabel = c.status || "INDEFINIDO"
      statusMap[statusLabel] = (statusMap[statusLabel] || 0) + 1

      empresaChamadosMap[c.empresaId] = (empresaChamadosMap[c.empresaId] || 0) + 1
      setorMap[c.setor] = (setorMap[c.setor] || 0) + 1

      const d = new Date(c.createdAt)
      const key = `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
      periodoMap[key] = (periodoMap[key] || 0) + 1

      if (!aberto) {
        const inicio = new Date(c.createdAt).getTime()
        const fim = new Date(c.updatedAt).getTime()
        somaTempoGlobal += fim - inicio
        countTempoGlobal++
      }
    })

    const tempoMedioGlobal = countTempoGlobal ? Math.round(somaTempoGlobal / countTempoGlobal / 3600000) : 0
    const taxaConclusaoGlobal = globalChamados.length ? Math.round((totalFechadosGlobal / globalChamados.length) * 100) : 0

    const empresasComChamados = empresas
      .map((e) => ({
        id: e.id,
        nome: e.nome,
        modulos: e.modulos,
        usuarios: e._count.users,
        chamados: empresaChamadosMap[e.id] || 0,
        cpfs: e._count.cpfs,
        ultimaAtividade: e.updatedAt,
      }))
      .sort((a, b) => b.chamados - a.chamados)

    const topEmpresas = [...empresasComChamados].slice(0, 5)
    const empresasInativas = empresasComChamados.filter((e) => {
      const dias = (Date.now() - new Date(e.ultimaAtividade).getTime()) / 86400000
      return dias > 30
    })

    const sortByTotal = (arr: { total: number }[]) => arr.sort((a, b) => b.total - a.total)

    let logsRecentes: unknown[] = []
    try {
      logsRecentes = await prisma.logs_de_acesso.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    } catch {
      console.warn("Tabela logs_de_acesso não disponível")
    }

    const response: Record<string, unknown> = {
      global: {
        totalEmpresas,
        totalUsuarios,
        totalChamados: globalChamados.length,
        totalAbertos: totalAbertosGlobal,
        totalFechados: totalFechadosGlobal,
        totalCpfs,
        totalLeads,
        tempoMedio: tempoMedioGlobal,
        taxaConclusao: taxaConclusaoGlobal,
      },
      empresas: empresasComChamados,
      topEmpresas,
      empresasInativas: empresasInativas.length,
      roleDistribution,
      statusStats: sortByTotal(
        Object.entries(statusMap).map(([status, total]) => ({ status, total }))
      ),
      setorStats: sortByTotal(
        Object.entries(setorMap).map(([setor, total]) => ({ setor, total }))
      ),
      chamadosPeriodo: Object.entries(periodoMap).map(([periodo, total]) => ({
        periodo,
        total,
      })),
      logsRecentes,
    }

    if (godEmpresaId) {
      const empresaGod = await prisma.empresa.findUnique({
        where: { id: godEmpresaId },
        select: { nome: true, modulos: true },
      })

      const chamadosGod = globalChamados.filter((c) => c.empresaId === godEmpresaId)
      const godAbertos = chamadosGod.filter(
        (c) => c.status !== "CONCLUIDO" && c.status !== "CANCELADO" && c.status !== "FECHADO"
      )
      const godFechados = chamadosGod.filter(
        (c) => c.status === "CONCLUIDO" || c.status === "FECHADO"
      )

      const godStatusMap: Record<string, number> = {}
      chamadosGod.forEach((c) => {
        const label = c.status || "INDEFINIDO"
        godStatusMap[label] = (godStatusMap[label] || 0) + 1
      })

      response.empresaGod = {
        nome: empresaGod?.nome || "Minha Empresa",
        totalChamados: chamadosGod.length,
        abertos: godAbertos.length,
        fechados: godFechados.length,
        statusStats: Object.entries(godStatusMap).map(([status, total]) => ({ status, total })),
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Erro ao gerar dashboard GOD:", error)
    return NextResponse.json({ error: "Erro ao gerar dashboard" }, { status: 500 })
  }
}
