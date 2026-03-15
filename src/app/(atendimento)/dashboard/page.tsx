'use client'

import { LuTrendingUp, LuClock, LuCheckCircle, LuAlertCircle } from 'react-icons/lu'

// Dados Mock
const mockMetrics = {
  totalTickets: 1248,
  openTickets: 342,
  closedTickets: 856,
  averageResponseTime: '2.4h',
  satisfactionRate: 94.2,
}

const mockTicketsByStatus = [
  { status: 'Novo', count: 156, percentage: 18 },
  { status: 'Em Andamento', count: 186, percentage: 22 },
  { status: 'Aguardando', count: 245, percentage: 29 },
  { status: 'Concluído', count: 856, percentage: 100 },
]

const mockTicketsByPriority = [
  { priority: 'Baixa', count: 245, color: 'var(--status-completed)' },
  { priority: 'Média', count: 412, color: 'var(--status-in-progress)' },
  { priority: 'Alta', count: 458, color: 'var(--status-waiting)' },
  { priority: 'Crítica', count: 133, color: 'var(--status-cancelled)' },
]

const mockRecentMetrics = [
  { week: 'Semana 1', tickets: 185, resolved: 142 },
  { week: 'Semana 2', tickets: 212, resolved: 168 },
  { week: 'Semana 3', tickets: 198, resolved: 156 },
  { week: 'Semana 4', tickets: 245, resolved: 190 },
  { week: 'Semana 5', tickets: 220, resolved: 178 },
]

const mockDetailedMetrics = [
  {
    sector: 'TI',
    totalTickets: 342,
    resolved: 256,
    pending: 86,
    avgTime: '2.1h',
    satisfaction: 96.2,
  },
  {
    sector: 'RH',
    totalTickets: 198,
    resolved: 145,
    pending: 53,
    avgTime: '2.8h',
    satisfaction: 91.5,
  },
  {
    sector: 'Financeiro',
    totalTickets: 287,
    resolved: 234,
    pending: 53,
    avgTime: '1.9h',
    satisfaction: 95.8,
  },
  {
    sector: 'Operações',
    totalTickets: 421,
    resolved: 321,
    pending: 100,
    avgTime: '2.6h',
    satisfaction: 92.1,
  },
]

