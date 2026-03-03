import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

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


function saudacao() {
  const hora = new Date().getHours();

  if (hora >= 5 && hora < 12) return "Bom dia";
  if (hora >= 12 && hora < 18) return "Boa tarde";
  if (hora >= 18 || hora < 5) return "Boa noite";
  
  return "Olá"; // Fallback de segurança
}


async function buscarAvisos() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/quadro-avisos`, { cache: 'no-store' });
    type Aviso = { titulo: string; conteudo: string };
    const data: Aviso[] = await res.json();
    return data
      .map(a => `📢 *${a.titulo}*: ${a.conteudo}`)
      .join("\n") || "Sem avisos.";
  } catch { return "Sem avisos no momento."; }
}


function ticketNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TKT${timestamp}${randomPart}`;
}

const LINK_PORTAL = `https://nolevel-bot.vercel.app/chamado;${ticketNumber()}`;

// --- IA HUMANIZADA ---
async function hevelynIA(session: UserSession, userInput: string, instrucaoEtapa: string, avisos: string = "") {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Você é a Hevelyn, a assistente virtual inteligente e empática da Nolevel.
           Sua missão principal é atuar como uma camada de suporte resolutiva, garantindo que os colaboradores obtenham 
           respostas rápidas e evitando a abertura de chamados desnecessários.

### PERFIL E TOM DE VOZ
- **Humana e Empática:** Use uma linguagem acolhedora, mas profissional.
- **Direta e Resolutiva:** Não dê voltas. Se a resposta existe, entregue-a.
- **Dona de Casa:** Você conhece as regras da Nolevel (avisos e histórico) melhor que ninguém.

### REGRAS DE OURO (STRICT RULES)
1. **Prioridade de Busca:** Antes de sugerir um chamado, analise MINUCIOSAMENTE o [QUADRO DE AVISOS] e a [MEMÓRIA DO USUÁRIO] fornecidos no contexto.
2. **Filtro Anti-Chamado:** Se a dúvida do colaborador sobre VT, VR, VA ou dúvidas comuns puder ser respondida com as informações do contexto, responda e encerre de forma amigável.
3. **Abertura de Chamado:** APENAS ofereça a abertura de chamado se:
   - A informação NÃO constar nos Avisos.
   - A dúvida for específica demais para a sua base de conhecimento atual.
4. **Obrigação de Canal:** Ao sugerir um chamado, sempre informe que ele pode ser aberto diretamente pelo link: ${LINK_PORTAL}.

### FLUXO DE PENSAMENTO
1. Analise a pergunta do colaborador.
2. Identifique se o assunto é (VT, VR, VA, RH ou TI, beneficios, ou qualquer duvida comum de colaboradores).
3. Verifique se há algum aviso recente sobre isso em [AVISOS]: ${avisos}.
4. Verifique o [HISTÓRICO]: ${session.resumoHistorico} para ver se isso já foi tratado.
5. Responda a dúvida. 
6. Se (e somente se) não houver solução, pergunte: "Não encontrei uma instrução específica sobre isso nos nossos comunicados. Deseja que eu abra um chamado para você agora ou prefere abrir pelo nosso portal?"

### CONTEXTO ATUAL
- **Colaborador:** ${session.nome || "Não identificado"}
- **Memória/Histórico:** ${session.resumoHistorico || "Sem interações registradas"}.
- **Quadro de Avisos Atualizado:** ${avisos}.
- **Sua Missão Agora:** ${instrucaoEtapa}

###GERAL
-A ideia geral é impedir que duvidas comuns e recorrentes gerem chamados, por isso utilzamos o quadro de avisos ${avisos}
-inicie com a ${saudacao()}


### RESTRIÇÕES
- Nunca invente regras de benefícios que não estejam nos avisos.
- Se o usuário for grosseiro, mantenha a elegância e a empatia.
- não diga ao usuario que existe um quadro de avisos, apenas use as informações dele para responder.
 Se a resposta estiver lá, entregue-a como resposta definitiva.
- Não saia do escopo de assistente da Nolevel.
- para responder evite usar mais de 4 linhas por resposta, a não ser que seja extremamente necessário, 
ou se a resposta for muito longa. Seja direto e objetivo, mas sem perder a empatia.

          `
        },
        { role: "user", content: userInput }
      ],
      temperature: 0.7
    });
    return response.choices[0].message.content || "Desculpe, pode repetir?";
  } catch { return "Estou com uma instabilidade técnica, mas vamos continuar. Como posso ajudar?"; }
}

// --- INTEGRAÇÕES ---
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
  } catch { console.error("Erro ao salvar memória"); }
}

async function enviarChamado(nome: string, cpf: string, setor: string, descricao: string) {
  try {
    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('cpf', cpf);
    formData.append('setor', setor);
    formData.append('descricao', descricao);
    const res = await fetch(`https://nolevel-bot.vercel.app/api/tickets`, { method: "POST", body: formData });
    return res.ok;
  } catch { return false; }
}


