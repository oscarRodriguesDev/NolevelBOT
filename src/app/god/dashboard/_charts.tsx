import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts"

interface StatItem { status?: string; setor?: string; role?: string; periodo?: string; total: number }
interface EmpresaStat { id: string; nome: string; modulos: string[]; usuarios: number; chamados: number; cpfs: number; ultimaAtividade: string }

const STATUS_CORES: Record<string, string> = {
  NOVO: "var(--status-new)", EM_ATENDIMENTO: "var(--status-in-progress)", AGUARDANDO: "var(--status-waiting)",
  CONCLUIDO: "var(--status-completed)", CANCELADO: "var(--status-cancelled)", FECHADO: "var(--status-completed)",
}
const ROLE_CORES: Record<string, string> = {
  GOD: "#f59e0b", ADMIN: "#3b82f6", GESTOR: "#8b5cf6", ATENDENTE: "#10b981",
}

// Componente de graficos do dashboard God
export function Charts({ data }: { data: { statusStats: StatItem[]; roleDistribution: StatItem[]; setorStats: StatItem[]; topEmpresas: EmpresaStat[]; chamadosPeriodo: StatItem[] } }) {
  return (
    <>
      <div className="lg:col-span-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">Status Global</h2>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.statusStats.map((s) => ({ ...s, name: s.status }))} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {data.statusStats.map((s) => (<Cell key={s.status} fill={STATUS_CORES[s.status || ""] || "var(--primary)"} />))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lg:col-span-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">Usuarios por Role</h2>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.roleDistribution.map((r) => ({ ...r, name: r.role }))} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {data.roleDistribution.map((r) => (<Cell key={r.role} fill={ROLE_CORES[r.role || ""] || "var(--primary)"} />))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lg:col-span-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">Setores mais Acionados</h2>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.setorStats.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-subtle)" opacity={0.5} />
              <XAxis type="number" axisLine={false} tickLine={false} fontSize={10} opacity={0.5} />
              <YAxis type="category" dataKey="setor" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" opacity={0.7} width={90} />
              <Tooltip cursor={{ fill: "var(--background)", opacity: 0.4 }} contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }} />
              <Bar dataKey="total" fill="var(--primary)" radius={[0, 6, 6, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lg:col-span-7 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">Chamados por Empresa</h2>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topEmpresas}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" opacity={0.5} />
              <XAxis dataKey="nome" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" opacity={0.5} dy={10} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis axisLine={false} tickLine={false} fontSize={10} opacity={0.5} />
              <Tooltip cursor={{ fill: "var(--background)", opacity: 0.4 }} contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }} />
              <Bar dataKey="chamados" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lg:col-span-5 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">Evolucao Temporal</h2>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.chamadosPeriodo}>
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