export default function DashboardPage() {
  const maxTickets = Math.max(...mockTicketsByStatus.map(item => item.count))
  const maxWeekTickets = Math.max(...mockRecentMetrics.map(item => item.tickets))

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: 'var(--primary)' }}>
          Dashboard de Atendimento
        </h1>
        <p className="text-sm opacity-70">Visão geral das métricas e desempenho do sistema</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <KPICard
          title="Total de Chamados"
          value={mockMetrics.totalTickets.toLocaleString('pt-BR')}
          icon={LuTrendingUp}
          color="var(--primary)"
        />
        <KPICard
          title="Chamados Abertos"
          value={mockMetrics.openTickets}
          icon={LuAlertCircle}
          color="var(--status-waiting)"
        />
        <KPICard
          title="Chamados Concluídos"
          value={mockMetrics.closedTickets}
          icon={LuCheckCircle}
          color="var(--status-completed)"
        />
        <KPICard
          title="Taxa de Satisfação"
          value={`${mockMetrics.satisfactionRate}%`}
          icon={LuTrendingUp}
          color="var(--accent-secondary)"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Chart */}
        <div
          className="rounded-2xl border p-6 transition-colors duration-300"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <h2 className="text-lg font-semibold mb-6">Distribuição por Status</h2>
          <div className="space-y-4">
            {mockTicketsByStatus.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.status}</span>
                  <span className="font-semibold">{item.count}</span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--surface-elevated)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(item.count / maxTickets) * 100}%`,
                      backgroundColor: getStatusColor(item.status),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Chart */}
        <div
          className="rounded-2xl border p-6 transition-colors duration-300"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <h2 className="text-lg font-semibold mb-6">Distribuição por Prioridade</h2>
          <div className="flex items-center justify-center gap-8 py-6">
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle
                cx="90"
                cy="90"
                r="70"
                fill="none"
                stroke="var(--status-completed)"
                strokeWidth="40"
                strokeDasharray={`${(245 / 1248) * 440} 440`}
              />
              <circle
                cx="90"
                cy="90"
                r="70"
                fill="none"
                stroke="var(--status-in-progress)"
                strokeWidth="40"
                strokeDasharray={`${(412 / 1248) * 440} 440`}
                strokeDashoffset={`-${(245 / 1248) * 440}`}
              />
              <circle
                cx="90"
                cy="90"
                r="70"
                fill="none"
                stroke="var(--status-waiting)"
                strokeWidth="40"
                strokeDasharray={`${(458 / 1248) * 440} 440`}
                strokeDashoffset={`-${((245 + 412) / 1248) * 440}`}
              />
              <circle
                cx="90"
                cy="90"
                r="70"
                fill="none"
                stroke="var(--status-cancelled)"
                strokeWidth="40"
                strokeDasharray={`${(133 / 1248) * 440} 440`}
                strokeDashoffset={`-${((245 + 412 + 458) / 1248) * 440}`}
              />
            </svg>
            <div className="space-y-3">
              {mockTicketsByPriority.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="text-sm">
                    <p className="font-medium">{item.priority}</p>
                    <p className="opacity-70">{item.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Trend */}
      <div
        className="rounded-2xl border p-6 transition-colors duration-300"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <h2 className="text-lg font-semibold mb-6">Tendência Semanal</h2>
        <div className="overflow-x-auto">
          <div className="flex items-end gap-4 pb-4" style={{ minWidth: '100%' }}>
            {mockRecentMetrics.map((item, idx) => {
              const height = (item.tickets / maxWeekTickets) * 200
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-medium opacity-60">{item.resolved}</div>
                  <div
                    className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80"
                    style={{
                      height: `${height}px`,
                      backgroundColor: 'var(--primary)',
                    }}
                  />
                  <div className="text-xs text-center opacity-60">{item.week}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div
        className="rounded-2xl border p-6 transition-colors duration-300 overflow-x-auto"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <h2 className="text-lg font-semibold mb-6">Métricas por Setor</h2>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottomColor: 'var(--border-subtle)' }} className="border-b">
              <th className="text-left py-3 px-4 font-semibold">Setor</th>
              <th className="text-center py-3 px-4 font-semibold">Total</th>
              <th className="text-center py-3 px-4 font-semibold">Resolvidos</th>
              <th className="text-center py-3 px-4 font-semibold">Pendentes</th>
              <th className="text-center py-3 px-4 font-semibold">Tempo Médio</th>
              <th className="text-center py-3 px-4 font-semibold">Satisfação</th>
            </tr>
          </thead>
          <tbody>
            {mockDetailedMetrics.map((metric, idx) => (
              <tr
                key={idx}
                style={{ borderBottomColor: 'var(--border-subtle)' }}
                className="border-b hover:opacity-80 transition-opacity duration-200"
              >
                <td className="py-3 px-4 font-medium">{metric.sector}</td>
                <td className="py-3 px-4 text-center">{metric.totalTickets}</td>
                <td className="py-3 px-4 text-center">
                  <span
                    className="px-2 py-1 rounded-lg text-xs font-semibold text-white"
                    style={{ backgroundColor: 'var(--status-completed)' }}
                  >
                    {metric.resolved}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className="px-2 py-1 rounded-lg text-xs font-semibold text-white"
                    style={{ backgroundColor: 'var(--status-waiting)' }}
                  >
                    {metric.pending}
                  </span>
                </td>
                <td className="py-3 px-4 text-center opacity-75">{metric.avgTime}</td>
                <td className="py-3 px-4 text-center font-semibold">{metric.satisfaction}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function KPICard({ title, value, icon: Icon, color }: any) {
  return (
    <div
      className="rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm opacity-70">{title}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{value}</p>
        </div>
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${color}20`, color: color }}
        >
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Novo':
      return 'var(--status-new)'
    case 'Em Andamento':
      return 'var(--status-in-progress)'
    case 'Aguardando':
      return 'var(--status-waiting)'
    case 'Concluído':
      return 'var(--status-completed)'
    default:
      return 'var(--primary)'
  }
}
