import { describe, it, expect, vi, beforeEach } from "vitest"

const mockExecuteRaw = vi.hoisted(() => vi.fn())

vi.mock("@/lib/prisma", () => ({
  prisma: { $executeRawUnsafe: mockExecuteRaw },
}))

import { logAcesso } from "@/lib/audit-log"

describe("logAcesso", () => {
  beforeEach(() => {
    mockExecuteRaw.mockReset()
  })

  it("chama $executeRawUnsafe com parametros corretos", async () => {
    mockExecuteRaw.mockResolvedValue(1)

    await logAcesso({
      cpf: "12345678901",
      nome: "Joao",
      empresa: "Empresa X",
      modulo: "CORPORATIVO",
      acao: "login",
    })

    expect(mockExecuteRaw).toHaveBeenCalledTimes(1)

    const [sql, cpf, nome, empresa, modulo, acao] = mockExecuteRaw.mock.calls[0]
    expect(sql).toContain("INSERT INTO logs_de_acesso")
    expect(cpf).toBe("12345678901")
    expect(nome).toBe("Joao")
    expect(empresa).toBe("Empresa X")
    expect(modulo).toBe("CORPORATIVO")
    expect(acao).toBe("login")
  })

  it("aceita cpf e nome nulos", async () => {
    mockExecuteRaw.mockResolvedValue(1)

    await logAcesso({
      cpf: null,
      nome: null,
      empresa: "Empresa Y",
      modulo: "OFICINA",
      acao: "logout",
    })

    const [, cpf, nome] = mockExecuteRaw.mock.calls[0]
    expect(cpf).toBeNull()
    expect(nome).toBeNull()
  })

  it("nao lanca erro quando prisma falha", async () => {
    mockExecuteRaw.mockRejectedValue(new Error("DB error"))

    await expect(
      logAcesso({
        cpf: "00000000000",
        nome: "Test",
        empresa: "Empresa Z",
        modulo: "EVENTOS",
        acao: "login",
      })
    ).resolves.toBeUndefined()
  })
})
