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
  validarCpf,
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


  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
            Você é a Hevelyn, atendente virtual da ${empresa}. 
            REGRAS: Nunca saia do papel. Seja empática. Priorize o CPF.
            CONTEXTO:
            - Nome: ${session.nome || "Não identificado"}
            - CPF: ${session.cpf || "Não identificado"}
            - CPF Válido: ${ await validarCpf(session.cpf || "") } //tentar validar assim
            - Histórico: ${session.resumoHistorico || "Nenhum"}
            - Avisos: ${avisos || "Nenhum"}
            - Chamados: ${JSON.stringify(statusAtual)}
            - Etapa Atual: ${session.state}
            - Instrução: ${instrucaoEtapa}
            - Menu: ${menuString}
            - Saudação base: ${saudacao}
          `
        },
        { role: "user", content: userInput }
      ],
      temperature: 0.5
    });
    return response.choices[0].message.content || "Poderia repetir?";
  } catch (error) {
    console.error("Erro OpenAI:", error);
    return "Estou com uma instabilidade técnica, mas vamos continuar.";
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
        const isCpfValido = await validarCpf(cleanCPF);
      

        if (cleanCPF.length === 11 && isCpfValido) {
          session.cpf = cleanCPF;
          const memoria = await getMemoria(cleanCPF);
          
          if (memoria) {
            session.resumoHistorico = memoria;
            const nomeMatch = memoria.match(/Nome: ([^.|\n]+)/);
            session.nome = nomeMatch ? nomeMatch[1].trim() : undefined;
          }

          if (session.nome) {
            session.state = FlowState.MENU_PRINCIPAL;
            const resp = await hevelynIA(session, userInput, `Boas-vindas e menu: ${menuString}`);
            await sendEvolutionText(instance, number, resp);
          } else {
            session.state = FlowState.IDENTIFICACAO_NOME;
            await sendEvolutionText(instance, number, "CPF validado! Como posso te chamar?");
          }
        } else {
          await sendEvolutionText(instance, number, "O CPF informado é inválido. Por favor, digite os 11 números corretamente.");
        }
        break;
      }

      case FlowState.IDENTIFICACAO_NOME:
        session.nome = userInput;
        session.state = FlowState.MENU_PRINCIPAL;
        const msgNome = await hevelynIA(session, userInput, `Apresente o menu: ${menuString}`);
        await sendEvolutionText(instance, number, msgNome);
        break;

      case FlowState.MENU_PRINCIPAL:
        if (["1", "abrir"].some(v => lowerInput.includes(v))) {
          session.state = FlowState.COLETAR_MOTIVO;
          await sendEvolutionText(instance, number, "Descreva o motivo do chamado detalhadamente.");
        } else if (["2", "status", "consultar"].some(v => lowerInput.includes(v))) {
          const status = await StatusChamado(session.cpf || "");
          if (status && status.length > 0) {
            const lista = status.map((t: Chamado) => `🎫 Ticket: ${t.ticket}\n📊 Status: ${t.status}`).join("\n\n");
            await sendEvolutionText(instance, number, `Seus chamados:\n\n${lista}`);
          } else {
            await sendEvolutionText(instance, number, "Nenhum chamado encontrado para este CPF.");
          }
        } else if (["3", "aviso"].some(v => lowerInput.includes(v))) {
          const avisos = await buscarAvisos();
          await sendEvolutionText(instance, number, `📢 Avisos:\n\n${avisos || "Sem avisos novos."}`);
        } else {
          const respLivre = await hevelynIA(session, userInput, "Responda a dúvida e reforce o menu.");
          await sendEvolutionText(instance, number, respLivre);
        }
        break;

      case FlowState.COLETAR_MOTIVO:
        session.motivoAtual = userInput;
        session.state = FlowState.ESCOLHER_ABERTURA;
        await sendEvolutionText(instance, number, "Deseja abrir o chamado agora?\n\n1. ✅ Sim\n2. ❌ Não (Voltar)");
        break;

      case FlowState.ESCOLHER_ABERTURA:
        if (["1", "sim"].some(v => lowerInput.includes(v))) {
          session.state = FlowState.COLETAR_SETOR;
          await sendEvolutionText(instance, number, `Qual o setor? (${SETORES.join(", ")})`);
        } else {
          session.state = FlowState.MENU_PRINCIPAL;
          await sendEvolutionText(instance, number, "Voltando ao menu principal.");
        }
        break;

      case FlowState.COLETAR_SETOR:
        const setor = SETORES.find(s => lowerInput.includes(s.toLowerCase()));
        if (setor) {
          const ok = await enviarChamado(session.nome || "Usuário", session.cpf || "", setor, session.motivoAtual || "");
          if (ok) {
            await sendEvolutionText(instance, number, `✅ Chamado para ${setor} aberto com sucesso!`);
            await saveMemoria(session.cpf!, session.nome!, `Último chamado: ${session.motivoAtual}`);
          } else {
            const ticket = generateRandomTicket();
            await sendEvolutionText(instance, number, `Erro ao registrar. Use o portal: ${LINK_PORTAL}/chamados/${ticket}`);
          }
          session.state = FlowState.MENU_PRINCIPAL;
        } else {
          await sendEvolutionText(instance, number, `Setor não reconhecido. Opções: ${SETORES.join(", ")}`);
        }
        break;
    }

    sessions.set(number, session);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro crítico:", error);
    return NextResponse.json({ ok: true });
  }
}