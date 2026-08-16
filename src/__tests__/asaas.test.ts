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
      valor: 99.9,
    })
    expect(result.mock).toBe(true)
    expect(result.subscriptionId).toContain("sub_mock_")
    expect(result.customerId).toContain("cus_mock_")
    expect(result.valor).toBe(99.9)
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

  it("criarAssinatura tokeniza cartão e envia valor real do plano", async () => {
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
        json: async () => ({ creditCardToken: "cc_token_1" }),
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
      valor: 299.99,
      cartao: {
        holderName: "JOAO DA SILVA",
        number: "5162306214932319",
        expiryMonth: "08",
        expiryYear: "2029",
        ccv: "318",
      },
    })
    expect(result.mock).toBe(false)
    expect(result.subscriptionId).toBe("sub_1")
    expect(result.customerId).toBe("cus_1")
    expect(result.valor).toBe(299.99)

    // 4 chamadas: busca customer, cria customer, tokeniza cartão, cria assinatura
    expect(fetchMock).toHaveBeenCalledTimes(4)

    // Tokenização envia o cartão (para o Asaas), nunca é persistida
    const tokenizacao = fetchMock.mock.calls[2]
    expect(tokenizacao[0]).toBe("https://sandbox.asaas.com/api/v3/creditCard/tokenizeCreditCard")
    const bodyToken = JSON.parse(tokenizacao[1].body)
    expect(bodyToken.creditCard.number).toBe("5162306214932319")
    expect(bodyToken.creditCard.expiryYear).toBe("2029")
    expect(bodyToken.creditCard.expiryMonth).toBe("08")
    expect(bodyToken.remoteIp).toBe("127.0.0.1")

    // Assinatura usa o token + valor REAL (não zero)
    const assinaturaCall = fetchMock.mock.calls[3]
    expect(assinaturaCall[0]).toBe("https://sandbox.asaas.com/api/v3/subscriptions")
    const bodySub = JSON.parse(assinaturaCall[1].body)
    expect(bodySub.creditCardToken).toBe("cc_token_1")
    expect(bodySub.value).toBe(299.99)
    expect(bodySub.billingType).toBe("CREDIT_CARD")
    expect(bodySub.paymentDelay).toBe(7)
    vi.unstubAllGlobals()
  })

  it("criarAssinatura falha sem cartão no fluxo real", async () => {
    const fetchMock = vi.fn()
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "cus_1" }),
      })
    vi.stubGlobal("fetch", fetchMock)

    const { criarAssinatura } = await import("@/lib/asaas")
    await expect(
      criarAssinatura({
        trial: 7,
        cycle: "MONTHLY",
        externalReference: "emp-1",
        nome: "Empresa Teste",
        cpfCnpj: "12345678901234",
        valor: 299.99,
      })
    ).rejects.toThrow(/cartão/i)
    vi.unstubAllGlobals()
  })

  it("criarAssinatura usa token pré-existente (sem tokenizar de novo)", async () => {
    const fetchMock = vi.fn()
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "cus_1" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "sub_1", status: "PENDING" }),
      })
    vi.stubGlobal("fetch", fetchMock)

    const { criarAssinatura } = await import("@/lib/asaas")
    const result = await criarAssinatura({
      trial: 7,
      cycle: "MONTHLY",
      externalReference: "emp-1",
      nome: "Empresa Teste",
      cpfCnpj: "12345678901234",
      valor: 199.9,
      creditCardToken: "cc_tok_existente",
    })
    expect(result.subscriptionId).toBe("sub_1")
    expect(fetchMock).toHaveBeenCalledTimes(3)
    const bodySub = JSON.parse(fetchMock.mock.calls[2][1].body)
    expect(bodySub.creditCardToken).toBe("cc_tok_existente")
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

describe("asaas - helpers de diagnóstico", () => {
  it("getAsaasModo retorna mock sem chave, sandbox com URL sandbox, producao caso contrário", async () => {
    const { getAsaasModo } = await import("@/lib/asaas")
    expect(getAsaasModo()).toBe("mock")

    process.env.ASAAS_API_KEY = "k"
    process.env.ASAAS_BASE_URL = "https://sandbox.asaas.com/api/v3"
    expect(getAsaasModo()).toBe("sandbox")

    process.env.ASAAS_BASE_URL = "https://api.asaas.com/v3"
    expect(getAsaasModo()).toBe("producao")
  })

  it("mascararChave nunca expõe a chave completa", async () => {
    const { mascararChave } = await import("@/lib/asaas")
    expect(mascararChave("")).toBe("(não configurada)")
    const m = mascararChave("$aact_prod_1234567890abcdef")
    expect(m).not.toContain("1234567890abcdef")
    expect(m).toContain("$aact_")
    expect(m).toContain("cdef")
  })
})
