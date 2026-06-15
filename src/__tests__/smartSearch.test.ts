import { describe, it, expect, vi, beforeEach } from "vitest"

const mockPrisma = vi.hoisted(() => ({
  cpfsLeads: { findUnique: vi.fn() },
  empresa: { findUnique: vi.fn() },
  avisos: { findMany: vi.fn() },
}))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))

import { obterBaseDeConhecimento } from "@/lib/smartSearch"

describe("obterBaseDeConhecimento", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("retorna fallback quando CPF nao encontrado", async () => {
    mockPrisma.cpfsLeads.findUnique.mockResolvedValue(null)

    const result = await obterBaseDeConhecimento("00000000000")
    expect(result).toBe("Não há informações adicionais no banco de dados no momento.")
    expect(mockPrisma.empresa.findUnique).not.toHaveBeenCalled()
  })

  it("retorna fallback quando empresa nao encontrada", async () => {
    mockPrisma.cpfsLeads.findUnique.mockResolvedValue({ empresa: "Empresa X" })
    mockPrisma.empresa.findUnique.mockResolvedValue(null)

    const result = await obterBaseDeConhecimento("11111111111")
    expect(result).toBe("Não há informações adicionais no banco de dados no momento.")
  })

  it("retorna fallback quando nao ha avisos", async () => {
    mockPrisma.cpfsLeads.findUnique.mockResolvedValue({ empresa: "Empresa X" })
    mockPrisma.empresa.findUnique.mockResolvedValue({ id: "emp-1" })
    mockPrisma.avisos.findMany.mockResolvedValue([])

    const result = await obterBaseDeConhecimento("22222222222")
    expect(result).toBe("Não há informações adicionais no banco de dados no momento.")
  })

  it("retorna avisos quando existem", async () => {
    mockPrisma.cpfsLeads.findUnique.mockResolvedValue({ empresa: "Empresa X" })
    mockPrisma.empresa.findUnique.mockResolvedValue({ id: "emp-1" })
    mockPrisma.avisos.findMany.mockResolvedValue([
      { titulo: "Aviso 1", conteudo: "Conteudo do aviso 1" },
      { titulo: "Aviso 2", conteudo: "Conteudo do aviso 2" },
    ])

    const result = await obterBaseDeConhecimento("33333333333")
    expect(result).toContain("Conteudo do aviso 1")
    expect(result).toContain("Conteudo do aviso 2")
  })

  it("retorna fallback em caso de erro", async () => {
    mockPrisma.cpfsLeads.findUnique.mockRejectedValue(new Error("DB error"))

    const result = await obterBaseDeConhecimento("44444444444")
    expect(result).toBe("Erro ao carregar base de conhecimento.")
  })

  it("filtra avisos nao expirados corretamente", async () => {
    mockPrisma.cpfsLeads.findUnique.mockResolvedValue({ empresa: "Empresa X" })
    mockPrisma.empresa.findUnique.mockResolvedValue({ id: "emp-1" })
    mockPrisma.avisos.findMany.mockResolvedValue([
      { titulo: "Aviso Ativo", conteudo: "Ainda vale" },
    ])

    const result = await obterBaseDeConhecimento("55555555555")
    expect(result).toContain("Ainda vale")
    expect(mockPrisma.avisos.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          empresaId: "emp-1",
          OR: expect.arrayContaining([
            expect.objectContaining({ expiresAt: null }),
            expect.objectContaining({ expiresAt: expect.objectContaining({ gt: expect.any(Date) }) }),
          ]),
        }),
      })
    )
  })
})
