export type DashboardData = {
  totalGeral: number
  chamadosPorStatus: { status: string; total: number; color: string }[]
  tempoMedio: number
  chamadosPorPrioridade: { prioridade: string; total: number; color: string }[]
  chamadosPorSetor: { setor: string; total: number }[]
  chamadosPorAtendente: { atendente: string; total: number }[]
  chamadosPeriodo: { periodo: string; total: number }[]
  topMotivos: { motivo: string; total: number }[]
  picoHorarios: { dia: string; total: number }[]
  veiculosMaisOcorrencias: { veiculo: string; total: number }[]
  motoristasMaisRegistros: { motorista: string; total: number }[]
  solicitacoesPorFuncao: { funcao: string; total: number }[]
}

export type IndicatorDef = {
  id: string
  label: string
  description: string
  icon: string
  onlyModulo?: "corporativo" | "oficina" | "eventos"
}

export const CORPORATIVO_INDICATORS: IndicatorDef[] = [
  { id: "totalGeral", label: "Total Geral", description: "Total de chamados no período", icon: "📊" },
  { id: "chamadosPorStatus", label: "Chamados por Status", description: "Distribuição por status do chamado", icon: "📋" },
  { id: "tempoMedio", label: "Tempo Médio", description: "Tempo médio de atendimento (horas)", icon: "⏱️" },
  { id: "chamadosPorPrioridade", label: "Chamados por Prioridade", description: "Distribuição por prioridade", icon: "🔴" },
  { id: "chamadosPorSetor", label: "Chamados por Setor", description: "Chamados agrupados por setor", icon: "🏢" },
  { id: "chamadosPorAtendente", label: "Chamados por Atendente", description: "Carga de trabalho por atendente", icon: "👤" },
  { id: "evolucaoTemporal", label: "Evolução Temporal", description: "Chamados ao longo do tempo", icon: "📈" },
  { id: "topMotivos", label: "Top Motivos", description: "Ranking de motivos mais frequentes", icon: "🏆" },
  { id: "picoHorarios", label: "Pico por Dia da Semana", description: "Chamados por dia da semana", icon: "📅" },
]

export const OFICINA_INDICATORS: IndicatorDef[] = [
  { id: "totalGeral", label: "Total de Solicitações", description: "Total de solicitações no período", icon: "📊" },
  { id: "chamadosPorStatus", label: "Solicitações por Status", description: "Distribuição por status", icon: "📋" },
  { id: "tempoMedio", label: "Tempo Médio de Reparo", description: "Tempo médio para conclusão (horas)", icon: "⏱️" },
  { id: "veiculosMaisOcorrencias", label: "Veículos com Mais Ocorrências", description: "Top veículos com defeitos", icon: "🚌" },
  { id: "topMotivos", label: "Defeitos Mais Comuns", description: "Ranking de problemas relatados", icon: "🏆" },
  { id: "evolucaoTemporal", label: "Evolução Temporal", description: "Solicitações ao longo do tempo", icon: "📈" },
  { id: "motoristasMaisRegistros", label: "Motoristas com Mais Registros", description: "Quem mais reporta", icon: "👤" },
  { id: "solicitacoesPorFuncao", label: "Solicitações por Função", description: "Motorista, Cobrador, etc.", icon: "👥" },
  { id: "picoHorarios", label: "Pico por Dia da Semana", description: "Solicitações por dia da semana", icon: "📅" },
]
