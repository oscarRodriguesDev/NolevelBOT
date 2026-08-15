import { describe, it, expect, vi, afterEach } from "vitest"
import {
  calcularTrialFim,
  calcularDiasRestantes,
  formatarDataBR,
  labelCiclo,
  montarResumoAssinatura,
  TRIAL_DIAS_DEFAULT,
} from "@/lib/assinatura"

afterEach(() => {
  vi.useRealTimers()
})

describe("calcularTrialFim", () => {
  it("soma os dias de trial ao createdAt", () => {
    const inicio = new Date("2026-08-01T10:00:00.000Z")
    const fim = calcularTrialFim(inicio, 7)
    expect(fim.toISOString()).toBe("2026-08-08T10:00:00.000Z")
  })

  it("usa TRIAL_DIAS (7) por padrão", () => {
    const inicio = new Date("2026-08-01T10:00:00.000Z")
    const fim = calcularTrialFim(inicio)
    expect(fim.getTime() - inicio.getTime()).toBe(7 * 24 * 60 * 60 * 1000)
    expect(TRIAL_DIAS_DEFAULT).toBe(7)
  })
})

describe("calcularDiasRestantes", () => {
  it("retorna dias restantes inteiros", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-08-01T00:00:00.000Z"))
    const dias = calcularDiasRestantes(new Date("2026-08-08T00:00:00.000Z"))
    expect(dias).toBe(7)
  })

  it("aceita string ISO", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-08-01T00:00:00.000Z"))
    expect(calcularDiasRestantes("2026-08-05T00:00:00.000Z")).toBe(4)
  })

  it("retorna null para data nula/inválida", () => {
    expect(calcularDiasRestantes(null)).toBeNull()
    expect(calcularDiasRestantes("data-invalida")).toBeNull()
  })

  it("nunca retorna negativo (mínimo 0)", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-08-10T00:00:00.000Z"))
    expect(calcularDiasRestantes(new Date("2026-08-01T00:00:00.000Z"))).toBe(0)
  })
})

describe("formatarDataBR", () => {
  it("formata como DD/MM/AAAA", () => {
    expect(formatarDataBR(new Date("2026-08-15T12:00:00.000Z"))).toBe("15/08/2026")
  })

  it("aceita string ISO", () => {
    expect(formatarDataBR("2026-08-15T12:00:00.000Z")).toBe("15/08/2026")
  })

  it("retorna null para entrada inválida", () => {
    expect(formatarDataBR(null)).toBeNull()
    expect(formatarDataBR("nada")).toBeNull()
  })
})

describe("labelCiclo", () => {
  it("traduz ciclos do Asaas", () => {
    expect(labelCiclo("MONTHLY")).toBe("Mensal")
    expect(labelCiclo("YEARLY")).toBe("Anual")
    expect(labelCiclo("weekly")).toBe("Semanal")
    expect(labelCiclo(null)).toBeNull()
    expect(labelCiclo("DESCONHECIDO")).toBe("DESCONHECIDO")
  })
})

describe("montarResumoAssinatura", () => {
  const base = {
    plano: "start",
    nomePlano: "Start",
    statusPagamento: "PENDENTE" as const,
    trialAtivo: true,
    createdAt: new Date("2026-08-01T10:00:00.000Z"),
  }

  it("monta resumo com trial ativo e dias restantes", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-08-01T10:00:00.000Z"))
    const resumo = montarResumoAssinatura(base)
    expect(resumo.trialAtivo).toBe(true)
    expect(resumo.trialFim).toBe("2026-08-08T10:00:00.000Z")
    expect(resumo.trialDiasRestantes).toBe(7)
    expect(resumo.trialDias).toBe(7)
  })

  it("sem trial -> trialDiasRestantes null", () => {
    const resumo = montarResumoAssinatura({
      ...base,
      trialAtivo: false,
      statusPagamento: "PAGO",
      dataVencimento: "2026-09-01",
      ciclo: "MONTHLY",
      asaasSubscriptionId: "sub_1",
      asaasConfigurado: true,
    })
    expect(resumo.trialDiasRestantes).toBeNull()
    expect(resumo.dataVencimento).toBe("2026-09-01")
    expect(resumo.ciclo).toBe("MONTHLY")
    expect(resumo.assinaturaId).toBe("sub_1")
    expect(resumo.assinaturaAsaas).toBe(true)
  })

  it("pagamento em atraso mantém dados sem vencimento", () => {
    const resumo = montarResumoAssinatura({
      ...base,
      trialAtivo: false,
      statusPagamento: "ATRASADO",
    })
    expect(resumo.statusPagamento).toBe("ATRASADO")
    expect(resumo.dataVencimento).toBeNull()
  })
})
