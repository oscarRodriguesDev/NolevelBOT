import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

const ENV_BACKUP = { ...process.env }

const mockFindUniqueUser = vi.fn()
const mockFindUniqueEmpresa = vi.fn()
const mockFindManyChamado = vi.fn()

beforeEach(() => {
  vi.resetModules()
  process.env = { ...ENV_BACKUP }

  mockFindUniqueUser.mockReset()
  mockFindUniqueEmpresa.mockReset()
  mockFindManyChamado.mockReset()

  vi.doMock("@/lib/prisma", () => ({
    prisma: {
      user: { findUnique: mockFindUniqueUser },
      empresa: { findUnique: mockFindUniqueEmpresa },
      chamado: { findMany: mockFindManyChamado },
    },
  }))
  vi.doMock("@/lib/rate-limit", () => ({
    needsCaptcha: vi.fn().mockResolvedValue(false),
    verifyTurnstileToken: vi.fn().mockResolvedValue(true),
    trackFailedLogin: vi.fn().mockResolvedValue(undefined),
    resetFailedLogin: vi.fn().mockResolvedValue(undefined),
  }))
  vi.doMock("@/lib/audit-log", () => ({
    logAcesso: vi.fn().mockResolvedValue(undefined),
  }))
  vi.doMock("bcryptjs", () => ({
    compare: vi.fn().mockResolvedValue(true),
  }))
})

afterEach(() => {
  process.env = { ...ENV_BACKUP }
})

async function getAuthorize() {
  const { authOptions } = await import("@/lib/nextauth")
  const provider = authOptions.providers[0] as any
  return provider.options.authorize as (c: any) => Promise<any>
}

function mockUsuario(role: string) {
  mockFindUniqueUser.mockResolvedValue({
    id: "user-1",
    email: "admin@empresa.com.br",
    cpf: "12345678901",
    empresaId: "emp-1",
    name: "Admin",
    role,
    avatarUrl: null,
    setor: "all",
    password: "hash",
    chamados: [],
  })
  mockFindManyChamado.mockResolvedValue([])
}

describe("bloqueio por pagamento no login", () => {
  it("ADMIN com statusPagamento PENDENTE e fora do trial é bloqueado", async () => {
    mockUsuario("ADMIN")
    mockFindUniqueEmpresa.mockResolvedValue({
      nome: "Empresa X",
      statusPagamento: "PENDENTE",
      trialAtivo: false,
    })

    const authorize = await getAuthorize()
    const result = await authorize({ email: "admin@empresa.com.br", password: "x" })
    expect(result).toBeNull()
  })

  it("ADMIN com statusPagamento ATRASADO é bloqueado", async () => {
    mockUsuario("ADMIN")
    mockFindUniqueEmpresa.mockResolvedValue({
      nome: "Empresa X",
      statusPagamento: "ATRASADO",
      trialAtivo: false,
    })

    const authorize = await getAuthorize()
    const result = await authorize({ email: "admin@empresa.com.br", password: "x" })
    expect(result).toBeNull()
  })

  it("ADMIN com trial ativo entra mesmo com pagamento pendente", async () => {
    mockUsuario("ADMIN")
    mockFindUniqueEmpresa.mockResolvedValue({
      nome: "Empresa X",
      statusPagamento: "PENDENTE",
      trialAtivo: true,
    })

    const authorize = await getAuthorize()
    const result = await authorize({ email: "admin@empresa.com.br", password: "x" })
    expect(result).not.toBeNull()
    expect(result.empresaId).toBe("emp-1")
  })

  it("ADMIN com statusPagamento PAGO entra normalmente", async () => {
    mockUsuario("ADMIN")
    mockFindUniqueEmpresa.mockResolvedValue({
      nome: "Empresa X",
      statusPagamento: "PAGO",
      trialAtivo: false,
    })

    const authorize = await getAuthorize()
    const result = await authorize({ email: "admin@empresa.com.br", password: "x" })
    expect(result).not.toBeNull()
  })

  it("GOD entra mesmo com empresa em atraso (GOD sempre liberado)", async () => {
    mockUsuario("GOD")
    mockFindUniqueEmpresa.mockResolvedValue({
      nome: "Empresa X",
      statusPagamento: "ATRASADO",
      trialAtivo: false,
    })

    const authorize = await getAuthorize()
    const result = await authorize({ email: "admin@empresa.com.br", password: "x" })
    expect(result).not.toBeNull()
    expect(result.role).toBe("GOD")
  })
})
