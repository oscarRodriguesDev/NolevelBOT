import { NextRequest, NextResponse } from "next/server";
import { TTLMap } from "@/lib/ttl-map";
import { prisma } from "@/lib/prisma";
import {
  getOrCreateSession,
  handleExit,
  saveSession,
  webhookError,
} from "@/lib/webhook-core";
import { handleWebhook } from "@/lib/whatsapp/registry";

const FlowState = {
  INICIO: "inicio",
  COLETAR_NOME: "coletar_nome",
  COLETAR_TELEFONE: "coletar_telefone",
  COLETAR_INTERESSE: "coletar_interesse",
  CONFIRMAR: "confirmar",
} as const;

type Session = {
  state: string;
  nome?: string;
  telefone?: string;
  interesse?: string;
  empresaId?: string;
  lastInteraction: number;
};

const sessions = new TTLMap<string, Session>(120 * 60 * 1000);

export async function POST(req: NextRequest) {
  const r = await handleWebhook(req, "webhook-comercial");
  if (!r.ok) return r.response;

  try {
    const msg = r.message!;
    const ctx = r.ctx!;
    const provider = r.provider!;
    const { number, userInput, lowerInput } = msg;

    async function sendText(text: string) {
      return provider.sendText(ctx, number, text);
    }

    const session = getOrCreateSession(sessions, number, {
      state: FlowState.INICIO,
      lastInteraction: Date.now(),
    });

    const exit = await handleExit(userInput, ctx.instance, number, sessions, number, sendText);
    if (exit) return exit;

    switch (session.state) {
      case FlowState.INICIO: {
        await sendText(
          "Ola! Bem-vindo ao atendimento comercial. Para começar, me informe seu *nome* completo."
        );
        session.state = FlowState.COLETAR_NOME;
        break;
      }

      case FlowState.COLETAR_NOME: {
        if (!userInput || userInput.length < 2) {
          await sendText("Por favor, informe seu nome completo.");
          return NextResponse.json({ ok: true });
        }
        session.nome = userInput;
        await sendText(
          `Obrigado, ${session.nome}! Agora me informe seu *telefone* para contato (com DDD).`
        );
        session.state = FlowState.COLETAR_TELEFONE;
        break;
      }

      case FlowState.COLETAR_TELEFONE: {
        const telefone = userInput.replace(/\D/g, "");
        if (telefone.length < 8) {
          await sendText("Informe um telefone valido com DDD (apenas numeros).");
          return NextResponse.json({ ok: true });
        }
        session.telefone = userInput;
        await sendText(
          "Qual o seu *interesse*? Conte resumidamente o que esta buscando."
        );
        session.state = FlowState.COLETAR_INTERESSE;
        break;
      }

      case FlowState.COLETAR_INTERESSE: {
        if (!userInput || userInput.length < 3) {
          await sendText("Conte um pouco mais sobre seu interesse, por favor.");
          return NextResponse.json({ ok: true });
        }
        session.interesse = userInput;

        const resumo =
          `*Resumo do Cadastro:*\n\n` +
          `👤 Nome: ${session.nome}\n` +
          `📱 Telefone: ${session.telefone}\n` +
          `💼 Interesse: ${session.interesse}\n\n` +
          `Os dados estao corretos? (sim/nao)`;
        await sendText(resumo);
        session.state = FlowState.CONFIRMAR;
        break;
      }

      case FlowState.CONFIRMAR: {
        if (["sim", "s", "confirmar", "correto"].some(v => lowerInput.includes(v))) {
          try {
            await prisma.cpfsLeads.create({
              data: {
                cpf: `LEAD-${Date.now()}`,
                nome: session.nome || "",
                telefone: session.telefone || "",
                empresa: session.interesse || "",
              },
            });
            await sendText(
              "✅ *Cadastro concluido com sucesso!*\n\n" +
              "Em breve nossa equipe entrara em contato.\n" +
              "Obrigado pelo interesse! 🚀"
            );
          } catch {
            await sendText(
              "Ops, tive um problema ao salvar. Mas ja registrei seu contato manualmente. Em breve entraremos em contato!"
            );
          }
          sessions.delete(number);
          return NextResponse.json({ ok: true });
        } else {
          session.nome = undefined;
          session.telefone = undefined;
          session.interesse = undefined;
          await sendText("Tudo bem! Vamos recomecar. Me informe seu *nome* completo.");
          session.state = FlowState.COLETAR_NOME;
        }
        break;
      }
    }

    saveSession(sessions, number, session);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return webhookError("webhook-comercial")(error)
  }
}
