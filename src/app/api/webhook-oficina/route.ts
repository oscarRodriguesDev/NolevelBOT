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
  IDENTIFICACAO_MATRICULA: "identificacao_matricula",
  COLETAR_FUNCAO: "coletar_funcao",
  COLETAR_ONIBUS: "coletar_onibus",
  COLETAR_DEFEITO: "coletar_defeito",
  PERGUNTAR_ANEXO: "perguntar_anexo",
  COLETAR_MIDIA: "coletar_midia",
  CONFIRMAR: "confirmar",
  COLETAR_SETOR: "coletar_setor",
} as const;

type Session = {
  state: string;
  nome?: string;
  matricula?: string;
  funcao?: string;
  numeroOnibus?: string;
  data?: string;
  defeito?: string;
  empresaId?: string;
  anexoUrl?: string;
  lastInteraction: number;
};

const sessions = new TTLMap<string, Session>(120 * 60 * 1000);

// Busca avisos especificos para uma matricula dentro de uma empresa
async function buscarAvisosEspecificos(
  empresaId: string,
  matricula: string
): Promise<string> {
  try {
    const avisos = await prisma.avisos.findMany({
      where: { empresaId },
      orderBy: { createdAt: "desc" },
    });

    if (avisos.length === 0) return "";

    const agora = new Date();
    const relevantes: string[] = [];
    const matLower = matricula.toLowerCase();

    for (const aviso of avisos) {
      if (aviso.duracao) {
        const dias = Number(aviso.duracao);
        if (!isNaN(dias)) {
          const expiracao = new Date(aviso.createdAt);
          expiracao.setDate(expiracao.getDate() + dias);
          if (agora > expiracao) continue;
        }
      }

      const titulo = aviso.titulo.toLowerCase();
      const conteudo = aviso.conteudo.toLowerCase();

      if (titulo.includes(matLower) || conteudo.includes(matLower)) {
        relevantes.push(`📢 *${aviso.titulo}*: ${aviso.conteudo}`);
      }
    }

    return relevantes.length > 0 ? relevantes.join("\n\n") : "";
  } catch {
    return "";
  }
}

// Busca avisos especificos para um veiculo dentro de uma empresa
async function buscarAvisosDoVeiculo(
  empresaId: string,
  numeroOnibus: string
): Promise<string> {
  try {
    const avisos = await prisma.avisos.findMany({
      where: { empresaId },
      orderBy: { createdAt: "desc" },
    });

    if (avisos.length === 0) return "";

    const agora = new Date();
    const relevantes: string[] = [];
    const onibusLower = numeroOnibus.toLowerCase();

    for (const aviso of avisos) {
      if (aviso.duracao) {
        const dias = Number(aviso.duracao);
        if (!isNaN(dias)) {
          const expiracao = new Date(aviso.createdAt);
          expiracao.setDate(expiracao.getDate() + dias);
          if (agora > expiracao) continue;
        }
      }

      const titulo = aviso.titulo.toLowerCase();
      const conteudo = aviso.conteudo.toLowerCase();

      if (titulo.includes(onibusLower) || conteudo.includes(onibusLower)) {
        relevantes.push(`📢 *${aviso.titulo}*: ${aviso.conteudo}`);
      }
    }

    return relevantes.length > 0 ? relevantes.join("\n\n") : "";
  } catch {
    return "";
  }
}

