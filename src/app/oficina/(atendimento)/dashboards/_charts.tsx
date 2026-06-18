import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from "recharts"

interface StatItem { setor?: string; periodo?: string; status?: string; defeito?: string; funcao?: string; veiculo?: string; total: number }

const STATUS_CORES: Record<string, string> = {
  NOVO: "var(--status-new)", EM_ATENDIMENTO: "var(--status-in-progress)", AGUARDANDO: "var(--status-waiting)",
  CONCLUIDO: "var(--status-completed)", CANCELADO: "var(--status-cancelled)", FECHADO: "var(--status-completed)",
}

export function Charts({ statusStats, funcoesStats, veiculosStats, tempoMedioPorDefeito, melhoresVeiculos, defeitosStats, chamadosPeriodo }: {
  statusStats: StatItem[]; funcoesStats: StatItem[]; veiculosStats: StatItem[]; tempoMedioPorDefeito: StatItem[];
  melhoresVeiculos: StatItem[]; defeitosStats: StatItem[]; chamadosPeriodo: StatItem[];
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
        <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">Funcoes</h2>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funcoesStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-subtle)" opacity={0.5} />
              <XAxis type="number" axisLine={false} tickLine={false} fontSize={10} opacity={0.5} />
              <YAxis type="category" dataKey="funcao" axisLine={false} tickLine={false} fontSize={11} fontWeight="bold" opacity={0.7} width={90} />
              <Tooltip cursor={{ fill: "var(--background)", opacity: 0.4 }} contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }} />
              <Bar dataKey="total" fill="var(--primary)" radius={[0, 6, 6, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lg:col-span-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">Veiculos</h2>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={veiculosStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" opacity={0.5} />
              <XAxis dataKey="veiculo" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" opacity={0.5} dy={10} interval={0} angle={-30} textAnchor="end" height={50} />
              <YAxis axisLine={false} tickLine={false} fontSize={10} opacity={0.5} />
              <Tooltip cursor={{ fill: "var(--background)", opacity: 0.4 }} contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }} />
              <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lg:col-span-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">Tempo Medio por Defeito</h2>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tempoMedioPorDefeito} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-subtle)" opacity={0.5} />
              <XAxis type="number" axisLine={false} tickLine={false} fontSize={10} opacity={0.5} unit="h" />
              <YAxis type="category" dataKey="defeito" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" opacity={0.7} width={100} />
              <Tooltip cursor={{ fill: "var(--background)", opacity: 0.4 }} contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }} />
              <Bar dataKey="total" fill="var(--status-in-progress)" radius={[0, 6, 6, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lg:col-span-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">Melhores Veiculos</h2>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[...melhoresVeiculos].reverse().slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" opacity={0.5} />
              <XAxis dataKey="veiculo" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" opacity={0.5} dy={10} interval={0} angle={-30} textAnchor="end" height={50} />
              <YAxis axisLine={false} tickLine={false} fontSize={10} opacity={0.5} />
              <Tooltip cursor={{ fill: "var(--background)", opacity: 0.4 }} contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }} />
              <Bar dataKey="total" fill="var(--status-completed)" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lg:col-span-6 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">Defeitos mais comuns</h2>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={defeitosStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-subtle)" opacity={0.5} />
              <XAxis type="number" axisLine={false} tickLine={false} fontSize={10} opacity={0.5} />
              <YAxis type="category" dataKey="defeito" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" opacity={0.7} width={120} />
              <Tooltip cursor={{ fill: "var(--background)", opacity: 0.4 }} contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-subtle)", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }} />
              <Bar dataKey="total" fill="var(--status-cancelled)" radius={[0, 6, 6, 0]} barSize={24} />
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
              <Line type="monotone" dataKey="total" stroke="var(--status-in-progress)" strokeWidth={4} dot={{ r: 4, fill: "var(--status-in-progress)", strokeWidth: 2, stroke: "var(--surface)" }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}
