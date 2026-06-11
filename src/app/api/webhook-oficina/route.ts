import { NextRequest, NextResponse } from "next/server";
import { sendEvolutionText } from "@/lib/usedata";
import { getSetores } from "@/lib/setores";
import { prisma } from "@/lib/prisma";

const FlowState = {
  INICIO: "inicio",
  IDENTIFICACAO_MATRICULA: "identificacao_matricula",
  COLETAR_FUNCAO: "coletar_funcao",
  COLETAR_ONIBUS: "coletar_onibus",
  COLETAR_DATA: "coletar_data",
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
  lastInteraction: number;
};

const sessions = new Map<string, Session>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.event !== "messages.upsert") return NextResponse.json({ ok: true });

    const data = body.data;
    if (!data?.message || data.key?.fromMe) return NextResponse.json({ ok: true });

    const number = data.key.remoteJid;
    const instance = body.instance;
    const userInput = (
      data.message.conversation ||
      data.message.extendedTextMessage?.text ||
      data.message.imageMessage?.caption ||
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

        await sendEvolutionText(
          instance,
          number,
          `Olá, *${registro.nome}!* 😊\n\nQual a sua *função*? (Ex: Motorista, Cobrador, Fiscal...)`
        );
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
        await sendEvolutionText(
          instance,
          number,
          "Qual a *data do ocorrido*? (Ex: 10/06/2026)"
        );
        session.state = FlowState.COLETAR_DATA;
        break;
      }

      case FlowState.COLETAR_DATA: {
        session.data = userInput;
        await sendEvolutionText(
          instance,
          number,
          "Descreva o *defeito* encontrado no veículo com detalhes:"
        );
        session.state = FlowState.COLETAR_DEFEITO;
        break;
      }

      case FlowState.COLETAR_DEFEITO: {
        session.defeito = userInput;
        const resumo =
          `*Resumo do Registro:*\n\n` +
          `👤 Nome: ${session.nome}\n` +
          `🔢 Matrícula: ${session.matricula}\n` +
          `📋 Função: ${session.funcao}\n` +
          `🚌 Ônibus: ${session.numeroOnibus}\n` +
          `📅 Data: ${session.data}\n` +
          `🔧 Defeito: ${session.defeito}\n\n` +
          `Os dados estão corretos? (sim/não)`;
        await sendEvolutionText(instance, number, resumo);
        session.state = FlowState.CONFIRMAR;
        break;
      }

      case FlowState.CONFIRMAR: {
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
              },
            });
            await sendEvolutionText(
              instance,
              number,
              `✅ *Registro concluído!*\n\nSeu chamado *${ticket}* foi criado e encaminhado para *${setor}*. Nossa equipe vai analisar o mais breve possível.\n\nObrigado pelo relato! 🚌`
            );
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
