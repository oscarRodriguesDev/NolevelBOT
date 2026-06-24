import { NextRequest, NextResponse } from "next/server";
import { TTLMap } from "@/lib/ttl-map";
import { FlowState, detectFileIntent, botIA4 as botIA, type UserSession } from "@/lib/useIA4";
import {
  validarCpf,
  StatusChamado,
  enviarChamado,
  sendEvolutionText,
  generateRandomTicket,
  buscarAvisos,
  buscarAvisosPorCpf,
  checkEmpresaModule,
} from "@/lib/usedata";
import { registerPhone } from "@/lib/phoneMap";
import { getSetores } from "@/lib/setores";
import {
  parseWebhookMessage,
  rateLimited,
  getOrCreateSession,
  handleExit,
  processWebhookMedia,
  saveSession,
  webhookError,
} from "@/lib/webhook-core";

const menuString = "1. Abrir Chamado, 2. Consultar Chamado, 3. Sair";

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

type Webhook27Session = UserSession & { 
  anexoUrl?: string;
  empresaId?: string;
  pendingState?: string;
};

const sessions = new TTLMap<string, Webhook27Session>(120 * 60 * 1000);
const link = `${process.env.NEXT_PUBLIC_BASE_URL_WP}/chamado`; 

// Processa mensagens do webhook WhatsApp instancia 27 com fluxo de IA
export async function POST(req: NextRequest) {
  const rateLimit = await rateLimited(req, "webhook27")
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

    let avisos = "Sem avisos no momento.";
    if (session.cpf) {
      avisos = await buscarAvisos(session.cpf, req);
    }

    // Processa midia recebida e avanca para coleta de setor
    async function processMediaAndAdvance() {
      const url = await processWebhookMedia(data, instance, number, hasImage, hasDocument, session.cpf || "unknown");
      if (url) session.anexoUrl = url;

      const setores = await getSetores(session.cpf || "");
      await sendEvolutionText(
        instance,
        number,
        `Pra qual setor devo encaminhar?\n\n📍 *Setores disponíveis:* ${setores.join(", ")}`
      );
      session.state = FlowState.COLETAR_SETOR;
    }

    // Busca o empresaId associado a um CPF na tabela cpfs
    async function getEmpresaIdFromCpf(cpf: string): Promise<string | undefined> {
      try {
        const { prisma } = await import("@/lib/prisma");
        const record = await prisma.cpfs.findUnique({
          where: { cpf },
          select: { empresaId: true },
        });
        return record?.empresaId;
      } catch {
        return undefined;
      }
    }

    switch (session.state) {
      case FlowState.INICIO: {
        const resp = await botIA(
          session,
          userInput,
          "O usuário acabou de chegar. Dê as boas-vindas e peça OBRIGATORIAMENTE o CPF para começar o atendimento. IMPORTANTE: Você é a recepção, NÃO se apresente e NÃO diga nenhum nome de bot ou de empresa ainda.",
          avisos
        );
        
        session.state = FlowState.IDENTIFICACAO_CPF;
        await sendEvolutionText(instance, number, resp);
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
          session.empresaId = await getEmpresaIdFromCpf(cleanCPF);

          if (session.empresaId) {
            const { hasModule, activeModules } = await checkEmpresaModule(session.empresaId, "CORPORATIVO");
            if (!hasModule) {
              const nomeEmpresa = activeModules.length > 0 ? activeModules.join(", ") : "nenhum módulo ativo";
              await sendEvolutionText(
                instance,
                number,
                `Olá, ${resCpf.nome}! Seu CPF foi encontrado ✅, mas sua empresa não possui o módulo *CORPORATIVO* ativo.\n\nMódulos disponíveis na sua empresa: ${nomeEmpresa}.\n\nPor favor, utilize o canal de atendimento correto para o módulo desejado. Se precisar de ajuda, entre em contato com a administração da sua empresa.`
              );
              sessions.delete(number);
              return NextResponse.json({ ok: true });
            }
          }

          registerPhone(cleanCPF, number, instance);

          // Verificar vínculo de telefone
          const { prisma } = await import("@/lib/prisma");
          const cpfRecord = await prisma.cpfs.findUnique({
            where: { cpf: cleanCPF },
            select: { telefone: true },
          });

          const currentNumber = number.includes("@") ? number.split("@")[0].replace("+", "") : number.replace("+", "");
          const currentTelefone = currentNumber.replace(/\D/g, "");

          if (!cpfRecord?.telefone) {
            await sendEvolutionText(
              instance,
              number,
              `Olá, ${resCpf.nome}! Seu CPF foi validado com sucesso ✅\n\nDeseja vincular este número de WhatsApp (${number}) ao seu CPF para facilitar futuros contatos? Responda *SIM* ou *NÃO*.`
            );
            session.state = FlowState.VINCULAR_TELEFONE;
            break;
          }

          if (cpfRecord.telefone !== currentTelefone) {
            await sendEvolutionText(
              instance,
              number,
              `Olá, ${resCpf.nome}! Seu CPF foi validado com sucesso ✅\n\nSeu número vinculado atual é ${cpfRecord.telefone}. Deseja substituir pelo novo número (${number})? Responda *SIM* ou *NÃO*.`
            );
            session.state = FlowState.VINCULAR_TELEFONE;
            break;
          }

          avisos = await buscarAvisosPorCpf(cleanCPF);

          if (avisos && !avisos.includes("Sem avisos")) {
            const instrucaoAviso = session.nome
              ? `CPF ${cleanCPF} validado. Nome: ${session.nome}. Existe um aviso importante específico para você:\n${avisos}\n\nAção OBRIGATÓRIA: Apresente-se com SEU NOME e o NOME DA SUA EMPRESA. Em seguida, informe o aviso de forma HUMANIZADA e ACOLHEDORA. Depois, apresente as opções: ${menuString}. Tudo em uma única mensagem.`
              : `CPF ${cleanCPF} encontrado. Existe um aviso importante:\n${avisos}\n\nAção OBRIGATÓRIA: Apresente-se com SEU NOME e o NOME DA SUA EMPRESA. Em seguida, informe o aviso de forma HUMANIZADA e ACOLHEDORA. Depois, pergunte educadamente como o usuário gostaria de ser chamado. Tudo em uma única mensagem.`;

            const apresentacao = await botIA(session, userInput, instrucaoAviso, avisos);
            await sendEvolutionText(instance, number, apresentacao);
            session.state = session.nome ? FlowState.MENU_PRINCIPAL : FlowState.IDENTIFICACAO_NOME;
          } else {
            const instrucao = session.nome
              ? `CPF ${cleanCPF} validado. O nome do usuário é ${session.nome}. OBRIGATÓRIO: Agora você deve se apresentar com o SEU NOME e o NOME DA SUA EMPRESA. Depois, saude o usuário e apresente as opções: ${menuString} Responda com o numero da sua opção`
              : `CPF ${cleanCPF} encontrado. OBRIGATÓRIO: Agora você deve se apresentar com o SEU NOME e o NOME DA SUA EMPRESA. Depois, pergunte como o usuário gostaria de ser chamado.`;

            const resposta = await botIA(session, userInput, instrucao, avisos);
            await sendEvolutionText(instance, number, resposta);

            session.state = session.nome ? FlowState.MENU_PRINCIPAL : FlowState.IDENTIFICACAO_NOME;
          }
        } else {
          await sendEvolutionText(instance, number, "Esse CPF não está cadastrado no sistema. Pode verificar e tentar de novo?");
        }
        break;
      }

      case FlowState.VINCULAR_TELEFONE: {
        if (lowerInput.includes("sim")) {
          const { prisma } = await import("@/lib/prisma");
          const currentNumber = number.includes("@") ? number.split("@")[0].replace("+", "") : number.replace("+", "");
          const currentTelefone = currentNumber.replace(/\D/g, "");
          await prisma.cpfs.update({
            where: { cpf: session.cpf },
            data: { telefone: currentTelefone },
          });
          await sendEvolutionText(instance, number, "✅ Número vinculado com sucesso ao seu CPF!");
        } else {
          await sendEvolutionText(instance, number, "Tudo bem, pode continuar normalmente!");
        }

        avisos = await buscarAvisosPorCpf(session.cpf || "");
        if (avisos && !avisos.includes("Sem avisos")) {
          const instrucaoAviso = session.nome
            ? `CPF validado. Nome: ${session.nome}. Existe um aviso importante específico para você:\n${avisos}\n\nAção OBRIGATÓRIA: Apresente-se com SEU NOME e o NOME DA SUA EMPRESA. Em seguida, informe o aviso de forma HUMANIZADA e ACOLHEDORA. Depois, apresente as opções: ${menuString}. Tudo em uma única mensagem.`
            : `CPF encontrado. Existe um aviso importante:\n${avisos}\n\nAção OBRIGATÓRIA: Apresente-se com SEU NOME e o NOME DA SUA EMPRESA. Em seguida, informe o aviso de forma HUMANIZADA e ACOLHEDORA. Depois, pergunte educadamente como o usuário gostaria de ser chamado. Tudo em uma única mensagem.`;
          const apresentacao = await botIA(session, userInput, instrucaoAviso, avisos);
          await sendEvolutionText(instance, number, apresentacao);
          session.state = session.nome ? FlowState.MENU_PRINCIPAL : FlowState.IDENTIFICACAO_NOME;
        } else {
          const instrucao = session.nome
            ? `CPF validado. O nome do usuário é ${session.nome}. OBRIGATÓRIO: Agora você deve se apresentar com o SEU NOME e o NOME DA SUA EMPRESA. Depois, saude o usuário e apresente as opções: ${menuString} Responda com o numero da sua opção`
            : `CPF encontrado. OBRIGATÓRIO: Agora você deve se apresentar com o SEU NOME e o NOME DA SUA EMPRESA. Depois, pergunte como o usuário gostaria de ser chamado.`;
          const resposta = await botIA(session, userInput, instrucao, avisos);
          await sendEvolutionText(instance, number, resposta);
          session.state = session.nome ? FlowState.MENU_PRINCIPAL : FlowState.IDENTIFICACAO_NOME;
        }
        break;
      }

      case FlowState.IDENTIFICACAO_NOME: {
        session.nome = userInput;
        const instrucao = `Agora que já sabe o nome (${userInput}), saude-o brevemente e apresente o menu: ${menuString} Responda com o numero da sua opção`;
        const resposta = await botIA(session, userInput, instrucao, avisos);
        
        await sendEvolutionText(instance, number, resposta);
        session.state = FlowState.MENU_PRINCIPAL;
        break;
      }

      case FlowState.MOSTRAR_AVISO: {
        if (session.pendingState === FlowState.IDENTIFICACAO_NOME && !session.nome) {
          session.nome = userInput;
        }

        const resposta = await botIA(
          session,
          userInput,
          `Apresente-se com o SEU NOME e o NOME DA SUA EMPRESA e apresente as opções: ${menuString}`,
          avisos
        );
        await sendEvolutionText(instance, number, resposta);
        session.state = FlowState.MENU_PRINCIPAL;
        break;
      }

      case FlowState.MENU_PRINCIPAL: {
        if (["1", "abrir", "chamado"].some(v => lowerInput.includes(v))) {
          await sendEvolutionText(instance, number, "Claro! Me conta o que está acontecendo? Pode descrever com detalhes, vou registrar tudo para você.");
          session.state = FlowState.COLETAR_MOTIVO;
        }
        else if (["2", "status", "consultar", "ver"].some(v => lowerInput.includes(v))) {
          const chamados = await StatusChamado(session.cpf || "");
          const lista = chamados.length > 0
            ? chamados.map((t:any) => {
                const label = statusLabels[t.status] || t.status;
                const atendente = t.atendente?.name ? `🧑‍💻 Atendente: ${t.atendente.name}` : "";
                const dataCriacao = new Date(t.createdAt).toLocaleDateString("pt-BR");
                const descricao = t.descricao ? `📄 ${t.descricao.substring(0, 100)}${t.descricao.length > 100 ? "..." : ""}` : "";
                const ultimoHistorico = t.historico ? (() => {
                  try {
                    const h = JSON.parse(t.historico);
                    return h.length > 0 ? `📋 Última ação: ${statusLabels[h[h.length - 1].acao] || h[h.length - 1].acao}${h[h.length - 1].observacao ? ` — ${h[h.length - 1].observacao}` : ""}` : "";
                  } catch { return ""; }
                })() : "";

                return [
                  `🎫 *${t.ticket}* — ${label}`,
                  `📅 Abertura: ${dataCriacao}`,
                  `📍 Setor: ${t.setor}`,
                  atendente,
                  ultimoHistorico,
                  descricao,
                ].filter(Boolean).join("\n");
              }).join("\n\n━━━━━━━━━━━━━━━━\n\n")
            : "Nenhum chamado aberto encontrado no seu CPF.";

          await sendEvolutionText(instance, number, `📋 *SEUS CHAMADOS*\n\n${lista}\n\nMais alguma coisa?\n\n${menuString}`);
        }
        else if (["3", "sair", "encerrar", "cancelar"].some(v => lowerInput.includes(v))) {
          await sendEvolutionText(instance, number, "Tudo bem, atendimento encerrado. Quando precisar é só me chamar de volta!");
          sessions.delete(number);
        }
        else {
          const resposta = await botIA(
            session,
            userInput,
            `Vamos tentar novamente, você precisa escolher uma das opções abaixo: ${menuString}. Caso não consiga identificar, retorne dont_know`,
            avisos
          );

          if (resposta.includes("dont_know")) {
            await sendEvolutionText(instance, number, "Desculpa, não consegui entender o motivo do seu chamado.");
            return NextResponse.json({ ok: true }); 
          }

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

        let todosAvisos = await buscarAvisos(session.cpf, req);
        if (todosAvisos.includes("Sem avisos")) {
          todosAvisos = await buscarAvisosPorCpf(session.cpf!);
        }

        const semAvisos = todosAvisos === "Sem avisos." || todosAvisos === "Sem avisos no momento.";

        if (semAvisos) {
          await sendEvolutionText(
            instance,
            number,
            `Certo! Você precisa enviar alguma foto ou documento ou comprovante?`
          );
          session.state = FlowState.PERGUNTAR_ANEXO;
          break;
        }

        const analiseIA = await botIA(
          session,
          userInput,
          `Analise o motivo relatado e os avisos disponíveis seguindo as instruções do sistema.`,
          todosAvisos
        );

        if (analiseIA.startsWith("AVISO_RESOLVE:")) {
          const msg = analiseIA.replace("AVISO_RESOLVE:", "").trim();
          await sendEvolutionText(instance, number, msg);
          sessions.delete(number);
          break;
        }

        if (analiseIA.includes("PROSSEGUIR_FLUXO")) {
          await sendEvolutionText(
            instance,
            number,
            `Certo! Você precisa enviar alguma foto ou documento ou comprovante?`
          );
          session.state = FlowState.PERGUNTAR_ANEXO;
        } else {
          await sendEvolutionText(instance, number, analiseIA);
          session.state = FlowState.MENU_PRINCIPAL;
        }
        break;
      }

      case FlowState.VERIFICAR_AVISOS: {
        let todosAvisos = await buscarAvisos(session.cpf, req);
        if (todosAvisos.includes("Sem avisos")) {
          todosAvisos = await buscarAvisosPorCpf(session.cpf!);
        }

        const analiseIA = await botIA(
          session,
          userInput,
          `Analise a resposta do usuário e os avisos disponíveis seguindo as instruções do sistema.`,
          todosAvisos
        );

        if (analiseIA.startsWith("AVISO_RESOLVE:")) {
          const msg = analiseIA.replace("AVISO_RESOLVE:", "").trim();
          await sendEvolutionText(instance, number, msg);
          sessions.delete(number);
          break;
        }

        if (analiseIA.includes("PROSSEGUIR_FLUXO")) {
          await sendEvolutionText(
            instance,
            number,
            `Certo! Você precisa enviar alguma foto ou documento ou comprovante?`
          );
          session.state = FlowState.PERGUNTAR_ANEXO;
        } else {
          await sendEvolutionText(instance, number, analiseIA);
        }
        break;
      }

      case FlowState.PERGUNTAR_ANEXO: {
        if (hasMedia) {
          await processMediaAndAdvance();
          break;
        }
        const intent = detectFileIntent(userInput);
        if (intent === "send_file") {
          await sendEvolutionText(instance, number, "Pode enviar! Manda a foto ou o arquivo aqui mesmo. 📎");
          session.state = FlowState.COLETAR_MIDIA;
        } else {
          const setores = await getSetores(session.cpf || "");
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
          await processMediaAndAdvance();
        } else if (detectFileIntent(userInput) === "no_file") {
          const setores = await getSetores(session.cpf || "");
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
            `Pode enviar a foto ou documento aqui mesmo! 📎`
          );
        } else {
          await sendEvolutionText(
            instance,
            number,
            `Pode mandar aqui mesmo, vou anexar ao chamado!`
          );
        }
        break;
      }

      case FlowState.COLETAR_SETOR: {
        const setores = await getSetores(session.cpf || "");
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
            let msg = `✅ Prontinho! Seu chamado pra *${setor}* foi registrado com sucesso. `;
            if (session.anexoUrl) {
              msg += `\n📎 O arquivo que você enviou foi anexado automaticamente.`;
            } 

            msg +='\nObrigado por entrar em contato. Nossa equipe vai analisar e te retornar o mais rápido possível.\n\nSe precisar de mais alguma coisa, é só me chamar!';
            await sendEvolutionText(instance, number, msg);
            
            sessions.delete(number);
          }
          else {
            const ticketErr = generateRandomTicket();
            await sendEvolutionText(
              instance,
              number,
              `O sistema deu uma oscilada, mas não se preocupe! Seu protocolo é *${ticketErr}*. Nossa equipe já foi avisada.`
            );
          }

          session.anexoUrl = undefined;
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
    return webhookError("webhook27")(error)
  }
}
