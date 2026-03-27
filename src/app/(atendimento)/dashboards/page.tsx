"use client"

import { useEffect, useState, useMemo } from "react"
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
  Cell
} from "recharts"
import jsPDF from "jspdf"
import { useHeader } from "../layout"

// Tipagem para os dados que vêm da API (ajuste conforme seu backend)
interface StatItem {
  setor?: string;
  motivo?: string;
  periodo?: string;
  total: number;
}

export default function Dashboard() {
  const [periodo, setPeriodo] = useState<"dia" | "semana" | "mes" | "ano">("mes")
  const [chamadosPorSetor, setChamadosPorSetor] = useState<StatItem[]>([])
  const [chamadosPeriodo, setChamadosPeriodo] = useState<StatItem[]>([])
  const [motivosStats, setMotivosStats] = useState<StatItem[]>([])
  const [tempoMedio, setTempoMedio] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const { setHeader } = useHeader()

  // Cálculo do total geral baseado nos motivos recebidos
  const totalGeral = useMemo(() => {
    return motivosStats.reduce((acc, curr) => acc + curr.total, 0)
  }, [motivosStats])

  useEffect(() => {
    setHeader({
      titulo: "Dashboards",
      descricao: "Visualize métricas e análises de desempenho do seu sistema"
    })
  }, [setHeader])

  useEffect(() => {
    setIsLoading(true)
    fetch(`/api/dashboards?periodo=${periodo}`)
      .then((res) => res.json())
      .then((data) => {
        setChamadosPorSetor(data.chamadosPorSetor || [])
        setChamadosPeriodo(data.chamadosPeriodo || [])
        setMotivosStats(data.motivosStats || [])
        setTempoMedio(data.tempoMedio || 0)
      })
      .finally(() => setIsLoading(false))
  }, [periodo])

  function downloadCSV() {
    const header = "setor,total\n"
    const rows = chamadosPorSetor.map((t) => `${t.setor},${t.total}`).join("\n")
    const blob = new Blob([header + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dashboard_${periodo}.csv`
    a.click()
  }

  function downloadPDF() {
    const pdf = new jsPDF()
    pdf.setFontSize(18)
    pdf.text("Relatório de Chamados", 10, 20)
    pdf.setFontSize(12)
    pdf.text(`Período: ${periodo} | Total: ${totalGeral} | TM: ${tempoMedio}h`, 10, 30)
    
    let y = 50
    chamadosPorSetor.forEach((t) => {
      pdf.text(`${t.setor}: ${t.total} chamados`, 10, y)
      y += 7
    })
    pdf.save("dashboard.pdf")
  }

  return (
    <div
      className="min-h-screen px-4 py-8 space-y-6 transition-colors duration-300 max-w-[1600px] mx-auto select-none"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      {/* HEADER COMPACTO */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[var(--surface)] p-2 pl-4 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
        <span className="text-xs font-black uppercase tracking-[0.2em] opacity-50">Filtros</span>
        
        <div className="flex items-center gap-4">
          <nav className="flex bg-[var(--background)] p-1 rounded-xl border border-[var(--border-subtle)]">
            {(["dia", "semana", "mes", "ano"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-4 py-1.5 rounded-lg font-bold transition-all capitalize text-xs ${
                  periodo === p ? "shadow-md scale-105" : "opacity-40 hover:opacity-100"
                }`}
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
            <button onClick={downloadCSV} className="p-2 px-4 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:brightness-110 transition-all" style={{ backgroundColor: "var(--status-completed)" }}>CSV</button>
            <button onClick={downloadPDF} className="p-2 px-4 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:brightness-110 transition-all" style={{ backgroundColor: "var(--status-in-progress)" }}>PDF</button>
          </div>
        </div>
      </header>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* KPIs LATERAIS */}
        <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--primary)] opacity-[0.03] rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
            <p className="text-[10px] font-black uppercase opacity-40 mb-2 tracking-widest">Tempo Médio</p>
            <p className="text-4xl font-black" style={{ color: "var(--primary)" }}>
              {isLoading ? "..." : tempoMedio}
              <span className="text-sm opacity-40 ml-2 font-bold uppercase">h</span>
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--status-completed)] opacity-[0.03] rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
            <p className="text-[10px] font-black uppercase opacity-40 mb-2 tracking-widest">Total Geral</p>
            <p className="text-4xl font-black" style={{ color: "var(--foreground)" }}>
              {isLoading ? "..." : totalGeral}
              <span className="text-sm opacity-40 ml-2 font-bold uppercase text-[var(--status-completed)]">un</span>
            </p>
          </div>
        </div>

        {/* GRÁFICO DE BARRAS CENTRAL */}
        <div className="lg:col-span-3 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Chamados por Setor</h2>
            <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: 'var(--primary)'}} />
                <div className="w-2 h-2 rounded-full opacity-20" style={{backgroundColor: 'var(--primary)'}} />
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chamadosPorSetor}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" opacity={0.5} />
                <XAxis dataKey="setor" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" stroke="var(--foreground)" opacity={0.5} dy={10} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} stroke="var(--foreground)" opacity={0.5} />
                <Tooltip cursor={{fill: 'var(--background)', opacity: 0.4}} contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }} />
                <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* EVOLUÇÃO TEMPORAL */}
        <div className="lg:col-span-2 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-8 opacity-70">Evolução Temporal</h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chamadosPeriodo}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" opacity={0.5} />
                <XAxis dataKey="periodo" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" opacity={0.5} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} opacity={0.5} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={4} dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: 'var(--surface)' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RANKING TABLE */}
        <div className="lg:col-span-2 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--background)] bg-opacity-20 flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Top Motivos</h2>
            <span className="text-[10px] font-bold opacity-40">RANKING</span>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left opacity-30 border-b border-[var(--border-subtle)]">
                  <th className="px-6 py-3 font-black tracking-widest text-[9px]">MOTIVO</th>
                  <th className="px-6 py-3 font-black tracking-widest text-right text-[9px]">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {motivosStats.length > 0 ? (
                  motivosStats.slice(0, 6).map((m, i) => (
                    <tr key={i} className="hover:bg-[var(--background)] hover:bg-opacity-40 transition-colors group">
                      <td className="px-6 py-4 font-bold opacity-80 group-hover:opacity-100">{m.motivo}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="bg-[var(--background)] px-3 py-1 rounded-lg font-black" style={{ color: "var(--primary)" }}>
                          {m.total}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="p-10 text-center opacity-30 font-bold uppercase tracking-widest">Nenhum dado encontrado</td>
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