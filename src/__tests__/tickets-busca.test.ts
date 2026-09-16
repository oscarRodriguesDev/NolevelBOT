import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

const mockPrisma = vi.hoisted(() => ({
  chamado: { findMany: vi.fn() },
}))

const mockGetSessionOrFail = vi.hoisted(() => vi.fn())

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("@/util/permission", () => ({ getSessionOrFail: mockGetSessionOrFail }))
vi.mock("@/lib/rate-limit", () => ({
  applyRateLimit: vi.fn().mockResolvedValue(null),
}))

import { GET } from "@/app/api/tickets/busca/route"

const sessaoAdmin = {
  user: { id: "user-1", role: "ADMIN", setor: "ADM", empresaId: "emp-1" },
}

const sessaoAtendente = {
  user: { id: "user-2", role: "ATENDENTE", setor: "beneficios", empresaId: "emp-1" },
}

const sessaoGod = {
  user: { id: "user-3", role: "GOD", setor: "", empresaId: "1" },
}

const sessaoGestorAll = {
  user: { id: "user-4", role: "GESTOR", setor: "all", empresaId: "emp-1" },
}

function criaReq(url = "http://localhost/api/tickets/busca?q=TKT-1786") {
  return new NextRequest(url)
}

// Extrai os itens do AND do where montado pela rota
function getAnd(where: Record<string, unknown>): Array<Record<string, unknown>> {
  const and = where?.AND
  if (Array.isArray(and)) return and as Array<Record<string, unknown>>
  return and ? [and as Record<string, unknown>] : []
}

// Localiza o item do AND que contém o OR principal (mais flexível que índice fixo)
function getOrClause(where: Record<string, unknown>): Record<string, unknown> {
  return getAnd(where).find((item) => item && typeof item === "object" && "OR" in item) || {}
}

// Retorna os itens do OR interno do filtro por colaborador (TERCEIRO)
function getColaboradorOr(where: Record<string, unknown>): Array<Record<string, unknown>> {
  const or = (getOrClause(where)?.OR as Array<Record<string, unknown>>) || []
  const col = or.find((item) => item && typeof item === "object" && "colaborador" in item)
  const is = (col?.colaborador as Record<string, unknown>)?.is as Record<string, unknown> | undefined
  return (is?.OR as Array<Record<string, unknown>>) || []
}

// Retorna o primeiro argumento de prisma.chamado.findMany
function getFindManyArgs(index = 0): Record<string, unknown> {
  return mockPrisma.chamado.findMany.mock.calls[index][0] as Record<string, unknown>
}

