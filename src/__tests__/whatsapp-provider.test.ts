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
import { metaProvider } from "@/lib/whatsapp/meta-provider"
import { handleWebhook, handleWebhookVerify } from "@/lib/whatsapp/registry"
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

  it("prioriza o token da query string (?token=) sobre o apikey do body", () => {
    const req2 = makeReq({})
    const url = new URL("http://localhost/api/webhook-teste?token=token-da-url")
    const reqWithQuery = new NextRequest(url, { method: "POST", body: JSON.stringify(baseBody) })
    expect(evolutionProvider.extractToken(baseBody, reqWithQuery)).toBe("token-da-url")
  })

  it("aceita o token do header x-webhook-token como fallback", () => {
    const reqHeader = new NextRequest("http://localhost/api/webhook-teste", {
      method: "POST",
      headers: { "x-webhook-token": "token-header" },
      body: JSON.stringify(baseBody),
    })
    expect(evolutionProvider.extractToken(baseBody, reqHeader)).toBe("token-header")
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
    vi.mocked(prisma.empresa.findFirst).mockResolvedValue({
      id: "emp-1",
      provider: "EVOLUTION",
      evolution_url: "https://api.cliente.com.br",
      api_key: "chave-de-envio-do-cliente",
    })
    const res = await handleWebhook(makeReq(baseBody), "webhook-teste")
    expect(res.ok).toBe(true)
    expect(res.message!.userInput).toBe("Olá")
    expect(res.ctx!.provider).toBe("evolution")
    expect(res.ctx!.serverUrl).toBe("https://api.cliente.com.br")
    expect(res.ctx!.apiKey).toBe("chave-de-envio-do-cliente")
    expect(res.empresaId).toBe("emp-1")
    expect(prisma.empresa.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { evolution_token: "token-empresa-valido" } })
    )
  })

  it("ctx de envio vem da config da empresa, nao do body (anti-SSRF)", async () => {
    vi.mocked(prisma.empresa.findFirst).mockResolvedValue({
      id: "emp-2",
      provider: "EVOLUTION",
      evolution_url: "https://url-confiavel.com.br",
      api_key: "segredo-da-empresa",
    })
    const body = {
      ...baseBody,
      server_url: "https://url-maliciosa.com.br",
      apikey: "token-empresa-valido",
    }
    const res = await handleWebhook(makeReq(body), "webhook-teste")
    expect(res.ok).toBe(true)
    expect(res.ctx!.serverUrl).toBe("https://url-confiavel.com.br")
    expect(res.ctx!.apiKey).toBe("segredo-da-empresa")
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

// ── Payload da Meta Cloud API ─────────────────────────────────

const metaBody = {
  object: "whatsapp_business_account",
  entry: [
    {
      id: "WBID",
      changes: [
        {
          value: {
            messaging_product: "whatsapp",
            metadata: { display_phone_number: "5511999999999", phone_number_id: "1029384756" },
            contacts: [{ profile: { name: "Cliente" }, wa_id: "5511888888888" }],
            messages: [
              {
                from: "5511888888888",
                id: "wamid.ABC123",
                timestamp: "1700000000",
                type: "text",
                text: { body: "Olá, preciso de ajuda" },
              },
            ],
          },
          field: "messages",
        },
      ],
    },
  ],
}

function makeMetaReq(body: unknown, url = "http://localhost/api/webhook-teste"): NextRequest {
  return new NextRequest(url, { method: "POST", body: JSON.stringify(body) })
}

describe("metaProvider.parseEvent", () => {
  it("retorna null para payload que nao e da Meta", () => {
    expect(metaProvider.parseEvent({ event: "messages.upsert" })).toBeNull()
    expect(metaProvider.parseEvent({})).toBeNull()
  })

  it("retorna null quando so ha status (sem messages)", () => {
    const body = {
      object: "whatsapp_business_account",
      entry: [{ changes: [{ value: { statuses: [{ id: "wamid" }] }, field: "messages" }] }],
    }
    expect(metaProvider.parseEvent(body)).toBeNull()
  })

  it("extrai texto, numero (sem sufixo) e phone_number_id", () => {
    const parsed = metaProvider.parseEvent(metaBody)
    expect(parsed).not.toBeNull()
    expect(parsed!.message!.number).toBe("5511888888888")
    expect(parsed!.message!.userInput).toBe("Olá, preciso de ajuda")
    expect(parsed!.message!.hasMedia).toBe(false)
    expect(parsed!.ctx.instance).toBe("1029384756")
    expect(parsed!.ctx.provider).toBe("meta")
  })

  it("detecta imagem com legenda", () => {
    const body = JSON.parse(JSON.stringify(metaBody))
    body.entry[0].changes[0].value.messages[0] = {
      from: "5511888888888",
      id: "wamid.IMG",
      type: "image",
      image: { id: "MEDIA_1", mime_type: "image/jpeg", caption: "foto do problema" },
    }
    const parsed = metaProvider.parseEvent(body)
    expect(parsed!.message!.hasImage).toBe(true)
    expect(parsed!.message!.hasMedia).toBe(true)
    expect(parsed!.message!.userInput).toBe("foto do problema")
    expect(parsed!.message!.media!.mimeType).toBe("image/jpeg")
  })
})

describe("metaProvider.extractToken", () => {
  it("extrai o token da query string (?token=)", () => {
    const req = makeMetaReq({}, "http://localhost/api/webhook-teste?token=segredo-meta")
    expect(metaProvider.extractToken(metaBody, req)).toBe("segredo-meta")
  })

  it("extrai o token do header x-webhook-token como fallback", () => {
    const req = new NextRequest("http://localhost/api/webhook-teste", {
      method: "POST",
      headers: { "x-webhook-token": "token-header" },
    })
    expect(metaProvider.extractToken(metaBody, req)).toBe("token-header")
  })

  it("retorna null quando ausente", () => {
    const req = makeMetaReq(metaBody)
    expect(metaProvider.extractToken(metaBody, req)).toBeNull()
  })
})

describe("handleWebhook com payload da Meta", () => {
  beforeEach(() => {
    vi.mocked(prisma.empresa.findFirst).mockReset()
  })

  it("retorna 401 quando o token (query) esta ausente", async () => {
    const res = await handleWebhook(makeMetaReq(metaBody), "webhook-teste")
    expect(res.ok).toBe(false)
    expect(res.response!.status).toBe(401)
  })

  it("detecta o provider pela heuristica e monta ctx da empresa (provider META)", async () => {
    vi.mocked(prisma.empresa.findFirst).mockResolvedValue({
      id: "emp-meta",
      provider: "META",
      evolution_url: null,
      api_key: "access-token-do-cliente",
    })
    const res = await handleWebhook(
      makeMetaReq(metaBody, "http://localhost/api/webhook-teste?token=token-meta-valido"),
      "webhook-teste"
    )
    expect(res.ok).toBe(true)
    expect(res.message!.userInput).toBe("Olá, preciso de ajuda")
    expect(res.ctx!.provider).toBe("meta")
    expect(res.ctx!.instance).toBe("1029384756")
    expect(res.ctx!.apiKey).toBe("access-token-do-cliente")
    expect(res.provider!.name).toBe("meta")
    expect(prisma.empresa.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { evolution_token: "token-meta-valido" } })
    )
  })

  it("evento da Meta com status (sem mensagem) responde ok sem exigir token", async () => {
    const body = {
      object: "whatsapp_business_account",
      entry: [{ changes: [{ value: { statuses: [{ id: "wamid.1", status: "read" }] }, field: "messages" }] }],
    }
    const res = await handleWebhook(makeMetaReq(body), "webhook-teste")
    expect(res.ok).toBe(false)
    expect(res.response!.status).toBe(200)
  })
})

