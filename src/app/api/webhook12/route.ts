import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const LINK_PORTAL = "https://nolevel-bot.vercel.app/chamado";

type FlowState = "inicio" | "identificacao_cpf" | "identificacao_nome" | "menu_principal" | "coletar_motivo" | "escolher_abertura" | "coletar_setor" | "consultar_chamado"

type UserSession = {
  state: FlowState
  nome?: string
  cpf?: string
  resumoHistorico?: string 
  motivoAtual?: string     
  lastInteraction: number
}

const sessions = new Map<string, UserSession>()

// --- FUNÇÃO CENTRAL DE IA PARA TODAS AS RESPOSTAS ---
async function hevelynIA(session: UserSession, userInput: string, instrucaoEtapa: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: `Você é a Hevelyn da Nolevel. Use emojis e seja prestativa.
          MEMÓRIA DO BANCO: ${session.resumoHistorico || "Nenhuma"}.
          NOME DO USUÁRIO: ${session.nome || "Desconhecido"}.
          OBJETIVO AGORA: ${instrucaoEtapa}`
        },
        { role: "user", content: userInput }
      ],
      temperature: 0.7
    });
    return response.choices[0].message.content || "Ops, pode repetir?";
  } catch { return "Tive um probleminha técnico, mas vamos continuar!"; }
}

// --- SUAS FUNÇÕES DE INTEGRAÇÃO ORIGINAIS (MANTIDAS) ---

async function getMemoria(cpf: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nolevel-bot.vercel.app";
    const res = await fetch(`${baseUrl}/api/memories?cpf=${cpf}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.resumo || null;
  } catch { return null; }
}

async function saveMemoria(cpf: string, nome: string, resumo: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nolevel-bot.vercel.app";
    await fetch(`${baseUrl}/api/memories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf, nome, resumo }),
    });
  } catch (err) { console.error("Erro ao salvar memória"); }
}

async function buscarAvisos() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nolevel-bot.vercel.app";
    const res = await fetch(`${baseUrl}/api/quadro-avisos`, { cache: 'no-store' });
    const avisos = await res.json() as Array<{ titulo: string; conteudo: string }>;
    return avisos.map(a => `📍 ${a.titulo}: ${a.conteudo}`).join("\n");
  } catch { return "Sem avisos no momento."; }
}

async function enviarChamado(nome: string, cpf: string, setor: string, descricao: string) {
  try {
    const url = `https://nolevel-bot.vercel.app/api/tickets`; 
    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('cpf', cpf);
    formData.append('setor', setor);
    formData.append('descricao', descricao);
    formData.append('prioridade', 'normal');
    const response = await fetch(url, { method: "POST", body: formData });
    return response.ok;
  } catch { return false; }
}

