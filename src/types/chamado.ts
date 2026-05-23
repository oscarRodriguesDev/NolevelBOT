export type HistoricoItem = {
  data: string
  acao: string
  observacao?: string
  atendente?: string
}

export type Chamado = {
  id: number
  ticket: string
  nome: string
  cpf: string
  setor: string
  descricao: string
  prioridade: string
  status: string
  createdAt: string
  anexoUrl?: string | null
  historico?: string | null
  atendente?: string | null
}

export type StatusChamado = 'NOVO' | 'EM_ATENDIMENTO' | 'AGUARDANDO' | 'CONCLUIDO' | 'CANCELADO'

export type PrioridadeChamado = 'baixa' | 'normal' | 'alta' | 'critica'

export const STATUS_VALIDOS = ['NOVO', 'EM_ATENDIMENTO', 'AGUARDANDO', 'CONCLUIDO', 'CANCELADO'] as const

export function getStatusColor(status: string): string {
  const s = status?.toUpperCase() || ""
  if (s.includes("NOVO")) return "var(--status-new)"
  if (s.includes("ATENDIMENTO") || s.includes("ANDAMENTO")) return "var(--status-in-progress)"
  if (s.includes("AGUARDANDO")) return "var(--status-waiting)"
  if (s.includes("CONCLUIDO") || s.includes("FINALIZADO")) return "var(--status-completed)"
  if (s.includes("CANCELADO")) return "var(--status-cancelled)"
  return "#6b7280"
}

export function getPriorityColor(prioridade: string): string {
  const p = prioridade?.toUpperCase() || ""
  if (p.includes("BAIXA")) return "#10b981"
  if (p.includes("NORMAL") || p.includes("MEDIA")) return "var(--status-in-progress)"
  if (p.includes("ALTA")) return "#ef4444"
  if (p.includes("CRITICA")) return "#7f1d1d"
  return "var(--primary)"
}

export function normalizarStatus(status: string): string {
  const s = status?.toUpperCase().replace(/[^A-Z]/g, '') || ''
  if (s.includes('NOVO')) return 'NOVO'
  if (s.includes('ATENDIMENTO') || s.includes('ANDAMENTO')) return 'EM_ATENDIMENTO'
  if (s.includes('AGUARDANDO')) return 'AGUARDANDO'
  if (s.includes('CONCLUIDO') || s.includes('FINALIZADO')) return 'CONCLUIDO'
  if (s.includes('CANCELADO')) return 'CANCELADO'
  return status
}
