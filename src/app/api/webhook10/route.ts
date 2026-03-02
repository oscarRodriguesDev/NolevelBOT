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

// --- FUNÇÕES DE INTEGRAÇÃO ---

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

    // --- FLUXO DE IDENTIFICAÇÃO (ORDEM INVERTIDA PARA MEMÓRIA) ---

    if (session.state === "inicio") {
      await sendEvolutionText(instance, number, `Olá! 😊 Sou a Hevelyn da Nolevel.\n\nPara eu te atender com todo carinho, poderia me passar seu CPF? (Apenas os números)`)
      session.state = "identificacao_cpf"
      return NextResponse.json({ ok: true })
    }

    if (session.state === "identificacao_cpf") {
      const cleanCPF = userInput.replace(/\D/g, "")
      if (cleanCPF.length >= 11) {
        session.cpf = cleanCPF
        const memoria = await getMemoria(cleanCPF)
        
        if (memoria) {
          session.resumoHistorico = memoria
          // Tenta extrair o nome da memória se existir (formato esperado: "Nome: Fulano...")
          const nomeSalvo = memoria.match(/Nome: ([^.]+)/)
          session.nome = nomeSalvo ? nomeSalvo[1] : undefined
        }

        if (session.nome) {
          await sendEvolutionText(instance, number, `Oi, ${session.nome}! Que bom te ver de novo. 👋\n\nComo posso te ajudar hoje?`)
          session.state = "menu_principal"
          await sendEvolutionText(instance, number, `1️⃣ Abrir chamado\n2️⃣ Ver status\n3️⃣ Quadro de Avisos`)
        } else {
          await sendEvolutionText(instance, number, `CPF anotado! ✅ Mas ainda não sei seu nome... Como você se chama?`)
          session.state = "identificacao_nome"
        }
      } else {
        await sendEvolutionText(instance, number, `Ih, esse CPF parece incompleto. Poderia digitar novamente os 11 números?`)
      }
      return NextResponse.json({ ok: true })
    }

    if (session.state === "identificacao_nome") {
      session.nome = userInput.trim()
      session.state = "menu_principal"
      await sendEvolutionText(instance, number, `Prazer, ${session.nome}! Agora sim estamos prontos. ✨\n\nO que você precisa?\n\n1️⃣ Abrir chamado\n2️⃣ Ver status\n3️⃣ Avisos`)
      return NextResponse.json({ ok: true })
    }

    // --- LOGICA DE ESTADOS FIXOS (PROTEÇÃO CONTRA "EMBANANAMENTO") ---

    // ESTADO: Escolher Setor
    if (session.state === "coletar_setor") {
      const setores = ["vitoria", "serra", "vale", "arcelor"]
      const setorEscolhido = setores.find(s => userInput.toLowerCase().includes(s))
      
      if (setorEscolhido) {
        await sendEvolutionText(instance, number, `Só um segundinho, estou gerando seu protocolo... ⏳`)
        const sucesso = await enviarChamado(session.nome!, session.cpf!, setorEscolhido, session.motivoAtual!)
        if (sucesso) {
          await sendEvolutionText(instance, number, `Prontinho! Seu chamado foi aberto para o setor ${setorEscolhido.toUpperCase()}. Logo mais o time te responde! ✨`)
        } else {
          await sendEvolutionText(instance, number, `Poxa, o sistema de tickets falhou. Tenta pelo portal: ${LINK_PORTAL}`)
        }
        session.state = "menu_principal"
      } else {
        await sendEvolutionText(instance, number, `Ainda não conheço esse setor. Escolha entre: Vitória, Serra, Vale ou Arcelor.`)
      }
      return NextResponse.json({ ok: true })
    }

    // ESTADO: Escolher Abertura (Sim/Portal)
    if (session.state === "escolher_abertura") {
      if (userInput.includes("1") || userInput.toLowerCase().includes("sim")) {
        session.state = "coletar_setor"
        await sendEvolutionText(instance, number, `Legal! Para qual setor vamos enviar? (Vitória, Serra, Vale ou Arcelor)`)
      } else {
        await sendEvolutionText(instance, number, `Tudo bem! Qualquer coisa é só chamar. Se mudar de ideia, o portal é ${LINK_PORTAL} 👋`)
        session.state = "menu_principal"
      }
      return NextResponse.json({ ok: true })
    }

    // --- INTERCEPTAÇÃO DA IA (PARA CONVERSA E MOTIVOS) ---

    const avisos = await buscarAvisos()
    const menuOpcoes = ["1", "2", "3"]

    // Só entra na IA se não for uma opção direta do menu ou se já estiver coletando o motivo
    if (!menuOpcoes.includes(userInput.trim()) || session.state === "coletar_motivo") {
      
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: `Você é a Hevelyn da Nolevel. Use emojis.
            MEMÓRIA: ${session.resumoHistorico || "Primeiro contato"}.
            AVISOS: ${avisos}.
            Se o usuário descrever um problema, responda de forma humana e pergunte se ele quer abrir um chamado.` 
          },
          { role: "user", content: userInput }
        ],
        temperature: 0.7
      });

      const respostaTexto = aiResponse.choices[0].message.content || ""
      await sendEvolutionText(instance, number, respostaTexto)

      // Atualiza Memória em segundo plano
      const novaMemoria = `Nome: ${session.nome}. Historico: ${userInput.substring(0, 60)}...`.substring(0, 400)
      saveMemoria(session.cpf!, session.nome!, novaMemoria)

      session.motivoAtual = userInput
      session.state = "escolher_abertura"
      await sendEvolutionText(instance, number, `Deseja abrir um chamado agora?\n\n1️⃣ Sim\n2️⃣ Não/Portal`)
      return NextResponse.json({ ok: true })
    }

    // --- SWITCH DE MENU (RESPOSTAS 1, 2, 3) ---

    switch (userInput.trim()) {
      case "1":
        session.state = "coletar_motivo"
        await sendEvolutionText(instance, number, `Com certeza, ${session.nome}. Pode me contar detalhadamente o que está acontecendo?`)
        break
      case "2":
        await sendEvolutionText(instance, number, `Vou verificar o status dos seus chamados... 🔍 (Funcionalidade em manutenção, use o portal: ${LINK_PORTAL})`)
        break
      case "3":
        await sendEvolutionText(instance, number, `Aqui estão os avisos importantes de hoje:\n\n${avisos}\n\nAlgo mais que eu possa fazer?`)
        break
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: true })
  }
}