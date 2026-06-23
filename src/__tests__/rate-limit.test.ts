import { describe, it, expect, beforeEach, vi } from "vitest"

const mockCache = new Map<string, { value: string; expiresAt: Date }>()

vi.mock("@/lib/prisma", () => ({
  prisma: {
    cache: {
      findUnique: vi.fn(({ where }: { where: { key: string } }) => {
        return Promise.resolve(mockCache.get(where.key) || null)
      }),
      upsert: vi.fn(({ where, update, create }: any) => {
        mockCache.set(where.key, {
          value: update?.value || create.value,
          expiresAt: update?.expiresAt || create.expiresAt,
        })
        return Promise.resolve({})
      }),
      delete: vi.fn(({ where }: { where: { key: string } }) => {
        mockCache.delete(where.key)
        return Promise.resolve({})
      }),
    },
  },
}))

import {
  checkRateLimit,
  trackFailedLogin,
  resetFailedLogin,
  needsCaptcha,
  getClientIp,
} from "@/lib/rate-limit"

beforeEach(() => {
  vi.restoreAllMocks()
  mockCache.clear()
})

describe("checkRateLimit", () => {
  it("permite requisicao quando nao ha registro previo", async () => {
    const result = await checkRateLimit("ip:test", 5, 60000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
    expect(result.resetIn).toBeGreaterThan(0)
  })

  it("decrementa remaining a cada requisicao", async () => {
    await checkRateLimit("ip:test2", 3, 60000)
    const r2 = await checkRateLimit("ip:test2", 3, 60000)
    expect(r2.allowed).toBe(true)
    expect(r2.remaining).toBe(1)
  })

  it("bloqueia quando excede maxRequests", async () => {
    await checkRateLimit("ip:test3", 2, 60000)
    await checkRateLimit("ip:test3", 2, 60000)
    const r3 = await checkRateLimit("ip:test3", 2, 60000)
    expect(r3.allowed).toBe(false)
    expect(r3.remaining).toBe(0)
  })

  it("reset apos janela expirar", async () => {
    const key = "ip:test4"
    vi.useFakeTimers()
    await checkRateLimit(key, 1, 60000)
    vi.advanceTimersByTime(60001)
    const r = await checkRateLimit(key, 1, 60000)
    expect(r.allowed).toBe(true)
    expect(r.remaining).toBe(0)
    vi.useRealTimers()
  })
})

describe("trackFailedLogin", () => {
  it("retorna 1 na primeira tentativa", async () => {
    expect(await trackFailedLogin("primeiro@test.com")).toBe(1)
  })

  it("incrementa a cada tentativa falha", async () => {
    await trackFailedLogin("incrementa@test.com")
    await trackFailedLogin("incrementa@test.com")
    expect(await trackFailedLogin("incrementa@test.com")).toBe(3)
  })

  it("mantem contagens separadas por email", async () => {
    await trackFailedLogin("separa_a@test.com")
    await trackFailedLogin("separa_a@test.com")
    await trackFailedLogin("separa_b@test.com")
    expect(await trackFailedLogin("separa_a@test.com")).toBe(3)
    expect(await trackFailedLogin("separa_b@test.com")).toBe(2)
  })

  it("normaliza email para lowercase", async () => {
    expect(await trackFailedLogin("LowerCase@Test.com")).toBe(1)
    expect(await trackFailedLogin("lowercase@test.com")).toBe(2)
  })
})

describe("resetFailedLogin", () => {
  it("remove registro de tentativas", async () => {
    await trackFailedLogin("reset@test.com")
    await trackFailedLogin("reset@test.com")
    await resetFailedLogin("reset@test.com")
    expect(await trackFailedLogin("reset@test.com")).toBe(1)
  })
})

describe("needsCaptcha", () => {
  it("retorna false quando nao ha tentativas", async () => {
    expect(await needsCaptcha("noattempt@test.com")).toBe(false)
  })

  it("retorna true apos 3 tentativas", async () => {
    await trackFailedLogin("captcha@test.com")
    await trackFailedLogin("captcha@test.com")
    await trackFailedLogin("captcha@test.com")
    expect(await needsCaptcha("captcha@test.com")).toBe(true)
  })

  it("retorna false apos reset", async () => {
    await trackFailedLogin("captcha2@test.com")
    await trackFailedLogin("captcha2@test.com")
    await trackFailedLogin("captcha2@test.com")
    await resetFailedLogin("captcha2@test.com")
    expect(await needsCaptcha("captcha2@test.com")).toBe(false)
  })
})

describe("getClientIp", () => {
  it("extrai IP de x-forwarded-for", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "192.168.1.1, 10.0.0.1" },
    })
    expect(getClientIp(req)).toBe("192.168.1.1")
  })

  it("usa x-real-ip como fallback", () => {
    const req = new Request("http://localhost", {
      headers: { "x-real-ip": "10.0.0.5" },
    })
    expect(getClientIp(req)).toBe("10.0.0.5")
  })

  it("retorna unknown quando sem headers", () => {
    const req = new Request("http://localhost")
    expect(getClientIp(req)).toBe("unknown")
  })
})
