import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  checkRateLimit,
  trackFailedLogin,
  resetFailedLogin,
  needsCaptcha,
  getClientIp,
} from "@/lib/rate-limit"

beforeEach(() => {
  vi.restoreAllMocks()
})

describe("checkRateLimit", () => {
  it("permite requisicao quando nao ha registro previo", () => {
    const result = checkRateLimit("ip:test", 5, 60000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
    expect(result.resetIn).toBeGreaterThan(0)
  })

  it("decrementa remaining a cada requisicao", () => {
    checkRateLimit("ip:test2", 3, 60000)
    const r2 = checkRateLimit("ip:test2", 3, 60000)
    expect(r2.allowed).toBe(true)
    expect(r2.remaining).toBe(1)
  })

  it("bloqueia quando excede maxRequests", () => {
    checkRateLimit("ip:test3", 2, 60000)
    checkRateLimit("ip:test3", 2, 60000)
    const r3 = checkRateLimit("ip:test3", 2, 60000)
    expect(r3.allowed).toBe(false)
    expect(r3.remaining).toBe(0)
  })

  it("reset apos janela expirar", () => {
    const key = "ip:test4"
    vi.useFakeTimers()
    checkRateLimit(key, 1, 60000)
    vi.advanceTimersByTime(60001)
    const r = checkRateLimit(key, 1, 60000)
    expect(r.allowed).toBe(true)
    expect(r.remaining).toBe(0)
    vi.useRealTimers()
  })
})

describe("trackFailedLogin", () => {
  it("retorna 1 na primeira tentativa", () => {
    expect(trackFailedLogin("primeiro@test.com")).toBe(1)
  })

  it("incrementa a cada tentativa falha", () => {
    trackFailedLogin("incrementa@test.com")
    trackFailedLogin("incrementa@test.com")
    expect(trackFailedLogin("incrementa@test.com")).toBe(3)
  })

  it("mantem contagens separadas por email", () => {
    trackFailedLogin("separa_a@test.com")
    trackFailedLogin("separa_a@test.com")
    trackFailedLogin("separa_b@test.com")
    expect(trackFailedLogin("separa_a@test.com")).toBe(3)
    expect(trackFailedLogin("separa_b@test.com")).toBe(2)
  })

  it("normaliza email para lowercase", () => {
    expect(trackFailedLogin("LowerCase@Test.com")).toBe(1)
    expect(trackFailedLogin("lowercase@test.com")).toBe(2)
  })
})

describe("resetFailedLogin", () => {
  it("remove registro de tentativas", () => {
    trackFailedLogin("reset@test.com")
    trackFailedLogin("reset@test.com")
    resetFailedLogin("reset@test.com")
    expect(trackFailedLogin("reset@test.com")).toBe(1)
  })
})

describe("needsCaptcha", () => {
  it("retorna false quando nao ha tentativas", () => {
    expect(needsCaptcha("noattempt@test.com")).toBe(false)
  })

  it("retorna true apos 3 tentativas", () => {
    trackFailedLogin("captcha@test.com")
    trackFailedLogin("captcha@test.com")
    trackFailedLogin("captcha@test.com")
    expect(needsCaptcha("captcha@test.com")).toBe(true)
  })

  it("retorna false apos reset", () => {
    trackFailedLogin("captcha2@test.com")
    trackFailedLogin("captcha2@test.com")
    trackFailedLogin("captcha2@test.com")
    resetFailedLogin("captcha2@test.com")
    expect(needsCaptcha("captcha2@test.com")).toBe(false)
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
