import { NextRequest } from "next/server"
import { handleChatRequest } from "@/lib/chat-handler"

// Manipula requisicoes POST de chat generico
export async function POST(req: NextRequest) {
  return handleChatRequest(req, {
    rateLimitKey: "chat",
    hasInicioFlow: false,
  })
}
