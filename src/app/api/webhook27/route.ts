import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/rate-limit";
import { FlowState, detectFileIntent, botIA4 as botIA, type UserSession } from "@/lib/useIA4";
import {
  validarCpf,
  StatusChamado,
  enviarChamado,
  sendEvolutionText,
  generateRandomTicket,
  buscarAvisos,
  buscarAvisosPorCpf,
  downloadEvolutionMedia,
  checkEmpresaModule,
} from "@/lib/usedata";
import { uploadBuffer } from "@/lib/upload";
import { registerPhone } from "@/lib/phoneMap";
import { getSetores } from "@/lib/setores";

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

const sessions = new Map<string, Webhook27Session>();
const link = `${process.env.NEXT_PUBLIC_BASE_URL_WP}/chamado`; 

export async function POST(req: NextRequest) {
  const rateLimit = applyRateLimit(req, "webhook27", 60, 60 * 1000)
  if (rateLimit) return rateLimit

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

    async function processMediaAndAdvance(
      data: any, instance: string, number: string, session: Webhook27Session, hasImage: boolean
    ) {
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
        await sendEvolutionText(instance, number, `Parece que não consegui processar seu arquivo, se for mesmo necessario envia-lo acesse: ${link}`);
      }

      const setores = await getSetores(session.cpf || "");
      await sendEvolutionText(
        instance,
        number,
        `Pra qual setor devo encaminhar?\n\n📍 *Setores disponíveis:* ${setores.join(", ")}`
      );
      session.state = FlowState.COLETAR_SETOR;
    }

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
        // Apenas acolhe o usuário e pede o CPF. Sem revelar nomes.
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
          // Salvando o CPF na sessão. A partir daqui a função botIA4 sabe qual empresa buscar no banco.
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
          avisos = await buscarAvisosPorCpf(cleanCPF);

          // Se houver aviso específico para este CPF (no título ou conteúdo), já apresenta tudo de uma vez
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
          await processMediaAndAdvance(data, instance, number, session, hasImage);
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
          await processMediaAndAdvance(data, instance, number, session, hasImage);
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

    if (session) {
      sessions.set(number, session);
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro crítico no webhook27:", error);
    return NextResponse.json({ ok: true });
  }
}