import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionOrFail } from "@/util/permission"

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
  const session = await getSessionOrFail(["ADMIN", "GESTOR", "GOD"])
  if (!session) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const periodo = searchParams.get("periodo") || "mes"
    const modulo = searchParams.get("modulo") || "corporativo"

    const empresaId = session.user.empresaId

    const where: Record<string, unknown> = {}

    if (empresaId) {
      where.empresaId = empresaId
    }

    const chamados = await prisma.chamado.findMany({
      where,
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

    let totalTempo = 0
    let countTempo = 0
    let totalAbertos = 0
    let totalFechados = 0

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
        totalTempo += fim - inicio
        countTempo++
      }

      if (modulo === "oficina") {
        const parsed = parseOficinaDescricao(c.descricao)
        if (parsed) {
          if (parsed.defeito) oficinaDefeitos[parsed.defeito] = (oficinaDefeitos[parsed.defeito] || 0) + 1
          if (parsed.funcao) oficinaFuncoes[parsed.funcao] = (oficinaFuncoes[parsed.funcao] || 0) + 1
          if (parsed.numeroOnibus) oficinaVeiculos[parsed.numeroOnibus] = (oficinaVeiculos[parsed.numeroOnibus] || 0) + 1
        }
      } else {
        const motivo = c.descricao || "Outros"
        motivosMap[motivo] = (motivosMap[motivo] || 0) + 1
      }
    })

    const tempoMedio = countTempo ? Math.round(totalTempo / countTempo / 3600000) : 0
    const totalGeral = data.length
    const taxaConclusao = totalGeral ? Math.round((totalFechados / totalGeral) * 100) : 0

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
    }

    if (modulo === "oficina") {
      response.defeitosStats = sortByTotal(
        Object.entries(oficinaDefeitos).map(([defeito, total]) => ({ defeito, total }))
      )
      response.funcoesStats = sortByTotal(
        Object.entries(oficinaFuncoes).map(([funcao, total]) => ({ funcao, total }))
      )
      response.veiculosStats = sortByTotal(
        Object.entries(oficinaVeiculos).map(([veiculo, total]) => ({ veiculo, total }))
      )
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Erro ao gerar dashboard:", error)
    return NextResponse.json({ error: "Erro ao gerar dashboard" }, { status: 500 })
  }
}
