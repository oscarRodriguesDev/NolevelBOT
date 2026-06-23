import { NextRequest } from "next/server"
import { handleChatRequest } from "@/lib/chat-handler"

export async function POST(req: NextRequest) {
  return handleChatRequest(req, {
    rateLimitKey: "chat",
    hasInicioFlow: false,
  })
}
