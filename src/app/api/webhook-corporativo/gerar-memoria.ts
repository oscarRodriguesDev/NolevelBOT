import OpenAI from "openai";
import type { CorporateSession } from "@/lib/useIA-corporativa";

function getOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function gerarResumoMemoria(session: CorporateSession): Promise<string | null> {
  if (!session.cpf || !session.motivoAtual) return null;

  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Gere um resumo de 1-2 frases sobre este usuario baseado no atendimento atual. " +
            "Inclua: nome, tipo de problema relatado, e qualquer informacao relevante. " +
            "Seja conciso. Nao invente informacoes.",
        },
        {
          role: "user",
          content: `Nome: ${session.nome}\nMotivo: ${session.motivoAtual}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 80,
    });

    return response.choices[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}