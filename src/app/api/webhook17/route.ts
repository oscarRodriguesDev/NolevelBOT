import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { buscarAvisos, generateRandomTicket, getMemoria, saveMemoria, saudacao, StatusChamado, enviarChamado, sendEvolutionText,validarCpf } from "@/app/hooks/usedata";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SETORES = ["RH", "TI", "Financeiro", "Comercial", "Vendas", "Suporte", "Manutenção", "Logística", "Medicina", "Segurança", "Limpeza", "Juridico"];

type FlowState = "inicio" | "identificacao_cpf" | "identificacao_nome" | "menu_principal" | "coletar_motivo" | "escolher_abertura" | "coletar_setor"

type UserSession = {
  state: FlowState
  nome?: string
  cpf?: string
  resumoHistorico?: string
  motivoAtual?: string
  lastInteraction: number
}

const sessions = new Map<string, UserSession>()
const empresa = 'Nolevel'

const LINK_PORTAL = `https://nolevel-bot.vercel.app/chamado;${generateRandomTicket()}`;

async function hevelynIA(session: UserSession, userInput: string, instrucaoEtapa: string) {
  const avisos = await buscarAvisos();
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
Você é um atendente virtual da empresa ${empresa}. 
Seu objetivo é ajudar com chamados e avisos dos setores: ${SETORES.join(', ')}.
Responda de forma humana, natural e empática.
Use todas as informações disponíveis:
- Nome: ${session.nome || "não identificado"}
- CPF: ${session.cpf || "não identificado"}
- Histórico resumido: ${session.resumoHistorico || "nenhum histórico disponível"}
- Avisos recentes: ${avisos || "nenhum aviso"}
- Etapa atual do atendimento: ${session.state}
- Instrução da etapa: ${instrucaoEtapa}
- Saudação: ${saudacao}
Seja direto, claro e ofereça sempre opções ou instruções claras.
`
        },
        { role: "user", content: userInput }
      ],
      temperature: 0.7
    });
    return response.choices[0].message.content || "Desculpe, pode repetir?";
  } catch {
    return "Estou com uma instabilidade técnica, mas podemos continuar. Como posso ajudar?";
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
      session = { state: "inicio", lastInteraction: Date.now() };
      sessions.set(number, session);
    }
    session.lastInteraction = Date.now();

    if (["obrigado", "tchau", "encerrar", "sair"].some(word => lowerInput.includes(word))) {
      const resp = await hevelynIA(session, userInput, "Despeça-se amigavelmente e informe que a sessão foi encerrada.");
      await sendEvolutionText(instance, number, resp);
      sessions.delete(number);
      return NextResponse.json({ ok: true });
    }

    const avisos = await buscarAvisos();

    switch (session.state) {
      case "inicio":
        const saudacaoMsg = await hevelynIA(session, userInput, "Dê boas-vindas e peça o CPF do usuário.");
        await sendEvolutionText(instance, number, saudacaoMsg);
        session.state = "identificacao_cpf";
        break;

      case "identificacao_cpf":
        const cleanCPF = userInput.replace(/\D/g, "");
        if (cleanCPF.length >= 11) {
          session.cpf = cleanCPF;
          const memoria = await getMemoria(cleanCPF);
          if (memoria) {
            session.resumoHistorico = memoria;
            const nomeExtraido = memoria.match(/Nome: ([^.|\n]+)/);
            session.nome = nomeExtraido ? nomeExtraido[1].trim() : undefined;
          }

          if (session.nome) {
            session.state = "menu_principal";
            const resp = await hevelynIA(session, userInput, "Dê as boas-vindas de volta e apresente o menu principal: 1. Abrir Chamado, 2. Ver Status, 3. Avisos.");
            await sendEvolutionText(instance, number, resp);
          } else {
            session.state = "identificacao_nome";
            await sendEvolutionText(instance, number, "CPF validado! Como posso chamá-lo?");
          }
        } else {
          await sendEvolutionText(instance, number, "CPF inválido. Digite os 11 números, sem pontos ou traços.");
        }
        break;

      case "identificacao_nome":
        session.nome = userInput;
        session.state = "menu_principal";
        const menuMsg = await hevelynIA(session, userInput, "Apresente o menu principal: 1. Abrir Chamado, 2. Ver Status, 3. Avisos.");
        await sendEvolutionText(instance, number, menuMsg);
        break;

      case "menu_principal":
        if (["1", "abrir chamado"].includes(lowerInput)) {
          session.state = "coletar_motivo";
          await sendEvolutionText(instance, number, "Descreva detalhadamente o que está acontecendo.");
        } else if (["2", "ver status"].includes(lowerInput)) {
          if (session.cpf) {
            await sendEvolutionText(instance, number, "Consultando seus chamados...");
            const status = await StatusChamado(session.cpf);
            if (status?.length) {
              const listaStatus = status.map((t: { ticket: string; status: string }) => `Ticket: ${t.ticket} - Status: ${t.status}`).join("\n");
              await sendEvolutionText(instance, number, `Seus chamados:\n${listaStatus}\nConsulte no portal: ${LINK_PORTAL}`);
            } else {
              await sendEvolutionText(instance, number, `Nenhum chamado encontrado. Consulte no portal: ${LINK_PORTAL}`);
            }
          } else {
            await sendEvolutionText(instance, number, `Consulte seus chamados no portal: ${LINK_PORTAL}`);
          }
        } else if (["3", "avisos"].includes(lowerInput)) {
          await sendEvolutionText(instance, number, `Avisos recentes:\n${avisos}\nDeseja mais alguma coisa?`);
        } else {
          const conversaLivre = await hevelynIA(session, userInput, "Responda à dúvida do usuário ou peça que escolha uma opção do menu (1,2,3).");
          await sendEvolutionText(instance, number, conversaLivre);
        }
        break;

      case "coletar_motivo":
        session.motivoAtual = userInput;
        session.state = "escolher_abertura";
        const perguntaAbertura = await hevelynIA(session, userInput, "Confirme se o usuário deseja abrir o chamado agora.");
        await sendEvolutionText(instance, number, `${perguntaAbertura}\n1️⃣ Sim, abrir chamado\n2️⃣ Não, voltar ao menu`);
        break;

      case "escolher_abertura":
        if (["1", "sim"].some(v => lowerInput.includes(v))) {
          session.state = "coletar_setor";
          await sendEvolutionText(instance, number, `Qual setor deve receber o chamado? Opções: ${SETORES.join(", ")}`);
        } else {
          session.state = "menu_principal";
          await sendEvolutionText(instance, number, "Chamado cancelado. Como posso ajudar agora? (1. Abrir, 2. Status, 3. Avisos)");
        }
        break;

      case "coletar_setor":
        const setorAlvo = SETORES.find(s => lowerInput.includes(s.toLowerCase()));
        if (setorAlvo) {
          await sendEvolutionText(instance, number, "Processando seu chamado... 🚀");
          const ok = await enviarChamado(session.nome!, session.cpf!, setorAlvo, session.motivoAtual!);
          if (ok) {
            await sendEvolutionText(instance, number, `✅ Chamado aberto com sucesso para ${setorAlvo}. Em breve entraremos em contato.`);
            await saveMemoria(session.cpf!, session.nome!, `Nome: ${session.nome}. Último chamado: ${session.motivoAtual?.substring(0, 50)}...`);
          } else {
            await sendEvolutionText(instance, number, `Erro ao criar chamado. Tente pelo portal: ${LINK_PORTAL}`);
          }
          session.state = "menu_principal";
        } else {
          await sendEvolutionText(instance, number, `Setor não reconhecido. Escolha entre: ${SETORES.join(", ")}`);
        }
        break;
    }

    sessions.set(number, session);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}