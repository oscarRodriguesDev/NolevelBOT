import { NextRequest, NextResponse } from "next/server";
import { sendEvolutionText, downloadEvolutionMedia } from "@/lib/usedata";
import { uploadBuffer } from "@/lib/upload";
import { getSetores } from "@/lib/setores";
import { prisma } from "@/lib/prisma";

const FlowState = {
  INICIO: "inicio",
  IDENTIFICACAO_MATRICULA: "identificacao_matricula",
  COLETAR_FUNCAO: "coletar_funcao",
  COLETAR_ONIBUS: "coletar_onibus",
  COLETAR_DEFEITO: "coletar_defeito",
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

const sessions = new Map<string, Session>();

async function buscarAvisosParaMotorista(
  empresaId: string,
  matricula: string,
  nome: string,
  numeroOnibus?: string
): Promise<string> {
  try {
    const avisos = await prisma.avisos.findMany({
      where: { empresaId },
      orderBy: { createdAt: "desc" },
    });

    if (avisos.length === 0) return "";

    const agora = new Date();
    const relevantes: string[] = [];

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
      const matchMatricula = matricula && (titulo.includes(matricula) || conteudo.includes(matricula));
      const matchNome = nome && (titulo.includes(nome.toLowerCase()) || conteudo.includes(nome.toLowerCase()));
      const matchOnibus = numeroOnibus && (titulo.includes(numeroOnibus.toLowerCase()) || conteudo.includes(numeroOnibus.toLowerCase()));

      if (matchMatricula || matchNome || matchOnibus) {
        relevantes.push(`📢 *${aviso.titulo}*: ${aviso.conteudo}`);
      }
    }

    return relevantes.length > 0 ? relevantes.join("\n\n") : "";
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.event !== "messages.upsert") return NextResponse.json({ ok: true });

    const data = body.data;
    if (!data?.message || data.key?.fromMe) return NextResponse.json({ ok: true });

    const number = data.key.remoteJid;
    const instance = body.instance;
    const hasImage = !!data.message.imageMessage;
    const hasMedia = hasImage || !!data.message.documentMessage;
    const caption = data.message.imageMessage?.caption || data.message.documentMessage?.caption || "";
    const userInput = (
      data.message.conversation ||
      data.message.extendedTextMessage?.text ||
      caption ||
      ""
    ).trim();
    const lowerInput = userInput.toLowerCase();

    let session = sessions.get(number);

    if (!session || Date.now() - session.lastInteraction > 1000 * 60 * 60 * 2) {
      session = { state: FlowState.INICIO, lastInteraction: Date.now() };
      sessions.set(number, session);
    }

    session.lastInteraction = Date.now();

    if (["sair", "encerrar", "cancelar"].includes(lowerInput)) {
      await sendEvolutionText(instance, number, "Atendimento encerrado. Quando precisar, é só me chamar!");
      sessions.delete(number);
      return NextResponse.json({ ok: true });
    }

    const sess = session;
    async function processMedia(): Promise<string | undefined> {
      if (!hasMedia) return undefined;

      const mediaMsg = data.message.imageMessage || data.message.documentMessage;
      const mimeType = mediaMsg.mimetype || "application/octet-stream";
      const ext = (mimeType.split("/").pop() || "bin").replace(/[^a-z0-9]/g, "");
      const nomeArquivo = data.message.documentMessage?.fileName || `anexo_${Date.now()}.${ext}`;

      const buffer = await downloadEvolutionMedia(instance, data.key, data.message?.base64, mediaMsg);

      if (buffer) {
        const url = await uploadBuffer({
          buffer,
          fileName: nomeArquivo,
          mimeType,
          folder: sess.matricula || "oficina",
        });

        if (url) {
          sess.anexoUrl = url;
          const tipo = hasImage ? "foto" : "documento";
          await sendEvolutionText(instance, number, `Recebi ${tipo === "foto" ? "a foto" : "o documento"}! ✅`);
        } else {
          await sendEvolutionText(instance, number, `Ops, tive um problema ao salvar o arquivo. Mas vou seguir com o registro mesmo assim.`);
        }
      } else {
        await sendEvolutionText(instance, number, `Não consegui baixar o arquivo. Mas vamos continuar!`);
      }

      return userInput || caption;
    }

    switch (session.state) {
      case FlowState.INICIO: {
        await sendEvolutionText(
          instance,
          number,
          `🚌 *Oficina - Registro de Defeito*\n\nBem-vindo! Para começar, digite sua *matrícula* (apenas números).`
        );
        session.state = FlowState.IDENTIFICACAO_MATRICULA;
        break;
      }

      case FlowState.IDENTIFICACAO_MATRICULA: {
        const matricula = userInput.replace(/\D/g, "");
        if (!matricula) {
          await sendEvolutionText(instance, number, "Digite sua matrícula com apenas números.");
          return NextResponse.json({ ok: true });
        }

        const registro = await prisma.cpfs.findFirst({ where: { cpf: matricula } });
        if (!registro) {
          await sendEvolutionText(instance, number, "Matrícula não encontrada. Verifique e tente novamente.");
          return NextResponse.json({ ok: true });
        }

        session.matricula = matricula;
        session.nome = registro.nome;
        session.empresaId = registro.empresaId;

        const avisosTexto = session.empresaId
          ? await buscarAvisosParaMotorista(session.empresaId, matricula, registro.nome)
          : "";

        let msg = `Olá, *${registro.nome}!* 😊`;

        if (avisosTexto) {
          msg += `\n\n*📢 Avisos importantes para você:*\n\n${avisosTexto}`;
        }

        msg += `\n\nQual a sua *função*? (Ex: Motorista, Fiscal...)`;

        await sendEvolutionText(instance, number, msg);
        session.state = FlowState.COLETAR_FUNCAO;
        break;
      }

      case FlowState.COLETAR_FUNCAO: {
        session.funcao = userInput;
        await sendEvolutionText(instance, number, "Qual o *número do ônibus*?");
        session.state = FlowState.COLETAR_ONIBUS;
        break;
      }

      case FlowState.COLETAR_ONIBUS: {
        session.numeroOnibus = userInput;

        session.data = new Date().toLocaleDateString("pt-BR", {
          timeZone: "America/Sao_Paulo"
        });

        const avisosVeiculo = session.empresaId && session.matricula && session.nome
          ? await buscarAvisosParaMotorista(session.empresaId, session.matricula, session.nome, userInput)
          : "";

        let msg = "Descreva o *defeito* encontrado no veículo com detalhes:";

        if (avisosVeiculo) {
          msg = `*📢 Aviso referente a este veículo:*\n\n${avisosVeiculo}\n\n---\n\n` + msg;
        }

        msg += `\n\nSe quiser, pode enviar também uma *foto* do problema.`;

        await sendEvolutionText(instance, number, msg);
        session.state = FlowState.COLETAR_DEFEITO;
        break;
      }

      case FlowState.COLETAR_DEFEITO: {
        if (hasMedia) {
          const texto = await processMedia();
          if (texto) {
            session.defeito = texto;
          } else if (!session.defeito) {
            await sendEvolutionText(instance, number, "Recebi! Agora me conte qual é o *defeito* para eu registrar.");
            return NextResponse.json({ ok: true });
          }
        } else {
          session.defeito = userInput;
        }

        if (!session.defeito) {
          await sendEvolutionText(instance, number, "Descreva o *defeito* encontrado no veículo com detalhes:");
          return NextResponse.json({ ok: true });
        }

        const resumo =
          `*Resumo do Registro:*\n\n` +
          `👤 Nome: ${session.nome}\n` +
          `🔢 Matrícula: ${session.matricula}\n` +
          `📋 Função: ${session.funcao}\n` +
          `🚌 Ônibus: ${session.numeroOnibus}\n` +
          `📅 Data: ${session.data}\n` +
          `🔧 Defeito: ${session.defeito}\n` +
          (session.anexoUrl ? `📎 Foto anexada: ✅\n` : "") +
          `\nOs dados estão corretos? (sim/não)`;
        await sendEvolutionText(instance, number, resumo);
        session.state = FlowState.CONFIRMAR;
        break;
      }

      case FlowState.CONFIRMAR: {
        if (hasMedia) {
          await processMedia();
          await sendEvolutionText(instance, number, `Os dados estão corretos? (sim/não)`);
          return NextResponse.json({ ok: true });
        }

        if (["sim", "s", "confirmar", "correto"].some(v => lowerInput.includes(v))) {
          const setores = await getSetores(session.matricula || '');
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

            await sendEvolutionText(instance, number, msg);
          } catch {
            const fallback = `TKT-FB-${Date.now()}`;
            await sendEvolutionText(
              instance,
              number,
              `Ops, tive um problema ao registrar. Mas anote o protocolo: *${fallback}*. Nossa equipe foi notificada.`
            );
          }

          sessions.delete(number);
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

    sessions.set(number, session);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro crítico no webhook-oficina:", error);
    return NextResponse.json({ ok: true });
  }
}