async function sendEvolutionText(instance: string, number: string, text: string) {
  const typingDelay = Math.min(Math.max(1000, text.length * 20), 3000);
  await fetch(`${process.env.EVOLUTION_API_URL}/message/sendText/${instance}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: process.env.EVOLUTION_API_KEY! },
    body: JSON.stringify({ number: number.replace("@s.whatsapp.net", ""), text, options: { delay: typingDelay, presence: "composing" } })
  });
}

// --- WEBHOOK PRINCIPAL REFORMULADO COM IA ---

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (body.event !== "messages.upsert") return NextResponse.json({ ok: true })
    const data = body.data
    if (!data?.message || data.key?.fromMe) return NextResponse.json({ ok: true })

    const number = data.key.remoteJid
    const instance = body.instance
    const userInput = data.message.conversation || data.message.extendedTextMessage?.text || ""
    
    let session = sessions.get(number)
    if (!session || (Date.now() - session.lastInteraction > 1000 * 60 * 60 * 2)) {
      session = { state: "inicio", lastInteraction: Date.now() }
      sessions.set(number, session)
    }
    session.lastInteraction = Date.now()

    // 1. INÍCIO E CPF
    if (session.state === "inicio") {
      const resp = await hevelynIA(session, userInput, "Dê as boas-vindas e peça o CPF do usuário para começar.");
      await sendEvolutionText(instance, number, resp);
      session.state = "identificacao_cpf";
      return NextResponse.json({ ok: true });
    }

    if (session.state === "identificacao_cpf") {
      const cleanCPF = userInput.replace(/\D/g, "");
      if (cleanCPF.length >= 11) {
        session.cpf = cleanCPF;
        const memoria = await getMemoria(cleanCPF);
        if (memoria) {
          session.resumoHistorico = memoria;
          const nomeSalvo = memoria.match(/Nome: ([^.]+)/);
          session.nome = nomeSalvo ? nomeSalvo[1] : undefined;
        }

        if (session.nome) {
          session.state = "menu_principal";
          const resp = await hevelynIA(session, userInput, "Você reconheceu o usuário pelo banco de dados. Cumprimente-o pelo nome e apresente o Menu: 1. Abrir chamado, 2. Ver status, 3. Avisos.");
          await sendEvolutionText(instance, number, resp);
        } else {
          session.state = "identificacao_nome";
          const resp = await hevelynIA(session, userInput, "CPF validado, mas o nome não foi encontrado. Pergunte o nome do usuário de forma gentil.");
          await sendEvolutionText(instance, number, resp);
        }
      } else {
        const resp = await hevelynIA(session, userInput, "O usuário digitou um CPF inválido. Peça os 11 números novamente.");
        await sendEvolutionText(instance, number, resp);
      }
      return NextResponse.json({ ok: true });
    }

    if (session.state === "identificacao_nome") {
      session.nome = userInput.trim();
      session.state = "menu_principal";
      const resp = await hevelynIA(session, userInput, "Confirme que salvou o nome e apresente as opções: 1. Abrir chamado, 2. Ver status, 3. Avisos.");
      await sendEvolutionText(instance, number, resp);
      return NextResponse.json({ ok: true });
    }

    // 2. ESTADOS DE CHAMADO (PROTEÇÃO E IA)
    if (session.state === "coletar_setor") {
      const setores = ["vitoria", "serra", "vale", "arcelor"];
      const setorEscolhido = setores.find(s => userInput.toLowerCase().includes(s));
      
      if (setorEscolhido) {
        await sendEvolutionText(instance, number, `Só um segundinho... ⏳`);
        const sucesso = await enviarChamado(session.nome!, session.cpf!, setorEscolhido, session.motivoAtual!);
        const promptFim = sucesso ? `Sucesso ao abrir chamado para ${setorEscolhido}. Avise ao usuário.` : `Erro ao abrir chamado. Recomende o portal: ${LINK_PORTAL}`;
        const resp = await hevelynIA(session, userInput, promptFim);
        await sendEvolutionText(instance, number, resp);
        session.state = "menu_principal";
      } else {
        const resp = await hevelynIA(session, userInput, "O usuário não escolheu um setor válido. Peça para escolher entre Vitória, Serra, Vale ou Arcelor.");
        await sendEvolutionText(instance, number, resp);
      }
      return NextResponse.json({ ok: true });
    }

    if (session.state === "escolher_abertura") {
      if (userInput.includes("1") || userInput.toLowerCase().includes("sim")) {
        session.state = "coletar_setor";
        const resp = await hevelynIA(session, userInput, "Ele aceitou abrir o chamado. Pergunte qual o setor: Vitória, Serra, Vale ou Arcelor.");
        await sendEvolutionText(instance, number, resp);
      } else {
        session.state = "menu_principal";
        const resp = await hevelynIA(session, userInput, "O usuário não quis abrir o chamado agora. Despeça-se amigavelmente e mencione que o portal está disponível.");
        await sendEvolutionText(instance, number, resp);
      }
      return NextResponse.json({ ok: true });
    }

    // 3. IA PARA CONVERSA, MOTIVO E MENU
    const avisos = await buscarAvisos();
    const menuOpcoes = ["1", "2", "3"];

    // Se o usuário já está descrevendo o problema ou fugiu do menu
    if (!menuOpcoes.includes(userInput.trim()) || session.state === "coletar_motivo") {
      const promptIA = session.state === "coletar_motivo" 
        ? "O usuário está descrevendo o problema. Ouça, dê uma resposta empática e pergunte se ele confirma a abertura do chamado." 
        : `O usuário está conversando fora do menu. Responda-o considerando os avisos: ${avisos}.`;

      const respostaIA = await hevelynIA(session, userInput, promptIA);
      await sendEvolutionText(instance, number, respostaIA);

      // Se ele descreveu um problema, levamos para a confirmação de abertura
      session.motivoAtual = userInput;
      session.state = "escolher_abertura";
      await sendEvolutionText(instance, number, `Deseja abrir um chamado com essas informações?\n1️⃣ Sim\n2️⃣ Não`);
      
      // Atualiza memória silenciosamente
      saveMemoria(session.cpf!, session.nome!, `Nome: ${session.nome}. Recente: ${userInput.substring(0, 50)}`);
      return NextResponse.json({ ok: true });
    }

    // 4. SWITCH DE MENU (CASOS 1, 2, 3) - USANDO IA PARA FALAR
    switch (userInput.trim()) {
      case "1":
        session.state = "coletar_motivo";
        const resp1 = await hevelynIA(session, userInput, "Ele quer abrir um chamado. Peça para ele descrever o problema detalhadamente.");
        await sendEvolutionText(instance, number, resp1);
        break;
      case "2":
        const resp2 = await hevelynIA(session, userInput, `Mencione que a consulta automática está em manutenção e dê o link do portal: ${LINK_PORTAL}`);
        await sendEvolutionText(instance, number, resp2);
        break;
      case "3":
        const resp3 = await hevelynIA(session, userInput, `Apresente os seguintes avisos de forma organizada: ${avisos}`);
        await sendEvolutionText(instance, number, resp3);
        break;
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: true })
  }
}