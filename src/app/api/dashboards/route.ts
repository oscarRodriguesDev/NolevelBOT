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
  const rateLimit = applyRateLimit(req, "dashboards", 60, 60 * 1000)
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

    // helpers de filtro por periodo
    const now = new Date()

    function inPeriodo(data: Date, p: string): boolean {
      if (p === "dia") return data.toISOString().slice(0, 10) === now.toISOString().slice(0, 10)
      if (p === "semana") {
        const d = new Date(now); d.setDate(d.getDate() - 7)
        return data >= d
      }
      if (p === "mes") {
        return data.getMonth() === now.getMonth() && data.getFullYear() === now.getFullYear()
      }
      if (p === "ano") return data.getFullYear() === now.getFullYear()
      return true
    }

    function getMonthKey(d: Date) { return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}` }

    const where = getTicketWhereClause(userRole, userSetor, empresaId)

    const chamados = await prisma.chamado.findMany({
      where: where as Record<string, unknown>,
      select: {
        id: true,
        setor: true,
        descricao: true,
        status: true,
        prioridade: true,
        atendenteId: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const oficinaChamados = chamados.filter((c) => parseOficinaDescricao(c.descricao))
    const corporativoChamados = chamados.filter((c) => !parseOficinaDescricao(c.descricao))
    const data = modulo === "oficina" ? oficinaChamados : modulo === "corporativo" ? corporativoChamados : chamados

    const chamadosPorSetorMap: Record<string, number> = {}
    const chamadosPeriodoMap: Record<string, number> = {}
    const motivosMap: Record<string, number> = {}
    const statusMap: Record<string, number> = {}
    const prioridadeMap: Record<string, number> = {}
    const atendentesMap: Record<string, number> = {}
    const oficinaDefeitos: Record<string, number> = {}
    const oficinaFuncoes: Record<string, number> = {}
    const oficinaVeiculos: Record<string, number> = {}
    const oficinaCorrelacao: Record<string, Record<string, number>> = {} // defeito -> { veiculo: count }
    const oficinaTempoDefeito: Record<string, { total: number; count: number }> = {}
    const oficinaReincidencia: Record<string, { veiculo: string; defeito: string; datas: Date[] }> = {}
    const oficinaSazonalidade: Record<string, Record<string, number>> = {} // mes -> { defeito: count }
    const oficinaParsedData: { veiculo: string; defeito: string; funcao: string; createdAt: Date; status: string; updatedAt: Date }[] = []

    let totalTempo = 0
    let countTempo = 0
    let totalAbertos = 0
    let totalFechados = 0
    let totalTempoDiario = 0
    let countTempoDiario = 0
    let totalTempoSemanal = 0
    let countTempoSemanal = 0
    let totalTempoMensal = 0
    let countTempoMensal = 0

    data.forEach((c) => {
      const isOpen = c.status !== "CONCLUIDO" && c.status !== "CANCELADO" && c.status !== "FECHADO"

      if (isOpen) {
        totalAbertos++
        chamadosPorSetorMap[c.setor] = (chamadosPorSetorMap[c.setor] || 0) + 1
      } else {
        totalFechados++
      }

      const d = new Date(c.createdAt)
      let key = ""
      if (periodo === "dia") key = d.toISOString().slice(0, 10)
      if (periodo === "semana") key = `S${getWeek(d)}`
      if (periodo === "mes") key = `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
      if (periodo === "ano") key = `${d.getFullYear()}`
      chamadosPeriodoMap[key] = (chamadosPeriodoMap[key] || 0) + 1

      const statusLabel = c.status || "INDEFINIDO"
      statusMap[statusLabel] = (statusMap[statusLabel] || 0) + 1

      const prioLabel = c.prioridade || "normal"
      prioridadeMap[prioLabel] = (prioridadeMap[prioLabel] || 0) + 1

      if (c.atendenteId) {
        atendentesMap[c.atendenteId] = (atendentesMap[c.atendenteId] || 0) + 1
      }

      if (c.status === "CONCLUIDO" || c.status === "FECHADO") {
        const inicio = new Date(c.createdAt).getTime()
        const fim = new Date(c.updatedAt).getTime()
        const duracao = fim - inicio
        totalTempo += duracao
        countTempo++

        const diffDays = (fim - inicio) / 86400000
        if (diffDays <= 1) { totalTempoDiario += duracao; countTempoDiario++ }
        if (diffDays <= 7) { totalTempoSemanal += duracao; countTempoSemanal++ }
        if (diffDays <= 30) { totalTempoMensal += duracao; countTempoMensal++ }
      }

      if (modulo === "oficina") {
        const parsed = parseOficinaDescricao(c.descricao)
        if (parsed) {
          if (parsed.defeito) oficinaDefeitos[parsed.defeito] = (oficinaDefeitos[parsed.defeito] || 0) + 1
          if (parsed.funcao) oficinaFuncoes[parsed.funcao] = (oficinaFuncoes[parsed.funcao] || 0) + 1
          if (parsed.numeroOnibus) oficinaVeiculos[parsed.numeroOnibus] = (oficinaVeiculos[parsed.numeroOnibus] || 0) + 1

          const veiculo = parsed.numeroOnibus || "N/I"
          const defeito = parsed.defeito || "N/I"
          const funcao = parsed.funcao || "N/I"

          // Correlacao defeito x veiculo
          if (!oficinaCorrelacao[defeito]) oficinaCorrelacao[defeito] = {}
          oficinaCorrelacao[defeito][veiculo] = (oficinaCorrelacao[defeito][veiculo] || 0) + 1

          // Tempo medio por defeito (apenas concluidos)
          if (c.status === "CONCLUIDO" || c.status === "FECHADO") {
            const inicio = new Date(c.createdAt).getTime()
            const fim = new Date(c.updatedAt).getTime()
            const duracao = fim - inicio
            if (!oficinaTempoDefeito[defeito]) oficinaTempoDefeito[defeito] = { total: 0, count: 0 }
            oficinaTempoDefeito[defeito].total += duracao
            oficinaTempoDefeito[defeito].count++
          }

          // Reincidencia (agrupa por veiculo+defeito para detectar repeticoes)
          const reincKey = `${veiculo}|${defeito}`
          if (!oficinaReincidencia[reincKey]) oficinaReincidencia[reincKey] = { veiculo, defeito, datas: [] }
          oficinaReincidencia[reincKey].datas.push(new Date(c.createdAt))

          // Sazonalidade (defeitos por mes)
          const mesKey = `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
          if (!oficinaSazonalidade[mesKey]) oficinaSazonalidade[mesKey] = {}
          oficinaSazonalidade[mesKey][defeito] = (oficinaSazonalidade[mesKey][defeito] || 0) + 1
        }
      } else {
        const motivo = c.descricao || "Outros"
        motivosMap[motivo] = (motivosMap[motivo] || 0) + 1
      }
    })

    const tempoMedio = countTempo ? Math.round(totalTempo / countTempo / 3600000) : 0
    const tempoMedioDiario = countTempoDiario ? Math.round(totalTempoDiario / countTempoDiario / 3600000) : 0
    const tempoMedioSemanal = countTempoSemanal ? Math.round(totalTempoSemanal / countTempoSemanal / 3600000) : 0
    const tempoMedioMensal = countTempoMensal ? Math.round(totalTempoMensal / countTempoMensal / 3600000) : 0
    const totalGeral = data.length
    const taxaConclusao = totalGeral ? Math.round((totalFechados / totalGeral) * 100) : 0

    // Tickets evitados
    let ticketsEvitadosData: { descricao: string; createdAt: Date }[] = []
    try {
      ticketsEvitadosData = await prisma.tickets_evitados.findMany({
        where: { empresaId },
        select: { descricao: true, createdAt: true },
      }) as { descricao: string; createdAt: Date }[]
    } catch { ticketsEvitadosData = [] }

    const evitadosPeriodo = ticketsEvitadosData.filter((t) => inPeriodo(t.createdAt, periodo))
    const totalEvitados = evitadosPeriodo.length
    const taxaAutomacao = (totalGeral + totalEvitados) > 0
      ? Math.round((totalEvitados / (totalGeral + totalEvitados)) * 100) : 0
    const economiaHoras = totalEvitados * tempoMedio

    const evitadosPorMotivo: Record<string, number> = {}
    evitadosPeriodo.forEach((t) => {
      const motivo = t.descricao || "Outros"
      evitadosPorMotivo[motivo] = (evitadosPorMotivo[motivo] || 0) + 1
    })

    // Avisos
    let totalAvisos = 0
    try { totalAvisos = await prisma.avisos.count({ where: { empresaId } }) } catch { totalAvisos = 0 }

    // Comparativo avisos vs evitados (agrupado por mês)
    const comparativoAvisosMap: Record<string, { mes: string; avisos: number; evitados: number }> = {}
    try {
      const todosAvisos = await prisma.avisos.findMany({
        where: { empresaId },
        select: { createdAt: true },
      })
      todosAvisos.forEach((a) => {
        const key = getMonthKey(new Date(a.createdAt))
        if (!comparativoAvisosMap[key]) comparativoAvisosMap[key] = { mes: key, avisos: 0, evitados: 0 }
        comparativoAvisosMap[key].avisos++
      })
    } catch {}

    ticketsEvitadosData.forEach((t) => {
      const key = getMonthKey(new Date(t.createdAt))
      if (!comparativoAvisosMap[key]) comparativoAvisosMap[key] = { mes: key, avisos: 0, evitados: 0 }
      comparativoAvisosMap[key].evitados++
    })

    const sortByTotal = (arr: { total: number }[]) =>
      arr.sort((a, b) => b.total - a.total)

    const response: Record<string, unknown> = {
      chamadosPorSetor: sortByTotal(
        Object.entries(chamadosPorSetorMap).map(([setor, total]) => ({ setor, total }))
      ),
      chamadosPeriodo: Object.entries(chamadosPeriodoMap).map(([periodo, total]) => ({
        periodo,
        total,
      })),
      motivosStats: sortByTotal(
        Object.entries(motivosMap).map(([motivo, total]) => ({ motivo, total }))
      ),
      statusStats: sortByTotal(
        Object.entries(statusMap).map(([status, total]) => ({ status, total }))
      ),
      prioridadeStats: sortByTotal(
        Object.entries(prioridadeMap).map(([prioridade, total]) => ({ prioridade, total }))
      ),
      tempoMedio,
      totalAbertos,
      totalFechados,
      totalGeral,
      taxaConclusao,
      totalEmpresa: chamados.length,
      totalEvitados,
      taxaAutomacao,
      economiaHoras,
      totalAvisos,
      tempoMedioDiario,
      tempoMedioSemanal,
      tempoMedioMensal,
      evitadosPorMotivo: sortByTotal(
        Object.entries(evitadosPorMotivo).map(([motivo, total]) => ({ motivo, total }))
      ),
      comparativoAvisos: Object.values(comparativoAvisosMap).sort((a, b) => a.mes.localeCompare(b.mes)),
    }

    if (modulo === "oficina") {
      const veiculosArr = Object.entries(oficinaVeiculos).map(([veiculo, total]) => ({ veiculo, total }))
      response.veiculosStats = sortByTotal([...veiculosArr])
      response.melhoresVeiculos = [...veiculosArr].sort((a, b) => a.total - b.total)

      response.defeitosStats = sortByTotal(
        Object.entries(oficinaDefeitos).map(([defeito, total]) => ({ defeito, total }))
      )
      response.funcoesStats = sortByTotal(
        Object.entries(oficinaFuncoes).map(([funcao, total]) => ({ funcao, total }))
      )

      // Correlacao defeito x veiculo
      response.correlacaoDefeitoVeiculo = Object.entries(oficinaCorrelacao).map(([defeito, veiculos]) => ({
        defeito,
        veiculos: sortByTotal(Object.entries(veiculos).map(([veiculo, total]) => ({ veiculo, total }))),
      }))

      // Tempo medio por defeito
      response.tempoMedioPorDefeito = sortByTotal(
        Object.entries(oficinaTempoDefeito).map(([defeito, { total, count }]) => ({
          defeito,
          total: count ? Math.round(total / count / 3600000) : 0,
        }))
      )

      // Reincidencia (mesmo veiculo + mesmo defeito em ate 15 dias)
      const reincidenciaArr: { veiculo: string; defeito: string; ocorrencias: number; intervaloDias: number }[] = []
      Object.values(oficinaReincidencia).forEach(({ veiculo, defeito, datas }) => {
        if (datas.length <= 1) return
        datas.sort((a, b) => a.getTime() - b.getTime())
        const intervalo = (datas[datas.length - 1].getTime() - datas[0].getTime()) / 86400000
        if (intervalo <= 15) {
          reincidenciaArr.push({ veiculo, defeito, ocorrencias: datas.length, intervaloDias: Math.round(intervalo) })
        }
      })
      response.reincidenciaStats = reincidenciaArr.sort((a, b) => b.ocorrencias - a.ocorrencias)

      // Sazonalidade (defeitos por mes)
      response.sazonalidadeDefeitos = Object.entries(oficinaSazonalidade).map(([mes, defeitos]) => ({
        mes,
        defeitos: sortByTotal(Object.entries(defeitos).map(([defeito, total]) => ({ defeito, total }))),
      })).sort((a, b) => a.mes.localeCompare(b.mes))
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Erro ao gerar dashboard:", error)
    return NextResponse.json({ error: "Erro ao gerar dashboard" }, { status: 500 })
  }
}
