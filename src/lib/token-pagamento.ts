// Token efêmero e assinado (HMAC) para a página de pagamento pós-signup.
// O signup cria a conta ANTES do login; o token permite que a página /pagamento
// e a API identifiquem a empresa recém-criada sem expor dados sensíveis.
import crypto from "crypto"

const SEGREDO = process.env.NEXTAUTH_SECRET || process.env.SECRET || "dev-secret-token-pagamento"

const SEPARADOR = "."

function hmac(dado: string): string {
  return crypto.createHmac("sha256", SEGREDO).update(dado).digest("hex")
}

// Gera um token do tipo `empresaId.assinatura` com validade de 1 hora.
export function criarTokenPagamento(empresaId: string, ttlMs = 60 * 60 * 1000): string {
  const expira = Date.now() + ttlMs
  const payload = `${empresaId}${SEPARADOR}${expira}`
  const sig = hmac(payload)
  return Buffer.from(`${payload}${SEPARADOR}${sig}`).toString("base64url")
}

// Valida o token (assinatura + expiração) e retorna o empresaId, ou null.
export function validarTokenPagamento(token: string): string | null {
  try {
    const decodificado = Buffer.from(token, "base64url").toString("utf8")
    const partes = decodificado.split(SEPARADOR)
    if (partes.length !== 3) return null

    const [empresaId, expiraRaw, sig] = partes
    const expira = Number(expiraRaw)
    if (!empresaId || !Number.isFinite(expira)) return null

    // Valida expiração ANTES da assinatura (evita trabalho desnecessário)
    if (Date.now() > expira) return null

    // timing-safe: evita comparação não constante
    const esperado = hmac(`${empresaId}${SEPARADOR}${expiraRaw}`)
    const ok = crypto.timingSafeEqual(
      Buffer.from(esperado),
      Buffer.from(sig)
    )
    return ok ? empresaId : null
  } catch {
    return null
  }
}
