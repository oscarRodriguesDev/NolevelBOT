// src/lib/assinatura.ts
// Cálculos e formatação do resumo de assinatura (plano, trial, vencimento).
// Funções puras — fáceis de testar e reutilizadas pelo endpoint /api/empresa/assinatura.
import { TRIAL_DIAS, type StatusPagamento } from "@/lib/asaas"

// Alias para uso em testes/documentação
export const TRIAL_DIAS_DEFAULT = TRIAL_DIAS

export interface ResumoAssinatura {
  plano: string
  nomePlano: string | null
  statusPagamento: StatusPagamento
  trialAtivo: boolean
  trialUsado: boolean // true se a empresa já consumiu a degustação trial
  trialDias: number // dias totais do trial
  trialInicio: string | null // ISO
  trialFim: string | null // ISO
  trialDiasRestantes: number | null
  dataVencimento: string | null // próximo vencimento (recorrência) ISO
  ciclo: string | null // ex: MONTHLY
  assinaturaId: string | null
  clienteId: string | null
  assinaturaAsaas: boolean // integração Asaas configurada? (senão vem do mock)
}

export const DIAS_EM_MS = 24 * 60 * 60 * 1000

// Data de fim do trial = createdAt + trialDias
export function calcularTrialFim(createdAt: Date, trialDias = TRIAL_DIAS): Date {
  return new Date(createdAt.getTime() + trialDias * DIAS_EM_MS)
}

// Dias inteiros restantes até a data alvo (mínimo 0). null se a data for inválida.
export function calcularDiasRestantes(ate: Date | string | null): number | null {
  if (!ate) return null
  const alvo = typeof ate === "string" ? new Date(ate) : ate
  if (isNaN(alvo.getTime())) return null
  const diff = alvo.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / DIAS_EM_MS))
}

// Formata data como DD/MM/AAAA (pt-BR)
export function formatarDataBR(data: Date | string | null): string | null {
  if (!data) return null
  const d = typeof data === "string" ? new Date(data) : data
  if (isNaN(d.getTime())) return null
  return d.toLocaleDateString("pt-BR")
}

export const CICLO_LABEL: Record<string, string> = {
  WEEKLY: "Semanal",
  BIWEEKLY: "Quinzenal",
  MONTHLY: "Mensal",
  QUARTERLY: "Trimestral",
  SEMIANNUALLY: "Semestral",
  YEARLY: "Anual",
}

export function labelCiclo(ciclo: string | null): string | null {
  if (!ciclo) return null
  return CICLO_LABEL[ciclo.toUpperCase()] || ciclo
}

// Monta o resumo completo a partir dos dados crus da empresa + assinatura Asaas
export function montarResumoAssinatura(params: {
  plano: string
  nomePlano: string | null
  statusPagamento: StatusPagamento
  trialAtivo: boolean
  trialUsado?: boolean
  createdAt: Date
  trialDias?: number
  dataVencimento?: string | null
  ciclo?: string | null
  asaasSubscriptionId?: string | null
  asaasCustomerId?: string | null
  asaasConfigurado?: boolean
}): ResumoAssinatura {
  const trialDias = params.trialDias ?? TRIAL_DIAS
  const trialFim = calcularTrialFim(params.createdAt, trialDias)

  return {
    plano: params.plano,
    nomePlano: params.nomePlano,
    statusPagamento: params.statusPagamento,
    trialAtivo: params.trialAtivo,
    trialUsado: params.trialUsado ?? false,
    trialDias,
    trialInicio: params.createdAt.toISOString(),
    trialFim: trialFim.toISOString(),
    trialDiasRestantes: params.trialAtivo
      ? calcularDiasRestantes(trialFim)
      : null,
    dataVencimento: params.dataVencimento || null,
    ciclo: params.ciclo || null,
    assinaturaId: params.asaasSubscriptionId || null,
    clienteId: params.asaasCustomerId || null,
    assinaturaAsaas: params.asaasConfigurado ?? false,
  }
}
