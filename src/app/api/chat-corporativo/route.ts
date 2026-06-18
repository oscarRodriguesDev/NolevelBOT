import { NextRequest } from "next/server"
import { handleChatRequest } from "@/lib/chat-handler"

const corporativoColetarMotivoInstruction = `Analise o motivo relatado e os avisos disponíveis seguindo as instruções do sistema. IMPORTANTE: VOCÊ DEVE retornar APENAS uma destas opções sem explicar nada além disso:
- Se o motivo corresponde a um aviso E o aviso RESOLVE completamente: inicie com "AVISO_RESOLVE:" seguido da mensagem de encerramento.
- Em QUALQUER OUTRO caso (inclusive se não houver avisos ou se não corresponder): retorne APENAS a palavra "PROSSEGUIR_FLUXO".
NÃO responda a pergunta do usuário. NÃO liste chamados. NÃO converse. Apenas retorne o código.`

export async function POST(req: NextRequest) {
  return handleChatRequest(req, {
    rateLimitKey: "chat-corporativo",
    hasInicioFlow: true,
    coletarMotivoInstruction: corporativoColetarMotivoInstruction,
  })
}