describe("GET /api/tickets/busca", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("retorna 401 quando não autenticado", async () => {
    mockGetSessionOrFail.mockResolvedValue(null)

    const res = await GET(criaReq())

    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe("Usuário não autenticado")
    expect(mockPrisma.chamado.findMany).not.toHaveBeenCalled()
  })

  it("retorna 400 quando q está ausente ou vazio", async () => {
    mockGetSessionOrFail.mockResolvedValue(sessaoAdmin)

    const resSemQ = await GET(criaReq("http://localhost/api/tickets/busca"))
    expect(resSemQ.status).toBe(400)
    expect((await resSemQ.json()).error).toBe("Informe nome, CPF, matrícula ou número do chamado")

    const resQVazio = await GET(criaReq("http://localhost/api/tickets/busca?q=%20%20"))
    expect(resQVazio.status).toBe(400)
    expect((await resQVazio.json()).error).toBe("Informe nome, CPF, matrícula ou número do chamado")

    expect(mockPrisma.chamado.findMany).not.toHaveBeenCalled()
  })

  it("busca por ticket monta where com ticket contains + empresa da sessão", async () => {
    mockGetSessionOrFail.mockResolvedValue(sessaoAdmin)
    mockPrisma.chamado.findMany.mockResolvedValue([])

    const res = await GET(criaReq("http://localhost/api/tickets/busca?q=TKT-1786"))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])

    const where = getFindManyArgs().where as Record<string, unknown>
    expect(getAnd(where)).toEqual(
      expect.arrayContaining([expect.objectContaining({ empresaId: "emp-1" })])
    )
    expect(getOrClause(where).OR).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ticket: { contains: "TKT-1786", mode: "insensitive" } }),
      ])
    )
    expect(JSON.stringify(where)).toContain('"contains":"TKT-1786"')
  })

  it("busca por nome monta where com nome contains insensitive", async () => {
    mockGetSessionOrFail.mockResolvedValue(sessaoAdmin)
    mockPrisma.chamado.findMany.mockResolvedValue([])

    await GET(criaReq("http://localhost/api/tickets/busca?q=Maria"))

    const where = getFindManyArgs().where as Record<string, unknown>
    expect(getOrClause(where).OR).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ nome: { contains: "Maria", mode: "insensitive" } }),
      ])
    )
    expect(JSON.stringify(where)).toContain('"mode":"insensitive"')
  })

  it("busca por CPF normaliza dígitos (CPF mascarado vira só dígitos)", async () => {
    mockGetSessionOrFail.mockResolvedValue(sessaoAdmin)
    mockPrisma.chamado.findMany.mockResolvedValue([])

    await GET(criaReq("http://localhost/api/tickets/busca?q=062.301.246-45"))

    const where = getFindManyArgs().where as Record<string, unknown>
    expect(JSON.stringify(where)).toContain("06230124645")
    expect(getOrClause(where).OR).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ cpf: { contains: "06230124645" } }),
      ])
    )
    // A cláusula de CPF não pode conter máscara; ticket/nome mantêm a string crua
    const clausulaCpf = (getOrClause(where).OR as Array<Record<string, unknown>>).find(
      (item) => item && "cpf" in item
    )
    expect(JSON.stringify(clausulaCpf)).not.toContain("062.301.246-45")
  })

  it("busca por matrícula monta colaborador.is.OR com matricula contains", async () => {
    mockGetSessionOrFail.mockResolvedValue(sessaoAdmin)
    mockPrisma.chamado.findMany.mockResolvedValue([])

    await GET(criaReq("http://localhost/api/tickets/busca?q=MATRIC"))

    const where = getFindManyArgs().where as Record<string, unknown>
    const colaboradorOr = getColaboradorOr(where)
    expect(colaboradorOr).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ matricula: { contains: "MATRIC" } }),
      ])
    )
    expect(JSON.stringify(where)).toContain('"matricula"')
  })

  it("aplica filtro de setor para ATENDENTE/GESTOR e não aplica para ADMIN", async () => {
    mockPrisma.chamado.findMany.mockResolvedValue([])

    mockGetSessionOrFail.mockResolvedValue(sessaoAtendente)
    await GET(criaReq())
    const whereAtendente = getFindManyArgs().where as Record<string, unknown>
    expect(getAnd(whereAtendente)).toEqual(
      expect.arrayContaining([expect.objectContaining({ setor: "beneficios" })])
    )

    mockGetSessionOrFail.mockResolvedValue(sessaoAdmin)
    await GET(criaReq())
    const whereAdmin = getFindManyArgs(1).where as Record<string, unknown>
    const temSetor = getAnd(whereAdmin).some((item) => item.setor !== undefined)
    expect(temSetor).toBe(false)
  })

  it("GOD não filtra por empresa (enxerga chamados de todas as empresas)", async () => {
    mockGetSessionOrFail.mockResolvedValue(sessaoGod)
    mockPrisma.chamado.findMany.mockResolvedValue([])

    await GET(criaReq("http://localhost/api/tickets/busca?q=osquilson"))

    const where = getFindManyArgs().where as Record<string, unknown>
    const temEmpresa = getAnd(where).some((item) => item.empresaId !== undefined)
    expect(temEmpresa).toBe(false)
  })

  it("GESTOR com setor 'all' não filtra por setor", async () => {
    mockGetSessionOrFail.mockResolvedValue(sessaoGestorAll)
    mockPrisma.chamado.findMany.mockResolvedValue([])

    await GET(criaReq("http://localhost/api/tickets/busca?q=1052"))

    const where = getFindManyArgs().where as Record<string, unknown>
    const temSetor = getAnd(where).some((item) => item.setor !== undefined)
    expect(temSetor).toBe(false)
    // mantém o isolamento por empresa
    expect(getAnd(where)).toEqual(
      expect.arrayContaining([expect.objectContaining({ empresaId: "emp-1" })])
    )
  })

  it("retorna 500 em erro de banco e monta where.AND[2].OR[0] com ticket (role ATENDENTE)", async () => {
    mockGetSessionOrFail.mockResolvedValue(sessaoAtendente)
    mockPrisma.chamado.findMany.mockRejectedValue(new Error("DB error"))

    const res = await GET(criaReq())

    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe("Erro ao buscar chamados")

    const where = getFindManyArgs().where as Record<string, unknown>
    // ATENDENTE → AND = [empresaId, setor, OR] → OR em AND[2]
    const or = (getAnd(where)[2]?.OR as Array<Record<string, unknown>>) || []
    expect(or[0]).toEqual(
      expect.objectContaining({ ticket: { contains: "TKT-1786", mode: "insensitive" } })
    )
    expect(JSON.stringify(where)).toContain('"contains":"TKT-1786"')
  })
})