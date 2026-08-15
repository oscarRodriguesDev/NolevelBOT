import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"

const ENV_BACKUP = { ...process.env }
const mockUpdate = vi.fn()
const mockFindFirst = vi.fn()
const mockFindUnique = vi.fn()
const mockDeleteMany = vi.fn()
const mockConsultarCobranca = vi.fn()

function criaRequest(body: unknown, token = "whsec_test") {
  return new NextRequest("http://localhost/api/webhooks/asaas", {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
}

// Formato real do Asaas: token vai no header asaas-access-token
function criaRequestAsaas(body: unknown, token = "whsec_test") {
  return new NextRequest("http://localhost/api/webhooks/asaas", {
    method: "POST",
    headers: { "asaas-access-token": token },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.resetModules()
  process.env = { ...ENV_BACKUP }
  process.env.ASAAS_TOKEN_WEBHOOK = "whsec_test"

  mockUpdate.mockReset()
  mockFindFirst.mockReset()
  mockFindUnique.mockReset()
  mockDeleteMany.mockReset()
  mockConsultarCobranca.mockReset()

  vi.doMock("@/lib/asaas", () => ({
    consultarCobranca: mockConsultarCobranca,
    isAsaasConfigured: vi.fn().mockReturnValue(true),
  }))

  vi.doMock("@/lib/prisma", () => ({
    prisma: {
      empresa: {
        findUnique: mockFindUnique,
        findFirst: mockFindFirst,
        update: mockUpdate,
      },
      cache: { deleteMany: mockDeleteMany },
    },
  }))
})

afterEach(() => {
  process.env = { ...ENV_BACKUP }
})

describe("webhook asaas - validação", () => {
  it("rejeita requisição sem token válido (401)", async () => {
    const { POST } = await import("@/app/api/webhooks/asaas/route")
    const res = await POST(
      criaRequest({ event: "PAYMENT_CONFIRMED" }, "token-errado")
    )
    expect(res.status).toBe(401)
  })

  it("aceita token enviado no header asaas-access-token (formato real do Asaas)", async () => {
    const { POST } = await import("@/app/api/webhooks/asaas/route")

    mockFindUnique.mockResolvedValue({
      id: "emp-asaas",
      nome: "Empresa Asaas",
      statusPagamento: "PENDENTE",
      trialAtivo: true,
    })
    mockConsultarCobranca.mockResolvedValue({
      id: "pay_asaas",
      status: "CONFIRMED",
      externalReference: "emp-asaas",
      subscription: null,
      customer: null,
    })

    const res = await POST(
      criaRequestAsaas({
        id: "evt_asaas",
        event: "PAYMENT_RECEIVED",
        payment: { id: "pay_asaas" },
      })
    )

    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "emp-asaas" },
      data: expect.objectContaining({ statusPagamento: "PAGO" }),
    })
  })

  it("rejeita payload inválido (400)", async () => {
    const { POST } = await import("@/app/api/webhooks/asaas/route")
    const req = new NextRequest("http://localhost/api/webhooks/asaas", {
      method: "POST",
      headers: { authorization: "Bearer whsec_test" },
      body: "não-é-json",
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})

describe("webhook asaas - eventos de pagamento", () => {
  it("PAYMENT_CONFIRMED -> statusPagamento PAGO e trial desativado", async () => {
    const { POST } = await import("@/app/api/webhooks/asaas/route")

    mockFindUnique.mockResolvedValue({
      id: "emp-1",
      nome: "Empresa X",
      statusPagamento: "PENDENTE",
      trialAtivo: true,
    })
    mockConsultarCobranca.mockResolvedValue({
      id: "pay_1",
      status: "CONFIRMED",
      externalReference: "emp-1",
      subscription: "sub_1",
      customer: "cus_1",
    })

    const res = await POST(
      criaRequest({
        id: "evt_1",
        event: "PAYMENT_CONFIRMED",
        payment: { id: "pay_1" },
      })
    )

    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "emp-1" },
      data: expect.objectContaining({
        statusPagamento: "PAGO",
        trialAtivo: false,
      }),
    })
    // Invalida cache de módulos
    expect(mockDeleteMany).toHaveBeenCalled()
  })

  it("PAYMENT_OVERDUE -> statusPagamento ATRASADO", async () => {
    const { POST } = await import("@/app/api/webhooks/asaas/route")

    mockFindUnique.mockResolvedValue({
      id: "emp-2",
      statusPagamento: "PAGO",
      trialAtivo: false,
    })
    mockConsultarCobranca.mockResolvedValue({
      id: "pay_2",
      status: "OVERDUE",
      externalReference: "emp-2",
      subscription: null,
      customer: null,
    })

    const res = await POST(
      criaRequest({
        id: "evt_2",
        event: "PAYMENT_OVERDUE",
        payment: { id: "pay_2" },
      })
    )

    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "emp-2" },
      data: expect.objectContaining({ statusPagamento: "ATRASADO" }),
    })
  })

  it("evento repetido é ignorado (idempotência)", async () => {
    const { POST } = await import("@/app/api/webhooks/asaas/route")

    mockFindUnique.mockResolvedValue({
      id: "emp-3",
      statusPagamento: "PENDENTE",
      trialAtivo: true,
    })
    mockConsultarCobranca.mockResolvedValue({
      id: "pay_3",
      status: "CONFIRMED",
      externalReference: "emp-3",
      subscription: null,
      customer: null,
    })

    const body = {
      id: "evt_3",
      event: "PAYMENT_CONFIRMED",
      payment: { id: "pay_3" },
    }

    await POST(criaRequest(body))
    const segunda = await POST(criaRequest(body))

    const json = await segunda.json()
    expect(json.idempotent).toBe(true)
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  it("empresa não encontrada -> responde ok e não atualiza nada", async () => {
    const { POST } = await import("@/app/api/webhooks/asaas/route")

    mockFindUnique.mockResolvedValue(null)
    mockConsultarCobranca.mockResolvedValue({
      id: "pay_4",
      status: "CONFIRMED",
      externalReference: "emp-inexistente",
      subscription: null,
      customer: null,
    })

    const res = await POST(
      criaRequest({
        id: "evt_4",
        event: "PAYMENT_CONFIRMED",
        payment: { id: "pay_4" },
      })
    )

    expect(res.status).toBe(200)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it("falha na consulta reversa -> 502", async () => {
    const { POST } = await import("@/app/api/webhooks/asaas/route")

    mockConsultarCobranca.mockRejectedValue(new Error("Asaas API 500"))

    const res = await POST(
      criaRequest({
        id: "evt_5",
        event: "PAYMENT_CONFIRMED",
        payment: { id: "pay_5" },
      })
    )

    expect(res.status).toBe(502)
  })
})
