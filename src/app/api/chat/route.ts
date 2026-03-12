import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"
import OpenAI from "openai";
import { 
  buscarAvisos, 
  getMemoria, 
  saveMemoria, 
  saudacao, 
  StatusChamado, 
  enviarChamado, 
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

// Como é um chat interno, vamos usar um Map em memória. 
// Para produção, o ideal seria usar um Cookie ou Session ID vindo do Front.
const sessions = new Map<string, UserSession>();
const empresa = 'Nolevel';
const LINK_PORTAL = `https://nolevel-bot.vercel.app`;
const menuString = "1. Abrir Chamado, 2. Consultar Chamado, 3. Ver Avisos";

async function hevelynIA(session: UserSession, userInput: string, instrucaoEtapa: string) {
  const avisos = await buscarAvisos();
  const statusAtual = session.cpf ? await StatusChamado(session.cpf) : "Não consultado";
  const checagem = session.cpf ? await validarCpf(session.cpf) : { valido: false };

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Você é a Hevelyn, assistente da ${empresa}. Etapa: ${session.state}. Instrução: ${instrucaoEtapa}. Contexto: Nome ${session.nome || '?'}, CPF ${session.cpf || '?'}, Válido: ${checagem.valido}. Avisos: ${avisos}. Status: ${JSON.stringify(statusAtual)}. Menu: ${menuString}.`
        },
        { role: "user", content: userInput }
      ],
      temperature: 0.5
    });
    return response.choices[0].message.content || "Poderia repetir?";
  } catch (error) {
    return "Estou com uma instabilidade técnica momentânea.";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userInput = body.message?.trim() || "";

    // No chat interno, usaremos o IP ou um ID fixo para a sessão (exemplo simples)
    // O ideal é passar um "userId" do Front-end
    const sessionId = "usuario-web-unico"; 

    let session = sessions.get(sessionId);
    if (!session || (Date.now() - session.lastInteraction > 1000 * 60 * 60)) {
      session = { state: FlowState.INICIO, lastInteraction: Date.now() };
    }
    session.lastInteraction = Date.now();

    let reply = "";

    switch (session.state) {
      case FlowState.INICIO:
        reply = await hevelynIA(session, userInput, "Dê boas-vindas e peça o CPF.");
        session.state = FlowState.IDENTIFICACAO_CPF;
        break;

      case FlowState.IDENTIFICACAO_CPF: {
        const cleanCPF = userInput.replace(/\D/g, "");
        const resCpf = await validarCpf(cleanCPF);

        if (cleanCPF.length === 11 && resCpf.valido) {
          session.cpf = cleanCPF;
          session.nome = resCpf.nome;
          
          const memoria = await getMemoria(cleanCPF);
          if (memoria) session.resumoHistorico = memoria;

          if (session.nome) {
            session.state = FlowState.MENU_PRINCIPAL;
            reply = await hevelynIA(session, userInput, `Apresente o menu: ${menuString}`);
          } else {
            session.state = FlowState.IDENTIFICACAO_NOME;
            reply = "CPF validado! Como posso te chamar?";
          }
        } else {
          reply = "CPF inválido ou não encontrado no banco. Digite os 11 números corretamente.";
        }
        break;
      }

      case FlowState.IDENTIFICACAO_NOME:
        session.nome = userInput;
        session.state = FlowState.MENU_PRINCIPAL;
        reply = await hevelynIA(session, userInput, `Menu: ${menuString}`);
        break;

      case FlowState.MENU_PRINCIPAL:
        if (["1", "abrir"].some(v => userInput.toLowerCase().includes(v))) {
          session.state = FlowState.COLETAR_MOTIVO;
          reply = "Descreva detalhadamente o motivo do seu chamado.";
        } else if (["2", "status"].some(v => userInput.toLowerCase().includes(v))) {
          const status = await StatusChamado(session.cpf || "");
          if (status && status.length > 0) {
            reply = "Seus chamados:\n" + status.map((t: Chamado) => `🎫 ${t.ticket}: ${t.status}`).join("\n");
          } else {
            reply = "Nenhum chamado aberto encontrado.";
          }
        } else if (["3", "aviso"].some(v => userInput.toLowerCase().includes(v))) {
          const avisos = await buscarAvisos();
          reply = `📢 Avisos:\n${avisos || "Sem avisos."}`;
        } else {
          reply = await hevelynIA(session, userInput, "Dúvida geral, reforce o menu.");
        }
        break;

      case FlowState.COLETAR_MOTIVO:
        session.motivoAtual = userInput;
        session.state = FlowState.ESCOLHER_ABERTURA;
        reply = "Deseja abrir o chamado agora?\n1. Sim\n2. Não";
        break;

      case FlowState.ESCOLHER_ABERTURA:
        if (userInput.includes("1") || userInput.toLowerCase().includes("sim")) {
          session.state = FlowState.COLETAR_SETOR;
          reply = `Para qual setor? (${SETORES.join(", ")})`;
        } else {
          session.state = FlowState.MENU_PRINCIPAL;
          reply = "Cancelado. Algo mais?";
        }
        break;

      case FlowState.COLETAR_SETOR:
        const setor = SETORES.find(s => userInput.toLowerCase().includes(s.toLowerCase()));
        if (setor) {
          const ok = await enviarChamado(session.nome!, session.cpf!, setor, session.motivoAtual!);
          if (ok) {
            reply = `✅ Chamado para ${setor} aberto com sucesso!`;
            await saveMemoria(session.cpf!, session.nome!, `Chamado: ${session.motivoAtual}`);
          } else {
            reply = `Erro técnico. Tente no portal: ${LINK_PORTAL}`;
          }
          session.state = FlowState.MENU_PRINCIPAL;
        } else {
          reply = `Setor inválido. Escolha: ${SETORES.join(", ")}`;
        }
        break;
    }

    sessions.set(sessionId, session);
    return NextResponse.json({ reply });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ reply: "Erro no servidor." }, { status: 500 });
  }
}