import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts"

interface StatItem { setor?: string; motivo?: string; periodo?: string; status?: string; prioridade?: string; total: number }
interface ComparativoItem { mes: string; avisos: number; evitados: number }

const STATUS_CORES: Record<string, string> = {
  NOVO: "var(--status-new)", EM_ATENDIMENTO: "var(--status-in-progress)", AGUARDANDO: "var(--status-waiting)",
  CONCLUIDO: "var(--status-completed)", CANCELADO: "var(--status-cancelled)", FECHADO: "var(--status-completed)",
}
const PRIORIDADE_CORES: Record<string, string> = {
  baixa: "var(--status-completed)", normal: "var(--primary)", alta: "var(--status-waiting)", critica: "var(--status-cancelled)",
}

// Graficos do dashboard: status, prioridade, setor, evolucao e correlacao
// Componente de graficos do dashboard corporativo
export function Charts({ statusStats, prioridadeStats, chamadosPorSetor, chamadosPeriodo, comparativoAvisos }: {
  statusStats: StatItem[]; prioridadeStats: StatItem[]; chamadosPorSetor: StatItem[];
  chamadosPeriodo: StatItem[]; comparativoAvisos: ComparativoItem[];
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
        <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">Prioridade</h2>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={prioridadeStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-subtle)" opacity={0.5} />
              <XAxis type="number" axisLine={false} tickLine={false} fontSize={10} opacity={0.5} />
              <YAxis type="category" dataKey="prioridade" axisLine={false} tickLine={false} fontSize={11} fontWeight="bold" opacity={0.7} width={70} />
              <Tooltip cursor={{ fill: "var(--background)", opacity: 0.4 }} contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }} />
              <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={28}>
                {prioridadeStats.map((p) => (<Cell key={p.prioridade} fill={PRIORIDADE_CORES[p.prioridade || ""] || "var(--primary)"} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lg:col-span-6 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">Chamados por Setor</h2>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chamadosPorSetor}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" opacity={0.5} />
              <XAxis dataKey="setor" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" stroke="var(--foreground)" opacity={0.5} dy={10} />
              <YAxis axisLine={false} tickLine={false} fontSize={10} stroke="var(--foreground)" opacity={0.5} />
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

      {comparativoAvisos.length > 0 && (
        <div className="lg:col-span-12 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Avisos vs Chamados Evitados</h2>
            <span className="text-[10px] font-bold opacity-40">CORRELACAO</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativoAvisos}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" opacity={0.5} />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" opacity={0.5} dy={10} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} opacity={0.5} />
                <Tooltip cursor={{ fill: "var(--background)", opacity: 0.4 }} contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }} />
                <Bar dataKey="avisos" name="Avisos" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="evitados" name="Chamados Evitados" fill="var(--status-completed)" radius={[4, 4, 0, 0]} barSize={24} />
                <Legend wrapperStyle={{ fontSize: "11px", fontWeight: "bold", opacity: 0.7, paddingTop: "16px" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  )
}
