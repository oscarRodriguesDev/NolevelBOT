"use client"

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"

type PieData = {
  name: string
  value: number
  color: string
}

type PieChartCardProps = {
  title: string
  data: { label: string; total: number; color?: string }[]
  isLoading?: boolean
  emptyMessage?: string
}

export function PieChartCard({ title, data, isLoading, emptyMessage }: PieChartCardProps) {
  const chartData: PieData[] = data.map((d) => ({
    name: d.label || d.total?.toString() || "",
    value: d.total,
    color: d.color || "#3B82F6",
  }))

  const total = chartData.reduce((acc, d) => acc + d.value, 0)

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">{title}</h2>
        <div className={`flex gap-1 ${isLoading ? "animate-pulse" : ""}`}>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
          <div className="w-2 h-2 rounded-full opacity-20" style={{ backgroundColor: "var(--primary)" }} />
        </div>
      </div>
      <div className="h-[280px]">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center opacity-20 font-black text-xs tracking-widest">
            CARREGANDO...
          </div>
        ) : chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center opacity-30 font-bold text-xs uppercase tracking-widest">
            {emptyMessage || "Nenhum dado encontrado"}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
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
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span style={{ color: "var(--foreground)", opacity: 0.7, fontSize: "11px", fontWeight: "bold" }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
