"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ROLE } from "@prisma/client"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts"

interface EmpresaStat {
  id: string
  nome: string
  modulos: string[]
  usuarios: number
  chamados: number
  cpfs: number
  ultimaAtividade: string
}

interface StatItem {
  status?: string
  setor?: string
  role?: string
  periodo?: string
  total: number
}

interface LogItem {
  id: string
  cpf?: string
  nome?: string
  empresa: string
  modulo: string
  acao: string
  createdAt: string
}

interface GodData {
  global: {
    totalEmpresas: number
    totalUsuarios: number
    totalChamados: number
    totalAbertos: number
    totalFechados: number
    totalCpfs: number
    totalLeads: number
    tempoMedio: number
    taxaConclusao: number
  }
  empresas: EmpresaStat[]
  topEmpresas: EmpresaStat[]
  empresasInativas: number
  roleDistribution: StatItem[]
  statusStats: StatItem[]
  setorStats: StatItem[]
  chamadosPeriodo: StatItem[]
  logsRecentes: LogItem[]
  empresaGod?: {
    nome: string
    totalChamados: number
    abertos: number
    fechados: number
    statusStats: StatItem[]
  }
}

const STATUS_CORES: Record<string, string> = {
  NOVO: "var(--status-new)",
  EM_ATENDIMENTO: "var(--status-in-progress)",
  AGUARDANDO: "var(--status-waiting)",
  CONCLUIDO: "var(--status-completed)",
  CANCELADO: "var(--status-cancelled)",
  FECHADO: "var(--status-completed)",
}

const ROLE_CORES: Record<string, string> = {
  GOD: "#f59e0b",
  ADMIN: "#3b82f6",
  GESTOR: "#8b5cf6",
  ATENDENTE: "#10b981",
}

