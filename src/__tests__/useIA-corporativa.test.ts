import { describe, it, expect, vi, beforeEach } from "vitest"
import { detectFileIntent, FlowState } from "@/lib/useIA-corporativa"

describe("FlowState", () => {
  it("tem os estados esperados", () => {
    expect(FlowState.INICIO).toBe("inicio")
    expect(FlowState.IDENTIFICACAO_CPF).toBe("identificacao_cpf")
    expect(FlowState.MENU_PRINCIPAL).toBe("menu_principal")
    expect(FlowState.COLETAR_MOTIVO).toBe("coletar_motivo")
    expect(FlowState.PERGUNTAR_ANEXO).toBe("perguntar_anexo")
    expect(FlowState.COLETAR_MIDIA).toBe("coletar_midia")
    expect(FlowState.CONFIRMAR).toBe("confirmar")
    expect(FlowState.COLETAR_SETOR).toBe("coletar_setor")
  })
})

describe("detectFileIntent", () => {
  it('retorna "send_file" para palavras de envio', () => {
    expect(detectFileIntent("quero enviar foto")).toBe("send_file")
    expect(detectFileIntent("tenho comprovante")).toBe("send_file")
    expect(detectFileIntent("vou mandar o pdf")).toBe("send_file")
    expect(detectFileIntent("anexo o documento")).toBe("send_file")
  })

  it('retorna "send_file" para confirmacoes curtas', () => {
    expect(detectFileIntent("sim")).toBe("send_file")
    expect(detectFileIntent("quero")).toBe("send_file")
    expect(detectFileIntent("ok")).toBe("send_file")
    expect(detectFileIntent("claro")).toBe("send_file")
  })

  it('retorna "no_file" quando tem negacao antes de palavra de envio', () => {
    expect(detectFileIntent("nao tenho foto")).toBe("no_file")
    expect(detectFileIntent("sem comprovante")).toBe("no_file")
    expect(detectFileIntent("não tenho documento")).toBe("no_file")
    expect(detectFileIntent("nenhum anexo")).toBe("no_file")
  })

  it('retorna "continue" para texto sem relacao com arquivo', () => {
    expect(detectFileIntent("meu problema é elétrico")).toBe("continue")
    expect(detectFileIntent("qual o horario")).toBe("continue")
    expect(detectFileIntent("ajuda por favor")).toBe("continue")
  })
})

describe("botIA", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("retorna fallback quando OpenAI lanca erro", async () => {
    vi.doMock("@/lib/useIA-corporativa", () => ({
      FlowState,
      detectFileIntent,
      botIA: vi.fn().mockResolvedValue("Pode repetir, por favor?"),
    }))

    vi.doMock("openai", () => ({
      default: vi.fn().mockImplementation(() => ({
        chat: {
          completions: {
            create: vi.fn().mockRejectedValue(new Error("API error")),
          },
        },
      })),
    }))

    vi.doMock("@/lib/prisma", () => ({
      prisma: {
        empresa: {
          findUnique: vi.fn().mockResolvedValue({
            nome: "Empresa Teste",
            botName: "Bot",
            botPrompt: null,
          }),
        },
      },
    }))

    const { botIA } = await import("@/lib/useIA-corporativa")
    const result = await botIA(
      { state: FlowState.INICIO, cpf: "12345678901", nome: "Teste", lastInteraction: Date.now() },
      "Olá",
      "test instruction",
      "Sem avisos."
    )
    expect(result).toBe("Pode repetir, por favor?")
  })
})