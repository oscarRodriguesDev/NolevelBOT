import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const LINK_PORTAL = "https://nolevel-bot.vercel.app/chamado";

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

// --- AUXILIARES ---

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
    
    let session = sessions.get(number)
    if (!session || (Date.now() - session.lastInteraction > 1000 * 60 * 60 * 2)) {
      session = { state: "inicio", lastInteraction: Date.now() }
      sessions.set(number, session)
    }
    session.lastInteraction = Date.now()

    // 1. GATILHO DE ENCERRAMENTO (Evita vácuo e loops)
    const lowerInput = userInput.toLowerCase();
    if (lowerInput === "obrigado" || lowerInput === "obrigada" || lowerInput === "valeu" || lowerInput === "tchau") {
        await sendEvolutionText(instance, number, `De nada, ${session.nome || "amigo(a)"}! Precisando, é só chamar. Tenha um ótimo dia! ✨`);
        sessions.delete(number); // Reseta para a próxima vez pedir CPF
        return NextResponse.json({ ok: true });
    }

    // 2. FLUXO DE IDENTIFICAÇÃO
    if (session.state === "inicio") {
      await sendEvolutionText(instance, number, `Olá! 😊 Sou a Hevelyn da Nolevel. Como posso te chamar?`)
      session.state = "identificacao_nome"
      return NextResponse.json({ ok: true })
    }

    if (session.state === "identificacao_nome") {
      session.nome = userInput.trim()
      await sendEvolutionText(instance, number, `Prazer, ${session.nome}! Me passa seu CPF para eu acessar seu painel?`)
      session.state = "identificacao_cpf"
      return NextResponse.json({ ok: true })
    }

    if (session.state === "identificacao_cpf") {
      const cleanCPF = userInput.replace(/\D/g, "")
      if (cleanCPF.length >= 11) {
        session.cpf = cleanCPF
        session.resumoHistorico = await getMemoria(cleanCPF)
        
        await sendEvolutionText(instance, number, `Localizei você! ✅ O que precisa hoje, ${session.nome}?\n\n1️⃣ Abrir chamado\n2️⃣ Ver status\n3️⃣ Avisos`)
        session.state = "menu_principal"
      } else {
        await sendEvolutionText(instance, number, `Ih, esse CPF parece incompleto. Digita os 11 números para mim?`)
      }
      return NextResponse.json({ ok: true })
    }

    // 3. LOGICA DE ESTADOS RÍGIDOS (Setor e Abertura)
    if (session.state === "coletar_setor") {
      const setores = ['RH','DP','Financeiro','TI','Comercial','Marketing','Operações','Logística','Jurídico','Atendimento','TI']
      const setorEscolhido = setores.find(s => userInput.toLowerCase().includes(s))
      
      if (setorEscolhido) {
        await sendEvolutionText(instance, number, `Só um segundinho... ⏳`)
        const sucesso = await enviarChamado(session.nome!, session.cpf!, setorEscolhido, session.motivoAtual!)
        if (sucesso) {
          await sendEvolutionText(instance, number, `Prontinho! Seu chamado foi aberto para o setor ${setorEscolhido.toUpperCase()}. Logo mais o time te responde! ✨\n\nAlgo mais que eu possa fazer por você?`);
          session.state = "menu_principal";
        } else {
          await sendEvolutionText(instance, number, `Erro no sistema. Tenta o portal: ${LINK_PORTAL}`);
          session.state = "menu_principal";
        }
      } else {
        await sendEvolutionText(instance, number, `Ainda não conheço esse setor. Escolha entre: Vitória, Serra, Vale ou Arcelor.`);
      }
      return NextResponse.json({ ok: true })
    }

    if (session.state === "escolher_abertura") {
      if (userInput.includes("1") || userInput.toLowerCase().includes("sim")) {
        session.state = "coletar_setor"
        await sendEvolutionText(instance, number, `Legal! Para qual setor vamos enviar? (Vitória, Serra, Vale ou Arcelor)`)
      } else if (userInput.includes("2") || userInput.toLowerCase().includes("portal")) {
        await sendEvolutionText(instance, number, `Certo! Use o portal: ${LINK_PORTAL}. Algo mais?`)
        session.state = "menu_principal"
      } else {
        await sendEvolutionText(instance, number, `Não entendi. Digite 1 para sim ou 2 para portal.`)
      }
      return NextResponse.json({ ok: true })
    }

    // 4. IA PARA CONVERSA (Foge do menu ou descreve problema)
    const avisos = await buscarAvisos()
    const menuOpcoes = ["1", "2", "3"]

    if (!menuOpcoes.includes(userInput.trim()) || session.state === "coletar_motivo") {
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: `Você é a Hevelyn da Nolevel. O usuário é o ${session.nome}. 
            Seja humana. MEMÓRIA: ${session.resumoHistorico || "Sem histórico"}. AVISOS: ${avisos}.
            Se o usuário descrever um problema, finalize sua resposta e pergunte se ele quer abrir um chamado. Use emojis` 
          },
          { role: "user", content: userInput }
        ],
        temperature: 0.7
      });

      const respostaTexto = aiResponse.choices[0].message.content || ""
      await sendEvolutionText(instance, number, respostaTexto)

      // Salva memória
      const novaMemoria = `Nome: ${session.nome}. Problema relatado: ${userInput.substring(0, 100)}`.substring(0, 400)
      saveMemoria(session.cpf!, session.nome!, novaMemoria)

      session.motivoAtual = userInput
      session.state = "escolher_abertura"
      await sendEvolutionText(instance, number, `Deseja abrir um chamado agora?\n\n1️⃣ Sim\n2️⃣ Não/Portal`)
      return NextResponse.json({ ok: true })
    }

    // 5. SWITCH MENU
    switch (userInput.trim()) {
      case "1":
        session.state = "coletar_motivo"
        await sendEvolutionText(instance, number, `Com certeza, ${session.nome}. Pode me contar detalhadamente o que está acontecendo?`)
        break
      case "2":
        await sendEvolutionText(instance, number, `Verifique no portal: ${LINK_PORTAL}. Algo mais?`)
        break
      case "3":
        await sendEvolutionText(instance, number, `Avisos:\n${avisos}\n\nAlgo mais?`)
        break
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: true })
  }
}