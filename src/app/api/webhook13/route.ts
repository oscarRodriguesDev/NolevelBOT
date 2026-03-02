import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const LINK_PORTAL = "https://nolevel-bot.vercel.app/chamado";
  const setores = ["RH","TI", "Financeiro", "Comercial","Vendas", "Suporte", "Manutenção", "Logística","Medicina", "Segurança", "Limpeza", "Juridico"];

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

// --- FUNÇÃO CENTRAL DE IA PARA HUMANIZAR CADA ETAPA ---
async function hevelynIA(session: UserSession, userInput: string, instrucaoEtapa: string, avisos: string = "") {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Você é a Hevelyn uma assistente virtual da Nolevel.
          Vc precisa respoder de forma humana, empática e natural, como se fosse uma atendente real.
          nunca desvie do assunto, seja direta e objetiva, mas sem perder a cordialidade, se o usuario tentar
          desviar a conversa, traga ele de volta pro assunto principal que é ajudar com os chamados e avisos da empresa
          .
          MEMÓRIA DO BANCO: ${session.resumoHistorico || "Nenhuma"}.
          AVISOS ATUAIS: ${avisos}.
          NOME DO USUÁRIO: ${session.nome || "Ainda não identificado"}.
          ETAPA ATUAL: ${session.state}.
          SUA MISSÃO AGORA: ${instrucaoEtapa}`
        },
        { role: "user", content: userInput }
      ],
      temperature: 0.7
    });
    return response.choices[0].message.content || "Pode repetir? Me perdi um pouquinho.";
  } catch { return "Tive um erro técnico, mas estou aqui! Como posso ajudar?"; }
}

// --- SUAS FUNÇÕES DE INTEGRAÇÃO ORIGINAIS ---

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


async function buscarStatusChamado(filtro: string) {
  try {
    const isTicket = filtro.toUpperCase().includes("TKT") || filtro.length > 11;
    const param = isTicket ? `ticket=${filtro}` : `cpf=${filtro}`;
    const url = `https://nolevel-bot.vercel.app/api/tickets?${param}`;
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
}

