import { NextRequest, NextResponse } from "next/server";
import { botIA, FlowState } from "@/lib/useIA";
import type { UserSession } from "@/lib/useIA";
import {
  validarCpf,
  StatusChamado,
  enviarChamado,
  sendEvolutionText,
  generateRandomTicket,
  buscarAvisos,
  downloadEvolutionMedia
} from "@/lib/usedata";
import { uploadBuffer } from "@/lib/upload";
import { registerPhone } from "@/lib/phoneMap";
import { getSetores } from "@/lib/setores";
import { detectFileIntent } from "@/lib/useIA2";

const menuString = "1. Abrir Chamado, 2. Consultar Chamado";

const statusLabels: Record<string, string> = {
  novo: "📌 Novo",
  aberto: "📂 Aberto",
  em_atendimento: "🔄 Em Atendimento",
  aguardando: "⏳ Aguardando",
  concluido: "✅ Concluído",
  fechado: "🔒 Fechado",
  NOVO: "📌 Novo",
  EM_ANDAMENTO: "🔄 Em Andamento",
  FECHADO: "🔒 Fechado",
};

type Webhook25Session = UserSession & {
  anexoUrl?: string;
};

const sessions = new Map<string, Webhook25Session>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.event !== "messages.upsert") return NextResponse.json({ ok: true });

    const data = body.data;
    if (!data?.message || data.key?.fromMe) return NextResponse.json({ ok: true });

    const number = data.key.remoteJid;
    const instance = body.instance;
    const hasImage = !!data.message.imageMessage;
    const hasDocument = !!data.message.documentMessage;
    const hasMedia = hasImage || hasDocument;

    const caption = data.message.imageMessage?.caption || data.message.documentMessage?.caption || "";
    const userInput = (data.message.conversation || data.message.extendedTextMessage?.text || caption || "").trim();
    const lowerInput = userInput.toLowerCase();

    let session = sessions.get(number);

    if (!session || Date.now() - session.lastInteraction > 1000 * 60 * 60 * 2) {
      session = { state: FlowState.INICIO, lastInteraction: Date.now() };
      sessions.set(number, session);
    }

    session.lastInteraction = Date.now();

    let avisos = "Sem avisos no momento.";
    if (session.cpf) {
      avisos = await buscarAvisos(session.cpf, req);
    }

    if (["sair", "encerrar", "cancelar"].includes(lowerInput)) {
      await sendEvolutionText(instance, number, "Tudo bem, atendimento encerrado. Quando precisar é só me chamar de volta!");
      sessions.delete(number);
      return NextResponse.json({ ok: true });
    }

    switch (session.state) {
      case FlowState.INICIO: {
        await sendEvolutionText(instance, number, "Olá! Eu sou a Hevelyn, sua assistente virtual. 😊\n\nPara começar, me informe seu CPF (só os números) que eu te ajudo.");
        session.state = FlowState.IDENTIFICACAO_CPF;
        break;
      }

      case FlowState.IDENTIFICACAO_CPF: {
        const cleanCPF = userInput.replace(/\D/g, "");

        if (cleanCPF.length !== 11) {
          await sendEvolutionText(instance, number, "Hum, esse CPF não parece completo… Pode digitar só os 11 números?");
          return NextResponse.json({ ok: true });
        }

        const resCpf = await validarCpf(cleanCPF);

        if (resCpf && resCpf.valido) {
          session.cpf = cleanCPF;
          session.nome = resCpf.nome;

          registerPhone(cleanCPF, number, instance);
          avisos = await buscarAvisos(cleanCPF, req);

          if (session.nome) {
            await sendEvolutionText(instance, number, `${session.nome}, que bom te ver por aqui! 😄\n\nO que você precisa?\n\n${menuString}`);
            session.state = FlowState.MENU_PRINCIPAL;
          } else {
            await sendEvolutionText(instance, number, "CPF encontrado! Como prefere ser chamado?");
            session.state = FlowState.IDENTIFICACAO_NOME;
          }
        } else {
          await sendEvolutionText(instance, number, "Esse CPF não está cadastrado no sistema. Pode verificar e tentar de novo?");
        }
        break;
      }

      case FlowState.IDENTIFICACAO_NOME: {
        session.nome = userInput;
        await sendEvolutionText(instance, number, `Prazer, ${userInput}! 😊\n\nO que você precisa?\n\n${menuString}`);
        session.state = FlowState.MENU_PRINCIPAL;
        break;
      }

      case FlowState.MENU_PRINCIPAL: {
        if (["1", "abrir", "chamado"].some(v => lowerInput.includes(v))) {
          await sendEvolutionText(instance, number, "Claro! Me conta o que está acontecendo? Pode descrever com detalhes que eu anoto tudo.");
          session.state = FlowState.COLETAR_MOTIVO;
        }
        else if (["2", "status", "consultar", "ver"].some(v => lowerInput.includes(v))) {
          const chamados = await StatusChamado(session.cpf || "");
          const lista = chamados.length > 0
            ? chamados.map((t: any) => {
                const label = statusLabels[t.status] || t.status;
                const atendente = t.atendente?.name ? `🧑‍💻 Atendente: ${t.atendente.name}` : '';
                const dataCriacao = new Date(t.createdAt).toLocaleDateString('pt-BR');
                const descricao = t.descricao ? `📄 ${t.descricao.substring(0, 100)}${t.descricao.length > 100 ? '...' : ''}` : '';
                const ultimoHistorico = t.historico ? (() => {
                  try {
                    const h = JSON.parse(t.historico);
                    return h.length > 0 ? `📋 Última ação: ${statusLabels[h[h.length - 1].acao] || h[h.length - 1].acao}${h[h.length - 1].observacao ? ` — ${h[h.length - 1].observacao}` : ''}` : '';
                  } catch { return ''; }
                })() : '';

                return [
                  `🎫 *${t.ticket}* — ${label}`,
                  `📅 Abertura: ${dataCriacao}`,
                  `📍 Setor: ${t.setor}`,
                  atendente,
                  ultimoHistorico,
                  descricao,
                ].filter(Boolean).join('\n');
              }).join('\n\n━━━━━━━━━━━━━━━━\n\n')
            : "Nenhum chamado aberto encontrado no seu CPF.";

          await sendEvolutionText(instance, number, `📋 *SEUS CHAMADOS*\n\n${lista}\n\nMais alguma coisa?\n\n${menuString}`);
        } else {
          const resposta = await botIA(
            session,
            userInput,
            `Tente entender o que ele quer. Se não conseguir, encerre de forma educada dizendo que não entendeu e ofereça o menu: ${menuString}.`,
            avisos
          );
          await sendEvolutionText(instance, number, resposta);
        }
        break;
      }

      case FlowState.COLETAR_MOTIVO: {
        if (!userInput && hasMedia) {
          await sendEvolutionText(instance, number, "Recebi seu arquivo! Agora me conta, qual o problema para eu registrar?");
          return NextResponse.json({ ok: true });
        }

        session.motivoAtual = userInput;

        const fileIntent = detectFileIntent(userInput);
        if (fileIntent === "send_file") {
          await sendEvolutionText(instance, number, "Entendi! Pode enviar a foto ou documento por aqui mesmo que eu anexo ao chamado. 📎");
          session.state = FlowState.COLETAR_MIDIA;
          break;
        }

        if (!avisos || avisos.includes("Sem avisos")) {
          await sendEvolutionText(
            instance,
            number,
            "Entendi! Quer enviar alguma foto ou documento como comprovante?\n\nSe tiver, pode enviar agora. Se não, é só responder 'não'."
          );
          session.state = FlowState.PERGUNTAR_ANEXO;
          break;
        }

        const analiseIA = await botIA(
          session,
          userInput,
          `Veja se o problema do usuário tem relação com algum Aviso abaixo. Se tiver, responda com base no aviso e pergunte se resolveu. Se não tiver, responda apenas: PROSSEGUIR_FLUXO`,
          avisos
        );

        if (analiseIA.includes("PROSSEGUIR_FLUXO")) {
          await sendEvolutionText(
            instance,
            number,
            "Entendi! Quer enviar alguma foto ou documento como comprovante?\n\nSe tiver, pode enviar agora. Se não, é só responder 'não'."
          );
          session.state = FlowState.PERGUNTAR_ANEXO;
        } else {
          await sendEvolutionText(instance, number, analiseIA);
          session.state = FlowState.VERIFICAR_AVISOS;
        }
        break;
      }

      case FlowState.VERIFICAR_AVISOS: {
        if (["1", "sim", "quero", "continuar", "prosseguir"].some(v => lowerInput.includes(v))) {
          await sendEvolutionText(
            instance,
            number,
            "Quer enviar alguma foto ou documento como comprovante?\n\nSe tiver, pode enviar agora. Se não, é só responder 'não'."
          );
          session.state = FlowState.PERGUNTAR_ANEXO;
        } else {
          await sendEvolutionText(
            instance,
            number,
            `Sem problema! Se precisar de mais algo é só me falar.\n\n${menuString}`
          );
          session.state = FlowState.MENU_PRINCIPAL;
        }
        break;
      }

      case FlowState.PERGUNTAR_ANEXO: {
        const intent = detectFileIntent(userInput);
        if (intent === "send_file") {
          await sendEvolutionText(instance, number, "Pode enviar! Manda a foto ou o arquivo aqui mesmo. 📎");
          session.state = FlowState.COLETAR_MIDIA;
        } else {
          const setores = await getSetores(session.cpf || '');
          await sendEvolutionText(
            instance,
            number,
            `Tudo bem! Pra qual setor devo encaminhar?\n\n📍 *Setores disponíveis:* ${setores.join(", ")}`
          );
          session.state = FlowState.COLETAR_SETOR;
        }
        break;
      }

      case FlowState.COLETAR_MIDIA: {
        if (hasMedia) {
          const mediaMsg = data.message.imageMessage || data.message.documentMessage;
          const mimeType = mediaMsg.mimetype || "application/octet-stream";
          const ext = (mimeType.split("/").pop() || "bin").replace(/[^a-z0-9]/g, "");
          const nomeArquivo = data.message.documentMessage?.fileName || `anexo_${Date.now()}.${ext}`;

          const buffer = await downloadEvolutionMedia(instance, data.key);

          if (buffer) {
            const url = await uploadBuffer({
              buffer,
              fileName: nomeArquivo,
              mimeType,
              folder: session.cpf || "unknown",
            });

            if (url) {
              session.anexoUrl = url;
              const tipo = hasImage ? "foto" : "documento";
              await sendEvolutionText(instance, number, `Recebi seu ${tipo}! ✅ Já vou anexar ao chamado.`);
            } else {
              await sendEvolutionText(instance, number, "Ops, tive um problema ao salvar o arquivo. Mas vou seguir com seu chamado mesmo assim.");
            }
          } else {
            await sendEvolutionText(instance, number, "Não consegui baixar o arquivo. Pode tentar enviar de novo? Se preferir, sigo sem ele.");
          }

          const setores = await getSetores(session.cpf || '');
          await sendEvolutionText(
            instance,
            number,
            `Pra qual setor devo encaminhar?\n\n📍 *Setores disponíveis:* ${setores.join(", ")}`
          );
          session.state = FlowState.COLETAR_SETOR;
        } else if (detectFileIntent(userInput) === "no_file") {
          const setores = await getSetores(session.cpf || '');
          await sendEvolutionText(
            instance,
            number,
            `Tudo bem! Pra qual setor devo encaminhar?\n\n📍 *Setores disponíveis:* ${setores.join(", ")}`
          );
          session.state = FlowState.COLETAR_SETOR;
        } else if (userInput) {
          await sendEvolutionText(
            instance,
            number,
            "Pode enviar a foto ou documento aqui mesmo! 📎\n\nSe não quiser enviar, é só responder 'não' que eu prossigo."
          );
        } else {
          await sendEvolutionText(
            instance,
            number,
            "Manda a foto ou documento por aqui! 📎\n\nSe não tiver, me diga 'não' que eu sigo com o chamado."
          );
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
          const ok = await enviarChamado(
            session.nome || "Usuário",
            session.cpf || "",
            setor,
            session.motivoAtual || "",
            session.anexoUrl
          );

          if (ok) {
            let msg = `✅ Prontinho! Seu chamado pra *${setor}* foi registrado com sucesso.`;
            if (session.anexoUrl) {
              msg += `\n📎 O arquivo que você enviou foi anexado automaticamente.`;
            }
            await sendEvolutionText(instance, number, msg);
          } else {
            const ticketErr = generateRandomTicket();
            await sendEvolutionText(
              instance,
              number,
              `O sistema deu uma oscilada, mas não se preocupe! Seu protocolo é *${ticketErr}*. Nossa equipe já foi avisada.`
            );
          }

          session.anexoUrl = undefined;
          session.state = FlowState.MENU_PRINCIPAL;

          await sendEvolutionText(
            instance,
            number,
            `Quer resolver mais alguma coisa?\n\n${menuString}`
          );
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
    console.error("Erro crítico no webhook25:", error);
    return NextResponse.json({ ok: true });
  }
}
