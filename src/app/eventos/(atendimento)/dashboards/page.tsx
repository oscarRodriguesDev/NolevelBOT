"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useHeader } from "../layout"

const Charts = dynamic(() => import("./_charts").then((m) => m.Charts), { ssr: false })

interface StatItem {
  setor?: string;
  motivo?: string;
  periodo?: string;
  status?: string;
  prioridade?: string;
  total: number;
}

interface Lead {
  id: string;
  cpf: string;
  nome: string;
  telefone: string;
  empresa?: string;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter()
  const [periodo, setPeriodo] = useState<"dia" | "semana" | "mes" | "ano">("mes")
  const [chamadosPorSetor, setChamadosPorSetor] = useState<StatItem[]>([])
  const [chamadosPeriodo, setChamadosPeriodo] = useState<StatItem[]>([])
  const [motivosStats, setMotivosStats] = useState<StatItem[]>([])
  const [statusStats, setStatusStats] = useState<StatItem[]>([])
  const [tempoMedio, setTempoMedio] = useState(0)
  const [totalAbertos, setTotalAbertos] = useState(0)
  const [totalFechados, setTotalFechados] = useState(0)
  const [taxaConclusao, setTaxaConclusao] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState(true)

  const [leads, setLeads] = useState<Lead[]>([])
  const [leadsLoading, setLeadsLoading] = useState(true)
  const [totalLeads, setTotalLeads] = useState(0)

  const { setHeader } = useHeader()

  const totalGeral = useMemo(() => totalAbertos + totalFechados, [totalAbertos, totalFechados])

