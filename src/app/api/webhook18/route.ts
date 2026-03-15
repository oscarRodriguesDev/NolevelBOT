import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  buscarAvisos,
  getMemoria,
  saveMemoria,
  saudacao,
  StatusChamado,
  enviarChamado,
  sendEvolutionText,
  generateRandomTicket
} from "@/app/hooks/usedata";
import { Chamado } from "@prisma/client";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SETORES = ["RH", "TI", "Financeiro", "Comercial", "Vendas", "Suporte", "Manutenção", "Logística", "Medicina", "Segurança", "Limpeza", "Juridico"] as const;

const FlowState = {
  INICIO: "inicio",
  IDENTIFICACAO_CPF: "identificacao_cpf",
  IDENTIFICACAO_NOME: "identificacao_nome",
  MENU_PRINCIPAL: "menu_principal",
  COLETAR_MOTIVO: "coletar_motivo",
  ESCOLHER_ABERTURA: "escolher_abertura",
  COLETAR_SETOR: "coletar_setor"
} as const;

// --- FUNÇÃO DE VALIDAÇÃO CORRIGIDA ---
export async function validarCpf(cpf: string) {
  try {
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (!cpfLimpo) return { valido: false };

    const res = await fetch(`https://nolevel-bot.vercel.app/api/cpfs?cpf=${cpfLimpo}`);

    if (!res.ok) return { valido: false };

    const data = await res.json();

    // Lógica para lidar tanto com Array quanto com Objeto único
    if (Array.isArray(data)) {
      const registro = data.find(r => r.cpf.replace(/\D/g, "") === cpfLimpo);
      if (registro) {
        return { valido: true, nome: registro.nome, cpf: registro.cpf };
      }
    } else if (data && data.valido) {
      // Se a API já retorna o objeto no formato {"valido": true, ...}
      return {
        valido: true,
        nome: data.nome,
        cpf: data.cpf
      };
    }

    return { valido: false };
  } catch (err) {
    console.error("Erro ao validar CPF na API:", err);
    return { valido: false };
  }
}

type FlowStateValues = typeof FlowState[keyof typeof FlowState];

type UserSession = {
  state: FlowStateValues;
  nome?: string;
  cpf?: string;
  resumoHistorico?: string;
  motivoAtual?: string;
  lastInteraction: number;
};

const menuString = "1. Abrir Chamado, 2. Consultar Chamado, 3. Ver Avisos";
const sessions = new Map<string, UserSession>();
const empresa = 'Nolevel';
const LINK_PORTAL = `https://nolevel-bot.vercel.app`;