export default function GodDashboard() {
  const { data: session, status: sessionStatus } = useSession()
  const userRole = session?.user?.role as ROLE | undefined
  const router = useRouter()
  const [data, setData] = useState<GodData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionStatus === "loading") return
    if (!session || userRole !== "GOD") {
      router.replace("/dashboard")
      return
    }
    fetch("/api/dashboards/god")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { console.error("API error:", d.error); setData(null) }
        else setData(d)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [session, sessionStatus, userRole, router])

  const totalGeral = useMemo(
    () => (data?.global ? data.global.totalAbertos + data.global.totalFechados : 0),
    [data]
  )

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
      >
        <div className="animate-spin w-8 h-8 border-2 border-(--primary) border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div
      className="min-h-screen px-4 py-8 space-y-6 transition-colors duration-300 max-w-[1600px] mx-auto select-none"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <header className="flex items-center gap-3 mb-2">
        <div
          className="p-3 rounded-xl text-white shadow-lg"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold">Plataforma</h1>
          <p className="text-xs opacity-50 font-medium">
            Metricas globais do sistema
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <KPICard label="Empresas" value={data.global.totalEmpresas} unit="cadastradas" color="var(--primary)" />
        <KPICard label="Usuarios" value={data.global.totalUsuarios} unit="no total" color="var(--foreground)" />
        <KPICard label="Chamados" value={data.global.totalChamados} unit="registrados" color="var(--status-in-progress)" />
        <KPICard label="CPFs" value={data.global.totalCpfs} unit="cadastrados" color="var(--status-completed)" />
        <KPICard label="Leads" value={data.global.totalLeads} unit="captados" color="var(--status-waiting)" />
        <KPICard label="Tempo Medio" value={`${data.global.tempoMedio}h`} unit="por chamado" color="var(--primary)" />
      </div>

      {data.empresaGod && (
        <>
          <h2 className="text-sm font-black uppercase tracking-[0.2em] opacity-50 mt-4">
            Minha Empresa &mdash; {data.empresaGod.nome}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard label="Chamados" value={data.empresaGod.totalChamados} unit="total" color="var(--foreground)" />
            <KPICard label="Em Aberto" value={data.empresaGod.abertos} unit="aguardando" color="var(--status-in-progress)" />
            <KPICard label="Concluidos" value={data.empresaGod.fechados} unit="finalizados" color="var(--status-completed)" />
            <KPICard label="Empresa" value={data.empresaGod.nome} unit="" color="var(--primary)" />
          </div>
          {data.empresaGod.statusStats.length > 0 && (
            <div className="lg:col-span-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-70">
                Status dos Chamados
              </h2>
              <div className="flex flex-wrap gap-3">
                {data.empresaGod.statusStats.map((s) => (
                  <div key={s.status} className="flex items-center gap-1.5 text-xs font-bold">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: STATUS_CORES[s.status || ""] || "var(--primary)" }}
                    />
                    {s.status}: {s.total}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">
            Status Global
          </h2>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.statusStats.map((s) => ({ ...s, name: s.status }))}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {data.statusStats.map((s) => (
                    <Cell
                      key={s.status}
                      fill={STATUS_CORES[s.status || ""] || "var(--primary)"}
                    />
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
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">
            Usuarios por Role
          </h2>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.roleDistribution.map((r) => ({ ...r, name: r.role }))}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {data.roleDistribution.map((r) => (
                    <Cell
                      key={r.role}
                      fill={ROLE_CORES[r.role || ""] || "var(--primary)"}
                    />
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
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">
            Setores mais Acionados
          </h2>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.setorStats.slice(0, 8)} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="var(--border-subtle)"
                  opacity={0.5}
                />
                <XAxis type="number" axisLine={false} tickLine={false} fontSize={10} opacity={0.5} />
                <YAxis
                  type="category"
                  dataKey="setor"
                  axisLine={false}
                  tickLine={false}
                  fontSize={10}
                  fontWeight="bold"
                  opacity={0.7}
                  width={90}
                />
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
                <Bar dataKey="total" fill="var(--primary)" radius={[0, 6, 6, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">
            Chamados por Empresa
          </h2>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topEmpresas}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border-subtle)"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="nome"
                  axisLine={false}
                  tickLine={false}
                  fontSize={10}
                  fontWeight="bold"
                  opacity={0.5}
                  dy={10}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis axisLine={false} tickLine={false} fontSize={10} opacity={0.5} />
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
                <Bar dataKey="chamados" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">
            Evolucao Temporal
          </h2>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chamadosPeriodo}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" opacity={0.5} />
                <XAxis dataKey="periodo" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" opacity={0.5} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} opacity={0.5} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--primary)"
                  strokeWidth={4}
                  dot={{ r: 4, fill: "var(--primary)", strokeWidth: 2, stroke: "var(--surface)" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--background)] bg-opacity-20 flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">
              Empresas
            </h2>
            <span className="text-[10px] font-bold opacity-40">
              {data.empresasInativas} inativas &gt;30d
            </span>
          </div>
          <div className="overflow-auto max-h-[400px]">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left opacity-30 border-b border-[var(--border-subtle)]">
                  <th className="px-6 py-3 font-black tracking-widest text-[9px]">EMPRESA</th>
                  <th className="px-6 py-3 font-black tracking-widest text-center text-[9px]">MODULOS</th>
                  <th className="px-6 py-3 font-black tracking-widest text-center text-[9px]">USUARIOS</th>
                  <th className="px-6 py-3 font-black tracking-widest text-center text-[9px]">CHAMADOS</th>
                  <th className="px-6 py-3 font-black tracking-widest text-center text-[9px]">CPFS</th>
                  <th className="px-6 py-3 font-black tracking-widest text-right text-[9px]">ATIVIDADE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {data.empresas.map((emp) => {
                  const diasInativo = Math.round(
                    (Date.now() - new Date(emp.ultimaAtividade).getTime()) / 86400000
                  )
                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-[var(--background)] hover:bg-opacity-40 transition-colors"
                    >
                      <td className="px-6 py-3 font-bold opacity-80">{emp.nome}</td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          {emp.modulos.map((m) => (
                            <span
                              key={m}
                              className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                              style={{
                                backgroundColor: "var(--background)",
                                color: "var(--primary)",
                                opacity: 0.8,
                              }}
                            >
                              {m.slice(0, 4)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center font-bold">{emp.usuarios}</td>
                      <td className="px-6 py-3 text-center font-bold">{emp.chamados}</td>
                      <td className="px-6 py-3 text-center font-bold">{emp.cpfs}</td>
                      <td className="px-6 py-3 text-right">
                        <span
                          className="text-[10px] font-bold"
                          style={{
                            color:
                              diasInativo > 30
                                ? "var(--status-cancelled)"
                                : diasInativo > 7
                                  ? "var(--status-waiting)"
                                  : "var(--status-completed)",
                          }}
                        >
                          {diasInativo}d
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-5 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--background)] bg-opacity-20 flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">
              Logs Recentes
            </h2>
            <span className="text-[10px] font-bold opacity-40">ULTIMOS 50</span>
          </div>
          <div className="overflow-auto max-h-[400px]">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left opacity-30 border-b border-[var(--border-subtle)]">
                  <th className="px-4 py-3 font-black tracking-widest text-[9px]">DATA</th>
                  <th className="px-4 py-3 font-black tracking-widest text-[9px]">USUARIO</th>
                  <th className="px-4 py-3 font-black tracking-widest text-[9px]">EMPRESA</th>
                  <th className="px-4 py-3 font-black tracking-widest text-[9px]">ACAO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {data.logsRecentes.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--background)] hover:bg-opacity-40 transition-colors">
                    <td className="px-4 py-2.5 opacity-60 font-mono text-[10px]">
                      {new Date(log.createdAt).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-2.5 font-bold">{log.nome || log.cpf || "—"}</td>
                    <td className="px-4 py-2.5 opacity-70">{log.empresa}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: "var(--background)",
                          color: "var(--primary)",
                        }}
                      >
                        {log.acao}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.logsRecentes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-10 text-center opacity-30 font-bold uppercase tracking-widest">
                      Nenhum log registrado
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
