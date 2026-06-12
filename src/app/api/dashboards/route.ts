import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSessionRBAC } from "@/lib/rbac-server"

function getWeek(date: Date) {
  const first = new Date(date.getFullYear(), 0, 1)
  const diff = (date.getTime() - first.getTime()) / 86400000
  return Math.ceil((diff + first.getDay() + 1) / 7)
}

function getPeriodKey(date: Date, periodo: string): string {
  if (periodo === "dia") return date.toISOString().slice(0, 10)
  if (periodo === "semana") return `S${getWeek(date)}`
  if (periodo === "mes") return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`
  if (periodo === "ano") return String(date.getFullYear())
  return date.toISOString().slice(0, 10)
}

function getWeekdayName(day: number): string {
  const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
  return dias[day]
}

function parseDescricao(descricao: string) {
  try {
    return JSON.parse(descricao)
  } catch {
    return null
  }
}

function getPeriodDateRange(periodo: string, now: Date) {
  const y = now.getFullYear()
  const m = now.getMonth()

  switch (periodo) {
    case "dia":
      return {
        start: new Date(y, m, now.getDate()),
        prevStart: new Date(y, m, now.getDate() - 1),
        prevEnd: new Date(y, m, now.getDate()),
      }
    case "semana": {
      const dayOfWeek = now.getDay()
      const sunday = new Date(y, m, now.getDate() - dayOfWeek)
      return {
        start: new Date(sunday),
        prevStart: new Date(sunday.getTime() - 7 * 86400000),
        prevEnd: new Date(sunday),
      }
    }
    case "mes":
      return {
        start: new Date(y, m, 1),
        prevStart: new Date(y, m - 1, 1),
        prevEnd: new Date(y, m, 1),
      }
    case "ano":
      return {
        start: new Date(y, 0, 1),
        prevStart: new Date(y - 1, 0, 1),
        prevEnd: new Date(y, 0, 1),
      }
    default:
      return {
        start: new Date(y, m, 1),
        prevStart: new Date(y, m - 1, 1),
        prevEnd: new Date(y, m, 1),
      }
  }
}

const STATUS_STEPS_ORDER = ["NOVO", "EM_ATENDIMENTO", "AGUARDANDO", "CONCLUIDO"]
const STATUS_STEPS_MAP: Record<string, { label: string; color: string }> = {
  NOVO: { label: "Novo", color: "#8B5CF6" },
  EM_ATENDIMENTO: { label: "Em Atendimento", color: "#F59E0B" },
  AGUARDANDO: { label: "Aguardando", color: "#EC4899" },
  CONCLUIDO: { label: "Concluído", color: "#10B981" },
}

async function computeMetrics(empresaId: string, periodo: string, dateRange?: { start: Date; end?: Date }) {
  const where: Record<string, unknown> = { empresaId }
  if (dateRange?.start) {
    where.createdAt = { gte: dateRange.start }
    if (dateRange.end) {
      ;(where.createdAt as Record<string, Date>).lt = dateRange.end
    }
  }

  const chamados = await prisma.chamado.findMany({
    where,
    select: {
      id: true,
      ticket: true,
      nome: true,
      cpf: true,
      setor: true,
      descricao: true,
      prioridade: true,
      status: true,
      atendenteId: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const chamadosFechados = chamados.filter(
    (c) => c.status === "CONCLUIDO" || c.status === "FECHADO" || c.status === "CANCELADO"
  )

  const totalGeral = chamados.length

  const chamadosPorStatus: { status: string; total: number; color: string }[] = []
  const statusMap: Record<string, { label: string; color: string }> = {
    NOVO: { label: "Novo", color: "#8B5CF6" },
    EM_ATENDIMENTO: { label: "Em Atendimento", color: "#F59E0B" },
    AGUARDANDO: { label: "Aguardando", color: "#EC4899" },
    CONCLUIDO: { label: "Concluído", color: "#10B981" },
    CANCELADO: { label: "Cancelado", color: "#EF4444" },
    FECHADO: { label: "Fechado", color: "#10B981" },
  }
  const statusCount: Record<string, number> = {}
  chamados.forEach((c) => {
    const s = c.status || "OUTROS"
    statusCount[s] = (statusCount[s] || 0) + 1
  })
  Object.entries(statusCount).forEach(([status, total]) => {
    const info = statusMap[status] || { label: status, color: "#6B7280" }
    chamadosPorStatus.push({ status: info.label, total, color: info.color })
  })

  const chamadosPorStatusSteps: { label: string; count: number; color: string }[] = []
  STATUS_STEPS_ORDER.forEach((step) => {
    const count = statusCount[step] || 0
    const info = STATUS_STEPS_MAP[step]
    chamadosPorStatusSteps.push({ label: info.label, count, color: info.color })
  })

  let totalTempo = 0
  let countTempo = 0
  chamadosFechados.forEach((c) => {
    if (c.createdAt && c.updatedAt) {
      totalTempo += new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()
      countTempo++
    }
  })
  const tempoMedio = countTempo ? Math.round(totalTempo / countTempo / 3600000) : 0

  const chamadosPorPrioridade: { prioridade: string; total: number; color: string }[] = []
  const prioridadeMap: Record<string, { label: string; color: string }> = {
    baixa: { label: "Baixa", color: "#10B981" },
    normal: { label: "Normal", color: "#3B82F6" },
    alta: { label: "Alta", color: "#F59E0B" },
    critica: { label: "Crítica", color: "#EF4444" },
  }
  const prioridadeCount: Record<string, number> = {}
  chamados.forEach((c) => {
    const p = (c.prioridade || "normal").toLowerCase()
    prioridadeCount[p] = (prioridadeCount[p] || 0) + 1
  })
  Object.entries(prioridadeCount).forEach(([prioridade, total]) => {
    const info = prioridadeMap[prioridade] || { prioridade, color: "#6B7280" }
    chamadosPorPrioridade.push({ prioridade: info.label, total, color: info.color })
  })

  const chamadosPorSetor: { setor: string; total: number }[] = []
  const setorCount: Record<string, number> = {}
  chamados.forEach((c) => {
    if (c.setor) setorCount[c.setor] = (setorCount[c.setor] || 0) + 1
  })
  Object.entries(setorCount).forEach(([setor, total]) => {
    chamadosPorSetor.push({ setor, total })
  })

  const chamadosPorAtendente: { atendente: string; total: number }[] = []
  const atendenteCount: Record<string, number> = {}
  chamados.forEach((c) => {
    if (c.atendenteId) atendenteCount[c.atendenteId] = (atendenteCount[c.atendenteId] || 0) + 1
  })
  Object.entries(atendenteCount).forEach(([atendente, total]) => {
    chamadosPorAtendente.push({ atendente, total })
  })

  const chamadosPeriodo: { periodo: string; total: number }[] = []
  const periodoCount: Record<string, number> = {}
  chamados.forEach((c) => {
    const key = getPeriodKey(new Date(c.createdAt), periodo)
    periodoCount[key] = (periodoCount[key] || 0) + 1
  })
  Object.entries(periodoCount).forEach(([periodoKey, total]) => {
    chamadosPeriodo.push({ periodo: periodoKey, total })
  })

  const topMotivos: { motivo: string; total: number }[] = []
  const motivoCount: Record<string, number> = {}
  chamados.forEach((c) => {
    const parsed = parseDescricao(c.descricao)
    const motivo = parsed?.defeito || c.descricao || "Outros"
    motivoCount[motivo] = (motivoCount[motivo] || 0) + 1
  })
  Object.entries(motivoCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([motivo, total]) => topMotivos.push({ motivo: motivo.length > 60 ? motivo.slice(0, 60) + "..." : motivo, total }))

  const picoHorarios: { dia: string; total: number }[] = []
  const diaCount: Record<string, number> = {}
  chamados.forEach((c) => {
    const dia = getWeekdayName(new Date(c.createdAt).getDay())
    diaCount[dia] = (diaCount[dia] || 0) + 1
  })
  const ordemDias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
  ordemDias.forEach((dia) => {
    if (diaCount[dia]) picoHorarios.push({ dia, total: diaCount[dia] })
  })

  const motoristasMaisRegistros: { motorista: string; total: number }[] = []
  const motoristaCount: Record<string, number> = {}
  chamados.forEach((c) => {
    if (c.nome) motoristaCount[c.nome] = (motoristaCount[c.nome] || 0) + 1
  })
  Object.entries(motoristaCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([motorista, total]) => motoristasMaisRegistros.push({ motorista, total }))

  const solicitacoesPorFuncao: { funcao: string; total: number }[] = []
  const funcaoCount: Record<string, number> = {}
  chamados.forEach((c) => {
    const parsed = parseDescricao(c.descricao)
    const funcao = parsed?.funcao || ""
    if (funcao) funcaoCount[funcao] = (funcaoCount[funcao] || 0) + 1
  })
  Object.entries(funcaoCount).forEach(([funcao, total]) => solicitacoesPorFuncao.push({ funcao, total }))

  const veiculosMaisOcorrencias: { veiculo: string; total: number }[] = []
  const veiculoCount: Record<string, number> = {}
  chamados.forEach((c) => {
    const parsed = parseDescricao(c.descricao)
    const veiculo = parsed?.numeroOnibus || ""
    if (veiculo) veiculoCount[veiculo] = (veiculoCount[veiculo] || 0) + 1
  })
  Object.entries(veiculoCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([veiculo, total]) => veiculosMaisOcorrencias.push({ veiculo, total }))

  return {
    totalGeral,
    chamadosPorStatus,
    chamadosPorStatusSteps,
    tempoMedio,
    chamadosPorPrioridade,
    chamadosPorSetor,
    chamadosPorAtendente,
    chamadosPeriodo,
    topMotivos,
    picoHorarios,
    motoristasMaisRegistros,
    solicitacoesPorFuncao,
    veiculosMaisOcorrencias,
  }
}

export async function GET(req: Request) {
  const { session, error } = await getServerSessionRBAC(["ADMIN", "GESTOR", "GOD"])
  if (error) return error

  const empresaId = session!.empresaId
  const { searchParams } = new URL(req.url)
  const periodo = searchParams.get("periodo") || "mes"
  const comparar = searchParams.get("comparar") === "true"

  if (!periodo || !["dia", "semana", "mes", "ano"].includes(periodo)) {
    return NextResponse.json({ error: "Período inválido" }, { status: 400 })
  }

  try {
    const now = new Date()
    const range = getPeriodDateRange(periodo, now)

    const metrics = await computeMetrics(empresaId, periodo, { start: range.start, end: now })

    let comparativo = undefined
    if (comparar) {
      const metricsAnterior = await computeMetrics(empresaId, periodo, {
        start: range.prevStart,
        end: range.prevEnd,
      })

      const variacaoTotal = metricsAnterior.totalGeral > 0
        ? Math.round(((metrics.totalGeral - metricsAnterior.totalGeral) / metricsAnterior.totalGeral) * 100)
        : 0

      const variacaoTempo = metricsAnterior.tempoMedio > 0
        ? Math.round(((metrics.tempoMedio - metricsAnterior.tempoMedio) / metricsAnterior.tempoMedio) * 100)
        : 0

      comparativo = {
        atual: {
          totalGeral: metrics.totalGeral,
          tempoMedio: metrics.tempoMedio,
          chamadosPeriodo: metrics.chamadosPeriodo,
          chamadosPorStatus: metrics.chamadosPorStatus,
          chamadosPorSetor: metrics.chamadosPorSetor,
          chamadosPorAtendente: metrics.chamadosPorAtendente,
        },
        anterior: {
          totalGeral: metricsAnterior.totalGeral,
          tempoMedio: metricsAnterior.tempoMedio,
          chamadosPeriodo: metricsAnterior.chamadosPeriodo,
          chamadosPorStatus: metricsAnterior.chamadosPorStatus,
          chamadosPorSetor: metricsAnterior.chamadosPorSetor,
          chamadosPorAtendente: metricsAnterior.chamadosPorAtendente,
        },
        variacao: {
          totalGeral: variacaoTotal,
          tempoMedio: variacaoTempo,
        },
      }
    }

    return NextResponse.json({ ...metrics, comparativo })
  } catch (error) {
    console.error("Erro ao gerar dashboard:", error)
    return NextResponse.json({ error: "Erro ao gerar dashboard" }, { status: 500 })
  }
}
