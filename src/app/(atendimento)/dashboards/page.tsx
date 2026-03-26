"use client"

import { useEffect, useMemo, useState } from "react"
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
  Cell
} from "recharts"
import jsPDF from "jspdf"
import { useHeader } from "../layout"

type Ticket = {
  id: number
  setor: string
  motivo: string
  status: "Aberto" | "Fechado"
  abertura: string
  fechamento?: string
}

const motivos = [
  "Senha",
  "Computador lento",
  "Acesso sistema",
  "Erro sistema",
  "Internet",
  "Equipamento"
]

const setores = ["TI", "RH", "Financeiro", "Comercial", "Logistica"]

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function generateMock(): Ticket[] {
  const arr: Ticket[] = []

  for (let i = 1; i <= 200; i++) {
    const abertura = randomDate(new Date(2026, 0, 1), new Date())
    const fechado = Math.random() > 0.3

    const fechamento = fechado
      ? new Date(abertura.getTime() + Math.random() * 5 * 86400000)
      : undefined

    arr.push({
      id: i,
      setor: setores[Math.floor(Math.random() * setores.length)],
      motivo: motivos[Math.floor(Math.random() * motivos.length)],
      status: fechado ? "Fechado" : "Aberto",
      abertura: abertura.toISOString(),
      fechamento: fechamento?.toISOString()
    })
  }

  return arr
}

const tickets = generateMock()

function getWeek(date: Date) {
  const first = new Date(date.getFullYear(), 0, 1)
  const diff = (date.getTime() - first.getTime()) / 86400000
  return Math.ceil((diff + first.getDay() + 1) / 7)
}

