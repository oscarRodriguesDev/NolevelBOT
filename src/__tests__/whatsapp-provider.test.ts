import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    empresa: {
      findFirst: vi.fn(),
    },
  },
}))

vi.mock("@/lib/rate-limit", () => ({
  applyRateLimit: vi.fn().mockResolvedValue(null),
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 10, resetIn: 60000 }),
}))

import { NextRequest } from "next/server"
import { evolutionProvider } from "@/lib/whatsapp/evolution-provider"
import { handleWebhook } from "@/lib/whatsapp/registry"
import { prisma } from "@/lib/prisma"

const baseBody = {
  event: "messages.upsert",
  instance: "instancia123",
  server_url: "https://evolution.cliente.com.br",
  apikey: "token-empresa-valido",
  data: {
    key: { remoteJid: "5511999999999@whatsapp.net" },
    message: { conversation: "Olá" },
  },
}

function makeReq(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/webhook-teste", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

describe("evolutionProvider.parseEvent", () => {
  it("retorna null para evento que nao e messages.upsert", () => {
    const parsed = evolutionProvider.parseEvent({ event: "connection.update" })
    expect(parsed).toBeNull()
  })

  it("retorna null para mensagem enviada pelo proprio bot (fromMe)", () => {
    const body = {
      ...baseBody,
      data: { key: { remoteJid: "x", fromMe: true }, message: { conversation: "oi" } },
    }
    expect(evolutionProvider.parseEvent(body)).toBeNull()
  })

  it("extrai texto, numero e instancia", () => {
    const parsed = evolutionProvider.parseEvent(baseBody)
    expect(parsed).not.toBeNull()
    expect(parsed!.message!.number).toBe("5511999999999@whatsapp.net")
    expect(parsed!.message!.userInput).toBe("Olá")
    expect(parsed!.message!.hasMedia).toBe(false)
    expect(parsed!.ctx.serverUrl).toBe("https://evolution.cliente.com.br")
    expect(parsed!.ctx.apiKey).toBe("token-empresa-valido")
    expect(parsed!.ctx.provider).toBe("evolution")
  })

  it("detecta imagem e legenda", () => {
    const body = {
      ...baseBody,
      data: {
        key: { remoteJid: "x" },
        message: { imageMessage: { caption: "foto", mimetype: "image/jpeg" } },
      },
    }
    const parsed = evolutionProvider.parseEvent(body)
    expect(parsed!.message!.hasImage).toBe(true)
    expect(parsed!.message!.hasMedia).toBe(true)
    expect(parsed!.message!.userInput).toBe("foto")
    expect(parsed!.message!.media!.mimeType).toBe("image/jpeg")
  })

  it("preserva payload bruto (raw) para download de midia", () => {
    const parsed = evolutionProvider.parseEvent(baseBody)
    expect(parsed!.message!.raw).toEqual(baseBody.data)
  })
})

describe("evolutionProvider.extractToken", () => {
  const req = makeReq({})

  it("retorna o apikey do body", () => {
    expect(evolutionProvider.extractToken({ apikey: "abc" }, req)).toBe("abc")
  })

  it("retorna null quando ausente ou vazio", () => {
    expect(evolutionProvider.extractToken({}, req)).toBeNull()
    expect(evolutionProvider.extractToken({ apikey: "" }, req)).toBeNull()
  })
})

describe("handleWebhook", () => {
  beforeEach(() => {
    vi.mocked(prisma.empresa.findFirst).mockReset()
  })

  it("responde ok para evento ignoravel", async () => {
    const res = await handleWebhook(makeReq({ event: "connection.update" }), "webhook-teste")
    expect(res.ok).toBe(false)
    expect(res.response!.status).toBe(200)
  })

  it("retorna 401 quando token ausente", async () => {
    const body = { ...baseBody, apikey: undefined }
    const res = await handleWebhook(makeReq(body), "webhook-teste")
    expect(res.ok).toBe(false)
    expect(res.response!.status).toBe(401)
  })

  it("retorna 401 quando token invalido", async () => {
    vi.mocked(prisma.empresa.findFirst).mockResolvedValue(null)
    const res = await handleWebhook(makeReq(baseBody), "webhook-teste")
    expect(res.ok).toBe(false)
    expect(res.response!.status).toBe(401)
  })

  it("retorna ok com message, ctx e empresaId quando token valido", async () => {
    vi.mocked(prisma.empresa.findFirst).mockResolvedValue({ id: "emp-1" })
    const res = await handleWebhook(makeReq(baseBody), "webhook-teste")
    expect(res.ok).toBe(true)
    expect(res.message!.userInput).toBe("Olá")
    expect(res.ctx!.provider).toBe("evolution")
    expect(res.empresaId).toBe("emp-1")
    expect(prisma.empresa.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { evolution_token: "token-empresa-valido" } })
    )
  })

  it("repassa rate limit do IP quando bloqueado", async () => {
    const { applyRateLimit } = await import("@/lib/rate-limit")
    vi.mocked(applyRateLimit).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Muitas requisições" }), { status: 429 })
    )
    const res = await handleWebhook(makeReq(baseBody), "webhook-teste")
    expect(res.ok).toBe(false)
    expect(res.response!.status).toBe(429)
  })
})
