import { NextRequest } from "next/server"

export function validarBotApiKey(req: NextRequest): boolean {
  const apiKey = req.headers.get("x-api-key")
  const botApiKey = process.env.BOT_API_KEY
  if (!botApiKey) return false
  return apiKey === botApiKey
}
