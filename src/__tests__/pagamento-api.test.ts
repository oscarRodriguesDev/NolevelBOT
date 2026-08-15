import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"

const ENV_BACKUP = { ...process.env }

const mockFindUnique = vi.fn()
const mockUpdate = vi.fn()
const mockFindFirst = vi.fn()
const mockCriarAssinatura = vi.fn()
const mockValidarToken = vi.fn()

beforeEach(() => {
  vi.resetModules()
  process.env = { ...ENV_BACKUP }

  mockFindUnique.mockReset()
  mockUpdate.mockReset()
  mockFindFirst.mockReset()
  mockCriarAssinatura.mockReset()
  mockValidarToken.mockReset()

  vi.doMock("@/lib/prisma", () => ({
    prisma: {
      empresa: { findUnique: mockFindUnique, update: mockUpdate },
      user: { findFirst: mockFindFirst },
    },
  }))

  vi.doMock("@/lib/planos-server", () => ({
    getPlanoPorSlug: vi.fn().mockResolvedValue({ slug: "start", nome: "Start", preco: 99.9 }),
  }))

  vi.doMock("@/lib/rate-limit", () => ({
    applyRateLimit: vi.fn().mockResolvedValue(null),
  }))

  vi.doMock("@/lib/asaas", () => ({
    criarAssinatura: mockCriarAssinatura,
    getAsaasModo: vi.fn().mockReturnValue("sandbox"),
    isAsaasConfigured: vi.fn().mockReturnValue(true),
    TRIAL_DIAS: 7,
  }))

  vi.doMock("@/lib/token-pagamento", () => ({
    validarTokenPagamento: mockValidarToken,
  }))
})

afterEach(() => {
  process.env = { ...ENV_BACKUP }
})

function req(url: string, body?: unknown) {
  return new NextRequest(url, {
    method: body ? "POST" : "GET",
    ...(body ? { body: JSON.stringify(body) } : {}),
    headers: { "Content-Type": "application/json" },
  })
}

const EMPRESA = {
  id: "emp-1",
  nome: "Empresa Teste",
  plano: "start",
  cnpj: "12345678000100",
  statusPagamento: "PENDENTE",
  trialAtivo: false,
  trialUsado: false,
}

describe("GET /api/empresa/pagamento — dados da cobrança", () => {
  it("sem token -> 400", async () => {
    const { GET } = await import("@/app/api/empresa/pagamento/route")
    const res = await GET(req("http://localhost/api/empresa/pagamento"))
    expect(res.status).toBe(400)
  })

  it("token inválido -> 400", async () => {
    mockValidarToken.mockReturnValue(null)
    const { GET } = await import("@/app/api/empresa/pagamento/route")
    const res = await GET(req("http://localhost/api/empresa/pagamento?t=invalido"))
    expect(res.status).toBe(400)
  })

  it("token válido retorna plano, valor e modo sandbox", async () => {
    mockValidarToken.mockReturnValue("emp-1")
    mockFindUnique.mockResolvedValue(EMPRESA)

    const { GET } = await import("@/app/api/empresa/pagamento/route")
    const res = await GET(req("http://localhost/api/empresa/pagamento?t=ok"))
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.empresa).toBe("Empresa Teste")
    expect(json.plano).toBe("Start")
    expect(json.valor).toBe(99.9)
    expect(json.modo).toBe("sandbox")
    expect(json.asaasConfigurado).toBe(true)
    expect(json.trialDias).toBe(7)
    // trial já consumido? (empresa nova ainda tem disponível)
    expect(json.trialAtivo).toBe(false)
    expect(json.trialUsado).toBe(false)
    expect(json.trialDisponivel).toBe(true)
  })

  it("token de empresa que já usou o trial retorna trialUsado/trialDisponivel=false", async () => {
    mockValidarToken.mockReturnValue("emp-1")
    mockFindUnique.mockResolvedValue({ ...EMPRESA, trialUsado: true })

    const { GET } = await import("@/app/api/empresa/pagamento/route")
    const res = await GET(req("http://localhost/api/empresa/pagamento?t=ok"))
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.trialUsado).toBe(true)
    expect(json.trialDisponivel).toBe(false)
  })
})

