import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// --- CONFIGURAÇÕES ---
const LINK_PORTAL = "https://nolevel-bot.vercel.app/chamado";

type FlowState = "inicio" | "identificacao" | "menu_principal" | "coletar_motivo" | "escolher_abertura" | "coletar_setor" | "consultar_chamado"

type UserSession = {
  state: FlowState
  nome?: string
  cpf?: string
  resumoHistorico?: string 
  motivoAtual?: string     
  lastInteraction: number
}

const sessions = new Map<string, UserSession>()

// --- FUNÇÕES DE INTEGRAÇÃO ---

async function getMemoria(cpf: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nolevel-bot.vercel.app";
    const res = await fetch(`${baseUrl}/api/memories?cpf=${cpf}`, { cache: 'no-store' });
    return res.ok ? (await res.json())?.resumo : null;
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
    if (!res.ok) return "Sem avisos no momento.";
    const avisos = await res.json() as Array<{ titulo: string; conteudo: string }>;
    return avisos.map(a => `${a.titulo}: ${a.conteudo}`).join("\n");
  } catch { return "Sem avisos no momento."; }
}

async function sendEvolutionText(instance: string, number: string, text: string) {
  const typingDelay = Math.min(Math.max(1500, text.length * 30), 4000);
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
    const userInput = data.message.conversation || data.message.extendedTextMessage?.text || ""
    
    const session = sessions.get(number) || { state: "inicio", lastInteraction: Date.now() }
    session.lastInteraction = Date.now()
    sessions.set(number, session)

    // 1. FLUXO DE IDENTIFICAÇÃO (Sempre o primeiro passo)
    if (session.state === "inicio") {
      await sendEvolutionText(instance, number, `Olá! 😊 Sou a Hevelyn da Nolevel. Como posso te chamar?`)
      session.state = "identificacao"
      return NextResponse.json({ ok: true })
    }

    if (session.state === "identificacao") {
      if (!session.nome) {
        session.nome = userInput.trim()
        await sendEvolutionText(instance, number, `Prazer, ${session.nome}! Me passa seu CPF para eu acessar seu painel?`)
        return NextResponse.json({ ok: true })
      } else {
        const cleanCPF = userInput.replace(/\D/g, "")
        // Validação de CPF simplificada para o exemplo
        session.cpf = cleanCPF
        session.resumoHistorico = await getMemoria(cleanCPF)
        session.state = "menu_principal"
        await sendEvolutionText(instance, number, `Localizei você! ✅ O que precisa?\n\n1️⃣ Abrir chamado\n2️⃣ Ver status\n3️⃣ Avisos\n\nOu apenas me conte o que houve!`)
        return NextResponse.json({ ok: true })
      }
    }

    // 2. ACESSO À MEMÓRIA E IA PARA QUALQUER RESPOSTA FORA DO PADRÃO
    const avisos = await buscarAvisos();
    
    // Se o usuário fugir do "1, 2, 3" ou estiver no estado de "coletar_motivo"
    const menuOpcoes = ["1", "2", "3"];
    if (!menuOpcoes.includes(userInput.trim()) || session.state === "coletar_motivo") {
      
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: `Você é a Hevelyn. Use emojis. 
            MEMÓRIA DO USUÁRIO: ${session.resumoHistorico || "Sem histórico"}.
            AVISOS ATUAIS: ${avisos}.
            Se o usuário quiser abrir um chamado, finalize sua resposta e pergunte se ele confirma a abertura.
            Seja humana e empática.` 
          },
          { role: "user", content: userInput }
        ],
        temperature: 0.7
      });

      const respostaTexto = aiResponse.choices[0].message.content || "";
      await sendEvolutionText(instance, number, respostaTexto);

      // Atualiza Memória
      const novoResumo = `Histórico: ${session.resumoHistorico || ""}. Recente: ${userInput.substring(0,50)}.`.substring(0, 400);
      saveMemoria(session.cpf!, session.nome!, novoResumo);

      // Se a IA detectou que é um problema, prepara para abertura
      session.motivoAtual = userInput;
      session.state = "escolher_abertura";
      await sendEvolutionText(instance, number, `Deseja que eu abra o chamado ou prefere o portal?\n1️⃣ Sim\n2️⃣ Portal\n3️⃣ Sair`);
      return NextResponse.json({ ok: true });
    }

    // 3. LOGICA DE MENU PADRÃO (Caso ele digite 1, 2 ou 3)
    switch (userInput.trim()) {
      case "1":
        session.state = "coletar_motivo";
        await sendEvolutionText(instance, number, `Pode me explicar detalhadamente o que está acontecendo?`);
        break;
      case "2":
        // Lógica de consulta (omitida por brevidade, mas segue o padrão anterior)
        await sendEvolutionText(instance, number, `Consultando seus chamados...`);
        session.state = "menu_principal";
        break;
      case "3":
        await sendEvolutionText(instance, number, `Quadro de avisos:\n${avisos}`);
        break;
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: true })
  }
}