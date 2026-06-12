"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useSession } from "next-auth/react"
import * as XLSX from "xlsx"

import { KpiCard } from "./KpiCard"
import { BarChartCard } from "./BarChartCard"
import { PieChartCard } from "./PieChartCard"
import { LineChartCard } from "./LineChartCard"
import { RankingTable } from "./RankingTable"
import { FunnelCard } from "./FunnelCard"
import type { DashboardData, IndicatorDef, PeriodoKey } from "./types"

type DashboardContainerProps = {
  modulo: "corporativo" | "oficina" | "eventos"
  indicators: IndicatorDef[]
}

const STORAGE_KEY_PREFIX = "dashboard_indicators_"

function pctColor(value: number): string {
  if (value > 0) return "#10B981"
  if (value < 0) return "#EF4444"
  return "var(--foreground)"
}

function formatPct(value: number): string {
  return `${value > 0 ? "+" : ""}${value}%`
}

export function DashboardContainer({
  modulo,
  indicators,
}: DashboardContainerProps) {
  const { data: session } = useSession()
  const [periodo, setPeriodo] = useState<PeriodoKey>("mes")
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState(true)
  const [showConfig, setShowConfig] = useState(false)
  const [enabledIndicators, setEnabledIndicators] = useState<string[]>([])
  const [comparar, setComparar] = useState(false)

  const storageKey = `${STORAGE_KEY_PREFIX}${modulo}_${session?.user?.id || "anonymous"}`

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEnabledIndicators(parsed)
          return
        }
      }
    } catch {}
    setEnabledIndicators(indicators.map((i) => i.id))
  }, [storageKey, indicators])

  const toggleIndicator = useCallback(
    (id: string) => {
      setEnabledIndicators((prev) => {
        const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        try {
          localStorage.setItem(storageKey, JSON.stringify(next))
        } catch {}
        return next
      })
    },
    [storageKey]
  )

  const isEnabled = useCallback((id: string) => enabledIndicators.includes(id), [enabledIndicators])

  useEffect(() => {
    let isMounted = true
    if (!isLoading) setIsLoading(true)

    async function fetchData() {
      if (!session?.user?.empresaId && session?.user?.role !== "GOD") {
        if (isMounted) setHasPermission(false)
        return
      }

      try {
        const params = new URLSearchParams({ periodo, modulo })
        if (comparar) params.set("comparar", "true")

        const res = await fetch(`/api/dashboards?${params}`)
        if (res.status === 403) {
          if (isMounted) setHasPermission(false)
          return
        }
        if (!res.ok) throw new Error("Erro na requisição")
        const json = await res.json()
        if (json.allowed === false) {
          if (isMounted) setHasPermission(false)
          return
        }
        if (isMounted) {
          setData(json)
          setHasPermission(true)
        }
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchData()
    return () => { isMounted = false }
  }, [periodo, modulo, session, comparar])

  const handleExportExcel = useCallback(() => {
    if (!data) return

    const rows: Record<string, string | number>[] = []

    rows.push({ Indicador: "Total Geral", Valor: data.totalGeral })
    rows.push({ Indicador: "Tempo Médio (h)", Valor: data.tempoMedio })

    data.chamadosPorStatus.forEach((s) => {
      rows.push({ Indicador: `Status - ${s.status}`, Valor: s.total })
    })

    data.chamadosPorPrioridade?.forEach((p) => {
      rows.push({ Indicador: `Prioridade - ${p.prioridade}`, Valor: p.total })
    })

    data.chamadosPorSetor?.forEach((s) => {
      rows.push({ Indicador: `Setor - ${s.setor}`, Valor: s.total })
    })

    data.chamadosPorAtendente?.forEach((a) => {
      rows.push({ Indicador: `Atendente - ${a.atendente}`, Valor: a.total })
    })

    data.chamadosPeriodo?.forEach((p) => {
      rows.push({ Indicador: `Período - ${p.periodo}`, Valor: p.total })
    })

    data.topMotivos?.forEach((m) => {
      rows.push({ Indicador: `Motivo - ${m.motivo}`, Valor: m.total })
    })

    data.picoHorarios?.forEach((d) => {
      rows.push({ Indicador: `Dia - ${d.dia}`, Valor: d.total })
    })

    if (data.comparativo) {
      rows.push({ Indicador: "Comparativo - Variação Total", Valor: `${formatPct(data.comparativo.variacao.totalGeral)}` })
      rows.push({ Indicador: "Comparativo - Variação Tempo Médio", Valor: `${formatPct(data.comparativo.variacao.tempoMedio)}` })
    }

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Dashboard")
    XLSX.writeFile(wb, `dashboard_${modulo}_${periodo}.xlsx`)
  }, [data, modulo, periodo])

  const variacao = data?.comparativo?.variacao

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 bg-red-500/10 rounded-full">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m3.332-4.76a2 2 0 11-2.828 2.829 2 2 0 012.828-2.829zm4-8a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-black uppercase tracking-widest opacity-80">Acesso Negado</h1>
        <p className="text-sm opacity-50 max-w-md text-center font-medium">
          Você não possui as permissões necessárias para visualizar as métricas deste dashboard.
          Contate o administrador do sistema.
        </p>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen px-4 py-8 space-y-6 transition-colors duration-300 max-w-[1600px] mx-auto select-none"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[var(--surface)] p-2 pl-4 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase tracking-[0.2em] opacity-50">Filtros</span>
          <div className="h-6 w-[1px] bg-[var(--border-subtle)]" />
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
              showConfig ? "bg-[var(--primary)] text-white shadow-md" : "opacity-40 hover:opacity-100"
            }`}
          >
            Personalizar
          </button>
          {data && (
            <button
              onClick={handleExportExcel}
              disabled={isLoading}
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all opacity-40 hover:opacity-100 hover:bg-[var(--primary)] hover:text-white disabled:opacity-20"
            >
              Exportar XLSX
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className={`text-[10px] font-black uppercase tracking-widest transition-all ${comparar ? "text-[var(--primary)]" : "opacity-40"}`}>
              Comparar
            </span>
            <div
              onClick={() => setComparar((p) => !p)}
              className={`relative w-9 h-5 rounded-full transition-all cursor-pointer ${
                comparar ? "bg-[var(--primary)]" : "bg-[var(--border-subtle)]"
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                  comparar ? "left-4" : "left-0.5"
                }`}
              />
            </div>
          </label>

          <nav className="flex bg-[var(--background)] p-1 rounded-xl border border-[var(--border-subtle)]">
            {(["dia", "semana", "mes", "ano"] as PeriodoKey[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                disabled={isLoading}
                className={`px-4 py-1.5 rounded-lg font-bold transition-all capitalize text-xs ${
                  periodo === p ? "shadow-md scale-105" : "opacity-40 hover:opacity-100"
                } ${isLoading ? "cursor-not-allowed" : ""}`}
                style={{
                  backgroundColor: periodo === p ? "var(--primary)" : "transparent",
                  color: periodo === p ? "white" : "var(--foreground)",
                }}
              >
                {p}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {showConfig && (
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">
              Indicadores Visíveis
            </h3>
            <span className="text-[10px] font-bold opacity-40">
              {enabledIndicators.length} de {indicators.length} ativos
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {indicators.map((ind) => (
              <label
                key={ind.id}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  isEnabled(ind.id)
                    ? "border-[var(--primary)] bg-[var(--primary)] bg-opacity-5"
                    : "border-[var(--border-subtle)] opacity-50 hover:opacity-80"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isEnabled(ind.id)}
                  onChange={() => toggleIndicator(ind.id)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                  style={{ accentColor: "var(--primary)" }}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{ind.icon}</span>
                    <span className="text-xs font-bold">{ind.label}</span>
                  </div>
                  <p className="text-[10px] opacity-40 mt-0.5">{ind.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {isEnabled("totalGeral") && (
          <div className="lg:col-span-1">
            <KpiCard
              title="Total Geral"
              value={data?.totalGeral ?? 0}
              subtitle={
                variacao !== undefined
                  ? `${formatPct(variacao.totalGeral)} vs ant.`
                  : "un"
              }
              color={variacao ? pctColor(variacao.totalGeral) : undefined}
              icon="📊"
              isLoading={isLoading}
            />
          </div>
        )}

        {isEnabled("funilStatus") && (
          <div className="lg:col-span-2">
            <FunnelCard
              title="Funil de Status"
              steps={(data?.chamadosPorStatusSteps || []).map((s) => ({
                label: s.label,
                count: s.count,
                color: s.color,
              }))}
              isLoading={isLoading}
            />
          </div>
        )}

        {isEnabled("chamadosPorStatus") && (
          <div className={isEnabled("totalGeral") && !isEnabled("funilStatus") ? "lg:col-span-3" : isEnabled("funilStatus") ? "lg:col-span-2" : "lg:col-span-4"}>
            <PieChartCard
              title={modulo === "oficina" ? "Solicitações por Status" : "Chamados por Status"}
              data={(data?.chamadosPorStatus || []).map((s) => ({
                label: s.status,
                total: s.total,
                color: s.color,
              }))}
              isLoading={isLoading}
            />
          </div>
        )}

        {isEnabled("comparativo") && variacao && (
          <div className="lg:col-span-4">
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-4">Comparativo com Período Anterior</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--background)" }}>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Total Atual</p>
                  <p className="text-2xl font-black">{data?.comparativo?.atual.totalGeral ?? 0}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--background)" }}>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Total Anterior</p>
                  <p className="text-2xl font-black">{data?.comparativo?.anterior.totalGeral ?? 0}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--background)" }}>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Variação Total</p>
                  <p className="text-2xl font-black" style={{ color: pctColor(variacao.totalGeral) }}>
                    {formatPct(variacao.totalGeral)}
                  </p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--background)" }}>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Variação Tempo Médio</p>
                  <p className="text-2xl font-black" style={{ color: pctColor(variacao.tempoMedio) }}>
                    {formatPct(variacao.tempoMedio)}
                  </p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--background)" }}>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Tempo Médio Atual</p>
                  <p className="text-2xl font-black">{data?.comparativo?.atual.tempoMedio ?? 0}<span className="text-sm opacity-40 ml-1 font-bold">h</span></p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--background)" }}>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Tempo Médio Anterior</p>
                  <p className="text-2xl font-black">{data?.comparativo?.anterior.tempoMedio ?? 0}<span className="text-sm opacity-40 ml-1 font-bold">h</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isEnabled("chamadosPorPrioridade") && (
          <PieChartCard
            title="Chamados por Prioridade"
            data={(data?.chamadosPorPrioridade || []).map((p) => ({
              label: p.prioridade,
              total: p.total,
              color: p.color,
            }))}
            isLoading={isLoading}
          />
        )}

        {isEnabled("chamadosPorSetor") && (
          <BarChartCard
            title="Chamados por Setor"
            data={(data?.chamadosPorSetor || []).map((s) => ({ label: s.setor, value: s.total }))}
            isLoading={isLoading}
          />
        )}

        {isEnabled("chamadosPorAtendente") && (
          <BarChartCard
            title="Chamados por Atendente"
            data={(data?.chamadosPorAtendente || []).map((a) => ({ label: a.atendente, value: a.total }))}
            isLoading={isLoading}
            color="#8B5CF6"
          />
        )}

        {isEnabled("veiculosMaisOcorrencias") && (
          <BarChartCard
            title="Veículos com Mais Ocorrências"
            data={(data?.veiculosMaisOcorrencias || []).map((v) => ({ label: v.veiculo, value: v.total }))}
            isLoading={isLoading}
            color="#F59E0B"
          />
        )}

        {isEnabled("motoristasMaisRegistros") && (
          <BarChartCard
            title="Motoristas com Mais Registros"
            data={(data?.motoristasMaisRegistros || []).map((m) => ({ label: m.motorista, value: m.total }))}
            isLoading={isLoading}
            color="#EC4899"
          />
        )}

        {isEnabled("solicitacoesPorFuncao") && (
          <BarChartCard
            title="Solicitações por Função"
            data={(data?.solicitacoesPorFuncao || []).map((f) => ({ label: f.funcao, value: f.total }))}
            isLoading={isLoading}
            color="#10B981"
          />
        )}

        {isEnabled("tempoMedio") && (
          <div className="lg:col-span-1">
            <KpiCard
              title={modulo === "oficina" ? "Tempo Médio de Reparo" : "Tempo Médio"}
              value={data?.tempoMedio ?? 0}
              subtitle={
                variacao !== undefined
                  ? `${formatPct(variacao.tempoMedio)} vs ant.`
                  : "h"
              }
              color={variacao ? pctColor(variacao.tempoMedio) : "var(--primary)"}
              icon="⏱️"
              isLoading={isLoading}
            />
          </div>
        )}

        {isEnabled("evolucaoTemporal") && (
          data?.comparativo?.atual?.chamadosPeriodo && data?.comparativo?.anterior?.chamadosPeriodo && comparar ? (
            <div className="lg:col-span-3">
              <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Evolução Temporal</h2>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
                      <span className="text-[9px] font-bold opacity-50 uppercase tracking-wider">Atual</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#F59E0B" }} />
                      <span className="text-[9px] font-bold opacity-50 uppercase tracking-wider">Anterior</span>
                    </div>
                  </div>
                </div>
                <div className="h-[280px]">
                  <LineChartCard
                    title=""
                    data={(() => {
                      const periodKeys = new Set<string>()
                      const atualMap = new Map(data.comparativo!.atual.chamadosPeriodo!.map((p) => [p.periodo, p.total]))
                      const antMap = new Map(data.comparativo!.anterior.chamadosPeriodo!.map((p) => [p.periodo, p.total]))
                      ;[...atualMap.keys(), ...antMap.keys()].forEach((k) => periodKeys.add(k))
                      return Array.from(periodKeys).map((key) => ({
                        label: key,
                        value: atualMap.get(key) || 0,
                        anterior: antMap.get(key) || 0,
                      }))
                    })()}
                    dataKeyY="value"
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-3">
              <LineChartCard
                title="Evolução Temporal"
                data={(data?.chamadosPeriodo || []).map((p) => ({ label: p.periodo, value: p.total }))}
                isLoading={isLoading}
              />
            </div>
          )
        )}

        {isEnabled("topMotivos") && (
          <div className="lg:col-span-2">
            <RankingTable
              title={modulo === "oficina" ? "Defeitos Mais Comuns" : "Top Motivos"}
              data={(data?.topMotivos || []).map((m) => ({ label: m.motivo, value: m.total }))}
              labelCol={modulo === "oficina" ? "DEFEITO" : "MOTIVO"}
              valueCol="TOTAL"
              isLoading={isLoading}
            />
          </div>
        )}

        {isEnabled("picoHorarios") && (
          <div className="lg:col-span-2">
            <BarChartCard
              title="Pico por Dia da Semana"
              data={(data?.picoHorarios || []).map((d) => ({ label: d.dia, value: d.total }))}
              isLoading={isLoading}
              color="#F59E0B"
              barSize={48}
            />
          </div>
        )}
      </div>
    </div>
  )
}