describe("POST /api/empresa/pagamento — processa o cartão", () => {
  it("cartão incompleto -> 400", async () => {
    const { POST } = await import("@/app/api/empresa/pagamento/route")
    const res = await POST(req("http://localhost/api/empresa/pagamento", { token: "t", cartao: { number: "1234" } }))
    expect(res.status).toBe(400)
  })

  it("token inválido -> 400", async () => {
    mockValidarToken.mockReturnValue(null)
    const { POST } = await import("@/app/api/empresa/pagamento/route")
    const res = await POST(
      req("http://localhost/api/empresa/pagamento", {
        token: "invalido",
        cartao: { number: "5162306214932319", holderName: "JOAO", expiryMonth: "08", expiryYear: "2029", ccv: "318" },
      })
    )
    expect(res.status).toBe(400)
  })

  it("número do cartão inválido -> 400", async () => {
    mockValidarToken.mockReturnValue("emp-1")
    mockFindUnique.mockResolvedValue(EMPRESA)
    const { POST } = await import("@/app/api/empresa/pagamento/route")
    const res = await POST(
      req("http://localhost/api/empresa/pagamento", {
        token: "t",
        cartao: { number: "123", holderName: "JOAO", expiryMonth: "08", expiryYear: "2029", ccv: "318" },
      })
    )
    expect(res.status).toBe(400)
  })

  it("pagamento válido cria assinatura real e salva na empresa", async () => {
    mockValidarToken.mockReturnValue("emp-1")
    mockFindUnique.mockResolvedValue(EMPRESA)
    mockFindFirst.mockResolvedValue({ email: "admin@empresa.com", cpf: "12345678901" })
    mockCriarAssinatura.mockResolvedValue({
      subscriptionId: "sub_1",
      customerId: "cus_1",
      paymentId: "pay_1",
      status: "PENDING",
      valor: 99.9,
      mock: false,
    })
    mockUpdate.mockResolvedValue({})

    const { POST } = await import("@/app/api/empresa/pagamento/route")
    const res = await POST(
      req("http://localhost/api/empresa/pagamento", {
        token: "t",
        cartao: { number: "5162306214932319", holderName: "JOAO DA SILVA", expiryMonth: "08", expiryYear: "2029", ccv: "318" },
      })
    )
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.mock).toBe(false)
    expect(json.status).toBe("PENDING")
    expect(json.valor).toBe(99.9)

    // criarAssinatura recebeu o valor real do plano + cartão, SEM trial (pagamento imediato)
    expect(mockCriarAssinatura).toHaveBeenCalledTimes(1)
    const arg = mockCriarAssinatura.mock.calls[0][0]
    expect(arg.valor).toBe(99.9)
    expect(arg.trial).toBe(0)
    expect(arg.externalReference).toBe("emp-1")
    expect(arg.cpfCnpj).toBe("12345678000100")
    expect(arg.cartao.number.replace(/\D/g, "")).toBe("5162306214932319")

    // empresa atualizada com ids do Asaas e fora do trial
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "emp-1" },
      data: {
        asaasCustomerId: "cus_1",
        asaasSubscriptionId: "sub_1",
        asaasPaymentId: "pay_1",
        trialAtivo: false,
      },
    })
  })

  it("falha do Asaas retorna 502 com código de rastreio", async () => {
    mockValidarToken.mockReturnValue("emp-1")
    mockFindUnique.mockResolvedValue(EMPRESA)
    mockFindFirst.mockResolvedValue({ email: "admin@empresa.com", cpf: "12345678901" })
    mockCriarAssinatura.mockRejectedValue(new Error("Asaas API 400: valor deve ser maior que zero"))

    const { POST } = await import("@/app/api/empresa/pagamento/route")
    const res = await POST(
      req("http://localhost/api/empresa/pagamento", {
        token: "t",
        cartao: { number: "5162306214932319", holderName: "JOAO DA SILVA", expiryMonth: "08", expiryYear: "2029", ccv: "318" },
      })
    )
    expect(res.status).toBe(502)

    const json = await res.json()
    expect(json.codigo).toMatch(/^ERR-\d{5}$/)
    expect(json.error).toBeTruthy()
  })
})
