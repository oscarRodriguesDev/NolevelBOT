import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from "recharts"

interface StatItem { setor?: string; motivo?: string; periodo?: string; status?: string; total: number }

const STATUS_CORES: Record<string, string> = {
  NOVO: "var(--status-new)", EM_ATENDIMENTO: "var(--status-in-progress)", AGUARDANDO: "var(--status-waiting)",
  CONCLUIDO: "var(--status-completed)", CANCELADO: "var(--status-cancelled)", FECHADO: "var(--status-completed)",
}

export function Charts({ statusStats, chamadosPorSetor, chamadosPeriodo, leadsPorMes }: {
  statusStats: StatItem[]; chamadosPorSetor: StatItem[]; chamadosPeriodo: StatItem[]; leadsPorMes: StatItem[]
}) {
  return (
    <>
      <div className="lg:col-span-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">Status</h2>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusStats.map((s) => ({ ...s, name: s.status }))} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {statusStats.map((s) => (<Cell key={s.status} fill={STATUS_CORES[s.status || ""] || "var(--primary)"} />))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {statusStats.map((s) => (
            <div key={s.status} className="flex items-center gap-1.5 text-[10px] font-bold">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_CORES[s.status || ""] || "var(--primary)" }} />
              {s.status}: {s.total}
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Leads no Periodo</h2>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={leadsPorMes}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" opacity={0.5} />
              <XAxis dataKey="periodo" axisLine={false} tickLine={false} fontSize={10} opacity={0.5} />
              <YAxis axisLine={false} tickLine={false} fontSize={10} opacity={0.5} />
              <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px" }} />
              <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: "var(--primary)", strokeWidth: 2, stroke: "var(--surface)" }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lg:col-span-6 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">Chamados por Setor</h2>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chamadosPorSetor}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" opacity={0.5} />
              <XAxis dataKey="setor" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" opacity={0.5} dy={10} />
              <YAxis axisLine={false} tickLine={false} fontSize={10} opacity={0.5} />
              <Tooltip cursor={{ fill: "var(--background)", opacity: 0.4 }} contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }} />
              <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lg:col-span-6 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">Evolucao Temporal</h2>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chamadosPeriodo}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" opacity={0.5} />
              <XAxis dataKey="periodo" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" opacity={0.5} />
              <YAxis axisLine={false} tickLine={false} fontSize={10} opacity={0.5} />
              <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px" }} />
              <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={4} dot={{ r: 4, fill: "var(--primary)", strokeWidth: 2, stroke: "var(--surface)" }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}
