import { NextRequest, NextResponse } from "next/server";
import { TTLMap } from "@/lib/ttl-map";
import { sendEvolutionText, checkEmpresaModule, getMemoria, saveMemoria, StatusChamado } from "@/lib/usedata";
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
import { FlowState, botIA, detectFileIntent, type CorporateSession } from "@/lib/useIA-corporativa";

const menuString = "1. Abrir Chamado, 2. Consultar Chamado, 3. Sair";

const statusLabels: Record<string, string> = {
  novo: "📌 Novo", aberto: "📂 Aberto", em_atendimento: "🔄 Em Atendimento",
  aguardando: "⏳ Aguardando", concluido: "✅ Concluído", fechado: "🔒 Fechado",
  NOVO: "📌 Novo", EM_ANDAMENTO: "🔄 Em Andamento", FECHADO: "🔒 Fechado",
};

type WebhookSession = CorporateSession & { pendingState?: string };

const sessions = new TTLMap<string, WebhookSession>(120 * 60 * 1000);

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
      state: FlowState.INICIO as typeof FlowState.INICIO,
      lastInteraction: Date.now(),
    });

    const exit = await handleExit(userInput, instance, number, sessions, number);
    if (exit) return exit;

    let avisos = "Sem avisos no momento.";
    if (session.cpf) {
      const { buscarAvisos } = await import("@/lib/usedata");
      avisos = await buscarAvisos(session.cpf, req);
    }

    async function getEmpresaIdFromCpf(cpf: string): Promise<string | undefined> {
      try {
        const record = await prisma.cpfs.findUnique({
          where: { cpf },
          select: { empresaId: true },
        });
        return record?.empresaId;
      } catch { return undefined; }
    }

    async function processMediaAndAdvance() {
      const url = await processWebhookMedia(data, instance, number, hasImage, hasDocument, session.cpf || "corporativo");
      if (url) session.anexoUrl = url;
      const setores = await getSetores(session.cpf || "");
      await sendEvolutionText(
        instance, number,
        `Pra qual setor devo encaminhar?\n\n📍 *Setores disponíveis:* ${setores.join(", ")}`
      );
      session.state = FlowState.COLETAR_SETOR;
    }

    const STATUS_ABERTO = ["NOVO", "aberto", "em_atendimento", "aguardando", "EM_ANDAMENTO"];

    async function verificarChamadosAbertos(cpf: string): Promise<{ bloqueado: boolean; mensagem: string }> {
      const chamados = await prisma.chamado.findMany({
        where: { cpf },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { atendente: { select: { name: true } } },
      });

      const abertos = chamados.filter(c => STATUS_ABERTO.includes(c.status));
      if (abertos.length > 0) {
        const lista = abertos.map((t: any) => {
          const label = statusLabels[t.status] || t.status;
          const dataCriacao = new Date(t.createdAt).toLocaleDateString("pt-BR");
          return [
            `🎫 *${t.ticket}* — ${label}`,
            `📅 Abertura: ${dataCriacao}`,
            `📍 Setor: ${t.setor}`,
            t.atendente?.name ? `🧑‍💻 Atendente: ${t.atendente.name}` : "",
            t.descricao ? `📄 ${t.descricao.substring(0, 100)}` : "",
          ].filter(Boolean).join("\n");
        }).join("\n\n━━━━━━━━━━━━━━━━\n\n");
        return { bloqueado: true, mensagem: `Voce ja possui chamados em aberto:\n\n${lista}\n\nAcompanhe o status pelo numero do ticket. Caso necessario, aguarde o fechamento para abrir um novo.` };
      }

      const fechados = chamados.filter(c => !STATUS_ABERTO.includes(c.status));
      if (fechados.length > 0) {
        const ultimo = fechados[0];
        const dataFechamento = new Date(ultimo.updatedAt);
        const tresDias = 3 * 24 * 60 * 60 * 1000;
        if (Date.now() - dataFechamento.getTime() < tresDias) {
          const dataCriacao = new Date(ultimo.createdAt).toLocaleDateString("pt-BR");
          return { bloqueado: true, mensagem: `Seu ultimo chamado *${ultimo.ticket}* foi registrado em ${dataCriacao} e esta muito recente. Por favor, aguarde 3 dias para abrir um novo chamado. Se for urgente, entre em contato com a administracao.` };
        }
      }

      return { bloqueado: false, mensagem: "" };
    }

    async function criarChamado(setor: string): Promise<string | null> {
      const ticket = `TKT-${Date.now()}`;
      try {
        await prisma.chamado.create({
          data: {
            ticket, nome: session.nome || '', cpf: session.cpf || '', setor,
            descricao: session.motivoAtual || '', prioridade: 'normal',
            empresaId: session.empresaId || '', anexoUrl: session.anexoUrl || null,
          },
        });
        if (session.cpf && session.nome) {
          const { gerarResumoMemoria } = await import("./gerar-memoria");
          const resumo = await gerarResumoMemoria(session);
          if (resumo) await saveMemoria(session.cpf, session.nome, resumo);
        }
        return ticket;
      } catch { return null; }
    }

    switch (session.state) {
      case FlowState.INICIO: {
        const resp = await botIA(
          session, userInput,
          "O usuario acabou de chegar. De as boas-vindas e peça OBRIGATORIAMENTE o CPF para iniciar. Nao se apresente.",
          avisos
        );
        session.state = FlowState.IDENTIFICACAO_CPF;
        await sendEvolutionText(instance, number, resp);
        break;
      }

      case FlowState.IDENTIFICACAO_CPF: {
        const cleanCPF = userInput.replace(/\D/g, "");
        if (cleanCPF.length !== 11) {
          await sendEvolutionText(instance, number, "Hum, esse CPF parece incompleto… Pode digitar so os 11 numeros?");
          return NextResponse.json({ ok: true });
        }

        const registro = await prisma.cpfs.findUnique({ where: { cpf: cleanCPF } });
        if (!registro) {
          await sendEvolutionText(instance, number, "Esse CPF nao esta cadastrado. Verifique e tente novamente.");
          return NextResponse.json({ ok: true });
        }

        session.cpf = cleanCPF;
        session.nome = registro.nome;
        session.empresaId = registro.empresaId;

        const memoria = await getMemoria(cleanCPF);
        if (memoria) session.memoria = memoria;

        if (session.empresaId) {
          const { hasModule, activeModules } = await checkEmpresaModule(session.empresaId, "CORPORATIVO");
          if (!hasModule) {
            const modulosMsg = activeModules.length > 0
              ? `Modulos disponiveis: ${activeModules.join(", ")}.`
              : "Sua empresa nao possui modulos ativos.";
            await sendEvolutionText(
              instance, number,
              `Ola, ${registro.nome}! Seu CPF foi encontrado, mas sua empresa nao possui o modulo *CORPORATIVO* ativo.\n\n${modulosMsg}\n\nUtilize o canal correto para seu modulo.`
            );
            sessions.delete(number);
            return NextResponse.json({ ok: true });
          }
        }

        const { buscarAvisosPorCpf } = await import("@/lib/usedata");
        avisos = await buscarAvisosPorCpf(cleanCPF);

        if (avisos && !avisos.includes("Sem avisos")) {
          const instrucao = `CPF ${cleanCPF} validado. Nome: ${session.nome}. Aviso importante:\n${avisos}\n\nApresente-se e informe o aviso de forma acolhedora. Depois apresente: ${menuString}`;
          const resp = await botIA(session, userInput, instrucao, avisos);
          await sendEvolutionText(instance, number, resp);
        } else {
          const instrucao = `CPF ${cleanCPF} validado. Nome: ${session.nome}. Apresente-se e apresente as opcoes: ${menuString}`;
          const resp = await botIA(session, userInput, instrucao, avisos);
          await sendEvolutionText(instance, number, resp);
        }
        session.state = FlowState.MENU_PRINCIPAL;
        break;
      }

      case FlowState.MENU_PRINCIPAL: {
        if (["1", "abrir", "chamado"].some(v => lowerInput.includes(v))) {
          if (session.cpf) {
            const { bloqueado, mensagem } = await verificarChamadosAbertos(session.cpf);
            if (bloqueado) {
              await sendEvolutionText(instance, number, mensagem);
              sessions.delete(number);
              return NextResponse.json({ ok: true });
            }
          }
          await sendEvolutionText(instance, number, "Claro! Me conta o que esta acontecendo? Descreva com detalhes.");
          session.state = FlowState.COLETAR_MOTIVO;
        } else if (["2", "status", "consultar", "ver"].some(v => lowerInput.includes(v))) {
          const chamados = await StatusChamado(session.cpf || "");
          const lista = chamados.length > 0
            ? chamados.map((t: any) => {
                const label = statusLabels[t.status] || t.status;
                const dataCriacao = new Date(t.createdAt).toLocaleDateString("pt-BR");
                return [
                  `🎫 *${t.ticket}* — ${label}`,
                  `📅 Abertura: ${dataCriacao}`,
                  `📍 Setor: ${t.setor}`,
                  t.atendente?.name ? `🧑‍💻 Atendente: ${t.atendente.name}` : "",
                  t.descricao ? `📄 ${t.descricao.substring(0, 100)}` : "",
                ].filter(Boolean).join("\n");
              }).join("\n\n━━━━━━━━━━━━━━━━\n\n")
            : "Nenhum chamado encontrado no seu CPF.";
          await sendEvolutionText(instance, number, `📋 *SEUS CHAMADOS*\n\n${lista}\n\n${menuString}`);
        } else if (["3", "sair", "encerrar"].some(v => lowerInput.includes(v))) {
          await sendEvolutionText(instance, number, "Atendimento encerrado. Quando precisar e so me chamar!");
          sessions.delete(number);
        } else {
          const resp = await botIA(session, userInput, `Escolha uma opcao: ${menuString}. Se nao identificar, retorne NAO_IDENTIFIQUEI`, avisos);
          if (resp.includes("NAO_IDENTIFIQUEI")) {
            await sendEvolutionText(instance, number, "Desculpa, nao consegui entender. Digite 1 para abrir chamado ou 2 para consultar.");
          } else {
            await sendEvolutionText(instance, number, resp);
          }
        }
        break;
      }

      case FlowState.COLETAR_MOTIVO: {
        if (!userInput && hasMedia) {
          await sendEvolutionText(instance, number, "Recebi! Agora me conte qual o motivo do contato.");
          return NextResponse.json({ ok: true });
        }

        session.motivoAtual = userInput;

        const fileIntent = detectFileIntent(userInput);
        if (fileIntent === "send_file") {
          await sendEvolutionText(instance, number, "Pode enviar a foto ou documento por aqui! 📎");
          session.state = FlowState.COLETAR_MIDIA;
          break;
        }

        const { buscarAvisosPorCpf } = await import("@/lib/usedata");
        let todosAvisos = avisos;
        if (todosAvisos.includes("Sem avisos")) {
          todosAvisos = await buscarAvisosPorCpf(session.cpf!);
        }

        const semAvisos = todosAvisos === "Sem avisos." || todosAvisos === "Sem avisos no momento.";

        if (semAvisos) {
          await sendEvolutionText(instance, number, "Certo! Precisa enviar alguma foto ou documento?");
          session.state = FlowState.PERGUNTAR_ANEXO;
          break;
        }

        const analise = await botIA(
          session, userInput,
          `Analise o motivo e os avisos. Se o aviso resolver, retorne "AVISO_RESOLVE:" + mensagem. Senao, retorne "PROSSEGUIR_FLUXO".`,
          todosAvisos
        );

        if (analise.startsWith("AVISO_RESOLVE:")) {
          await sendEvolutionText(instance, number, analise.replace("AVISO_RESOLVE:", "").trim());
          sessions.delete(number);
          break;
        }

        await sendEvolutionText(instance, number, "Certo! Precisa enviar alguma foto ou documento?");
        session.state = FlowState.PERGUNTAR_ANEXO;
        break;
      }

      case FlowState.PERGUNTAR_ANEXO: {
        if (hasMedia) {
          await processMediaAndAdvance();
          break;
        }
        const intent = detectFileIntent(userInput);
        if (intent === "send_file") {
          await sendEvolutionText(instance, number, "Pode enviar! Manda a foto ou arquivo aqui. 📎");
          session.state = FlowState.COLETAR_MIDIA;
        } else {
          const { buscarAvisosPorCpf } = await import("@/lib/usedata");
          const todosAvisos = avisos.includes("Sem avisos") ? await buscarAvisosPorCpf(session.cpf!) : avisos;
          const temAviso = !todosAvisos.includes("Sem avisos") && !todosAvisos.includes("Sem avisos no momento.");

          let resumo = `*Resumo do Registro:*\n\n👤 Nome: ${session.nome}\n🔢 CPF: ${session.cpf}\n📝 Motivo: ${session.motivoAtual}\n`;
          if (session.anexoUrl) resumo += `📎 Anexo: ✅\n`;
          resumo += `\nOs dados estao corretos? (sim/nao)`;
          await sendEvolutionText(instance, number, resumo);
          session.state = FlowState.CONFIRMAR;
        }
        break;
      }

      case FlowState.COLETAR_MIDIA: {
        if (hasMedia) {
          await processMediaAndAdvance();
        } else if (["não", "nao", "n", "sem"].some(v => lowerInput.includes(v))) {
          const { buscarAvisosPorCpf } = await import("@/lib/usedata");
          const todosAvisos = avisos.includes("Sem avisos") ? await buscarAvisosPorCpf(session.cpf!) : avisos;

          let resumo = `*Resumo do Registro:*\n\n👤 Nome: ${session.nome}\n🔢 CPF: ${session.cpf}\n📝 Motivo: ${session.motivoAtual}\n`;
          if (session.anexoUrl) resumo += `📎 Anexo: ✅\n`;
          resumo += `\nOs dados estao corretos? (sim/nao)`;
          await sendEvolutionText(instance, number, resumo);
          session.state = FlowState.CONFIRMAR;
        } else if (detectFileIntent(userInput) === "no_file") {
          let resumo = `*Resumo do Registro:*\n\n👤 Nome: ${session.nome}\n🔢 CPF: ${session.cpf}\n📝 Motivo: ${session.motivoAtual}\n`;
          if (session.anexoUrl) resumo += `📎 Anexo: ✅\n`;
          resumo += `\nOs dados estao corretos? (sim/nao)`;
          await sendEvolutionText(instance, number, resumo);
          session.state = FlowState.CONFIRMAR;
        } else {
          await sendEvolutionText(instance, number, "Pode enviar o arquivo por aqui! 📎\n\nSe nao quiser, digite *nao*.");
        }
        break;
      }

      case FlowState.CONFIRMAR: {
        if (hasMedia) {
          await processWebhookMedia(data, instance, number, hasImage, hasDocument, session.cpf || "corporativo");
          let resumo = `*Resumo do Registro:*\n\n👤 Nome: ${session.nome}\n🔢 CPF: ${session.cpf}\n📝 Motivo: ${session.motivoAtual}\n`;
          resumo += `📎 Anexo: ✅\n`;
          resumo += `\nOs dados estao corretos? (sim/nao)`;
          await sendEvolutionText(instance, number, resumo);
          return NextResponse.json({ ok: true });
        }

        if (["sim", "s", "confirmar", "correto"].some(v => lowerInput.includes(v))) {
          const setores = await getSetores(session.cpf || '');
          if (setores.length === 0) {
            await sendEvolutionText(instance, number, "Nenhum setor disponivel. Entre em contato com a administracao.");
            return NextResponse.json({ ok: true });
          }
          await sendEvolutionText(instance, number, `Pra qual *setor* devo encaminhar?\n\n📍 *Setores:* ${setores.join(", ")}`);
          session.state = FlowState.COLETAR_SETOR;
        } else {
          session.anexoUrl = undefined;
          session.motivoAtual = undefined;
          await sendEvolutionText(instance, number, "Tudo bem! Vamos recomecar. Digite seu CPF:");
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
          const ticket = await criarChamado(setor);
          if (ticket) {
            let msg = `✅ *Registro concluido!*\n\nSeu chamado *${ticket}* foi criado para *${setor}*.`;
            if (session.anexoUrl) msg += `\n📎 O anexo foi salvo automaticamente.`;
            msg += `\n\nNossa equipe vai analisar em breve.\n\nObrigado pelo contato! 💼`;
            await sendEvolutionText(instance, number, msg);
          } else {
            const fallback = `TKT-FB-${Date.now()}`;
            await sendEvolutionText(instance, number, `Ops, problema ao registrar. Protocole: *${fallback}*. Equipe notificada.`);
          }
          sessions.delete(number);
          return NextResponse.json({ ok: true });
        } else {
          await sendEvolutionText(instance, number, `Nao encontrei esse setor. Disponiveis: ${setores.join(", ")}.`);
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