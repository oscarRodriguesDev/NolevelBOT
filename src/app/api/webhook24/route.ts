import { NextRequest, NextResponse } from "next/server";
import { botIA, FlowState } from "@/lib/useIA";
import type { UserSession } from "@/lib/useIA";
import {
  validarCpf,
  StatusChamado,
  enviarChamado,
  sendEvolutionText,
  generateRandomTicket,
  buscarAvisos
} from "@/lib/usedata";
import { registerPhone } from "@/lib/phoneMap";
import { getSetores } from "@/lib/setores";

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
const sessions = new Map<string, UserSession>();

const palavrasDocumento = ["foto", "comprovante", "documento", "anexo", "pdf", "imagem", "print", "scan", "scanner", "digitalizar", "arquivo", "upload", "atestado", "laudo", "receita"];

function temPalavraDocumento(texto: string): boolean {
  const t = texto.toLowerCase();
  return palavrasDocumento.some(p => t.includes(p));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.event !== "messages.upsert") return NextResponse.json({ ok: true });

    const data = body.data;
    if (!data?.message || data.key?.fromMe) return NextResponse.json({ ok: true });

    const number = data.key.remoteJid;
    const instance = body.instance;
    const userInput = (data.message.conversation || data.message.extendedTextMessage?.text || "").trim();
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
        const saudacao = `Olá! Eu sou a Hevelyn, sua assistente virtual. 😊\n\nPara começar, me informe seu CPF (só os números) que eu te ajudo.`;
        await sendEvolutionText(instance, number, saudacao);
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
        session.motivoAtual = userInput;

        if (temPalavraDocumento(userInput)) {
          const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
          await sendEvolutionText(
            instance,
            number,
            `Entendi! Como esse caso precisa de documentos ou anexos, vou precisar que você abra um chamado pelo nosso portal pra enviar os arquivos com segurança.\n\nAcesse: ${baseUrl}/chamado\n\nQualquer dúvida é só chamar de volta!`
          );
          session.state = FlowState.MENU_PRINCIPAL;
          break;
        }

        if (!avisos || avisos.includes("Sem avisos")) {
          const setores = await getSetores(session.cpf || '');
          await sendEvolutionText(
            instance,
            number,
            `Anotado! Pra qual setor devo encaminhar?\n\n📍 *Setores disponíveis:* ${setores.join(", ")}`
          );
          session.state = FlowState.COLETAR_SETOR;
          break;
        }

        const analiseIA = await botIA(
          session,
          userInput,
          `Veja se o problema do usuário tem relação com algum Aviso abaixo. Se tiver, responda com base no aviso e pergunte se resolveu. Se não tiver, responda apenas: PROSSEGUIR_FLUXO`,
          avisos
        );

        if (analiseIA.includes("PROSSEGUIR_FLUXO")) {
          const setores = await getSetores(session.cpf || '');
          await sendEvolutionText(
            instance,
            number,
            `Entendi. Pra qual setor devo encaminhar?\n\n📍 *Setores:* ${setores.join(", ")}`
          );
          session.state = FlowState.COLETAR_SETOR;
        } else {
          await sendEvolutionText(instance, number, analiseIA);
          session.state = FlowState.VERIFICAR_AVISOS;
        }
        break;
      }

      case FlowState.VERIFICAR_AVISOS: {
        if (["1", "sim", "quero", "continuar", "prosseguir"].some(v => lowerInput.includes(v))) {
          const setores = await getSetores(session.cpf || '');
          await sendEvolutionText(
            instance,
            number,
            `Beleza! Pra qual setor devo encaminhar?\n\n📍 *Setores:* ${setores.join(", ")}`
          );
          session.state = FlowState.COLETAR_SETOR;
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
            session.motivoAtual || ""
          );

          if (ok) {
            await sendEvolutionText(instance, number, `✅ Prontinho! Seu chamado pra *${setor}* foi registrado com sucesso.`);
          } else {
            const ticketErr = generateRandomTicket();
            await sendEvolutionText(
              instance,
              number,
              `O sistema deu uma oscilada, mas não se preocupe! Seu protocolo é *${ticketErr}*. Nossa equipe já foi avisada.`
            );
          }

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
    console.error("Erro crítico no webhook:", error);
    return NextResponse.json({ ok: true });
  }
}