export default function Dashboard() {
  const [periodo, setPeriodo] = useState<"dia" | "semana" | "mes" | "ano">("mes")

  const chamadosPorSetor = useMemo(() => {
    const map: Record<string, number> = {}

    tickets.forEach((t) => {
      if (t.status === "Aberto") {
        map[t.setor] = (map[t.setor] || 0) + 1
      }
    })

    return Object.entries(map).map(([setor, total]) => ({ setor, total }))
  }, [])

  const chamadosPeriodo = useMemo(() => {
    const map: Record<string, number> = {}

    tickets.forEach((t) => {
      const d = new Date(t.abertura)

      let key = ""

      if (periodo === "dia") key = d.toISOString().slice(0, 10)
      if (periodo === "semana") key = `S${getWeek(d)}`
      if (periodo === "mes") key = `${d.getMonth() + 1}/${d.getFullYear()}`
      if (periodo === "ano") key = `${d.getFullYear()}`

      map[key] = (map[key] || 0) + 1
    })

    return Object.entries(map).map(([k, v]) => ({
      periodo: k,
      total: v
    }))
  }, [periodo])

  const motivosStats = useMemo(() => {
    const map: Record<string, number> = {}

    tickets.forEach((t) => {
      map[t.motivo] = (map[t.motivo] || 0) + 1
    })

    return Object.entries(map)
      .map(([motivo, total]) => ({ motivo, total }))
      .sort((a, b) => b.total - a.total)
  }, [])

  const tempoMedio = useMemo(() => {
    let total = 0
    let count = 0

    tickets.forEach((t) => {
      if (t.fechamento) {
        const a = new Date(t.abertura).getTime()
        const f = new Date(t.fechamento).getTime()

        total += f - a
        count++
      }
    })

    if (!count) return 0

    return Math.round(total / count / 3600000)
  }, [])



    const { setHeader } = useHeader()
  
    useEffect(() => {
      setHeader({
        titulo: 'Dashboards',
        descricao: 'Visualize métricas e análises de desempenho do seu sistema'
      })
    }, [])

  function downloadCSV() {
    const header = "id,setor,motivo,status,abertura,fechamento\n"

    const rows = tickets
      .map(
        (t) =>
          `${t.id},${t.setor},${t.motivo},${t.status},${t.abertura},${t.fechamento ?? ""}`
      )
      .join("\n")

    const blob = new Blob([header + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "dashboard.csv"
    a.click()
  }

  function downloadPDF() {
    const pdf = new jsPDF()

    pdf.text("Relatorio Dashboard Chamados", 10, 10)
    pdf.text(`Tempo medio resolucao: ${tempoMedio} horas`, 10, 20)

    let y = 40

    tickets.slice(0, 40).forEach((t) => {
      pdf.text(
        `${t.id} | ${t.setor} | ${t.motivo} | ${t.status}`,
        10,
        y
      )
      y += 6
    })

    pdf.save("dashboard.pdf")
  }

  return (
    <div
      className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >


      {/* Filtros de Período */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <div className="flex gap-2 sm:gap-3">
          {(['dia', 'semana', 'mes', 'ano'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-300 capitalize text-xs sm:text-sm ${
                periodo === p ? 'text-white' : ''
              }`}
              style={{
                backgroundColor: periodo === p ? 'var(--primary)' : 'var(--surface)',
                borderColor: 'var(--border-subtle)',
                color: periodo === p ? 'white' : 'var(--foreground)',
                border: '1px solid',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex gap-2 sm:gap-3 ml-auto">
          <button
            onClick={downloadCSV}
            className="px-3 sm:px-4 py-2 rounded-lg font-medium text-white transition-all duration-300 hover:scale-105 active:scale-95 text-xs sm:text-sm"
            style={{ backgroundColor: "var(--status-completed)" }}
          >
            CSV
          </button>

          <button
            onClick={downloadPDF}
            className="px-3 sm:px-4 py-2 rounded-lg font-medium text-white transition-all duration-300 hover:scale-105 active:scale-95 text-xs sm:text-sm"
            style={{ backgroundColor: "var(--status-in-progress)" }}
          >
            PDF
          </button>
        </div>
      </div>

      {/* Métrica Principal */}
      <div
        className="p-4 sm:p-6 rounded-2xl border shadow-lg"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <p className="text-xs sm:text-sm opacity-70 mb-2">Tempo Médio de Resolução</p>
        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: "var(--primary)" }}>
          {tempoMedio} <span className="text-base sm:text-lg opacity-70">horas</span>
        </p>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Gráfico de Barras */}
        <div
          className="rounded-2xl border shadow-lg p-4 sm:p-6 transition-colors duration-300"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: "var(--primary)" }}>
            Chamados Abertos por Setor
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chamadosPorSetor}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-subtle)"
              />
              <XAxis dataKey="setor" stroke="var(--foreground)" style={{ fontSize: '12px' }} />
              <YAxis stroke="var(--foreground)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface-elevated)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--foreground)",
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="total" fill="var(--primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Linhas */}
        <div
          className="rounded-2xl border shadow-lg p-4 sm:p-6 transition-colors duration-300"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: "var(--primary)" }}>
            Chamados por {periodo === 'dia' ? 'Dia' : periodo === 'semana' ? 'Semana' : periodo === 'mes' ? 'Mês' : 'Ano'}
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chamadosPeriodo}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-subtle)"
              />
              <XAxis dataKey="periodo" stroke="var(--foreground)" style={{ fontSize: '12px' }} />
              <YAxis stroke="var(--foreground)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface-elevated)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--foreground)",
                  borderRadius: '8px',
                }}
              />
              <Line
                dataKey="total"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ fill: "var(--primary)", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Pizza e Tabela */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Gráfico de Pizza */}
        <div
          className="rounded-2xl border shadow-lg p-4 sm:p-6 transition-colors duration-300"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: "var(--primary)" }}>
            Motivos de Chamados
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface-elevated)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--foreground)",
                  borderRadius: '8px',
                }}
              />
              <Pie
                data={motivosStats}
                dataKey="total"
                nameKey="motivo"
                outerRadius={100}
                label={{ fill: 'var(--foreground)', fontSize: 12 }}
              >
                {motivosStats.map((_, i) => (
                  <Cell
                    key={i}
                    fill={[
                      'var(--primary)',
                      'var(--accent-secondary)',
                      'var(--status-completed)',
                      'var(--status-waiting)',
                      'var(--status-in-progress)',
                      'var(--status-new)',
                    ][i % 6]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tabela de Ranking */}
        <div
          className="rounded-2xl border shadow-lg p-4 sm:p-6 transition-colors duration-300 overflow-auto"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <h2 className="text-lg sm:text-xl font-bold mb-4" style={{ color: "var(--primary)" }}>
            Ranking de Motivos
          </h2>

          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-subtle)' }}>
                <th className="text-left p-3 font-semibold">Motivo</th>
                <th className="text-right p-3 font-semibold">Total</th>
              </tr>
            </thead>

            <tbody>
              {motivosStats.map((m, i) => (
                <tr
                  key={m.motivo}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--surface-elevated)',
                  }}
                >
                  <td className="p-3">{m.motivo}</td>
                  <td className="text-right p-3 font-semibold" style={{ color: "var(--primary)" }}>
                    {m.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
