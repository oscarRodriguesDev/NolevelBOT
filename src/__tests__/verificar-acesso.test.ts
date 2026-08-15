import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"

const ENV_BACKUP = { ...process.env }
const mockFindUniqueUser = vi.fn()
const mockFindUniqueEmpresa = vi.fn()

function criaRequest(email: string) {
  return new NextRequest("http://localhost/api/auth/verificar-acesso", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
}

beforeEach(() => {
  vi.resetModules()
  process.env = { ...ENV_BACKUP }

  mockFindUniqueUser.mockReset()
  mockFindUniqueEmpresa.mockReset()

  vi.doMock("@/lib/prisma", () => ({
    prisma: {
      user: { findUnique: mockFindUniqueUser },
      empresa: { findUnique: mockFindUniqueEmpresa },
    },
  }))

  vi.doMock("@/lib/rate-limit", () => ({
    applyRateLimit: vi.fn().mockResolvedValue(null),
  }))
})

afterEach(() => {
  process.env = { ...ENV_BACKUP }
})

describe("POST /api/auth/verificar-acesso", () => {
  it("conta inexistente não revela nada (acessivel true)", async () => {
    mockFindUniqueUser.mockResolvedValue(null)

    const { POST } = await import("@/app/api/auth/verificar-acesso/route")
    const res = await POST(criaRequest("nao-existe@empresa.com.br"))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.acessivel).toBe(true)
    expect(json.motivo).toBeUndefined()
  })

  it("GOD sempre acessível", async () => {
    mockFindUniqueUser.mockResolvedValue({ role: "GOD", empresaId: "emp-1" })

    const { POST } = await import("@/app/api/auth/verificar-acesso/route")
    const res = await POST(criaRequest("god@nolevel.com.br"))
    const json = await res.json()
    expect(json.acessivel).toBe(true)
  })

  it("empresa PAGO -> acessível", async () => {
    mockFindUniqueUser.mockResolvedValue({ role: "ADMIN", empresaId: "emp-1" })
    mockFindUniqueEmpresa.mockResolvedValue({
      statusPagamento: "PAGO",
      trialAtivo: false,
    })

    const { POST } = await import("@/app/api/auth/verificar-acesso/route")
    const res = await POST(criaRequest("admin@empresa.com.br"))
    const json = await res.json()
    expect(json.acessivel).toBe(true)
  })

  it("trial ativo -> acessível mesmo com PENDENTE", async () => {
    mockFindUniqueUser.mockResolvedValue({ role: "ADMIN", empresaId: "emp-1" })
    mockFindUniqueEmpresa.mockResolvedValue({
      statusPagamento: "PENDENTE",
      trialAtivo: true,
    })

    const { POST } = await import("@/app/api/auth/verificar-acesso/route")
    const res = await POST(criaRequest("admin@empresa.com.br"))
    const json = await res.json()
    expect(json.acessivel).toBe(true)
  })

  it("ATRASADO fora do trial -> bloqueado com motivo específico", async () => {
    mockFindUniqueUser.mockResolvedValue({ role: "ADMIN", empresaId: "emp-1" })
    mockFindUniqueEmpresa.mockResolvedValue({
      statusPagamento: "ATRASADO",
      trialAtivo: false,
    })

    const { POST } = await import("@/app/api/auth/verificar-acesso/route")
    const res = await POST(criaRequest("admin@empresa.com.br"))
    const json = await res.json()
    expect(json.acessivel).toBe(false)
    expect(json.motivo).toBe("ATRASADO")
    expect(json.mensagem.toLowerCase()).toContain("atraso")
  })

  it("CANCELADO -> bloqueado com mensagem de cancelamento", async () => {
    mockFindUniqueUser.mockResolvedValue({ role: "ADMIN", empresaId: "emp-1" })
    mockFindUniqueEmpresa.mockResolvedValue({
      statusPagamento: "CANCELADO",
      trialAtivo: false,
    })

    const { POST } = await import("@/app/api/auth/verificar-acesso/route")
    const res = await POST(criaRequest("admin@empresa.com.br"))
    const json = await res.json()
    expect(json.acessivel).toBe(false)
    expect(json.motivo).toBe("CANCELADO")
  })

  it("REEMBOLSADO -> bloqueado com motivo específico", async () => {
    mockFindUniqueUser.mockResolvedValue({ role: "ADMIN", empresaId: "emp-1" })
    mockFindUniqueEmpresa.mockResolvedValue({
      statusPagamento: "REEMBOLSADO",
      trialAtivo: false,
    })

    const { POST } = await import("@/app/api/auth/verificar-acesso/route")
    const res = await POST(criaRequest("admin@empresa.com.br"))
    const json = await res.json()
    expect(json.acessivel).toBe(false)
    expect(json.motivo).toBe("REEMBOLSADO")
  })

  it("PENDENTE fora do trial -> bloqueado aguardando confirmação", async () => {
    mockFindUniqueUser.mockResolvedValue({ role: "ADMIN", empresaId: "emp-1" })
    mockFindUniqueEmpresa.mockResolvedValue({
      statusPagamento: "PENDENTE",
      trialAtivo: false,
    })

    const { POST } = await import("@/app/api/auth/verificar-acesso/route")
    const res = await POST(criaRequest("admin@empresa.com.br"))
    const json = await res.json()
    expect(json.acessivel).toBe(false)
    expect(json.motivo).toBe("PENDENTE")
  })

  it("falha no banco não bloqueia o fluxo (acessivel true)", async () => {
    mockFindUniqueUser.mockRejectedValue(new Error("DB error"))

    const { POST } = await import("@/app/api/auth/verificar-acesso/route")
    const res = await POST(criaRequest("admin@empresa.com.br"))
    const json = await res.json()
    expect(json.acessivel).toBe(true)
  })
})
