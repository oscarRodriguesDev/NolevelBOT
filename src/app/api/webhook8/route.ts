import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// --- CONFIGURAÇÕES E TIPOS ---
const LINK_PORTAL = "https://nolevel-bot.vercel.app/chamado";

type FlowState = "inicio" | "identificacao" | "menu_principal" | "coletar_motivo" | "escolher_abertura" | "coletar_setor" | "consultar_chamado"

type Chamado = {
  ticket: string
  status?: string
  createdAt: string
}

type UserSession = {
  state: FlowState
  nome?: string
  cpf?: string
  resumoHistorico?: string 
  motivoAtual?: string     
  lastInteraction: number
}

const sessions = new Map<string, UserSession>()

// --- FUNÇÕES DE MEMÓRIA (API /api/memories) ---

async function getResumoPersona(cpf: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nolevel-bot.vercel.app";
    const res = await fetch(`${baseUrl}/api/memories?cpf=${cpf}`, { cache: 'no-store' });
    
    if (!res.ok) return null;

    const data = await res.json();
    // Retorna apenas a string do resumo para a IA
    return data?.resumo || null; 
  } catch (error) {
    console.error("Erro ao buscar memória na API:", error);
    return null;
  }
}

async function upsertResumoPersona(cpf: string, nome: string, resumo: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nolevel-bot.vercel.app";
    await fetch(`${baseUrl}/api/memories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf, nome, resumo }),
    });
  } catch (error) {
    console.error("Erro ao salvar memória na API:", error);
  }
}

// --- FUNÇÕES DE BUSCA (API EXTERNA) ---

async function verificarAutorizacao(cpfInformado: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nolevel-bot.vercel.app";
    const res = await fetch(`${baseUrl}/api/cpfs`, { cache: 'no-store' });
    if (!res.ok) return false;
    const cpfs: { nome: string; cpf: string }[] = await res.json();
    return cpfs.some(c => c.cpf === cpfInformado);
  } catch (error) {
    return false;
  }
}

async function pegarAvisosDoBanco() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nolevel-bot.vercel.app";
    const res = await fetch(`${baseUrl}/api/quadro-avisos`, { cache: 'no-store' });
    if (!res.ok) return "O quadro de avisos está em atualização.";
    const avisos: { id: number; titulo: string; conteudo: string }[] = await res.json();
    if (avisos.length === 0) return "Não há avisos importantes no momento.";
    return avisos.map((aviso, index) => `${index + 1}. ${aviso.titulo}: ${aviso.conteudo}`).join('\n');
  } catch (error) {
    return "Não consegui carregar os avisos agora.";
  }
}

// --- AUXILIARES DE COMUNICAÇÃO ---

function obterSaudacao() {
  const hora = new Date().getHours()
  if (hora < 12) return "Bom dia"
  if (hora < 18) return "Boa tarde"
  return "Boa noite"
}

async function sendEvolutionText(instance: string, number: string, text: string) {
  try {
    const typingDelay = Math.min(Math.max(1500, text.length * 30), 4000);
    await fetch(`${process.env.EVOLUTION_API_URL}/message/sendText/${instance}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.EVOLUTION_API_KEY as string
      },
      body: JSON.stringify({ 
        number: number.replace("@s.whatsapp.net", ""), 
        text,
        options: { delay: typingDelay, presence: "composing" } 
      })
    })
  } catch (error) {
    console.error("Erro Evolution:", error)
  }
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
    return { success: response.ok };
  } catch (error) {
    return { success: false };
  }
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

    switch (session.state) {
      case "inicio":
        await sendEvolutionText(instance, number, `${obterSaudacao()}! Eu sou a Hevelyn, sua assistente na Nolevel. 😊\n\nCom quem eu falo?`)
        session.state = "identificacao"
        break

      case "identificacao":
        if (!session.nome) {
          session.nome = userInput.trim()
          await sendEvolutionText(instance, number, `Prazer, ${session.nome}! ✨\n\nMe digite seu CPF (apenas números) para eu acessar seu painel.`)
        } else {
          const cleanCPF = userInput.replace(/\D/g, "")
          const autorizado = await verificarAutorizacao(cleanCPF);

          if (autorizado) {
            session.cpf = cleanCPF
            
            // Busca Resumo da Persona na API de Memórias
            const resumo = await getResumoPersona(cleanCPF);
            if (resumo) session.resumoHistorico = resumo;

            session.state = "menu_principal"
            await sendEvolutionText(instance, number, `Localizei você! ✅ O que precisa hoje?\n\n1️⃣ - Abrir chamado\n2️⃣ - Consultar status\n3️⃣ - Quadro de avisos`)
          } else {
            await sendEvolutionText(instance, number, `Poxa, não achei esse CPF. 😟 Tente novamente ou fale com o RH.`)
          }
        }
        break

      case "menu_principal":
        if (userInput.includes("1")) {
          session.state = "coletar_motivo"
          await sendEvolutionText(instance, number, `Entendido! Me conta o que está acontecendo.`)
        } else if (userInput.includes("2")) {
          session.state = "consultar_chamado"
          await sendEvolutionText(instance, number, `Digite o número do ticket ou "MEUS" para listar tudo.`)
        } else if (userInput.includes("3")) {
          const avisos = await pegarAvisosDoBanco();
          await sendEvolutionText(instance, number, `Aqui está o quadro de hoje:\n\n${avisos}\n\nAlgo mais? (1-Novo chamado | 2-Status)`)
        }
        break

      case "consultar_chamado":
        const filtro = userInput.trim().toLowerCase() === "meus" ? session.cpf! : userInput.trim();
        await sendEvolutionText(instance, number, `Consultando... 🔍`)
        const dados = await buscarStatusChamado(filtro);
        if (dados) {
          const chamados = Array.isArray(dados) ? dados : [dados];
          if (chamados.length === 0) {
            await sendEvolutionText(instance, number, `Não encontrei chamados ativos para você.`);
          } else {
            let msg = `Encontrei isso:\n`;
            chamados.forEach((c: Chamado) => {
              msg += `\n🎫 Ticket: ${c.ticket}\n📝 Status: ${c.status || "Em análise"}\n`;
            });
            await sendEvolutionText(instance, number, msg);
          }
        } else {
          await sendEvolutionText(instance, number, `Não encontrei nada. Tente o portal: ${LINK_PORTAL}`);
        }
        session.state = "menu_principal";
        break

      case "coletar_motivo":
        session.motivoAtual = userInput;
        const avisosContexto = await pegarAvisosDoBanco();
        
        const aiResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: `Você é a Hevelyn da Nolevel. Seja empática e natural. 
              HISTÓRICO DO USUÁRIO: ${session.resumoHistorico || "Primeiro contato"}. 
              AVISOS DO DIA: ${avisosContexto}.
              Use o histórico para personalizar a fala, mas não seja repetitiva.` 
            },
            { role: "user", content: userInput }
          ],
          temperature: 0.8
        })

        const respostaIA = aiResponse.choices[0].message.content || "Entendido.";
        await sendEvolutionText(instance, number, respostaIA);

        // Atualiza a memória na API para o próximo contato
        const novoTextoResumo = `Último assunto: ${userInput.substring(0, 80)}. Hevelyn respondeu: ${respostaIA.substring(0, 80)}`;
        upsertResumoPersona(session.cpf!, session.nome!, novoTextoResumo);

        session.state = "escolher_abertura"
        await sendEvolutionText(instance, number, `Como prefere seguir?\n\n1️⃣ - Abrir chamado agora\n2️⃣ - Usar o portal: ${LINK_PORTAL}\n3️⃣ - Sair`)
        break

      case "escolher_abertura":
        if (userInput.includes("1")) {
          session.state = "coletar_setor"
          await sendEvolutionText(instance, number, `Qual o setor? (Vitória, Serra, Vale ou Arcelor)`)
        } else {
          await sendEvolutionText(instance, number, `Certo! Qualquer coisa me chame. 👋`)
          sessions.delete(number)
        }
        break

      case "coletar_setor":
        const setores = ["vitoria", "serra", "vale", "arcelor"];
        const setorFinal = setores.find(s => userInput.toLowerCase().includes(s));

        if (!setorFinal) {
          await sendEvolutionText(instance, number, `Ops, não reconheci o setor. Tente escrever: Vitória, Serra, Vale ou Arcelor.`);
          return NextResponse.json({ ok: true });
        }

        await sendEvolutionText(instance, number, `Só um segundinho, estou gerando seu protocolo... ⏳`);
        const res = await enviarChamado(session.nome!, session.cpf!, setorFinal, session.motivoAtual!);
        
        if (res.success) {
          await sendEvolutionText(instance, number, `Ticket gerado com sucesso para o setor ${setorFinal.toUpperCase()}! ✨ O time já foi avisado.`);
        } else {
          await sendEvolutionText(instance, number, `Tive um erro ao gerar. Tente pelo portal: ${LINK_PORTAL}`);
        }
        sessions.delete(number);
        break
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("ERRO WEBHOOK:", err)
    return NextResponse.json({ ok: true })
  }
}