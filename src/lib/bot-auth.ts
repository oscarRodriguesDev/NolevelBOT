import { NextRequest } from "next/server"

// Valida a chave de API do bot no cabecalho da requisicao
export function validarBotApiKey(req: NextRequest): boolean {
  const apiKey = req.headers.get("x-api-key")
  const botApiKey = process.env.BOT_API_KEY
  if (!botApiKey) return false
  return apiKey === botApiKey
}
