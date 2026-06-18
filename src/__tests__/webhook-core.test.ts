import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/usedata", () => ({
  sendEvolutionText: vi.fn().mockResolvedValue(undefined),
  downloadEvolutionMedia: vi.fn().mockResolvedValue(Buffer.from("test")),
}))

vi.mock("@/lib/upload", () => ({
  uploadBuffer: vi.fn().mockResolvedValue("https://test.url/file.pdf"),
}))

import { NextRequest } from "next/server"
import {
  parseWebhookMessage,
  handleExit,
  getOrCreateSession,
  saveSession,
  webhookError,
} from "@/lib/webhook-core"
import { TTLMap } from "@/lib/ttl-map"

describe("parseWebhookMessage", () => {
  const baseBody = {
    event: "messages.upsert",
    instance: "instancia123",
    data: {
      key: { remoteJid: "5511999999999@whatsapp.net" },
      message: { conversation: "Olá" },
    },
  }

  it("retorna null quando event nao e messages.upsert", () => {
    const result = parseWebhookMessage({ event: "other" })
    expect(result).toBeNull()
  })

  it("retorna null quando fromMe e true", () => {
    const body = {
      ...baseBody,
      data: { ...baseBody.data, key: { ...baseBody.data.key, fromMe: true } },
    }
    expect(parseWebhookMessage(body)).toBeNull()
  })

  it("retorna null quando nao tem message", () => {
    const body = { ...baseBody, data: { key: { remoteJid: "x" } } }
    expect(parseWebhookMessage(body)).toBeNull()
  })

  it("extrai conversation corretamente", () => {
    const result = parseWebhookMessage(baseBody)
    expect(result).not.toBeNull()
    expect(result!.number).toBe("5511999999999@whatsapp.net")
    expect(result!.instance).toBe("instancia123")
    expect(result!.userInput).toBe("Olá")
    expect(result!.lowerInput).toBe("olá")
    expect(result!.hasImage).toBe(false)
    expect(result!.hasDocument).toBe(false)
  })

  it("extrai extendedTextMessage", () => {
    const body = {
      ...baseBody,
      data: {
        ...baseBody.data,
        message: { extendedTextMessage: { text: "Mensagem longa" } },
      },
    }
    const result = parseWebhookMessage(body)
    expect(result!.userInput).toBe("Mensagem longa")
  })

  it("extrai caption de imageMessage", () => {
    const body = {
      ...baseBody,
      data: {
        ...baseBody.data,
        message: { imageMessage: { caption: "Foto legenda" } },
      },
    }
    const result = parseWebhookMessage(body)
    expect(result!.userInput).toBe("Foto legenda")
    expect(result!.hasImage).toBe(true)
  })

  it("detecta hasDocument", () => {
    const body = {
      ...baseBody,
      data: {
        ...baseBody.data,
        message: { documentMessage: { caption: "Documento" } },
      },
    }
    const result = parseWebhookMessage(body)
    expect(result!.hasDocument).toBe(true)
    expect(result!.hasMedia).toBe(true)
  })

  it("retorna string vazia quando sem texto e sem caption", () => {
    const body = {
      ...baseBody,
      data: {
        ...baseBody.data,
        message: { imageMessage: {} },
      },
    }
    const result = parseWebhookMessage(body)
    expect(result!.userInput).toBe("")
    expect(result!.hasImage).toBe(true)
  })
})

describe("handleExit", () => {
  const instance = "instancia"
  const number = "5511999999999@whatsapp.net"
  const sessionKey = "test-key"

  it("retorna NextResponse e deleta sessao quando input e sair", async () => {
    const sessions = new TTLMap<string, { state: string; lastInteraction: number }>(60000)
    sessions.set(sessionKey, { state: "MENU_PRINCIPAL", lastInteraction: Date.now() })
    const result = await handleExit("sair", instance, number, sessions, sessionKey)
    expect(result).not.toBeNull()
    expect(sessions.get(sessionKey)).toBeUndefined()
  })

  it("retorna NextResponse para encerrar", async () => {
    const sessions = new TTLMap<string, { state: string; lastInteraction: number }>(60000)
    const result = await handleExit("encerrar", instance, number, sessions, sessionKey)
    expect(result).not.toBeNull()
  })

  it("retorna NextResponse para cancelar", async () => {
    const sessions = new TTLMap<string, { state: string; lastInteraction: number }>(60000)
    const result = await handleExit("cancelar", instance, number, sessions, sessionKey)
    expect(result).not.toBeNull()
  })

  it("retorna null para input nao relacionado", async () => {
    const sessions = new TTLMap<string, { state: string; lastInteraction: number }>(60000)
    const result = await handleExit("quero abrir chamado", instance, number, sessions, sessionKey)
    expect(result).toBeNull()
  })
})

describe("getOrCreateSession", () => {
  it("cria nova sessao quando nao existe", () => {
    const sessions = new TTLMap<string, { state: string; lastInteraction: number }>(60000)
    const result = getOrCreateSession(sessions, "key1", {
      state: "INICIO",
      lastInteraction: 0,
    })
    expect(result.state).toBe("INICIO")
    expect(result.lastInteraction).toBeGreaterThan(0)
    expect(sessions.get("key1")).toBeDefined()
  })

  it("retorna sessao existente", () => {
    const sessions = new TTLMap<string, { state: string; lastInteraction: number }>(60000)
    sessions.set("key2", { state: "MENU_PRINCIPAL", lastInteraction: 1000 })
    const result = getOrCreateSession(sessions, "key2", {
      state: "INICIO",
      lastInteraction: 0,
    })
    expect(result.state).toBe("MENU_PRINCIPAL")
  })

  it("atualiza lastInteraction ao recuperar", () => {
    const sessions = new TTLMap<string, { state: string; lastInteraction: number }>(60000)
    sessions.set("key3", { state: "INICIO", lastInteraction: 1000 })
    const result = getOrCreateSession(sessions, "key3", {
      state: "INICIO",
      lastInteraction: 0,
    })
    expect(result.lastInteraction).toBeGreaterThan(1000)
  })
})

describe("saveSession", () => {
  it("salva sessao no map", () => {
    const sessions = new TTLMap<string, { state: string; lastInteraction: number }>(60000)
    const session = { state: "TESTE", lastInteraction: Date.now() }
    saveSession(sessions, "save-key", session)
    expect(sessions.get("save-key")).toEqual(session)
  })
})

describe("webhookError", () => {
  it("retorna NextResponse com ok true e nao propaga erro", () => {
    const handler = webhookError("testWebhook")
    const result = handler(new Error("algum erro"))
    expect(result).toBeDefined()
  })

  it("retorna status 200", () => {
    const handler = webhookError("testWebhook")
    const result = handler("string error")
    expect(result.status).toBe(200)
  })
})