//buscar o status do chamdo pelo cpf
async function StatusChamado(filtro: string) {
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

// --- WEBHOOK ---
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

    // Comandos de Encerramento
    if (["obrigado", "tchau", "encerrar", "sair"].some(word => lowerInput.includes(word))) {
      const resp = await hevelynIA(session, userInput, "Despeça-se amigavelmente e informe que a sessão foi encerrada.");
      await sendEvolutionText(instance, number, resp);
      sessions.delete(number);
      return NextResponse.json({ ok: true });
    }

    const avisos = await buscarAvisos();

    // --- FLUXO DE ESTADOS ---
    switch (session.state) {
      case "inicio":
        const saudacao = await hevelynIA(session, userInput,` Dê boas-vindas e peça o CPF para iniciar`);
        await sendEvolutionText(instance, number, saudacao);
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
            const resp = await hevelynIA(session, userInput, "Dê as boas-vindas de volta e apresente o Menu: 1. Abrir Chamado, 2. Ver Status, 3. Avisos.");
            await sendEvolutionText(instance, number, resp);
          } else {
            session.state = "identificacao_nome";
            await sendEvolutionText(instance, number, "CPF validado! Como posso te chamar?");
          }
        } else {
          await sendEvolutionText(instance, number, "O CPF informado é inválido. Por favor, digite os 11 números.");
        }
        break;

      case "identificacao_nome":
        session.nome = userInput;
        session.state = "menu_principal";
        const menuInicial = await hevelynIA(session, userInput, "Apresente o menu principal: 1. Abrir Chamado, 2. Ver Status, 3. Avisos.");
        await sendEvolutionText(instance, number, menuInicial);
        break;

      case "menu_principal":
        if (userInput === "1") {
          session.state = "coletar_motivo";
          await sendEvolutionText(instance, number, "Entendido. Por favor, descreva detalhadamente o que está acontecendo.");
        } else if (userInput === "2") {
          // Lógica atualizada para buscar status pelo CPF da sessão
          if (session.cpf) {
            await sendEvolutionText(instance, number, "Buscando o status dos seus chamados...");
            const status = await StatusChamado(session.cpf);

            if (status && Array.isArray(status) && status.length > 0) {
              const listaStatus = status.map((t: { ticket: string; status: string }) => `Ticket: ${t.ticket} - Status: ${t.status}`).join("\n");
              await sendEvolutionText(instance, number, `Encontrei o seguinte:\n\n${listaStatus}\n\nVocê também pode consultar no portal: ${LINK_PORTAL}`);
            } else {
              await sendEvolutionText(instance, number, `Não encontrei chamados abertos para o seu CPF. Caso prefira, consulte o portal: ${LINK_PORTAL}`);
            }
          } else {
            await sendEvolutionText(instance, number, `Você pode consultar seus chamados aqui: ${LINK_PORTAL}`);
          }
        } else if (userInput === "3") {
          await sendEvolutionText(instance, number, `Aqui estão os avisos recentes:\n${avisos}\n\nDeseja algo mais?`);
        } else {
          const conversaLivre = await hevelynIA(session, userInput, "Responda a dúvida do usuário ou peça para ele escolher uma opção do menu (1, 2 ou 3).", avisos);
          await sendEvolutionText(instance, number, conversaLivre);
        }
        break;

      case "coletar_motivo":
        session.motivoAtual = userInput;
        session.state = "escolher_abertura";
        const perguntaAbertura = await hevelynIA(session, userInput, "O usuário explicou o problema. Pergunte se ele confirma a abertura do chamado agora.");
        await sendEvolutionText(instance, number, `${perguntaAbertura}\n\n1️⃣ Sim, abrir chamado\n2️⃣ Não, voltar ao menu`);
        break;

      case "escolher_abertura":
        if (userInput === "1" || lowerInput.includes("sim")) {
          session.state = "coletar_setor";
          await sendEvolutionText(instance, number, `Para qual setor deseja enviar? \nOpções: ${SETORES.join(", ")}`);
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
            await sendEvolutionText(instance, number, `✅ Chamado aberto com sucesso para o setor ${setorAlvo}! Em breve alguém entrará em contato.`);
            await saveMemoria(session.cpf!, session.nome!, `Nome: ${session.nome}. Último chamado: ${session.motivoAtual?.substring(0, 50)}...`);
          } else {
            await sendEvolutionText(instance, number, `Infelizmente tive um erro ao criar seu ticket. Tente pelo portal: ${LINK_PORTAL}`);
          }
          session.state = "menu_principal";
        } else {
          await sendEvolutionText(instance, number, `Setor não reconhecido. Por favor, escolha um destes: ${SETORES.join(", ")}`);
        }
        break;
    }

    sessions.set(number, session);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: true });
  }
}

