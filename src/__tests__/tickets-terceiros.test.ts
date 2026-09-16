import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

const mockPrisma = vi.hoisted(() => ({
  empresa: { findUnique: vi.fn() },
  colaboradores: { findFirst: vi.fn(), update: vi.fn(), create: vi.fn() },
  chamado: { create: vi.fn() },
}))

const mockGetSessionOrFail = vi.hoisted(() => vi.fn())

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("@/util/permission", () => ({ getSessionOrFail: mockGetSessionOrFail }))
vi.mock("@/lib/rate-limit", () => ({
  applyRateLimit: vi.fn().mockResolvedValue(null),
}))
vi.mock("@/lib/upload", () => ({ uploadFile: vi.fn().mockResolvedValue("") }))

import { POST } from "@/app/api/tickets/terceiros/route"

const sessao = {
  user: { id: "atendente-1", role: "ATENDENTE", setor: "ADM", empresaId: "emp-1" },
}

function criaReq(campos: Record<string, string>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(campos)) fd.append(k, v)
  return new NextRequest("http://localhost/api/tickets/terceiros", {
    method: "POST",
    body: fd,
  })
}

const base = {
  nome: "JOAO TESTE",
  setor: "ADM",
  prioridade: "normal",
  descricao: "Problema no cracha de acesso",
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetSessionOrFail.mockResolvedValue(sessao)
  mockPrisma.empresa.findUnique.mockResolvedValue({ modulos: ["CORPORATIVO"] })
  mockPrisma.chamado.create.mockResolvedValue({ id: "ch-1", ticket: "TKT-123" })
})

describe("POST /api/tickets/terceiros — matrícula (CPF ou matrícula na criação)", () => {
  it("retorna 401 sem sessão", async () => {
    mockGetSessionOrFail.mockResolvedValue(null)
    const res = await POST(criaReq(base))
    expect(res.status).toBe(401)
  })

  it("colaborador existente: salva a matrícula digitada no cadastro e mantém o CPF próprio no chamado", async () => {
    mockPrisma.colaboradores.findFirst.mockResolvedValue({
      id: "col-1",
      nome: "JOAO TESTE",
      cpf: "12345678901",
      matricula: null,
    })
    mockPrisma.colaboradores.update.mockResolvedValue({
      id: "col-1",
      nome: "JOAO TESTE",
      cpf: "12345678901",
      matricula: "5555",
    })

    const res = await POST(
      criaReq({ ...base, colaboradorId: "col-1", matricula: "5555" })
    )

    expect(res.status).toBe(201)
    // matrícula persistida no colaborador (não era salva antes)
    expect(mockPrisma.colaboradores.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "col-1" },
        data: expect.objectContaining({ matricula: "5555" }),
      })
    )
    // chamado usa o CPF do cadastro (11 dígitos) e não a matrícula
    expect(mockPrisma.chamado.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          colaboradorId: "col-1",
          cpf: "12345678901",
        }),
      })
    )
  })

  it("colaborador existente sem CPF: a matrícula vai para a MESMA coluna cpf do chamado", async () => {
    mockPrisma.colaboradores.findFirst.mockResolvedValue({
      id: "col-1",
      nome: "JOAO TESTE",
      cpf: null,
      matricula: null,
    })
    mockPrisma.colaboradores.update.mockResolvedValue({
      id: "col-1",
      nome: "JOAO TESTE",
      cpf: null,
      matricula: "5566",
    })

    const res = await POST(
      criaReq({ ...base, colaboradorId: "col-1", matricula: "5566" })
    )

    expect(res.status).toBe(201)
    expect(mockPrisma.chamado.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ cpf: "5566" }),
      })
    )
  })

  it("colaborador novo: cadastra com matrícula e grava a matrícula na coluna cpf do chamado (sem CPF)", async () => {
    mockPrisma.colaboradores.create.mockResolvedValue({
      id: "col-novo",
      nome: "JOAO TESTE",
      cpf: null,
      matricula: "7788",
    })

    const res = await POST(criaReq({ ...base, matricula: "7788" }))

    expect(res.status).toBe(201)
    expect(mockPrisma.colaboradores.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ matricula: "7788", cpf: undefined }),
      })
    )
    // sem CPF, o chamado fica identificado pela matrícula na coluna cpf
    expect(mockPrisma.chamado.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ cpf: "7788" }),
      })
    )
  })
})