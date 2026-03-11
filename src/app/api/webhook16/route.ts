import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { buscarAvisos, generateRandomTicket, getMemoria, saveMemoria, saudacao, StatusChamado, enviarChamado, sendEvolutionText } from "@/app/hooks/usedata";

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




const LINK_PORTAL = `https://nolevel-bot.vercel.app/chamado;${generateRandomTicket}`;


//inteligencia artificial do bot
async function hevelynIA(session: UserSession, userInput: string, instrucaoEtapa: string) {

  const avisos = await buscarAvisos();
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `siga as instruções: ${instrucaoEtapa}`
        },
        { role: "user", content: userInput }
      ],
      temperature: 0.7
    });
    return response.choices[0].message.content || "Desculpe, pode repetir?";
  } catch { return "Estou com uma instabilidade técnica, mas vamos continuar. Como posso ajudar?"; }
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
        const saudacao = await hevelynIA(session, userInput, ` Dê boas-vindas e peça o CPF para iniciar`);
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
          const conversaLivre = await hevelynIA(session, userInput, "Responda a dúvida do usuário ou peça para ele escolher uma opção do menu (1, 2 ou 3).");
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

