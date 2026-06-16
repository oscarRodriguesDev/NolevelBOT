"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import jsPDF from "jspdf"
import { useHeader } from "../layout"

interface StatItem {
  setor?: string;
  motivo?: string;
  periodo?: string;
  status?: string;
  prioridade?: string;
  total: number;
}

interface ComparativoItem {
  mes: string;
  avisos: number;
  evitados: number;
}

const STATUS_CORES: Record<string, string> = {
  NOVO: "var(--status-new)",
  EM_ATENDIMENTO: "var(--status-in-progress)",
  AGUARDANDO: "var(--status-waiting)",
  CONCLUIDO: "var(--status-completed)",
  CANCELADO: "var(--status-cancelled)",
  FECHADO: "var(--status-completed)",
}

const PRIORIDADE_CORES: Record<string, string> = {
  baixa: "var(--status-completed)",
  normal: "var(--primary)",
  alta: "var(--status-waiting)",
  critica: "var(--status-cancelled)",
}

export default function Dashboard() {
  const router = useRouter()
  const [periodo, setPeriodo] = useState<"dia" | "semana" | "mes" | "ano">("mes")
  const [chamadosPorSetor, setChamadosPorSetor] = useState<StatItem[]>([])
  const [chamadosPeriodo, setChamadosPeriodo] = useState<StatItem[]>([])
  const [motivosStats, setMotivosStats] = useState<StatItem[]>([])
  const [statusStats, setStatusStats] = useState<StatItem[]>([])
  const [prioridadeStats, setPrioridadeStats] = useState<StatItem[]>([])
  const [tempoMedio, setTempoMedio] = useState(0)
  const [tempoMedioDiario, setTempoMedioDiario] = useState(0)
  const [tempoMedioSemanal, setTempoMedioSemanal] = useState(0)
  const [tempoMedioMensal, setTempoMedioMensal] = useState(0)
  const [totalAbertos, setTotalAbertos] = useState(0)
  const [totalFechados, setTotalFechados] = useState(0)
  const [taxaConclusao, setTaxaConclusao] = useState(0)
  const [totalEvitados, setTotalEvitados] = useState(0)
  const [taxaAutomacao, setTaxaAutomacao] = useState(0)
  const [economiaHoras, setEconomiaHoras] = useState(0)
  const [totalAvisos, setTotalAvisos] = useState(0)
  const [evitadosPorMotivo, setEvitadosPorMotivo] = useState<StatItem[]>([])
  const [comparativoAvisos, setComparativoAvisos] = useState<ComparativoItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState(true)

  const { setHeader } = useHeader()

  const totalGeral = useMemo(() => totalAbertos + totalFechados, [totalAbertos, totalFechados])

  useEffect(() => {
    setHeader({
      titulo: "Dashboards",
      descricao: "Visualize metricas e analises de desempenho do seu sistema",
    })
  }, [setHeader])

  useEffect(() => {
    let isMounted = true

    async function fetchDashboardData() {
      if (!isLoading) setIsLoading(true)

      try {
        const response = await fetch(`/api/dashboards?periodo=${periodo}&modulo=corporativo`)

        if (response.status === 403) {
          if (isMounted) setHasPermission(false)
          return
        }

        if (!response.ok) throw new Error("Erro na requisicao")

        const data = await response.json()

        if (data.allowed === false) {
          if (isMounted) setHasPermission(false)
          return
        }

        if (isMounted) {
          setChamadosPorSetor(data.chamadosPorSetor || [])
          setChamadosPeriodo(data.chamadosPeriodo || [])
          setMotivosStats(data.motivosStats || [])
          setStatusStats(data.statusStats || [])
          setPrioridadeStats(data.prioridadeStats || [])
          setTempoMedio(data.tempoMedio || 0)
          setTempoMedioDiario(data.tempoMedioDiario || 0)
          setTempoMedioSemanal(data.tempoMedioSemanal || 0)
          setTempoMedioMensal(data.tempoMedioMensal || 0)
          setTotalAbertos(data.totalAbertos || 0)
          setTotalFechados(data.totalFechados || 0)
          setTaxaConclusao(data.taxaConclusao || 0)
          setTotalEvitados(data.totalEvitados || 0)
          setTaxaAutomacao(data.taxaAutomacao || 0)
          setEconomiaHoras(data.economiaHoras || 0)
          setTotalAvisos(data.totalAvisos || 0)
          setEvitadosPorMotivo(data.evitadosPorMotivo || [])
          setComparativoAvisos(data.comparativoAvisos || [])
          setHasPermission(true)
        }
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchDashboardData()

    return () => {
      isMounted = false
    }
  }, [periodo])

  function downloadCSV() {
    const linhas: string[] = []
    linhas.push(`Relatorio Corporativo - Periodo: ${periodo}`)
    linhas.push(`Gerado em: ${new Date().toLocaleString("pt-BR")}`)
    linhas.push("")
    linhas.push("--- INDICADORES ---")
    linhas.push(`Total Geral,${totalGeral}`)
    linhas.push(`Em Aberto,${totalAbertos}`)
    linhas.push(`Concluidos,${totalFechados}`)
    linhas.push(`Taxa de Conclusao,${taxaConclusao}%`)
    linhas.push(`Tempo Medio,${tempoMedio}h`)
    linhas.push(`Tempo Medio (<=1dia),${tempoMedioDiario}h`)
    linhas.push(`Tempo Medio (<=7dias),${tempoMedioSemanal}h`)
    linhas.push(`Tempo Medio (<=30dias),${tempoMedioMensal}h`)
    linhas.push(`Chamados Evitados,${totalEvitados}`)
    linhas.push(`Avisos Ativos,${totalAvisos}`)
    linhas.push(`Taxa de Automacao,${taxaAutomacao}%`)
    linhas.push(`Economia (horas),${economiaHoras}h`)
    linhas.push("")
    linhas.push("--- CHAMADOS POR SETOR ---")
    linhas.push("Setor,Total")
    chamadosPorSetor.forEach((t) => linhas.push(`${t.setor},${t.total}`))
    linhas.push("")
    linhas.push("--- STATUS ---")
    linhas.push("Status,Total")
    statusStats.forEach((s) => linhas.push(`${s.status},${s.total}`))
    linhas.push("")
    linhas.push("--- PRIORIDADE ---")
    linhas.push("Prioridade,Total")
    prioridadeStats.forEach((p) => linhas.push(`${p.prioridade},${p.total}`))
    linhas.push("")
    linhas.push("--- TOP MOTIVOS ---")
    linhas.push("Motivo,Total")
    motivosStats.forEach((m) => linhas.push(`${m.motivo},${m.total}`))
    linhas.push("")
    linhas.push("--- TOP MOTIVOS EVITADOS ---")
    linhas.push("Motivo,Total")
    evitadosPorMotivo.forEach((m) => linhas.push(`${m.motivo},${m.total}`))
    linhas.push("")
    linhas.push("--- AVISOS VS CHAMADOS EVITADOS ---")
    linhas.push("Mes,Avisos Criados,Chamados Evitados")
    comparativoAvisos.forEach((c) => linhas.push(`${c.mes},${c.avisos},${c.evitados}`))
    linhas.push("")
    linhas.push("--- EVOLUCAO TEMPORAL ---")
    linhas.push("Periodo,Total")
    chamadosPeriodo.forEach((c) => linhas.push(`${c.periodo},${c.total}`))
    const blob = new Blob([linhas.join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dashboard_corporativo_${periodo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function downloadPDF() {
    const pdf = new jsPDF()
    let y = 20
    const pageHeight = 280
    const checkPage = () => { if (y > pageHeight) { pdf.addPage(); y = 20 } }

    pdf.setFontSize(18)
    pdf.text("Relatorio de Chamados - Corporativo", 10, y)
    y += 8
    pdf.setFontSize(10)
    pdf.text(`Gerado em: ${new Date().toLocaleString("pt-BR")} | Periodo: ${periodo}`, 10, y)
    y += 12

    pdf.setFontSize(14)
    pdf.text("Indicadores", 10, y); y += 8
    pdf.setFontSize(11)
    pdf.text(`Total Geral: ${totalGeral} chamados`, 15, y); y += 6
    pdf.text(`Em Aberto: ${totalAbertos}`, 15, y); y += 6
    pdf.text(`Concluidos: ${totalFechados}`, 15, y); y += 6
    pdf.text(`Taxa de Conclusao: ${taxaConclusao}%`, 15, y); y += 6
    pdf.text(`Tempo Medio: ${tempoMedio} horas`, 15, y); y += 6
    pdf.text(`Tempo Medio (<=1dia): ${tempoMedioDiario}h`, 15, y); y += 6
    pdf.text(`Tempo Medio (<=7dias): ${tempoMedioSemanal}h`, 15, y); y += 6
    pdf.text(`Tempo Medio (<=30dias): ${tempoMedioMensal}h`, 15, y); y += 6
    pdf.text(`Chamados Evitados: ${totalEvitados}`, 15, y); y += 6
    pdf.text(`Avisos Ativos: ${totalAvisos}`, 15, y); y += 6
    pdf.text(`Taxa de Automacao: ${taxaAutomacao}%`, 15, y); y += 6
    pdf.text(`Economia: ${economiaHoras} horas`, 15, y); y += 10
    checkPage()

    if (chamadosPorSetor.length > 0) {
      pdf.setFontSize(14)
      pdf.text("Chamados por Setor", 10, y); y += 8
      pdf.setFontSize(11)
      chamadosPorSetor.slice(0, 15).forEach((t) => {
        pdf.text(`${t.setor}: ${t.total}`, 15, y); y += 6; checkPage()
      })
      y += 4; checkPage()
    }

    if (statusStats.length > 0) {
      pdf.setFontSize(14)
      pdf.text("Status", 10, y); y += 8
      pdf.setFontSize(11)
      statusStats.forEach((s) => {
        pdf.text(`${s.status}: ${s.total}`, 15, y); y += 6; checkPage()
      })
      y += 4; checkPage()
    }

    if (prioridadeStats.length > 0) {
      pdf.setFontSize(14)
      pdf.text("Prioridade", 10, y); y += 8
      pdf.setFontSize(11)
      prioridadeStats.forEach((p) => {
        pdf.text(`${p.prioridade}: ${p.total}`, 15, y); y += 6; checkPage()
      })
      y += 4; checkPage()
    }

    if (motivosStats.length > 0) {
      pdf.setFontSize(14)
      pdf.text("Top Motivos", 10, y); y += 8
      pdf.setFontSize(11)
      motivosStats.slice(0, 20).forEach((m) => {
        const txt = (m.motivo || "Sem motivo")
        const motivo = txt.length > 70 ? txt.slice(0, 70) + "..." : txt
        pdf.text(`${motivo}: ${m.total}`, 15, y); y += 6; checkPage()
      })
      y += 4; checkPage()
    }

    if (evitadosPorMotivo.length > 0) {
      pdf.setFontSize(14)
      pdf.text("Top Motivos Evitados", 10, y); y += 8
      pdf.setFontSize(11)
      evitadosPorMotivo.slice(0, 15).forEach((m) => {
        const txt = (m.motivo || "Sem motivo")
        const motivo = txt.length > 70 ? txt.slice(0, 70) + "..." : txt
        pdf.text(`${motivo}: ${m.total}`, 15, y); y += 6; checkPage()
      })
      y += 4; checkPage()
    }

    if (comparativoAvisos.length > 0) {
      pdf.setFontSize(14)
      pdf.text("Avisos vs Chamados Evitados", 10, y); y += 8
      pdf.setFontSize(11)
      comparativoAvisos.forEach((c) => {
        pdf.text(`${c.mes}: ${c.avisos} avisos, ${c.evitados} evitados`, 15, y); y += 6; checkPage()
      })
      y += 4; checkPage()
    }

    if (chamadosPeriodo.length > 0) {
      pdf.setFontSize(14)
      pdf.text("Evolucao Temporal", 10, y); y += 8
      pdf.setFontSize(11)
      chamadosPeriodo.forEach((c) => {
        pdf.text(`${c.periodo}: ${c.total}`, 15, y); y += 6; checkPage()
      })
    }

    pdf.save("dashboard_corporativo.pdf")
  }

  useEffect(() => {
    if (!hasPermission) {
      router.push("/corporativo/all-tickets")
    }
  }, [hasPermission, router])

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 bg-red-500/10 rounded-full">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m0 0v2m0-2h2m-2 0H10m3.332-4.76a2 2 0 11-2.828 2.829 2 2 0 012.828-2.829zm4-8a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-black uppercase tracking-widest opacity-80">Acesso Negado</h1>
        <p className="text-sm opacity-50 max-w-md text-center font-medium">
          Voce nao possui as permissoes necessarias para visualizar as metricas deste dashboard.
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
        <span className="text-xs font-black uppercase tracking-[0.2em] opacity-50">Filtros</span>

        <div className="flex items-center gap-4">
          <nav className="flex bg-[var(--background)] p-1 rounded-xl border border-[var(--border-subtle)]">
            {(["dia", "semana", "mes", "ano"] as const).map((p) => (
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

          <div className="h-8 w-[1px] bg-[var(--border-subtle)] hidden md:block" />

          <div className="flex gap-2">
            <button
              onClick={downloadCSV}
              className="p-2 px-4 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:brightness-110 transition-all"
              style={{ backgroundColor: "var(--status-completed)" }}
            >
              CSV
            </button>
            <button
              onClick={downloadPDF}
              className="p-2 px-4 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:brightness-110 transition-all"
              style={{ backgroundColor: "var(--status-in-progress)" }}
            >
              PDF
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
          <KPICard label="Total Geral" value={isLoading ? "..." : totalGeral} unit="chamados" color="var(--foreground)" />
          <KPICard label="Abertos" value={isLoading ? "..." : totalAbertos} unit="em andamento" color="var(--status-in-progress)" />
          <KPICard label="Concluidos" value={isLoading ? "..." : totalFechados} unit="finalizados" color="var(--status-completed)" />
          <KPICard label="Taxa de Conclusao" value={isLoading ? "..." : `${taxaConclusao}%`} unit={taxaConclusao > 50 ? "acima da media" : "abaixo da media"} color="var(--primary)" />
          <KPICard label="Chamados Evitados" value={isLoading ? "..." : totalEvitados} unit="pelo bot" color="var(--status-waiting)" />
          <KPICard label="Avisos Ativos" value={isLoading ? "..." : totalAvisos} unit="cadastrados" color="#8b5cf6" />
          <KPICard label="Taxa de Automacao" value={isLoading ? "..." : `${taxaAutomacao}%`} unit={taxaAutomacao > 50 ? "acima da media" : "abaixo da media"} color="var(--status-completed)" />
          <KPICard label="Economia (horas)" value={isLoading ? "..." : economiaHoras} unit="horas economizadas" color="var(--status-in-progress)" />
        </div>

        <div className="lg:col-span-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">Status</h2>
          <div className="h-[260px]">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center opacity-20 font-black text-xs tracking-widest">
                CARREGANDO...
              </div>
            ) : statusStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusStats.map((s) => ({ ...s, name: s.status }))}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {statusStats.map((s) => (
                      <Cell
                        key={s.status}
                        fill={STATUS_CORES[s.status || ""] || "var(--primary)"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-30 font-bold uppercase text-xs tracking-widest">
                Sem dados
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {statusStats.map((s) => (
              <div key={s.status} className="flex items-center gap-1.5 text-[10px] font-bold">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: STATUS_CORES[s.status || ""] || "var(--primary)" }}
                />
                {s.status}: {s.total}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">Prioridade</h2>
          <div className="h-[260px]">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center opacity-20 font-black text-xs tracking-widest">
                CARREGANDO...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prioridadeStats} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="var(--border-subtle)"
                    opacity={0.5}
                  />
                  <XAxis type="number" axisLine={false} tickLine={false} fontSize={10} opacity={0.5} />
                  <YAxis
                    type="category"
                    dataKey="prioridade"
                    axisLine={false}
                    tickLine={false}
                    fontSize={11}
                    fontWeight="bold"
                    opacity={0.7}
                    width={70}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--background)", opacity: 0.4 }}
                    contentStyle={{
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  />
                  <Bar
                    dataKey="total"
                    radius={[0, 6, 6, 0]}
                    barSize={28}
                  >
                    {prioridadeStats.map((p) => (
                      <Cell
                        key={p.prioridade}
                        fill={PRIORIDADE_CORES[p.prioridade || ""] || "var(--primary)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Tempo Medio de Atendimento</h2>
          </div>
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-5xl font-black" style={{ color: "var(--primary)" }}>
                {isLoading ? "..." : tempoMedio}
              </p>
              <p className="text-sm font-bold opacity-40 mt-1 uppercase tracking-widest">Media Geral (horas)</p>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--border-subtle)]">
              <div className="text-center">
                <p className="text-xl font-black" style={{ color: "var(--status-completed)" }}>{isLoading ? "..." : tempoMedioDiario}</p>
                <p className="text-[9px] font-bold opacity-40 uppercase tracking-wider mt-1">{'<='} 1dia</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black" style={{ color: "var(--status-in-progress)" }}>{isLoading ? "..." : tempoMedioSemanal}</p>
                <p className="text-[9px] font-bold opacity-40 uppercase tracking-wider mt-1">{'<='} 7dias</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black" style={{ color: "var(--status-waiting)" }}>{isLoading ? "..." : tempoMedioMensal}</p>
                <p className="text-[9px] font-bold opacity-40 uppercase tracking-wider mt-1">{'<='} 30dias</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">
              Chamados por Setor
            </h2>
          </div>
          <div className="h-[280px]">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center opacity-20 font-black text-xs tracking-widest">
                CARREGANDO...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chamadosPorSetor}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border-subtle)"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="setor"
                    axisLine={false}
                    tickLine={false}
                    fontSize={10}
                    fontWeight="bold"
                    stroke="var(--foreground)"
                    opacity={0.5}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    fontSize={10}
                    stroke="var(--foreground)"
                    opacity={0.5}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--background)", opacity: 0.4 }}
                    contentStyle={{
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  />
                  <Bar
                    dataKey="total"
                    fill="var(--primary)"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="lg:col-span-6 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">
            Evolucao Temporal
          </h2>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chamadosPeriodo}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border-subtle)"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="periodo"
                  axisLine={false}
                  tickLine={false}
                  fontSize={10}
                  fontWeight="bold"
                  opacity={0.5}
                />
                <YAxis axisLine={false} tickLine={false} fontSize={10} opacity={0.5} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--primary)"
                  strokeWidth={4}
                  dot={{
                    r: 4,
                    fill: "var(--primary)",
                    strokeWidth: 2,
                    stroke: "var(--surface)",
                  }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-12 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--background)] bg-opacity-20 flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">
              Top Motivos
            </h2>
            <span className="text-[10px] font-bold opacity-40">RANKING</span>
          </div>
          <div className="overflow-auto max-h-[300px]">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left opacity-30 border-b border-[var(--border-subtle)]">
                  <th className="px-6 py-3 font-black tracking-widest text-[9px]">#</th>
                  <th className="px-6 py-3 font-black tracking-widest text-[9px]">MOTIVO</th>
                  <th className="px-6 py-3 font-black tracking-widest text-right text-[9px]">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {motivosStats.length > 0 ? (
                  motivosStats.slice(0, 10).map((m, i) => (
                    <tr
                      key={i}
                      className="hover:bg-[var(--background)] hover:bg-opacity-40 transition-colors group"
                    >
                      <td className="px-6 py-3 font-black opacity-30 w-10">{String(i + 1).padStart(2, "0")}</td>
                      <td className="px-6 py-3 font-bold opacity-80 group-hover:opacity-100 max-w-[400px] truncate">
                        {m.motivo}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span
                          className="bg-[var(--background)] px-3 py-1 rounded-lg font-black"
                          style={{ color: "var(--primary)" }}
                        >
                          {m.total}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-10 text-center opacity-30 font-bold uppercase tracking-widest"
                    >
                      {isLoading ? "Buscando dados..." : "Nenhum dado encontrado"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparativo Avisos vs Chamados Evitados */}
        <div className="lg:col-span-12 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">
              Avisos vs Chamados Evitados
            </h2>
            <span className="text-[10px] font-bold opacity-40">CORRELACAO</span>
          </div>
          <div className="h-[300px]">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center opacity-20 font-black text-xs tracking-widest">
                CARREGANDO...
              </div>
            ) : comparativoAvisos.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparativoAvisos}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" opacity={0.5} />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" opacity={0.5} dy={10} />
                  <YAxis axisLine={false} tickLine={false} fontSize={10} opacity={0.5} />
                  <Tooltip cursor={{ fill: "var(--background)", opacity: 0.4 }}
                    contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}
                  />
                  <Bar dataKey="avisos" name="Avisos" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="evitados" name="Chamados Evitados" fill="var(--status-completed)" radius={[4, 4, 0, 0]} barSize={24} />
                  <Legend wrapperStyle={{ fontSize: "11px", fontWeight: "bold", opacity: 0.7, paddingTop: "16px" }} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-30 font-bold uppercase text-xs tracking-widest">
                Sem dados
              </div>
            )}
          </div>
        </div>

        {/* Top Motivos Evitados */}
        <div className="lg:col-span-6 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--background)] bg-opacity-20 flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">
              Top Motivos Evitados
            </h2>
            <span className="text-[10px] font-bold opacity-40">RANKING</span>
          </div>
          <div className="overflow-auto max-h-[300px]">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left opacity-30 border-b border-[var(--border-subtle)]">
                  <th className="px-6 py-3 font-black tracking-widest text-[9px]">#</th>
                  <th className="px-6 py-3 font-black tracking-widest text-[9px]">MOTIVO</th>
                  <th className="px-6 py-3 font-black tracking-widest text-right text-[9px]">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {evitadosPorMotivo.length > 0 ? (
                  evitadosPorMotivo.slice(0, 10).map((m, i) => (
                    <tr key={i} className="hover:bg-[var(--background)] hover:bg-opacity-40 transition-colors group">
                      <td className="px-6 py-3 font-black opacity-30 w-10">{String(i + 1).padStart(2, "0")}</td>
                      <td className="px-6 py-3 font-bold opacity-80 group-hover:opacity-100 max-w-[400px] truncate">
                        {m.motivo}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="bg-[var(--background)] px-3 py-1 rounded-lg font-black" style={{ color: "var(--status-completed)" }}>
                          {m.total}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-10 text-center opacity-30 font-bold uppercase tracking-widest">
                      {isLoading ? "Buscando dados..." : "Nenhum chamado evitado no periodo"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legenda: Avisos vs Evitados */}
        <div className="lg:col-span-6 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
          <div className="flex items-start justify-center h-full flex-col space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Entendendo a Relacao</h2>
            <p className="text-sm font-bold opacity-60 leading-relaxed">
              Quanto mais avisos a empresa cadastrar na aba de avisos, mais o bot consegue
              resolver problemas automaticamente, evitando a abertura de novos chamados.
            </p>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-[11px] font-bold">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "#8b5cf6" }} />
                Avisos Criados
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "var(--status-completed)" }} />
                Chamados Evitados
              </div>
            </div>
            <p className="text-[10px] font-bold opacity-30 mt-2">
              {totalAvisos} avisos ativos &middot; {totalEvitados} chamados evitados no periodo &middot; {taxaAutomacao}% de automacao
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({
  label,
  value,
  unit,
  color,
}: {
  label: string
  value: string | number
  unit: string
  color: string
}) {
  return (
    <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm relative overflow-hidden group">
      <div
        className="absolute top-0 right-0 w-28 h-28 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"
        style={{ backgroundColor: color, opacity: 0.04 }}
      />
      <p className="text-[10px] font-black uppercase opacity-40 mb-1.5 tracking-widest">{label}</p>
      <p className="text-3xl font-black" style={{ color }}>
        {value}
      </p>
      <p className="text-[10px] font-bold opacity-30 mt-0.5 uppercase tracking-wider">{unit}</p>
    </div>
  )
}
