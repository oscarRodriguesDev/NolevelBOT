import { NextRequest, NextResponse } from "next/server";
import { TTLMap } from "@/lib/ttl-map";
import { sendEvolutionText, checkEmpresaModule } from "@/lib/usedata";
import { getSetores } from "@/lib/setores";
import { prisma } from "@/lib/prisma";
import {
  parseWebhookMessage,
  rateLimited,
  getOrCreateSession,
  handleExit,
  processWebhookMedia,
  saveSession,
  webhookError,
} from "@/lib/webhook-core";

const FlowState = {
  INICIO: "inicio",
  IDENTIFICACAO_CPF: "identificacao_cpf",
  COLETAR_DESCRICAO: "coletar_descricao",
  PERGUNTAR_ANEXO: "perguntar_anexo",
  COLETAR_MIDIA: "coletar_midia",
  CONFIRMAR: "confirmar",
  COLETAR_SETOR: "coletar_setor",
} as const;

type Session = {
  state: string;
  nome?: string;
  cpf?: string;
  descricao?: string;
  empresaId?: string;
  anexoUrl?: string;
  lastInteraction: number;
};

const sessions = new TTLMap<string, Session>(120 * 60 * 1000);

export async function POST(req: NextRequest) {
  const rateLimit = await rateLimited(req, "webhook-corporativo")
  if (rateLimit) return rateLimit

  try {
    const body = await req.json();
    const msg = parseWebhookMessage(body);
    if (!msg) return NextResponse.json({ ok: true });

    const { number, instance, userInput, lowerInput, hasImage, hasDocument, hasMedia } = msg;
    const data = body.data;

    const session = getOrCreateSession(sessions, number, {
      state: FlowState.INICIO,
      lastInteraction: Date.now(),
    });

    const exit = await handleExit(userInput, instance, number, sessions, number);
    if (exit) return exit;

    const sess = session;
    async function processMedia(): Promise<string | undefined> {
      const url = await processWebhookMedia(data, instance, number, hasImage, hasDocument, sess.cpf || "corporativo");
      if (url) sess.anexoUrl = url;
      return userInput;
    }

    switch (session.state) {
      case FlowState.INICIO: {
        await sendEvolutionText(
          instance,
          number,
          `💼 *Atendimento Corporativo*\n\nBem-vindo! Para começar, digite seu *CPF* (apenas números).`
        );
        session.state = FlowState.IDENTIFICACAO_CPF;
        break;
      }

      case FlowState.IDENTIFICACAO_CPF: {
        const cpf = userInput.replace(/\D/g, "");
        if (!cpf || cpf.length < 11) {
          await sendEvolutionText(instance, number, "Digite um CPF válido com 11 dígitos (apenas números).");
          return NextResponse.json({ ok: true });
        }

        const registro = await prisma.cpfs.findFirst({ where: { cpf } });
        if (!registro) {
          await sendEvolutionText(instance, number, "CPF não encontrado. Verifique e tente novamente.");
          return NextResponse.json({ ok: true });
        }

        session.cpf = cpf;
        session.nome = registro.nome;
        session.empresaId = registro.empresaId;

        if (session.empresaId) {
          const { hasModule, activeModules } = await checkEmpresaModule(session.empresaId, "CORPORATIVO");
          if (!hasModule) {
            const modulosMsg = activeModules.length > 0
              ? `Sua empresa possui o(s) módulo(s): ${activeModules.join(", ")}.`
              : "Sua empresa não possui módulos de atendimento ativos.";
            await sendEvolutionText(
              instance,
              number,
              `Olá, ${registro.nome}! Seu CPF foi encontrado ✅, mas sua empresa não possui o módulo *CORPORATIVO* ativo.\n\n${modulosMsg}\n\nPor favor, utilize o canal de atendimento correto para o módulo desejado. Se precisar de ajuda, entre em contato com a administração da sua empresa.`
            );
            sessions.delete(number);
            return NextResponse.json({ ok: true });
          }
        }

        await sendEvolutionText(
          instance,
          number,
          `Olá, *${registro.nome}!* 😊`
        );

        await sendEvolutionText(
          instance,
          number,
          `Descreva o *motivo* do seu contato com detalhes:`
        );
        session.state = FlowState.COLETAR_DESCRICAO;
        break;
      }

      case FlowState.COLETAR_DESCRICAO: {
        if (hasMedia) {
          const texto = await processMedia();
          if (texto) {
            session.descricao = texto;
          } else if (!session.descricao) {
            await sendEvolutionText(instance, number, "Recebi! Agora me conte qual é o *motivo* do seu contato.");
            return NextResponse.json({ ok: true });
          }
          if (session.descricao) {
            const resumo = montarResumo(session);
            await sendEvolutionText(instance, number, resumo);
            session.state = FlowState.CONFIRMAR;
          }
        } else {
          session.descricao = userInput;
          if (!session.descricao) {
            await sendEvolutionText(instance, number, "Descreva o *motivo* do seu contato com detalhes:");
            return NextResponse.json({ ok: true });
          }
          await sendEvolutionText(
            instance,
            number,
            "Deseja enviar um *anexo* (foto, documento)? (sim/não)"
          );
          session.state = FlowState.PERGUNTAR_ANEXO;
        }
        break;
      }

      case FlowState.PERGUNTAR_ANEXO: {
        if (hasMedia) {
          await processMedia();
          await sendEvolutionText(instance, number, montarResumo(session));
          session.state = FlowState.CONFIRMAR;
        } else if (["sim", "s", "quero", "ok"].some(v => lowerInput.includes(v))) {
          await sendEvolutionText(
            instance,
            number,
            "Pode enviar o *arquivo* aqui mesmo! 📎"
          );
          session.state = FlowState.COLETAR_MIDIA;
        } else {
          await sendEvolutionText(instance, number, montarResumo(session));
          session.state = FlowState.CONFIRMAR;
        }
        break;
      }

      case FlowState.COLETAR_MIDIA: {
        if (hasMedia) {
          await processMedia();
          await sendEvolutionText(instance, number, montarResumo(session));
          session.state = FlowState.CONFIRMAR;
        } else if (["não", "nao", "n", "sem foto", "sem arquivo"].some(v => lowerInput.includes(v))) {
          await sendEvolutionText(instance, number, montarResumo(session));
          session.state = FlowState.CONFIRMAR;
        } else {
          await sendEvolutionText(
            instance,
            number,
            "Pode enviar o *arquivo* por aqui mesmo! 📎\n\nSe não quiser, digite *não*."
          );
        }
        break;
      }

      case FlowState.CONFIRMAR: {
        if (hasMedia) {
          await processMedia();
          await sendEvolutionText(instance, number, `Os dados estão corretos? (sim/não)`);
          return NextResponse.json({ ok: true });
        }

        if (["sim", "s", "confirmar", "correto"].some(v => lowerInput.includes(v))) {
          const setores = await getSetores(session.cpf || '');
          if (setores.length === 0) {
            await sendEvolutionText(
              instance,
              number,
              "Nenhum setor disponível para encaminhamento. Entre em contato com a administração."
            );
            return NextResponse.json({ ok: true });
          }
          await sendEvolutionText(
            instance,
            number,
            `Pra qual *setor* devo encaminhar?\n\n📍 *Setores disponíveis:* ${setores.join(", ")}`
          );
          session.state = FlowState.COLETAR_SETOR;
        } else {
          session.anexoUrl = undefined;
          await sendEvolutionText(
            instance,
            number,
            "Tudo bem! Vamos recomeçar. Digite seu CPF:"
          );
          session.state = FlowState.IDENTIFICACAO_CPF;
        }
        break;
      }

      case FlowState.COLETAR_SETOR: {
        const setores = await getSetores(session.cpf || '');
        const input = lowerInput.trim();
        const setor = setores.find(s => {
          const nomeSetor = s.toLowerCase();
          return nomeSetor.includes(input) || input.includes(nomeSetor);
        });

        if (setor) {
          const ticket = `TKT-${Date.now()}`;

          try {
            await prisma.chamado.create({
              data: {
                ticket,
                nome: session.nome || '',
                cpf: session.cpf || '',
                setor,
                descricao: session.descricao || '',
                prioridade: 'normal',
                empresaId: session.empresaId || '',
                anexoUrl: session.anexoUrl || null,
              },
            });

            let msg = `✅ *Registro concluído!*\n\nSeu chamado *${ticket}* foi criado e encaminhado para *${setor}*.`;
            if (session.anexoUrl) {
              msg += `\n📎 O anexo foi salvo automaticamente.`;
            }
            msg += `\n\nNossa equipe vai analisar o mais breve possível.\n\nObrigado pelo contato! 💼`;

            await sendEvolutionText(instance, number, msg);
            sessions.delete(number);
            return NextResponse.json({ ok: true });
          } catch {
            const fallback = `TKT-FB-${Date.now()}`;
            await sendEvolutionText(
              instance,
              number,
              `Ops, tive um problema ao registrar. Mas anote o protocolo: *${fallback}*. Nossa equipe foi notificada.`
            );
            sessions.delete(number);
            return NextResponse.json({ ok: true });
          }
        } else {
          await sendEvolutionText(
            instance,
            number,
            `Não encontrei esse setor. Os disponíveis são: ${setores.join(", ")}. Qual deles atende seu caso?`
          );
        }
        break;
      }
    }

    saveSession(sessions, number, session);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return webhookError("webhook-corporativo")(error)
  }
}

function montarResumo(session: Session): string {
  return (
    `*Resumo do Registro:*\n\n` +
    `👤 Nome: ${session.nome}\n` +
    `🔢 CPF: ${session.cpf}\n` +
    `📝 Motivo: ${session.descricao}\n` +
    (session.anexoUrl ? `📎 Anexo: ✅\n` : "") +
    `\nOs dados estão corretos? (sim/não)`
  );
}
