import { describe, it, expect, vi, beforeEach } from "vitest"
import { detectFileIntent, FlowState, botIA4 } from "@/lib/useIA4"

describe("FlowState", () => {
  it("tem os estados esperados", () => {
    expect(FlowState.INICIO).toBe("inicio")
    expect(FlowState.IDENTIFICACAO_CPF).toBe("identificacao_cpf")
    expect(FlowState.IDENTIFICACAO_NOME).toBe("identificacao_nome")
    expect(FlowState.MENU_PRINCIPAL).toBe("menu_principal")
    expect(FlowState.COLETAR_MOTIVO).toBe("coletar_motivo")
    expect(FlowState.VERIFICAR_AVISOS).toBe("verificar_aviso")
    expect(FlowState.ESCOLHER_ABERTURA).toBe("escolher_abertura")
    expect(FlowState.COLETAR_SETOR).toBe("coletar_setor")
    expect(FlowState.PERGUNTAR_ANEXO).toBe("perguntar_anexo")
    expect(FlowState.COLETAR_MIDIA).toBe("coletar_midia")
    expect(FlowState.MOSTRAR_AVISO).toBe("mostrar_aviso")
    expect(FlowState.VINCULAR_TELEFONE).toBe("vincular_telefone")
  })


})

describe("detectFileIntent", () => {
  it('retorna "send_file" para palavras de envio com confirmacao', () => {
    expect(detectFileIntent("quero enviar foto")).toBe("send_file")
    expect(detectFileIntent("sim tenho comprovante")).toBe("send_file")
    expect(detectFileIntent("vou mandar o pdf")).toBe("send_file")
    expect(detectFileIntent("claro anexo o documento")).toBe("send_file")
  })

  it('retorna "send_file" para respostas curtas de confirmacao', () => {
    expect(detectFileIntent("sim")).toBe("send_file")
    expect(detectFileIntent("quero")).toBe("send_file")
    expect(detectFileIntent("ok")).toBe("send_file")
    expect(detectFileIntent("claro")).toBe("send_file")
    expect(detectFileIntent("mando")).toBe("send_file")
  })

  it('retorna "no_file" quando tem negacao antes de palavra de envio', () => {
    expect(detectFileIntent("nao tenho foto")).toBe("no_file")
    expect(detectFileIntent("sem comprovante")).toBe("no_file")
    expect(detectFileIntent("não tenho documento")).toBe("no_file")
    expect(detectFileIntent("nenhum anexo")).toBe("no_file")
    expect(detectFileIntent("não vou enviar nada")).toBe("no_file")
  })

  it('retorna "no_file" para frases de negacao direta', () => {
    expect(detectFileIntent("não")).toBe("no_file")
    expect(detectFileIntent("nao")).toBe("no_file")
    expect(detectFileIntent("sem arquivo")).toBe("no_file")
    expect(detectFileIntent("sem")).toBe("no_file")
    expect(detectFileIntent("nada")).toBe("no_file")
    expect(detectFileIntent("sem foto")).toBe("no_file")
  })

  it('retorna "no_file" para frases completas de negacao', () => {
    expect(detectFileIntent("só descrição")).toBe("no_file")
    expect(detectFileIntent("só o problema")).toBe("no_file")
  })

  it('retorna "continue" para texto sem relacao com arquivo', () => {
    expect(detectFileIntent("meu problema é elétrico")).toBe("continue")
    expect(detectFileIntent("qual o horario")).toBe("continue")
    expect(detectFileIntent("isso é um problema")).toBe("continue")
    expect(detectFileIntent("ajuda por favor")).toBe("continue")
  })

  it('retorna "continue" para textos que nao sao confirmacao nem negacao', () => {
    expect(detectFileIntent("talvez")).toBe("continue")
  })
})

describe("botIA4", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("retorna fallback quando OpenAI lanca erro", async () => {
    vi.doMock("openai", () => ({
      default: vi.fn().mockImplementation(() => ({
        chat: {
          completions: {
            create: vi.fn().mockRejectedValue(new Error("API error")),
          },
        },
      })),
    }))

    vi.doMock("@/lib/usedata", () => ({
      StatusChamado: vi.fn().mockResolvedValue([]),
      saudacao: vi.fn().mockReturnValue("Bom dia"),
    }))

    vi.doMock("@/lib/prisma", () => ({
      prisma: {
        cpfs: {
          findUnique: vi.fn().mockResolvedValue({ empresaId: "emp-1" }),
        },
        empresa: {
          findUnique: vi.fn().mockResolvedValue({
            nome: "Empresa Teste",
            botName: "Bot",
            botPrompt: null,
            botPresentation: null,
            botServiceDesc: null,
            botAvisosDesc: null,
            logoUrl: null,
          }),
        },
      },
    }))

    const { botIA4: botIA } = await import("@/lib/useIA4")
    const result = await botIA(
      { state: FlowState.INICIO, lastInteraction: Date.now() },
      "Olá",
      "test instruction",
      "Sem avisos."
    )
    expect(result).toBe("Pode repetir, por favor?")
  })
})