  const leadsPorMes = useMemo(() => {
    const map: Record<string, number> = {}
    leads.forEach((l) => {
      const d = new Date(l.createdAt)
      const key = `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
      map[key] = (map[key] || 0) + 1
    })
    return Object.entries(map).map(([periodo, total]) => ({ periodo, total }))
  }, [leads])

  useEffect(() => {
    setHeader({
      titulo: "Dashboards",
      descricao: "Visualize metricas e analises de eventos e leads",
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
          setTempoMedio(data.tempoMedio || 0)
          setTotalAbertos(data.totalAbertos || 0)
          setTotalFechados(data.totalFechados || 0)
          setTaxaConclusao(data.taxaConclusao || 0)
          setHasPermission(true)
        }
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchDashboardData()
    fetchLeads()

    return () => {
      isMounted = false
    }
  }, [periodo])

  async function fetchLeads() {
    setLeadsLoading(true)
    try {
      const response = await fetch("/api/leads-network")
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setLeads(data)
          setTotalLeads(data.length)
        }
      }
    } catch (error) {
      console.error("Erro ao carregar leads:", error)
    } finally {
      setLeadsLoading(false)
    }
  }

  function downloadCSV() {
    const linhas: string[] = []
    linhas.push(`Relatorio de Eventos - Periodo: ${periodo}`)
    linhas.push(`Gerado em: ${new Date().toLocaleString("pt-BR")}`)
    linhas.push("")
    linhas.push("--- INDICADORES ---")
    linhas.push(`Total de Chamados,${totalGeral}`)
    linhas.push(`Em Aberto,${totalAbertos}`)
    linhas.push(`Concluidos,${totalFechados}`)
    linhas.push(`Taxa de Conclusao,${taxaConclusao}%`)
    linhas.push(`Tempo Medio,${tempoMedio}h`)
    linhas.push(`Total de Leads,${totalLeads}`)
    linhas.push("")
    linhas.push("--- STATUS ---")
    linhas.push("Status,Total")
    statusStats.forEach((s) => linhas.push(`${s.status},${s.total}`))
    linhas.push("")
    linhas.push("--- CHAMADOS POR SETOR ---")
    linhas.push("Setor,Total")
    chamadosPorSetor.forEach((t) => linhas.push(`${t.setor},${t.total}`))
    linhas.push("")
    linhas.push("--- TOP MOTIVOS ---")
    linhas.push("Motivo,Total")
    motivosStats.forEach((m) => linhas.push(`${m.motivo},${m.total}`))
    linhas.push("")
    linhas.push("--- LEADS POR PERIODO ---")
    linhas.push("Periodo,Total")
    leadsPorMes.forEach((l) => linhas.push(`${l.periodo},${l.total}`))
    linhas.push("")
    linhas.push("--- EVOLUCAO TEMPORAL ---")
    linhas.push("Periodo,Total")
    chamadosPeriodo.forEach((c) => linhas.push(`${c.periodo},${c.total}`))
    const blob = new Blob([linhas.join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dashboard_eventos_${periodo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function downloadPDF() {
    const jsPDF = (await import("jspdf")).default
    const pdf = new jsPDF()
    let y = 20
    const pageHeight = 280
    const checkPage = () => { if (y > pageHeight) { pdf.addPage(); y = 20 } }

    pdf.setFontSize(18)
    pdf.text("Relatorio de Eventos", 10, y)
    y += 8
    pdf.setFontSize(10)
    pdf.text(`Gerado em: ${new Date().toLocaleString("pt-BR")} | Periodo: ${periodo}`, 10, y)
    y += 12

    pdf.setFontSize(14)
    pdf.text("Indicadores", 10, y); y += 8
    pdf.setFontSize(11)
    pdf.text(`Total de Chamados: ${totalGeral}`, 15, y); y += 6
    pdf.text(`Em Aberto: ${totalAbertos}`, 15, y); y += 6
    pdf.text(`Concluidos: ${totalFechados}`, 15, y); y += 6
    pdf.text(`Taxa de Conclusao: ${taxaConclusao}%`, 15, y); y += 6
    pdf.text(`Tempo Medio: ${tempoMedio} horas`, 15, y); y += 6
    pdf.text(`Total de Leads Captados: ${totalLeads}`, 15, y); y += 10
    checkPage()

    if (statusStats.length > 0) {
      pdf.setFontSize(14)
      pdf.text("Status dos Chamados", 10, y); y += 8
      pdf.setFontSize(11)
      statusStats.forEach((s) => {
        pdf.text(`${s.status}: ${s.total}`, 15, y); y += 6; checkPage()
      })
      y += 4; checkPage()
    }

    if (chamadosPorSetor.length > 0) {
      pdf.setFontSize(14)
      pdf.text("Chamados por Setor", 10, y); y += 8
      pdf.setFontSize(11)
      chamadosPorSetor.slice(0, 15).forEach((t) => {
        pdf.text(`${t.setor}: ${t.total}`, 15, y); y += 6; checkPage()
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

    if (leadsPorMes.length > 0) {
      pdf.setFontSize(14)
      pdf.text("Leads por Periodo", 10, y); y += 8
      pdf.setFontSize(11)
      leadsPorMes.forEach((l) => {
        pdf.text(`${l.periodo}: ${l.total}`, 15, y); y += 6; checkPage()
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

    pdf.save("dashboard_eventos.pdf")
  }

  useEffect(() => {
    if (!hasPermission) {
      router.push("/eventos/all-tickets")
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
        <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            label="Chamados"
            value={isLoading ? "..." : totalGeral}
            unit="total"
            color="var(--foreground)"
          />
          <KPICard
            label="Abertos"
            value={isLoading ? "..." : totalAbertos}
            unit="em andamento"
            color="var(--status-in-progress)"
          />
          <KPICard
            label="Leads Captados"
            value={leadsLoading ? "..." : totalLeads}
            unit="cadastros"
            color="var(--primary)"
          />
          <KPICard
            label="Conclusao"
            value={isLoading ? "..." : `${taxaConclusao}%`}
            unit="taxa media"
            color="var(--status-completed)"
          />
        </div>

        {!isLoading && statusStats.length > 0 && (
          <Charts
            statusStats={statusStats}
            chamadosPorSetor={chamadosPorSetor}
            chamadosPeriodo={chamadosPeriodo}
            leadsPorMes={leadsPorMes}
          />
        )}

        {isLoading && (
          <>
            {[1,2,3,4].map((i) => (
              <div key={i} className="lg:col-span-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
                <div className="w-full h-[260px] flex items-center justify-center opacity-20 font-black text-xs tracking-widest">CARREGANDO...</div>
              </div>
            ))}
          </>
        )}

        {!isLoading && statusStats.length === 0 && (
          <div className="lg:col-span-12 flex flex-col items-center justify-center py-20 space-y-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] shadow-sm">
            <div className="text-6xl">📊</div>
            <p className="text-lg font-bold opacity-60">Nenhum dado disponível</p>
            <p className="text-sm opacity-40">Não há registros no período selecionado para exibir nos gráficos.</p>
          </div>
        )}

        <div className="lg:col-span-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Tempo Medio</h2>
          </div>
          <div className="flex items-center justify-center h-[200px]">
            <div className="text-center">
              <p className="text-6xl font-black" style={{ color: "var(--primary)" }}>
                {isLoading ? "..." : tempoMedio}
              </p>
              <p className="text-sm font-bold opacity-40 mt-2 uppercase tracking-widest">Horas</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-50">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--status-completed)" }} />
              Baseado em chamados concluidos
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--background)] bg-opacity-20 flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Top Motivos</h2>
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
                      <td className="px-6 py-3 font-black opacity-30 w-10">
                        {String(i + 1).padStart(2, "0")}
                      </td>
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

        <div className="lg:col-span-6 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--background)] bg-opacity-20 flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">
              Ultimos Leads
            </h2>
            <span className="text-[10px] font-bold opacity-40">CADASTROS</span>
          </div>
          <div className="overflow-auto max-h-[300px]">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left opacity-30 border-b border-[var(--border-subtle)]">
                  <th className="px-6 py-3 font-black tracking-widest text-[9px]">NOME</th>
                  <th className="px-6 py-3 font-black tracking-widest text-[9px]">EMPRESA</th>
                  <th className="px-6 py-3 font-black tracking-widest text-right text-[9px]">DATA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {leads.length > 0 ? (
                  leads.slice(0, 10).map((lead) => (
                    <tr key={lead.id} className="hover:bg-[var(--background)] hover:bg-opacity-40 transition-colors group">
                      <td className="px-6 py-3 font-bold opacity-80 group-hover:opacity-100">
                        {lead.nome}
                      </td>
                      <td className="px-6 py-3 opacity-60">{lead.empresa || "---"}</td>
                      <td className="px-6 py-3 text-right opacity-50">
                        {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-10 text-center opacity-30 font-bold uppercase tracking-widest"
                    >
                      {leadsLoading ? "Buscando leads..." : "Nenhum lead cadastrado"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
