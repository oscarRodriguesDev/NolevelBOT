import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// Ambiente dev: sem ASAAS_API_KEY -> fallback mock ativo
const ENV_BACKUP = { ...process.env }

beforeEach(() => {
  vi.resetModules()
  process.env = { ...ENV_BACKUP }
  delete process.env.ASAAS_API_KEY
  delete process.env.ASAAS_BASE_URL
})

afterEach(() => {
  process.env = { ...ENV_BACKUP }
})

describe("asaas - fallback dev", () => {
  it("criarAssinatura retorna mock quando sem API key", async () => {
    const { criarAssinatura } = await import("@/lib/asaas")
    const result = await criarAssinatura({
      trial: 7,
      cycle: "MONTHLY",
      externalReference: "emp-123",
      nome: "Empresa Teste",
      cpfCnpj: "12345678901234",
    })
    expect(result.mock).toBe(true)
    expect(result.subscriptionId).toContain("sub_mock_")
    expect(result.customerId).toContain("cus_mock_")
  })

  it("consultarCobranca retorna mock quando sem API key", async () => {
    const { consultarCobranca } = await import("@/lib/asaas")
    const result = await consultarCobranca("pay_123")
    expect(result.mock).toBe(true)
    expect(result.id).toBe("pay_123")
    expect(result.status).toBe("PENDING")
  })

  it("isAsaasConfigured retorna false sem API key", async () => {
    const { isAsaasConfigured } = await import("@/lib/asaas")
    expect(isAsaasConfigured()).toBe(false)
  })
})

describe("asaas - mapearStatusAsaas", () => {
  it("mapeia status do Asaas para enum do schema", async () => {
    const { mapearStatusAsaas } = await import("@/lib/asaas")
    expect(mapearStatusAsaas("CONFIRMED")).toBe("PAGO")
    expect(mapearStatusAsaas("RECEIVED")).toBe("PAGO")
    expect(mapearStatusAsaas("OVERDUE")).toBe("ATRASADO")
    expect(mapearStatusAsaas("REFUNDED")).toBe("REEMBOLSADO")
    expect(mapearStatusAsaas("CANCELLED")).toBe("CANCELADO")
    expect(mapearStatusAsaas("PENDING")).toBe("PENDENTE")
  })
})

describe("asaas - com API key (produção)", () => {
  beforeEach(() => {
    process.env.ASAAS_API_KEY = "test-key"
    process.env.ASAAS_BASE_URL = "https://sandbox.asaas.com/api/v3"
  })

  it("criarAssinatura chama a API e retorna dados reais", async () => {
    const fetchMock = vi.fn()
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "cus_1", name: "Empresa Teste" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "sub_1",
          paymentId: "pay_1",
          status: "PENDING",
        }),
      })
    vi.stubGlobal("fetch", fetchMock)

    const { criarAssinatura } = await import("@/lib/asaas")
    const result = await criarAssinatura({
      trial: 7,
      cycle: "MONTHLY",
      externalReference: "emp-1",
      nome: "Empresa Teste",
      cpfCnpj: "12345678901234",
    })
    expect(result.mock).toBe(false)
    expect(result.subscriptionId).toBe("sub_1")
    expect(result.customerId).toBe("cus_1")
    expect(fetchMock).toHaveBeenCalledTimes(3)
    vi.unstubAllGlobals()
  })

  it("consultarCobranca chama GET /payments/{id}", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "pay_1",
        status: "CONFIRMED",
        value: 99.9,
        dueDate: "2026-08-20",
        externalReference: "emp-1",
        subscription: "sub_1",
      }),
    })
    vi.stubGlobal("fetch", fetchMock)

    const { consultarCobranca } = await import("@/lib/asaas")
    const result = await consultarCobranca("pay_1")
    expect(result.status).toBe("CONFIRMED")
    expect(result.amount).toBe(99.9)
    expect(result.mock).toBe(false)
    expect(fetchMock).toHaveBeenCalledWith(
      "https://sandbox.asaas.com/api/v3/payments/pay_1",
      expect.objectContaining({
        headers: expect.objectContaining({ access_token: "test-key" }),
      })
    )
    vi.unstubAllGlobals()
  })
})
