"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

type BarChartCardProps = {
  title: string
  data: { label: string; value: number }[]
  dataKeyX?: string
  dataKeyY?: string
  color?: string
  isLoading?: boolean
  emptyMessage?: string
  barSize?: number
}

export function BarChartCard({
  title,
  data,
  dataKeyX = "label",
  dataKeyY = "value",
  color,
  isLoading,
  emptyMessage,
  barSize = 32,
}: BarChartCardProps) {
  const chartData = data.map((d) => ({ [dataKeyX]: d.label, [dataKeyY]: d.value }))

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">{title}</h2>
        <div className={`flex gap-1 ${isLoading ? "animate-pulse" : ""}`}>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color || "var(--primary)" }} />
          <div className="w-2 h-2 rounded-full opacity-20" style={{ backgroundColor: color || "var(--primary)" }} />
        </div>
      </div>
      <div className="h-[300px]">
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
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" opacity={0.5} />
              <XAxis
                dataKey={dataKeyX}
                axisLine={false}
                tickLine={false}
                fontSize={10}
                fontWeight="bold"
                stroke="var(--foreground)"
                opacity={0.5}
                dy={10}
                interval={0}
                angle={chartData.length > 6 ? -25 : 0}
                textAnchor={chartData.length > 6 ? "end" : "middle"}
                height={chartData.length > 6 ? 60 : 30}
              />
              <YAxis axisLine={false} tickLine={false} fontSize={10} stroke="var(--foreground)" opacity={0.5} />
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
              <Bar dataKey={dataKeyY} fill={color || "var(--primary)"} radius={[6, 6, 0, 0]} barSize={barSize} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