async function sendEvolutionText(instance: string, number: string, text: string) {
  const typingDelay = Math.min(Math.max(1000, text.length * 20), 3000);
  await fetch(`${process.env.EVOLUTION_API_URL}/message/sendText/${instance}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: process.env.EVOLUTION_API_KEY! },
    body: JSON.stringify({ number: number.replace("@s.whatsapp.net", ""), text, options: { delay: typingDelay, presence: "composing" } })
  });
}

// --- WEBHOOK PRINCIPAL ---

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (body.event !== "messages.upsert") return NextResponse.json({ ok: true })
    const data = body.data
    if (!data?.message || data.key?.fromMe) return NextResponse.json({ ok: true })

    const number = data.key.remoteJid
    const instance = body.instance
    const userInput = (data.message.conversation || data.message.extendedTextMessage?.text || "").trim()
    const lowerInput = userInput.toLowerCase();

    let session = sessions.get(number)
    if (!session || (Date.now() - session.lastInteraction > 1000 * 60 * 60 * 2)) {
      session = { state: "inicio", lastInteraction: Date.now() }
      sessions.set(number, session)
    }
    session.lastInteraction = Date.now()

    // --- GATILHO DE ENCERRAMENTO (LIMPA RAM) ---
    if (["obrigado", "obrigada", "valeu", "tchau", "encerrar", "finalizar"].includes(lowerInput)) {
      const resp = await hevelynIA(session, userInput, "O usuário está finalizando a conversa. Despeça-se amigavelmente.");
      await sendEvolutionText(instance, number, resp);
      sessions.delete(number); // DESCARTA DA RAM
      return NextResponse.json({ ok: true });
    }

    // 1. IDENTIFICAÇÃO (CPF INVERTIDO)
    if (session.state === "inicio") {
      const resp = await hevelynIA(session, userInput, "Dê as boas-vindas dando saudação conforme o horario do dia e peça o CPF do usuário para começar o atendimento.");
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
          const resp = await hevelynIA(session, userInput, "Usuário reconhecido pelo banco. Dê as boas-vindas pelo nome e apresente o Menu: 1. Abrir chamado, 2. Ver status, 3. Avisos.");
          await sendEvolutionText(instance, number, resp);
        } else {
          session.state = "identificacao_nome";
          const resp = await hevelynIA(session, userInput, "CPF validado, mas não temos o nome. Pergunte como ele se chama.");
          await sendEvolutionText(instance, number, resp);
        }
      } else {
        const resp = await hevelynIA(session, userInput, "O CPF parece errado. Peça gentilmente os 11 números novamente.");
        await sendEvolutionText(instance, number, resp);
      }
      return NextResponse.json({ ok: true });
    }

    if (session.state === "identificacao_nome") {
      session.nome = userInput.trim();
      session.state = "menu_principal";
      const resp = await hevelynIA(session, userInput, "Ele informou o nome. agora apresente o Menu: 1. Abrir chamado, 2. Ver status, 3. Avisos.");
      await sendEvolutionText(instance, number, resp);
      return NextResponse.json({ ok: true });
    }

    // 2. LOGICA DE ESTADOS FIXOS (SETOR E ABERTURA)
    if (session.state === "coletar_setor") {
    
      const setorEscolhido = setores.find(s => lowerInput.includes(s));
      if (setorEscolhido) {
        await sendEvolutionText(instance, number, `Gerando protocolo... ⏳`);
        const sucesso = await enviarChamado(session.nome!, session.cpf!, setorEscolhido, session.motivoAtual!);
        const instrucao = sucesso ? `Sucesso! Avise que o chamado para ${setorEscolhido} foi aberto.` : `Erro técnico. Peça para usar o portal: ${LINK_PORTAL}`;
        const resp = await hevelynIA(session, userInput, instrucao);
        await sendEvolutionText(instance, number, resp);

        // Pós-chamado: Limpa RAM para manter segurança e volta ao início
        sessions.delete(number);
        return NextResponse.json({ ok: true });
      } else {
        const resp = await hevelynIA(session, userInput, `Ele não escolheu um setor válido, lembre-o dos setores ${setores.join(", ")} e peça para escolher um.`);
        await sendEvolutionText(instance, number, resp);
        return NextResponse.json({ ok: true });
      }
    }

    if (session.state === "escolher_abertura") {
      if (userInput.includes("1") || lowerInput.includes("sim")) {
        session.state = "coletar_setor";
        const resp = await hevelynIA(session, userInput, `Ele quer abrir o chamado. Pergunte qual o setor (${setores.join(", ")}).`);
        await sendEvolutionText(instance, number, resp);
      } else {
        session.state = "menu_principal";
        const resp = await hevelynIA(session, userInput, "Ele recusou a abertura. tente encerrar a conversa. apresente as opções e entre elas a opção Encerrar conversa.");
        await sendEvolutionText(instance, number, resp);
      }
      return NextResponse.json({ ok: true });
    }

    // 3. IA PARA CONVERSA, MOTIVO E MENU
    const avisos = await buscarAvisos();
    const menuOpcoes = ["1", "2", "3"];

    if (!menuOpcoes.includes(userInput.trim()) || session.state === "coletar_motivo") {
      const instrucao = session.state === "coletar_motivo"
        ? "O usuário está descrevendo o problema. Ouça com empatia e pergunte se ele deseja abrir um chamado agora."
        : `O usuário está conversando livremente. Responda-o com base nos avisos: ${avisos}.`;

      const respostaIA = await hevelynIA(session, userInput, instrucao, avisos);
      await sendEvolutionText(instance, number, respostaIA);

      session.motivoAtual = userInput;
      session.state = "escolher_abertura";
      await sendEvolutionText(instance, number, `Deseja abrir um chamado com essas informações?\n1️⃣ Sim\n2️⃣ Não`);

      saveMemoria(session.cpf!, session.nome!, `Nome: ${session.nome}. Recente: ${userInput.substring(0, 60)}`);
      return NextResponse.json({ ok: true });
    }

    // 4. SWITCH DE MENU (USANDO IA)
    switch (userInput.trim()) {
      case "1":
        session.state = "coletar_motivo";
        const r1 = await hevelynIA(session, userInput, `Ele quer abrir um chamado. Peça para ele descrever o problema detalhadamente.
          se perceber que o problema esta no quadro de avisos, informe de acordo com o aviso específico, apos isso pergunte se ele ainda deseja abrir o chamado ou prefere consultar o portal.
          Caso ele ainda deseje abrir o chamado, pergunte qual o setor (${setores.join(", ")}).`);
        await sendEvolutionText(instance, number, r1);
        break;
      case "2":
        const r2 = await hevelynIA(session, userInput, `Tente buscar os status: ${buscarStatusChamado(session.cpf!)}. 
        caso não consiga,Mencione que a consulta automática está em manutenção e dê o link: ${LINK_PORTAL}`);
        await sendEvolutionText(instance, number, r2);
        break;
      case "3":
        const r3 = await hevelynIA(session, userInput, `Deseja encerrar a conversa?
        1️⃣ Sim, encerrar.
        2️⃣ Não, continuar a conversa.`);
        await sendEvolutionText(instance, number, r3);
        break;
      default:
         await hevelynIA(session, userInput, `Agradeça o contato e encerre a conversa de forma amigável, dando o link do portal caso ele queira contato futuro: ${LINK_PORTAL}`);
        break;
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: true })
  }
}