async function hevelynIA(session: UserSession, userInput: string, instrucaoEtapa: string) {
  const avisos = await buscarAvisos();
  const statusAtual = session.cpf ? await StatusChamado(session.cpf) : "Nenhum CPF informado";
  const saudacaoTexto = saudacao(); // Chamando a função para pegar o texto real

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
            Você é a Hevelyn, atendente virtual da ${empresa}. 
            REGRAS: Se apresente de forma humana, seja cordial. Use a saudação: ${saudacaoTexto}.
            Nunca saia do papel. Seja empática e direta.
            
            CONTEXTO:
            - Nome: ${session.nome || "Não identificado"}
            - CPF: ${session.cpf || "Não identificado"}
            - Histórico: ${session.resumoHistorico || "Nenhum"}
            - Avisos: ${avisos || "Nenhum"}
            - Chamados: ${JSON.stringify(statusAtual)}
            - Etapa Atual: ${session.state}
            - Instrução: ${instrucaoEtapa}
            - Menu: ${menuString}
          `
        },
        { role: "user", content: userInput }
      ],
      temperature: 0.5
    });
    return response.choices[0].message.content || "Poderia repetir?";
  } catch (error) {
    console.error("Erro OpenAI:", error);
    return `Olá! ${saudacaoTexto}. Estou com uma instabilidade técnica, mas podemos continuar com as opções: ${menuString}`;
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
    const userInput = (data.message.conversation || data.message.extendedTextMessage?.text || "").trim();
    const lowerInput = userInput.toLowerCase();

    let session = sessions.get(number);
    if (!session || (Date.now() - session.lastInteraction > 1000 * 60 * 60 * 2)) {
      session = { state: FlowState.INICIO, lastInteraction: Date.now() };
      sessions.set(number, session);
    }
    session.lastInteraction = Date.now();

    if (["sair", "encerrar", "cancelar"].some(word => lowerInput === word)) {
      await sendEvolutionText(instance, number, "Atendimento encerrado. 👋");
      sessions.delete(number);
      return NextResponse.json({ ok: true });
    }

    switch (session.state) {
      case FlowState.INICIO:
        const msgInicio = await hevelynIA(session, userInput, "Apresente-se e peça o CPF.");
        await sendEvolutionText(instance, number, msgInicio);
        session.state = FlowState.IDENTIFICACAO_CPF;
        break;

      case FlowState.IDENTIFICACAO_CPF: {
        const cleanCPF = userInput.replace(/\D/g, "");

        // Feedback visual para o usuário saber que está processando
        const resCpf = await validarCpf(cleanCPF);

        if (resCpf && resCpf.valido) {
          session.cpf = cleanCPF;
          // Prioriza o nome vindo da API
          session.nome = resCpf.nome;

          if (session.nome) {
            await sendEvolutionText(instance, number, `Que bom ter você de volta, *${session.nome}*!\n\nComo posso ajudar hoje?\n\n${menuString}`);
            session.state = FlowState.MENU_PRINCIPAL;
          } else {
            await sendEvolutionText(instance, number, "CPF validado com sucesso! Como devo te chamar?");
            session.state = FlowState.IDENTIFICACAO_NOME;
          }
        } else {
          // Se a API retornar falso, avisa o usuário
          await sendEvolutionText(instance, number, "❌ CPF não encontrado ou não cadastrado. Por favor, digite um CPF válido (apenas números):");
          // Mantém o estado IDENTIFICACAO_CPF para ele tentar de novo
        }
        break;
      }
      case FlowState.IDENTIFICACAO_NOME:
        session.nome = userInput;
        session.state = FlowState.MENU_PRINCIPAL;
        const msgNome = await hevelynIA(session, userInput, `Apresente o menu e pergunte como ajudar: ${menuString}`);
        await sendEvolutionText(instance, number, msgNome);
        break;

      case FlowState.MENU_PRINCIPAL:
        if (["1", "abrir"].some(v => lowerInput.includes(v))) {
          session.state = FlowState.COLETAR_MOTIVO;
          await sendEvolutionText(instance, number, "Entendido. Descreva o motivo do chamado detalhadamente para que eu possa ajudar.");
        } else if (["2", "status", "consultar"].some(v => lowerInput.includes(v))) {
          const status = await StatusChamado(session.cpf || "");
          if (status && status.length > 0) {
            const lista = status.map((t: Chamado) => `🎫 Ticket: ${t.ticket}\n📊 Status: ${t.status}`).join("\n\n");
            await sendEvolutionText(instance, number, `Aqui estão seus chamados ativos:\n\n${lista}\n\nPosso ajudar em algo mais?`);
          } else {
            await sendEvolutionText(instance, number, "Não encontrei nenhum chamado aberto para você no momento.");
          }
        } else if (["3", "aviso"].some(v => lowerInput.includes(v))) {
          const avisos = await buscarAvisos();
          await sendEvolutionText(instance, number, `📢 *Quadro de Avisos*:\n\n${avisos || "Sem avisos no momento."}\n\nO que mais deseja fazer?`);
        } else {
          const respLivre = await hevelynIA(session, userInput, "Responda a dúvida de forma empática e reforce as opções do menu.");
          await sendEvolutionText(instance, number, respLivre);
        }
        break;

      case FlowState.COLETAR_MOTIVO:
        session.motivoAtual = userInput;
        session.state = FlowState.ESCOLHER_ABERTURA;
        await sendEvolutionText(instance, number, "Deseja que eu abra o chamado com essas informações agora?\n\n1. ✅ Sim, abrir agora\n2. ❌ Não, cancelar e voltar");
        break;

      case FlowState.ESCOLHER_ABERTURA:
        if (["1", "sim"].some(v => lowerInput.includes(v))) {
          session.state = FlowState.COLETAR_SETOR;
          await sendEvolutionText(instance, number, `Certo! Para qual setor deseja enviar?\n\nOpções: ${SETORES.join(", ")}`);
        } else {
          session.state = FlowState.MENU_PRINCIPAL;
          await sendEvolutionText(instance, number, "Sem problemas. Chamado não foi aberto. Como posso te ajudar agora?");
        }
        break;

      case FlowState.COLETAR_SETOR:
        const setor = SETORES.find(s => lowerInput.includes(s.toLowerCase()));
        if (setor) {
          const ok = await enviarChamado(session.nome || "Usuário", session.cpf || "", setor, session.motivoAtual || "");
          if (ok) {
            await sendEvolutionText(instance, number, `✅ Sucesso! Seu chamado para o setor *${setor}* foi registrado.`);
            await saveMemoria(session.cpf!, session.nome!, `Último chamado aberto para: ${setor}`);
          } else {
            const ticketErr = generateRandomTicket();
            await sendEvolutionText(instance, number, `Houve um erro no sistema, mas você pode abrir direto pelo portal: ${LINK_PORTAL}/chamado/${ticketErr}`);
          }
          session.state = FlowState.MENU_PRINCIPAL;
        } else {
          await sendEvolutionText(instance, number, `Setor não reconhecido. Por favor, escolha um destes: ${SETORES.join(", ")}`);
        }
        break;
    }

    sessions.set(number, session);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro crítico no webhook:", error);
    return NextResponse.json({ ok: true });
  }
}