import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"

// Testes do POST /api/signup — escolha entre TRIAL (default) e PAGAMENTO IMEDIATO.
const ENV_BACKUP = { ...process.env }

const mockApplyRateLimit = vi.fn()
const mockFindUniqueEmpresa = vi.fn()
const mockFindFirstUser = vi.fn()
const mockFindUniqueUser = vi.fn()
const mockEmpresaCreate = vi.fn()
const mockUserCreate = vi.fn()
const mockCpfUpsert = vi.fn()
const mockGetPlanoPorSlug = vi.fn()
const mockCriarTokenPagamento = vi.fn()

const PLANO_ATIVO = {
  slug: "start",
  nome: "Start",
  preco: 299.99,
  ativo: true,
  maxModulos: 1,
  modulosAutomaticos: [],
}

function planoOk() {
  return { ok: true, modulos: ["CORPORATIVO"], error: null }
}

beforeEach(() => {
  vi.resetModules()
  process.env = { ...ENV_BACKUP }

  mockApplyRateLimit.mockReset()
  mockFindUniqueEmpresa.mockReset()
  mockFindFirstUser.mockReset()
  mockFindUniqueUser.mockReset()
  mockEmpresaCreate.mockReset()
  mockUserCreate.mockReset()
  mockCpfUpsert.mockReset()
  mockGetPlanoPorSlug.mockReset()
  mockCriarTokenPagamento.mockReset()

  mockApplyRateLimit.mockResolvedValue(null)
  mockFindUniqueEmpresa.mockResolvedValue(null)
  mockFindFirstUser.mockResolvedValue(null)
  mockFindUniqueUser.mockResolvedValue(null)
  mockGetPlanoPorSlug.mockResolvedValue(PLANO_ATIVO)
  mockCriarTokenPagamento.mockReturnValue("token-pagamento-teste")
  mockEmpresaCreate.mockImplementation((args) => Promise.resolve({ id: "emp-nova", ...args.data }))
  mockUserCreate.mockImplementation((args) =>
    Promise.resolve({ id: "user-novo", email: args.data.email })
  )
  mockCpfUpsert.mockResolvedValue({})

  vi.doMock("@/lib/rate-limit", () => ({
    applyRateLimit: mockApplyRateLimit,
  }))

  vi.doMock("@/lib/prisma", () => ({
    prisma: {
      empresa: { findUnique: mockFindUniqueEmpresa },
      user: { findFirst: mockFindFirstUser, findUnique: mockFindUniqueUser },
      cpfs: { upsert: mockCpfUpsert },
      $transaction: vi.fn(async (cb: any) => {
        return cb({
          empresa: { create: mockEmpresaCreate },
          user: { create: mockUserCreate },
          cpfs: { upsert: mockCpfUpsert },
        })
      }),
    },
  }))

  vi.doMock("@/lib/planos-server", () => ({
    getPlanoPorSlug: mockGetPlanoPorSlug,
  }))

  vi.doMock("@/lib/token-pagamento", () => ({
    criarTokenPagamento: mockCriarTokenPagamento,
  }))

  vi.doMock("bcryptjs", () => ({
    hash: vi.fn().mockResolvedValue("hash-teste"),
  }))

  // planos.ts e limparcpfs são funções puras — mantém a implementação real
})

afterEach(() => {
  process.env = { ...ENV_BACKUP }
})

function req(body: unknown) {
  return new NextRequest("http://localhost/api/signup", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
}

const BODY_BASE = {
  plano: "start",
  empresa: { nome: "Empresa Trial Teste", cnpj: "11222333000181", setores: ["TI"] },
  admin: { nome: "Admin Teste", cpf: "11144477735", password: "teste123" },
  modulos: ["CORPORATIVO"],
}

describe("POST /api/signup — escolha trial vs pagamento imediato", () => {
  it("usarTrial=true (default) → conta nasce em trial, SEM pagamentoUrl", async () => {
    const { POST } = await import("@/app/api/signup/route")
    const res = await POST(req({ ...BODY_BASE, usarTrial: true }))
    expect(res.status).toBe(201)

    const json = await res.json()
    expect(json.trialAtivo).toBe(true)
    expect(json.trialDias).toBe(7)
    expect(json.pagamentoUrl).toBeNull()

    // empresa criada com trial ativo + trial marcado como usado
    const criada = mockEmpresaCreate.mock.calls[0][0].data
    expect(criada.trialAtivo).toBe(true)
    expect(criada.trialUsado).toBe(true)

    // token de pagamento NÃO é gerado no caminho de trial
    expect(mockCriarTokenPagamento).not.toHaveBeenCalled()
  })

  it("usarTrial=false → conta nasce SEM trial e retorna pagamentoUrl", async () => {
    const { POST } = await import("@/app/api/signup/route")
    const res = await POST(req({ ...BODY_BASE, usarTrial: false }))
    expect(res.status).toBe(201)

    const json = await res.json()
    expect(json.trialAtivo).toBe(false)
    expect(json.pagamentoUrl).toBe("/pagamento?t=token-pagamento-teste")

    const criada = mockEmpresaCreate.mock.calls[0][0].data
    expect(criada.trialAtivo).toBe(false)
    expect(criada.trialUsado).toBe(false)

    expect(mockCriarTokenPagamento).toHaveBeenCalledWith("emp-nova")
  })

  it("sem campo usarTrial → assume trial (default true)", async () => {
    const { POST } = await import("@/app/api/signup/route")
    const res = await POST(req(BODY_BASE))
    expect(res.status).toBe(201)

    const json = await res.json()
    expect(json.trialAtivo).toBe(true)
    expect(json.pagamentoUrl).toBeNull()
  })

  it("plano inativo → 400", async () => {
    mockGetPlanoPorSlug.mockResolvedValue({ ...PLANO_ATIVO, ativo: false })
    const { POST } = await import("@/app/api/signup/route")
    const res = await POST(req(BODY_BASE))
    expect(res.status).toBe(400)
  })

  it("CNPJ já cadastrado → 409", async () => {
    mockFindUniqueEmpresa.mockResolvedValue({ id: "emp-outra", cnpj: "11222333000181" })
    const { POST } = await import("@/app/api/signup/route")
    const res = await POST(req(BODY_BASE))
    expect(res.status).toBe(409)
  })
})
