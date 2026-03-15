"use client"

import { useMemo, useState } from "react"
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
   <div className="p-10 space-y-10 text-gray-900 dark:text-gray-100">

  <div className="flex gap-4">
    <button onClick={() => setPeriodo("dia")} className="border px-3 py-1 dark:border-gray-700">Dia</button>
    <button onClick={() => setPeriodo("semana")} className="border px-3 py-1 dark:border-gray-700">Semana</button>
    <button onClick={() => setPeriodo("mes")} className="border px-3 py-1 dark:border-gray-700">Mes</button>
    <button onClick={() => setPeriodo("ano")} className="border px-3 py-1 dark:border-gray-700">Ano</button>

    <button onClick={downloadCSV} className="bg-blue-600 text-white px-4 py-2">
      CSV
    </button>

    <button onClick={downloadPDF} className="bg-green-600 text-white px-4 py-2">
      PDF
    </button>
  </div>

  <div className="text-xl">
    Tempo médio de resolução: {tempoMedio} horas
  </div>

  <div className="grid md:grid-cols-2 gap-10">

    <div className="h-80 bg-white dark:bg-zinc-900 p-4 shadow rounded">
      <h2 className="mb-4">Chamados abertos por setor</h2>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chamadosPorSetor}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(156 163 175 / 0.3)" />
          <XAxis dataKey="setor" stroke="currentColor" />
          <YAxis stroke="currentColor" />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgb(24 24 27)",
              border: "none",
              color: "#fff"
            }}
          />
          <Bar dataKey="total" />
        </BarChart>
      </ResponsiveContainer>

    </div>

    <div className="h-80 bg-white dark:bg-zinc-900 p-4 shadow rounded">

      <h2 className="mb-4">Chamados por {periodo}</h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chamadosPeriodo}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(156 163 175 / 0.3)" />
          <XAxis dataKey="periodo" stroke="currentColor" />
          <YAxis stroke="currentColor" />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgb(24 24 27)",
              border: "none",
              color: "#fff"
            }}
          />
          <Line dataKey="total" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

    </div>

  </div>

  <div className="grid md:grid-cols-2 gap-10">

    <div className="h-80 bg-white dark:bg-zinc-900 p-4 shadow rounded">

      <h2 className="mb-4">Motivos de chamados</h2>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgb(24 24 27)",
              border: "none",
              color: "#fff"
            }}
          />
          <Pie
            data={motivosStats}
            dataKey="total"
            nameKey="motivo"
            outerRadius={120}
            label
          >
            {motivosStats.map((_, i) => (
              <Cell key={i} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

    </div>

    <div className="bg-white dark:bg-zinc-900 p-4 shadow rounded overflow-auto">

      <h2 className="mb-4">Ranking motivos</h2>

      <table className="w-full border border-gray-200 dark:border-gray-700">

        <thead className="bg-gray-100 dark:bg-zinc-800">
          <tr>
            <th className="border p-2 dark:border-gray-700">Motivo</th>
            <th className="border p-2 dark:border-gray-700">Total</th>
          </tr>
        </thead>

        <tbody>
          {motivosStats.map((m) => (
            <tr key={m.motivo}>
              <td className="border p-2 dark:border-gray-700">{m.motivo}</td>
              <td className="border p-2 dark:border-gray-700">{m.total}</td>
            </tr>
          ))}
        </tbody>

      </table>

    </div>

  </div>

</div>
  )
}