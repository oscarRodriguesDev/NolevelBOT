import OpenAI from "openai";

//retorna instancia do cliente OpenAI
function getOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Analisa se o motivo do contato do usuario corresponde a algum aviso disponivel
// e, se corresponder, gera uma mensagem personalizada apresentando o aviso.
// Usa a mesma chave OPENAI_API_KEY das demais funcionalidades do bot.
export async function analisarAvisoPorMotivo(
  motivo: string,
  avisos: string
): Promise<{ corresponde: boolean; mensagem: string | null }> {
  try {
    const openai = getOpenAI();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um assistente que analisa se o problema relatado por um usuário corresponde a algum aviso disponibilizado pela empresa.

Avisos disponíveis:
${avisos}

Instruções:
1. Analise o MOTIVO relatado pelo usuário e compare com os avisos.
2. Considere correspondência quando o assunto for relacionado, mesmo que o usuário não use as mesmas palavras.
3. Se houver correspondência, gere uma MENSAGEM PERSONALIZADA que apresente o aviso ao usuário de forma natural, acolhedora e útil, relacionando com o problema que ele relatou. Não invente informações que não estejam no aviso.
4. Se NÃO houver correspondência, retorne APENAS o JSON: {"corresponde": false}

Responda APENAS com JSON no formato: {"corresponde": true, "mensagem": "texto personalizado"} ou {"corresponde": false}`,
        },
        {
          role: "user",
          content: `Motivo relatado: ${motivo}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 250,
    });

    const content = response.choices[0]?.message?.content || "";
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return { corresponde: false, mensagem: null };

    const parsed = JSON.parse(match[0]) as {
      corresponde?: boolean;
      mensagem?: string;
    };

    if (parsed.corresponde && parsed.mensagem) {
      return { corresponde: true, mensagem: parsed.mensagem.trim() };
    }

    return { corresponde: false, mensagem: null };
  } catch (error) {
    console.error("analisarAvisoPorMotivo error:", error);
    return { corresponde: false, mensagem: null };
  }
}
