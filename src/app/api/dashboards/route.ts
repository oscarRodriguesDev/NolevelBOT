import { NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { getSessionOrFail } from "@/util/permission"
import { getTicketWhereClause } from "@/lib/rbac"
import { ROLE } from "@prisma/client"

function getWeek(date: Date) {
  const first = new Date(date.getFullYear(), 0, 1)
  const diff = (date.getTime() - first.getTime()) / 86400000
  return Math.ceil((diff + first.getDay() + 1) / 7)
}

function parseOficinaDescricao(descricao: string) {
  try {
    const parsed = JSON.parse(descricao)
    if (parsed.funcao || parsed.numeroOnibus || parsed.defeito) {
      return parsed as { funcao?: string; numeroOnibus?: string; data?: string; defeito?: string }
    }
  } catch {}
  return null
}

export async function GET(req: Request) {
  const rateLimit = await applyRateLimit(req, "dashboards", 60, 60 * 1000)
  if (rateLimit) return rateLimit
  const session = await getSessionOrFail(["ADMIN", "GESTOR", "GOD"])
  if (!session) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const periodo = searchParams.get("periodo") || "mes"
    const modulo = searchParams.get("modulo") || "corporativo"

    const userRole = session.user.role as ROLE
    const userSetor = session.user.setor || ""
    const empresaId = session.user.empresaId

    const now = new Date()
    function getMonthKey(d: Date) { return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}` }
    function getPeriodKey(d: Date) {
      if (periodo === "dia") return d.toISOString().slice(0, 10)
      if (periodo === "semana") return `S${getWeek(d)}`
      if (periodo === "mes") return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
      if (periodo === "ano") return `${d.getFullYear()}`
      return d.toISOString().slice(0, 10)
    }

    function getPeriodDateRange(p: string): Date | null {
      if (p === "dia") { const d = new Date(now); d.setHours(0,0,0,0); return d }
      if (p === "semana") { const d = new Date(now); d.setDate(d.getDate() - 7); return d }
      if (p === "mes") { return new Date(now.getFullYear(), now.getMonth(), 1) }
      if (p === "ano") { return new Date(now.getFullYear(), 0, 1) }
      return null
    }

    const dateFrom = getPeriodDateRange(periodo)
    const baseWhere = getTicketWhereClause(userRole, userSetor, empresaId) as Record<string, unknown>
    const where = { ...baseWhere, ...(dateFrom ? { createdAt: { gte: dateFrom } } : {}) }

    const sortByTotal = (arr: { total: number }[]) =>
      arr.sort((a, b) => b.total - a.total)

    if (modulo === "oficina") {
      const chamados = await prisma.chamado.findMany({
        where,
        take: 10000,
        select: {
          id: true, setor: true, descricao: true, status: true,
          prioridade: true, atendenteId: true, createdAt: true, updatedAt: true,
        },
      })

      const oficinaChamados = chamados.filter((c) => parseOficinaDescricao(c.descricao))
      const data = oficinaChamados

      const chamadosPorSetorMap: Record<string, number> = {}
      const chamadosPeriodoMap: Record<string, number> = {}
      const statusMap: Record<string, number> = {}
      const prioridadeMap: Record<string, number> = {}
      const atendentesMap: Record<string, number> = {}
      const oficinaDefeitos: Record<string, number> = {}
      const oficinaFuncoes: Record<string, number> = {}
      const oficinaVeiculos: Record<string, number> = {}
      const oficinaCorrelacao: Record<string, Record<string, number>> = {}
      const oficinaTempoDefeito: Record<string, { total: number; count: number }> = {}
      const oficinaReincidencia: Record<string, { veiculo: string; defeito: string; datas: Date[] }> = {}
      const oficinaSazonalidade: Record<string, Record<string, number>> = {}

      let totalTempo = 0; let countTempo = 0
      let totalAbertos = 0; let totalFechados = 0
      let totalTempoDiario = 0; let countTempoDiario = 0
      let totalTempoSemanal = 0; let countTempoSemanal = 0
      let totalTempoMensal = 0; let countTempoMensal = 0

      data.forEach((c) => {
        const isOpen = c.status !== "CONCLUIDO" && c.status !== "CANCELADO" && c.status !== "FECHADO"
        if (isOpen) { totalAbertos++; chamadosPorSetorMap[c.setor] = (chamadosPorSetorMap[c.setor] || 0) + 1 }
        else { totalFechados++ }

        const d = new Date(c.createdAt)
        const key = getPeriodKey(d)
        chamadosPeriodoMap[key] = (chamadosPeriodoMap[key] || 0) + 1

        const statusLabel = c.status || "INDEFINIDO"
        statusMap[statusLabel] = (statusMap[statusLabel] || 0) + 1
        const prioLabel = c.prioridade || "normal"
        prioridadeMap[prioLabel] = (prioridadeMap[prioLabel] || 0) + 1
        if (c.atendenteId) atendentesMap[c.atendenteId] = (atendentesMap[c.atendenteId] || 0) + 1

        if (c.status === "CONCLUIDO" || c.status === "FECHADO") {
          const inicio = new Date(c.createdAt).getTime()
          const fim = new Date(c.updatedAt).getTime()
          const duracao = fim - inicio
          totalTempo += duracao; countTempo++
          const diffDays = (fim - inicio) / 86400000
          if (diffDays <= 1) { totalTempoDiario += duracao; countTempoDiario++ }
          if (diffDays <= 7) { totalTempoSemanal += duracao; countTempoSemanal++ }
          if (diffDays <= 30) { totalTempoMensal += duracao; countTempoMensal++ }
        }

        const parsed = parseOficinaDescricao(c.descricao)
        if (parsed) {
          if (parsed.defeito) oficinaDefeitos[parsed.defeito] = (oficinaDefeitos[parsed.defeito] || 0) + 1
          if (parsed.funcao) oficinaFuncoes[parsed.funcao] = (oficinaFuncoes[parsed.funcao] || 0) + 1
          if (parsed.numeroOnibus) oficinaVeiculos[parsed.numeroOnibus] = (oficinaVeiculos[parsed.numeroOnibus] || 0) + 1

          const veiculo = parsed.numeroOnibus || "N/I"
          const defeito = parsed.defeito || "N/I"

          if (!oficinaCorrelacao[defeito]) oficinaCorrelacao[defeito] = {}
          oficinaCorrelacao[defeito][veiculo] = (oficinaCorrelacao[defeito][veiculo] || 0) + 1

          if (c.status === "CONCLUIDO" || c.status === "FECHADO") {
            const inicio = new Date(c.createdAt).getTime()
            const fim = new Date(c.updatedAt).getTime()
            const duracao = fim - inicio
            if (!oficinaTempoDefeito[defeito]) oficinaTempoDefeito[defeito] = { total: 0, count: 0 }
            oficinaTempoDefeito[defeito].total += duracao; oficinaTempoDefeito[defeito].count++
          }

          const reincKey = `${veiculo}|${defeito}`
          if (!oficinaReincidencia[reincKey]) oficinaReincidencia[reincKey] = { veiculo, defeito, datas: [] }
          oficinaReincidencia[reincKey].datas.push(new Date(c.createdAt))

          const mesKey = getMonthKey(d)
          if (!oficinaSazonalidade[mesKey]) oficinaSazonalidade[mesKey] = {}
          oficinaSazonalidade[mesKey][defeito] = (oficinaSazonalidade[mesKey][defeito] || 0) + 1
        }
      })

      const totalGeral = data.length
      const tempoMedio = countTempo ? Math.round(totalTempo / countTempo / 3600000) : 0
      const taxaConclusao = totalGeral ? Math.round((totalFechados / totalGeral) * 100) : 0

      // Tickets evitados + avisos (shared)
      const { totalEvitados, evitadosPorMotivo, totalAvisos, comparativoAvisos } = await getEvitadosEAvisos(empresaId, dateFrom, getMonthKey, tempoMedio, totalGeral)

      const veiculosArr = Object.entries(oficinaVeiculos).map(([veiculo, total]) => ({ veiculo, total }))
      const response: Record<string, unknown> = {
        chamadosPorSetor: sortByTotal(Object.entries(chamadosPorSetorMap).map(([setor, total]) => ({ setor, total }))),
        chamadosPeriodo: Object.entries(chamadosPeriodoMap).map(([periodo, total]) => ({ periodo, total })),
        statusStats: sortByTotal(Object.entries(statusMap).map(([s, total]) => ({ status: s, total }))),
        prioridadeStats: sortByTotal(Object.entries(prioridadeMap).map(([p, total]) => ({ prioridade: p, total }))),
        tempoMedio, totalAbertos, totalFechados, totalGeral, taxaConclusao,
        totalEmpresa: chamados.length,
        ...totalEvitados !== undefined ? { totalEvitados, evitadosPorMotivo, totalAvisos, comparativoAvisos } : {},
        veiculosStats: sortByTotal([...veiculosArr]),
        melhoresVeiculos: [...veiculosArr].sort((a, b) => a.total - b.total),
        defeitosStats: sortByTotal(Object.entries(oficinaDefeitos).map(([defeito, total]) => ({ defeito, total }))),
        funcoesStats: sortByTotal(Object.entries(oficinaFuncoes).map(([funcao, total]) => ({ funcao, total }))),
        correlacaoDefeitoVeiculo: Object.entries(oficinaCorrelacao).map(([defeito, veiculos]) => ({
          defeito, veiculos: sortByTotal(Object.entries(veiculos).map(([v, t]) => ({ veiculo: v, total: t }))),
        })),
        tempoMedioPorDefeito: sortByTotal(Object.entries(oficinaTempoDefeito).map(([d, { total, count }]) => ({
          defeito: d, total: count ? Math.round(total / count / 3600000) : 0,
        }))),
        reincidenciaStats: (() => {
          const arr: { veiculo: string; defeito: string; ocorrencias: number; intervaloDias: number }[] = []
          Object.values(oficinaReincidencia).forEach(({ veiculo, defeito, datas }) => {
            if (datas.length <= 1) return
            datas.sort((a, b) => a.getTime() - b.getTime())
            const intervalo = (datas[datas.length - 1].getTime() - datas[0].getTime()) / 86400000
            if (intervalo <= 15) arr.push({ veiculo, defeito, ocorrencias: datas.length, intervaloDias: Math.round(intervalo) })
          })
          return arr.sort((a, b) => b.ocorrencias - a.ocorrencias)
        })(),
        sazonalidadeDefeitos: Object.entries(oficinaSazonalidade).map(([mes, defeitos]) => ({
          mes, defeitos: sortByTotal(Object.entries(defeitos).map(([d, t]) => ({ defeito: d, total: t }))),
        })).sort((a, b) => a.mes.localeCompare(b.mes)),
      }
      return NextResponse.json(response)
    }

    // ── Corporate / ambos ──
    const [
      statusGroups,
      prioridadeGroups,
      setorGroups,
      atendenteGroups,
      chamadosDates,
      totalAbertos,
      totalFechados,
      fechadosParaTempo,
      totalGeral,
      motivosGroups,
    ] = await Promise.all([
      prisma.chamado.groupBy({ by: ["status"], where, _count: true }),
      prisma.chamado.groupBy({ by: ["prioridade"], where, _count: true }),
      prisma.chamado.groupBy({
        by: ["setor"],
        where: { ...where, status: { notIn: ["CONCLUIDO", "CANCELADO", "FECHADO"] } },
        _count: true,
      }),
      prisma.chamado.groupBy({
        by: ["atendenteId"],
        where: { ...where, atendenteId: { not: null } },
        _count: true,
      }),
      prisma.chamado.findMany({
        where,
        select: { createdAt: true },
        take: 10000,
      }),
      prisma.chamado.count({
        where: { ...where, status: { notIn: ["CONCLUIDO", "CANCELADO", "FECHADO"] } },
      }),
      prisma.chamado.count({
        where: { ...where, status: { in: ["CONCLUIDO", "FECHADO"] } },
      }),
      prisma.chamado.findMany({
        where: { ...where, status: { in: ["CONCLUIDO", "FECHADO"] } },
        select: { createdAt: true, updatedAt: true },
        take: 10000,
      }),
      prisma.chamado.count({ where }),
      prisma.chamado.groupBy({ by: ["descricao"], where, _count: true }),
    ])

    const statusMap = Object.fromEntries(statusGroups.map((g) => [g.status, g._count]))
    const prioridadeMap = Object.fromEntries(prioridadeGroups.map((g) => [g.prioridade, g._count]))
    const chamadosPorSetorMap = Object.fromEntries(setorGroups.map((g) => [g.setor, g._count]))
    const atendentesMap = Object.fromEntries(atendenteGroups.map((g) => [g.atendenteId || "", g._count]))
    delete atendentesMap[""]

    const chamadosPeriodoMap: Record<string, number> = {}
    chamadosDates.forEach((c) => {
      const key = getPeriodKey(new Date(c.createdAt))
      chamadosPeriodoMap[key] = (chamadosPeriodoMap[key] || 0) + 1
    })

    const motivosMap: Record<string, number> = {}
    motivosGroups.forEach((g) => {
      if (!g.descricao.startsWith("{")) {
        motivosMap[g.descricao] = g._count
      }
    })

    let totalTempo = 0; let countTempo = 0
    let totalTempoDiario = 0; let countTempoDiario = 0
    let totalTempoSemanal = 0; let countTempoSemanal = 0
    let totalTempoMensal = 0; let countTempoMensal = 0

    fechadosParaTempo.forEach((c) => {
      const inicio = new Date(c.createdAt).getTime()
      const fim = new Date(c.updatedAt).getTime()
      const duracao = fim - inicio
      totalTempo += duracao; countTempo++
      const diffDays = (fim - inicio) / 86400000
      if (diffDays <= 1) { totalTempoDiario += duracao; countTempoDiario++ }
      if (diffDays <= 7) { totalTempoSemanal += duracao; countTempoSemanal++ }
      if (diffDays <= 30) { totalTempoMensal += duracao; countTempoMensal++ }
    })

    const tempoMedio = countTempo ? Math.round(totalTempo / countTempo / 3600000) : 0
    const tempoMedioDiario = countTempoDiario ? Math.round(totalTempoDiario / countTempoDiario / 3600000) : 0
    const tempoMedioSemanal = countTempoSemanal ? Math.round(totalTempoSemanal / countTempoSemanal / 3600000) : 0
    const tempoMedioMensal = countTempoMensal ? Math.round(totalTempoMensal / countTempoMensal / 3600000) : 0
    const taxaConclusao = totalGeral ? Math.round((totalFechados / totalGeral) * 100) : 0

    const { totalEvitados, evitadosPorMotivo, totalAvisos, comparativoAvisos } =
      await getEvitadosEAvisos(empresaId, dateFrom, getMonthKey, tempoMedio, totalGeral)

    const response: Record<string, unknown> = {
      chamadosPorSetor: sortByTotal(Object.entries(chamadosPorSetorMap).map(([setor, total]) => ({ setor, total }))),
      chamadosPeriodo: Object.entries(chamadosPeriodoMap).map(([periodo, total]) => ({ periodo, total })),
      motivosStats: sortByTotal(Object.entries(motivosMap).map(([motivo, total]) => ({ motivo, total }))),
      statusStats: sortByTotal(Object.entries(statusMap).map(([status, total]) => ({ status, total }))),
      prioridadeStats: sortByTotal(Object.entries(prioridadeMap).map(([prioridade, total]) => ({ prioridade, total }))),
      tempoMedio,
      tempoMedioDiario,
      tempoMedioSemanal,
      tempoMedioMensal,
      totalAbertos,
      totalFechados,
      totalGeral,
      taxaConclusao,
      totalEmpresa: totalGeral,
      ...totalEvitados !== undefined ? { totalEvitados, evitadosPorMotivo, totalAvisos, comparativoAvisos } : {},
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Erro ao gerar dashboard:", error)
    return NextResponse.json({ error: "Erro ao gerar dashboard" }, { status: 500 })
  }
}

async function getEvitadosEAvisos(
  empresaId: string | undefined,
  dateFrom: Date | null,
  getMonthKey: (d: Date) => string,
  tempoMedio: number,
  totalGeral: number
) {
  try {
    const [ticketsEvitadosData, totalAvisos, todosAvisos] = await Promise.all([
      prisma.tickets_evitados.findMany({
        where: { empresaId, ...(dateFrom ? { createdAt: { gte: dateFrom } } : {}) },
        take: 10000,
        select: { descricao: true, createdAt: true },
      }) as Promise<{ descricao: string; createdAt: Date }[]>,
      prisma.avisos.count({ where: { empresaId } }).catch(() => 0),
      prisma.avisos.findMany({
        where: { empresaId },
        select: { createdAt: true },
      }).catch(() => [] as { createdAt: Date }[]),
    ])

    const evitadosPeriodo = ticketsEvitadosData
    const totalEvitados = evitadosPeriodo.length
    const taxaAutomacao = (totalGeral + totalEvitados) > 0
      ? Math.round((totalEvitados / (totalGeral + totalEvitados)) * 100) : 0
    const economiaHoras = totalEvitados * tempoMedio

    const evitadosPorMotivo: Record<string, number> = {}
    evitadosPeriodo.forEach((t) => {
      const motivo = t.descricao || "Outros"
      evitadosPorMotivo[motivo] = (evitadosPorMotivo[motivo] || 0) + 1
    })

    const comparativoAvisosMap: Record<string, { mes: string; avisos: number; evitados: number }> = {}
    todosAvisos.forEach((a) => {
      const key = getMonthKey(new Date(a.createdAt))
      if (!comparativoAvisosMap[key]) comparativoAvisosMap[key] = { mes: key, avisos: 0, evitados: 0 }
      comparativoAvisosMap[key].avisos++
    })
    ticketsEvitadosData.forEach((t) => {
      const key = getMonthKey(new Date(t.createdAt))
      if (!comparativoAvisosMap[key]) comparativoAvisosMap[key] = { mes: key, avisos: 0, evitados: 0 }
      comparativoAvisosMap[key].evitados++
    })

    return {
      totalEvitados,
      evitadosPorMotivo: Object.entries(evitadosPorMotivo)
        .map(([motivo, total]) => ({ motivo, total }))
        .sort((a, b) => b.total - a.total),
      totalAvisos,
      taxaAutomacao,
      economiaHoras,
      comparativoAvisos: Object.values(comparativoAvisosMap).sort((a, b) => a.mes.localeCompare(b.mes)),
    }
  } catch {
    return { totalEvitados: undefined, evitadosPorMotivo: undefined, totalAvisos: undefined, taxaAutomacao: undefined, economiaHoras: undefined, comparativoAvisos: undefined }
  }
}
