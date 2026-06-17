import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  generateRandomTicket,
  saudacao,
  checkEmpresaModule,
} from "@/lib/usedata"

describe("generateRandomTicket", () => {
  it("retorna string no formato TKT- seguido de 15 caracteres", () => {
    const ticket = generateRandomTicket()
    expect(ticket).toMatch(/^TKT-\d{15}$/)
  })

  it("retorna valores diferentes em chamadas consecutivas", () => {
    vi.useFakeTimers()
    const t1 = generateRandomTicket()
    vi.advanceTimersByTime(10)
    const t2 = generateRandomTicket()
    expect(t1).not.toBe(t2)
    vi.useRealTimers()
  })
})

describe("saudacao", () => {
  it('retorna "Bom dia" entre 5h e 11h', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 15, 8, 0, 0))
    expect(saudacao()).toBe("Bom dia")
    vi.useRealTimers()
  })

  it('retorna "Boa tarde" entre 12h e 17h', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 15, 14, 0, 0))
    expect(saudacao()).toBe("Boa tarde")
    vi.useRealTimers()
  })

  it('retorna "Boa noite" entre 18h e 4h', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 15, 22, 0, 0))
    expect(saudacao()).toBe("Boa noite")
    vi.useRealTimers()
  })

  it('retorna "Boa noite" de madrugada (3h)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 15, 3, 0, 0))
    expect(saudacao()).toBe("Boa noite")
    vi.useRealTimers()
  })
})

describe("checkEmpresaModule", () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it("retorna hasModule false quando empresa nao encontrada", async () => {
    const mockPrisma = {
      empresa: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    }
    vi.doMock("@/lib/prisma", () => ({ prisma: mockPrisma }))

    const { checkEmpresaModule: check } = await import("@/lib/usedata")
    const result = await check("invalid-id", "CORPORATIVO")
    expect(result.hasModule).toBe(false)
    expect(result.activeModules).toEqual([])
  })

  it("retorna hasModule true quando empresa tem o modulo", async () => {
    const mockPrisma = {
      empresa: {
        findUnique: vi.fn().mockResolvedValue({
          modulos: ["CORPORATIVO", "OFICINA"],
        }),
      },
    }
    vi.doMock("@/lib/prisma", () => ({ prisma: mockPrisma }))

    const { checkEmpresaModule: check } = await import("@/lib/usedata")
    const result = await check("emp-1", "CORPORATIVO")
    expect(result.hasModule).toBe(true)
    expect(result.activeModules).toContain("CORPORATIVO")
  })

  it("retorna hasModule false quando empresa nao tem o modulo", async () => {
    const mockPrisma = {
      empresa: {
        findUnique: vi.fn().mockResolvedValue({
          modulos: ["EVENTOS"],
        }),
      },
    }
    vi.doMock("@/lib/prisma", () => ({ prisma: mockPrisma }))

    const { checkEmpresaModule: check } = await import("@/lib/usedata")
    const result = await check("emp-2", "OFICINA")
    expect(result.hasModule).toBe(false)
    expect(result.activeModules).toEqual(["EVENTOS"])
  })

  it("retorna fallback em caso de erro", async () => {
    const mockPrisma = {
      empresa: {
        findUnique: vi.fn().mockRejectedValue(new Error("DB error")),
      },
    }
    vi.doMock("@/lib/prisma", () => ({ prisma: mockPrisma }))

    const { checkEmpresaModule: check } = await import("@/lib/usedata")
    const result = await check("emp-3", "CORPORATIVO")
    expect(result.hasModule).toBe(false)
    expect(result.activeModules).toEqual([])
  })
})