describe("handleWebhookVerify (GET da Meta)", () => {
  beforeEach(() => {
    vi.mocked(prisma.empresa.findFirst).mockReset()
  })

  it("devolve o challenge quando o verify_token bate com uma empresa", async () => {
    vi.mocked(prisma.empresa.findFirst).mockResolvedValue({ id: "emp-1" } as any)
    const req = new NextRequest(
      "http://localhost/api/webhook-teste?hub.mode=subscribe&hub.verify_token=token-empresa&hub.challenge=CHALLENGE_123",
      { method: "GET" }
    )
    const res = await handleWebhookVerify(req)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe("CHALLENGE_123")
  })

  it("responde 403 quando o verify_token nao bate", async () => {
    vi.mocked(prisma.empresa.findFirst).mockResolvedValue(null)
    const req = new NextRequest(
      "http://localhost/api/webhook-teste?hub.mode=subscribe&hub.verify_token=invalido&hub.challenge=X",
      { method: "GET" }
    )
    const res = await handleWebhookVerify(req)
    expect(res.status).toBe(403)
  })

  it("responde 405 quando nao e uma requisicao de verificacao", async () => {
    const req = new NextRequest("http://localhost/api/webhook-teste", { method: "GET" })
    const res = await handleWebhookVerify(req)
    expect(res.status).toBe(405)
  })
})
