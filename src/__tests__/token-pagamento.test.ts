import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

const ENV_BACKUP = { ...process.env }

beforeEach(() => {
  vi.resetModules()
  process.env = { ...ENV_BACKUP }
  process.env.NEXTAUTH_SECRET = "segredo-de-teste-super-seguro"
})

afterEach(() => {
  process.env = { ...ENV_BACKUP }
})

describe("token-pagamento", () => {
  it("gera token válido e recupera o empresaId", async () => {
    const { criarTokenPagamento, validarTokenPagamento } = await import("@/lib/token-pagamento")
    const token = criarTokenPagamento("emp-123")
    expect(typeof token).toBe("string")
    expect(validarTokenPagamento(token)).toBe("emp-123")
  })

  it("rejeita token adulterado", async () => {
    const { criarTokenPagamento, validarTokenPagamento } = await import("@/lib/token-pagamento")
    const token = criarTokenPagamento("emp-123")
    // altera o payload sem re-assinar
    const partes = token.split(".")
    const adulterado = Buffer.from(
      Buffer.from(token, "base64url").toString("utf8").replace("emp-123", "emp-999")
    ).toString("base64url")
    expect(validarTokenPagamento(adulterado)).toBeNull()
    expect(partes.length).toBeGreaterThan(0)
  })

  it("rejeita token expirado", async () => {
    const { criarTokenPagamento, validarTokenPagamento } = await import("@/lib/token-pagamento")
    const token = criarTokenPagamento("emp-123", -1000) // já expirado
    expect(validarTokenPagamento(token)).toBeNull()
  })

  it("rejeita token malformado", async () => {
    const { validarTokenPagamento } = await import("@/lib/token-pagamento")
    expect(validarTokenPagamento("lixo")).toBeNull()
    expect(validarTokenPagamento("")).toBeNull()
  })

  it("tokens com segredos diferentes não são intercambiáveis", async () => {
    const mod1 = await import("@/lib/token-pagamento")
    const token = mod1.criarTokenPagamento("emp-123")
    process.env.NEXTAUTH_SECRET = "outro-segredo"
    vi.resetModules()
    const mod2 = await import("@/lib/token-pagamento")
    expect(mod2.validarTokenPagamento(token)).toBeNull()
  })
})