// Processa mensagens do webhook da oficina para registro de defeitos veiculares
export async function POST(req: NextRequest) {
  const rateLimit = await rateLimited(req, "webhook-oficina")
  if (rateLimit) return rateLimit

  try {
    const body = await req.json();
    const msg = parseWebhookMessage(body);
    if (!msg) return NextResponse.json({ ok: true });

    const { number, instance, userInput, lowerInput, hasImage, hasDocument, hasMedia } = msg;
    const data = body.data;

    const evolutionUrl = body?.server_url || "";
    const evolutionApiKey = body?.apikey || "";

    if (evolutionApiKey) {
      const empresa = await prisma.empresa.findFirst({ where: { evolution_token: evolutionApiKey } });
      if (!empresa) {
        console.warn("apikey invalida recebida no webhook-oficina:", evolutionApiKey);
      }
    }

    async function sendText(text: string) {
      return sendEvolutionText(instance, number, text, evolutionUrl, evolutionApiKey);
    }

    const session = getOrCreateSession(sessions, number, {
      state: FlowState.INICIO,
      lastInteraction: Date.now(),
    });

    const exit = await handleExit(userInput, instance, number, sessions, number);
    if (exit) return exit;

    const sess = session;
    // Processa midia recebida e armazena URL na sessao da oficina
    async function processMedia(): Promise<string | undefined> {
      const url = await processWebhookMedia(data, instance, number, hasImage, hasDocument, sess.matricula || "oficina");
      if (url) sess.anexoUrl = url;
      return userInput;
    }

    switch (session.state) {
      case FlowState.INICIO: {
        await sendText(
          `🚌 *Oficina - Registro de Defeito*\n\nBem-vindo! Para começar, digite sua *matrícula* (apenas números).`
        );
        session.state = FlowState.IDENTIFICACAO_MATRICULA;
        break;
      }

      case FlowState.IDENTIFICACAO_MATRICULA: {
        const matricula = userInput.replace(/\D/g, "");
        if (!matricula) {
          await sendText( "Digite sua matrícula com apenas números.");
          return NextResponse.json({ ok: true });
        }

        const registro = await prisma.cpfs.findFirst({ where: { cpf: matricula } });
        if (!registro) {
          await sendText( "Matrícula não encontrada. Verifique e tente novamente.");
          return NextResponse.json({ ok: true });
        }

        session.matricula = matricula;
        session.nome = registro.nome;
        session.empresaId = registro.empresaId;

        if (session.empresaId) {
          const { hasModule, activeModules } = await checkEmpresaModule(session.empresaId, "OFICINA");
          if (!hasModule) {
            const modulosMsg = activeModules.length > 0
              ? `Sua empresa possui o(s) módulo(s): ${activeModules.join(", ")}.`
              : "Sua empresa não possui módulos de atendimento ativos.";
            await sendText(
              `Olá, ${registro.nome}! Sua matrícula foi encontrada ✅, mas sua empresa não possui o módulo *OFICINA* ativo.\n\n${modulosMsg}\n\nPor favor, utilize o canal de atendimento correto para o módulo desejado. Se precisar de ajuda, entre em contato com a administração da sua empresa.`
            );
            sessions.delete(number);
            return NextResponse.json({ ok: true });
          }
        }

        const avisosEspecificos = session.empresaId
          ? await buscarAvisosEspecificos(session.empresaId, matricula)
          : "";

        await sendText(
          `Olá, *${registro.nome}!* 😊`
        );

        if (avisosEspecificos) {
          await sendText(
            `*📢 Aviso importante para você:*\n\n${avisosEspecificos}`
          );
        }

        await sendText(
          `Qual a sua *função*? (Ex: Motorista, Fiscal...)`
        );
        session.state = FlowState.COLETAR_FUNCAO;
        break;
      }

      case FlowState.COLETAR_FUNCAO: {
        session.funcao = userInput;
        await sendText( "Qual a identificação do veiculo?");
        session.state = FlowState.COLETAR_ONIBUS;
        break;
      }

      case FlowState.COLETAR_ONIBUS: {
        session.numeroOnibus = userInput;

        session.data = new Date().toLocaleDateString("pt-BR", {
          timeZone: "America/Sao_Paulo"
        });

        const avisosVeiculo = session.empresaId && userInput
          ? await buscarAvisosDoVeiculo(session.empresaId, userInput)
          : "";

        let msg = "Descreva o *defeito* encontrado no veículo com detalhes:";

        if (avisosVeiculo) {
          msg = `*📢 Aviso referente a este veículo:*\n\n${avisosVeiculo}\n\n---\n\n` + msg;
        }

        await sendText( msg);
        session.state = FlowState.COLETAR_DEFEITO;
        break;
      }

      case FlowState.COLETAR_DEFEITO: {
        if (hasMedia) {
          const texto = await processMedia();
          if (texto) {
            session.defeito = texto;
          } else if (!session.defeito) {
            await sendText( "Recebi! Agora me conte qual é o *defeito* para eu registrar.");
            return NextResponse.json({ ok: true });
          }
          if (session.defeito) {
            const resumo = montarResumo(session);
            await sendText( resumo);
            session.state = FlowState.CONFIRMAR;
          }
        } else {
          session.defeito = userInput;
          if (!session.defeito) {
            await sendText( "Descreva o *defeito* encontrado no veículo com detalhes:");
            return NextResponse.json({ ok: true });
          }
          await sendText(
            "Deseja enviar uma *foto* do problema? (sim/não)"
          );
          session.state = FlowState.PERGUNTAR_ANEXO;
        }
        break;
      }

      case FlowState.PERGUNTAR_ANEXO: {
        if (hasMedia) {
          await processMedia();
          await sendText( montarResumo(session));
          session.state = FlowState.CONFIRMAR;
        } else if (["sim", "s", "quero", "ok"].some(v => lowerInput.includes(v))) {
          await sendText(
            "Pode enviar a *foto* aqui mesmo! 📎"
          );
          session.state = FlowState.COLETAR_MIDIA;
        } else {
          await sendText( montarResumo(session));
          session.state = FlowState.CONFIRMAR;
        }
        break;
      }

      case FlowState.COLETAR_MIDIA: {
        if (hasMedia) {
          await processMedia();
          await sendText( montarResumo(session));
          session.state = FlowState.CONFIRMAR;
        } else if (["não", "nao", "n", "sem foto", "sem arquivo"].some(v => lowerInput.includes(v))) {
          await sendText( montarResumo(session));
          session.state = FlowState.CONFIRMAR;
        } else {
          await sendText(
            "Pode enviar a *foto* por aqui mesmo! 📎\n\nSe não quiser, digite *não*."
          );
        }
        break;
      }

      case FlowState.CONFIRMAR: {
        if (hasMedia) {
          await processMedia();
          await sendText( `Os dados estão corretos? (sim/não)`);
          return NextResponse.json({ ok: true });
        }

        if (["sim", "s", "confirmar", "correto"].some(v => lowerInput.includes(v))) {
          const setores = await getSetores(session.matricula || '');
          if (setores.length === 0) {
            await sendText(
              "Nenhum setor disponível para encaminhamento. Entre em contato com a administração."
            );
            return NextResponse.json({ ok: true });
          }
          await sendText(
            `Pra qual *setor* devo encaminhar?\n\n📍 *Setores disponíveis:* ${setores.join(", ")}`
          );
          session.state = FlowState.COLETAR_SETOR;
        } else {
          session.anexoUrl = undefined;
          await sendText(
            "Tudo bem! Vamos recomeçar. Digite sua matrícula:"
          );
          session.state = FlowState.IDENTIFICACAO_MATRICULA;
        }
        break;
      }

      case FlowState.COLETAR_SETOR: {
        const setores = await getSetores(session.matricula || '');
        const input = lowerInput.trim();
        const setor = setores.find(s => {
          const nomeSetor = s.toLowerCase();
          return nomeSetor.includes(input) || input.includes(nomeSetor);
        });

        if (setor) {
          const descricao = JSON.stringify({
            funcao: session.funcao,
            numeroOnibus: session.numeroOnibus,
            data: session.data,
            defeito: session.defeito,
          });

          const ticket = `TKT-${Date.now()}`;

          try {
            await prisma.chamado.create({
              data: {
                ticket,
                nome: session.nome || '',
                cpf: session.matricula || '',
                setor,
                descricao,
                prioridade: 'normal',
                empresaId: session.empresaId || '',
                anexoUrl: session.anexoUrl || null,
              },
            });

            let msg = `✅ *Registro concluído!*\n\nSeu chamado *${ticket}* foi criado e encaminhado para *${setor}*.`;
            if (session.anexoUrl) {
              msg += `\n📎 A foto foi anexada automaticamente.`;
            }
            msg += `\n\nNossa equipe vai analisar o mais breve possível.\n\nObrigado pelo relato! 🚌`;
          
            await sendText( msg);
            sessions.delete(number);
            return NextResponse.json({ ok: true });
          } catch {
            const fallback = `TKT-FB-${Date.now()}`;
            await sendText(
              `Ops, tive um problema ao registrar. Mas anote o protocolo: *${fallback}*. Nossa equipe foi notificada.`
            );
            sessions.delete(number);
            return NextResponse.json({ ok: true });
          }
        } else {
          await sendText(
            `Não encontrei esse setor. Os disponíveis são: ${setores.join(", ")}. Qual deles atende seu caso?`
          );
        }
        break;
      }
    }

    saveSession(sessions, number, session);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return webhookError("webhook-oficina")(error)
  }
}

// Monta o resumo formatado do registro de defeito para confirmacao
function montarResumo(session: Session): string {
  return (
    `*Resumo do Registro:*\n\n` +
    `👤 Nome: ${session.nome}\n` +
    `🔢 Matrícula: ${session.matricula}\n` +
    `📋 Função: ${session.funcao}\n` +
    `🚌 Ônibus: ${session.numeroOnibus}\n` +
    `📅 Data: ${session.data}\n` +
    `🔧 Defeito: ${session.defeito}\n` +
    (session.anexoUrl ? `📎 Foto anexada: ✅\n` : "") +
    `\nOs dados estão corretos? (sim/não)`
  );
}
