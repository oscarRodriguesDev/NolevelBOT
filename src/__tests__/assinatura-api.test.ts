import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"

const ENV_BACKUP = { ...process.env }
const mockFindUnique = vi.fn()
const mockConsultarAssinatura = vi.fn()

function criaRequest(url = "http://localhost/api/empresa/assinatura?id=emp-1") {
  return new NextRequest(url, { method: "GET" })
}

beforeEach(() => {
  vi.resetModules()
  process.env = { ...ENV_BACKUP }

  mockFindUnique.mockReset()
  mockConsultarAssinatura.mockReset()

  vi.doMock("@/lib/prisma", () => ({
    prisma: { empresa: { findUnique: mockFindUnique } },
  }))

  vi.doMock("@/lib/planos-server", () => ({
    getPlanoPorSlug: vi.fn().mockResolvedValue({ slug: "start", nome: "Start" }),
  }))

  vi.doMock("@/lib/asaas", () => ({
    consultarAssinatura: mockConsultarAssinatura,
    isAsaasConfigured: vi.fn().mockReturnValue(true),
    TRIAL_DIAS: 7,
  }))

  vi.doMock("@/lib/rate-limit", () => ({
    applyRateLimit: vi.fn().mockResolvedValue(null),
  }))
})

afterEach(() => {
  process.env = { ...ENV_BACKUP }
})

describe("GET /api/empresa/assinatura — autorização", () => {
  it("GESTOR não acessa dados financeiros (403)", async () => {
    vi.doMock("@/lib/rbac-server", () => ({
      getServerSessionRBAC: vi.fn().mockResolvedValue({
        session: { role: "GESTOR", empresaId: "emp-X" },
        error: null,
      }),
    }))

    const { GET } = await import("@/app/api/empresa/assinatura/route")
    const res = await GET(criaRequest("http://localhost/api/empresa/assinatura?id=emp-1"))
    expect(res.status).toBe(403)
  })

  it("ADMIN tentando ver empresa de outro — acesso negado (403)", async () => {
    vi.doMock("@/lib/rbac-server", () => ({
      getServerSessionRBAC: vi.fn().mockResolvedValue({
        session: { role: "ADMIN", empresaId: "emp-X" },
        error: null,
      }),
    }))

    const { GET } = await import("@/app/api/empresa/assinatura/route")
    const res = await GET(criaRequest("http://localhost/api/empresa/assinatura?id=emp-1"))
    expect(res.status).toBe(403)
  })

  it("GOD vê assinatura de qualquer empresa", async () => {
    vi.doMock("@/lib/rbac-server", () => ({
      getServerSessionRBAC: vi.fn().mockResolvedValue({
        session: { role: "GOD", empresaId: "emp-X" },
        error: null,
      }),
    }))

    mockFindUnique.mockResolvedValue({
      id: "emp-1",
      nome: "Empresa X",
      plano: "start",
      statusPagamento: "PAGO",
      trialAtivo: false,
      createdAt: new Date("2026-08-01T10:00:00.000Z"),
      asaasSubscriptionId: null,
      asaasCustomerId: null,
    })

    const { GET } = await import("@/app/api/empresa/assinatura/route")
    const res = await GET(criaRequest("http://localhost/api/empresa/assinatura?id=emp-1"))
    expect(res.status).toBe(200)
  })
})

describe("GET /api/empresa/assinatura — dados", () => {
  it("ADMIN vê resumo com trial ativo", async () => {
    vi.doMock("@/lib/rbac-server", () => ({
      getServerSessionRBAC: vi.fn().mockResolvedValue({
        session: { role: "ADMIN", empresaId: "emp-1" },
        error: null,
      }),
    }))

    mockFindUnique.mockResolvedValue({
      id: "emp-1",
      nome: "Empresa X",
      plano: "start",
      statusPagamento: "PENDENTE",
      trialAtivo: true,
      createdAt: new Date("2026-08-01T10:00:00.000Z"),
      asaasSubscriptionId: null,
      asaasCustomerId: null,
    })

    const { GET } = await import("@/app/api/empresa/assinatura/route")
    const res = await GET(criaRequest())
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.plano).toBe("start")
    expect(json.nomePlano).toBe("Start")
    expect(json.statusPagamento).toBe("PENDENTE")
    expect(json.trialAtivo).toBe(true)
    expect(json.trialFim).toBe("2026-08-08T10:00:00.000Z")
  })

  it("ADMIN pagante vê próximo vencimento da recorrência", async () => {
    vi.doMock("@/lib/rbac-server", () => ({
      getServerSessionRBAC: vi.fn().mockResolvedValue({
        session: { role: "ADMIN", empresaId: "emp-1" },
        error: null,
      }),
    }))

    mockFindUnique.mockResolvedValue({
      id: "emp-1",
      nome: "Empresa X",
      plano: "start",
      statusPagamento: "PAGO",
      trialAtivo: false,
      createdAt: new Date("2026-08-01T10:00:00.000Z"),
      asaasSubscriptionId: "sub_1",
      asaasCustomerId: "cus_1",
    })
    mockConsultarAssinatura.mockResolvedValue({
      id: "sub_1",
      status: "ACTIVE",
      cycle: "MONTHLY",
      nextDueDate: "2026-09-01",
      value: 299.99,
      mock: false,
    })

    const { GET } = await import("@/app/api/empresa/assinatura/route")
    const res = await GET(criaRequest())
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.statusPagamento).toBe("PAGO")
    expect(json.dataVencimento).toBe("2026-09-01")
    expect(json.ciclo).toBe("MONTHLY")
    expect(json.assinaturaId).toBe("sub_1")
    expect(json.trialDiasRestantes).toBeNull()
  })

  it("empresa não encontrada -> 404", async () => {
    vi.doMock("@/lib/rbac-server", () => ({
      getServerSessionRBAC: vi.fn().mockResolvedValue({
        session: { role: "ADMIN", empresaId: "emp-x" },
        error: null,
      }),
    }))
    mockFindUnique.mockResolvedValue(null)

    const { GET } = await import("@/app/api/empresa/assinatura/route")
    const res = await GET(criaRequest("http://localhost/api/empresa/assinatura?id=emp-x"))
    expect(res.status).toBe(404)
  })
})
