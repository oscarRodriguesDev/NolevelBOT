import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { gerarTicketId } from "../webhook3/route"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// --- FUNÇÃO DE BUSCA DE CPFs CORRIGIDA ---
async function verificarAutorizacao(cpfInformado: string) {
  try {
    // Em Server Components/Routes, precisamos da URL completa ou chamar o banco diretamente
    // Vou usar a variável de ambiente do seu domínio para garantir o fetch
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://nolevel-bot.vercel.app";
    const res = await fetch(`${baseUrl}/api/cpfs`, { cache: 'no-store' });
    
    if (!res.ok) return false;

    const cpfs: { nome: string; cpf: string }[] = await res.json();
    
    // Verifica se o CPF limpo existe na lista retornada pelo banco
    return cpfs.some(c => c.cpf === cpfInformado);
  } catch (error) {
    console.error("Erro na verificação de CPFs:", error);
    return false;
  }
}

const QUADRO_DE_AVISOS = `
1. Problemas com Email: Reiniciar senha no portal self-service.
2. Lentidão no Sistema: Manutenção programada até as 14h de hoje.
3. Férias: App RH Digital com 30 dias de antecedência.
4. Atestados: saude@empresa.com.br em até 48h.
5. Contracheque: Portal do Colaborador > Financeiro.
6. Cartão Alimentação: Verifique saldo no App. Recargas todo dia 01.
7. EPI: Almoxarifado do contrato (assinar cautela).
8. Crachá: Supervisor imediato.
9. Vale Transporte: RH até dia 15.
10. Ponto: Ajuste via formulário administrativo.
`

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
  resumo?: string
  lastInteraction: number
}

const sessions = new Map<string, UserSession>()

// --- AUXILIARES ---

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
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    return { success: true, ticketId: data.ticket || data.id || "Gerado" };
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

// --- WEBHOOK ---

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
        await sendEvolutionText(instance, number, `${obterSaudacao()}! Eu sou a Hevelyn, sua assistente aqui na Nolevel. 😊\n\nCom quem eu tenho o prazer de falar?`)
        session.state = "identificacao"
        break

      case "identificacao":
        if (!session.nome) {
          session.nome = userInput.trim()
          await sendEvolutionText(instance, number, `Prazer em te conhecer, ${session.nome}! ✨\n\nPara eu acessar seu painel, poderia me digitar seu CPF? (Apenas os números).`)
        } else {
          const cleanCPF = userInput.replace(/\D/g, "")
          
          // CHAMADA PARA O BANCO DE DADOS AQUI
          const autorizado = await verificarAutorizacao(cleanCPF);

          if (autorizado) {
            session.cpf = cleanCPF
            session.state = "menu_principal"
            await sendEvolutionText(instance, number, `Certo, ${session.nome}, localizei você! ✅\n\nO que você precisa hoje?\n\n1️⃣ - Abrir novo chamado\n2️⃣ - Consultar status de chamado\n3️⃣ - Ver quadro de avisos`)
          } else {
            await sendEvolutionText(instance, number, `Poxa, não achei esse CPF na nossa lista de autorizados. 🤔 Tenta digitar novamente os 11 números ou entre em contato com o RH.`)
          }
        }
        break

      case "menu_principal":
        if (userInput.includes("1")) {
          session.state = "coletar_motivo"
          await sendEvolutionText(instance, number, `Entendido! Me conta o que está acontecendo ou qual sua dúvida.`)
        } else if (userInput.includes("2")) {
          session.state = "consultar_chamado"
          await sendEvolutionText(instance, number, `Com certeza! Digite o número do seu ticket ou digite "MEUS" para listar tudo.\n\nSe preferir ver pelo portal: ${LINK_PORTAL}/${gerarTicketId()}`)
        } else if (userInput.includes("3")) {
          await sendEvolutionText(instance, number, `Aqui está o que temos hoje:\n${QUADRO_DE_AVISOS}\n\nPosso ajudar em algo mais? (1 - Novo chamado | 2 - Consultar status)`)
        } else {
          await sendEvolutionText(instance, number, `Escolha uma das opções acima (1, 2 ou 3) para eu te ajudar. 😉`)
        }
        break

      case "consultar_chamado":
        const filtro = userInput.trim().toLowerCase() === "meus" ? session.cpf! : userInput.trim();
        await sendEvolutionText(instance, number, `Só um segundinho, estou consultando aqui no sistema... 🔍`)
        
        const dados = await buscarStatusChamado(filtro);
        if (dados) {
          const chamados = Array.isArray(dados) ? dados : [dados];
          if (chamados.length === 0) {
             await sendEvolutionText(instance, number, `Olha, não encontrei nenhum chamado ativo. 😕 Quer tentar abrir um novo aqui comigo (digite 1) ou prefere usar o portal?\nLink: ${LINK_PORTAL}/${gerarTicketId()}`);
          } else {
             let msg = `Encontrei isso aqui:\n`;
             chamados.forEach((c: Chamado) => {
               msg += `\n🎫 *Ticket:* ${c.ticket}\n📝 *Status:* ${c.status || "Em análise"}\n📅 *Data:* ${new Date(c.createdAt).toLocaleDateString('pt-BR')}\n`;
             });
             await sendEvolutionText(instance, number, msg);
             await sendEvolutionText(instance, number, `Deseja algo mais? (1 - Novo chamado | 2 - Ver outro status)`);
          }
        } else {
          await sendEvolutionText(instance, number, `Não achei nada com esse dado. 😟 Quer tentar de novo ou abrir um chamado?\n\nPortal: ${LINK_PORTAL}/${gerarTicketId()}`);
        }
        session.state = "menu_principal";
        break

      case "coletar_motivo":
        session.resumo = userInput
        const aiResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: `Você é a Hevelyn, assistente virtual da Nolevel. Aja como uma pessoa real e empática. Se o problema estiver no Quadro: ${QUADRO_DE_AVISOS}, explique de forma humana.` },
            { role: "user", content: userInput }
          ],
          temperature: 0.8
        })
        await sendEvolutionText(instance, number, aiResponse.choices[0].message.content || "Entendi.")
        session.state = "escolher_abertura"
        await sendEvolutionText(instance, number, `Como você prefere seguir?\n\n1️⃣ - Quero que você abra o chamado agora\n2️⃣ - Vou abrir pelo portal: ${LINK_PORTAL}/${gerarTicketId()}\n3️⃣ - Não preciso mais, obrigado!`)
        break

      case "escolher_abertura":
        if (userInput.includes("1") || userInput.toLowerCase().includes("sim")) {
          session.state = "coletar_setor"
          await sendEvolutionText(instance, number, `Ótimo! Para qual setor vamos enviar? (Vitória, Serra, Vale ou Arcelor)`)
        } else if (userInput.includes("2") || userInput.toLowerCase().includes("portal")) {
          await sendEvolutionText(instance, number, `Combinado! O portal é super rápido também. Aqui está o link: ${LINK_PORTAL}/${gerarTicketId()}\n\nQualquer coisa, estarei por aqui! 👋`)
          sessions.delete(number)
        } else {
          await sendEvolutionText(instance, number, `Tudo bem! Qualquer coisa é só me chamar. 👋`)
          sessions.delete(number)
        }
        break

      case "coletar_setor":
        const setorRaw = userInput.toLowerCase().trim()
        const setoresValidos = ["vitoria", "serra", "vale", "arcelor"]
        const setorFinal = setoresValidos.find(s => setorRaw.includes(s))

        if (!setorFinal) {
          await sendEvolutionText(instance, number, `Ops, não reconheci o setor. Tenta escrever: Vitória, Serra, Vale ou Arcelor.\n\nSe preferir, pode escolher direto no portal: ${LINK_PORTAL}/${gerarTicketId()}`)
          return NextResponse.json({ ok: true })
        }

        await sendEvolutionText(instance, number, `Só um segundinho, ${session.nome}, estou gerando seu protocolo... ⏳`)
        const resultado = await enviarChamado(session.nome || "", session.cpf || "", setorFinal, session.resumo || "")

        if (resultado.success) {
          await sendEvolutionText(instance, number, `Prontinho! ✨\n\nTicket: *${resultado.ticketId}*\nSetor: *${setorFinal.toUpperCase()}*\n\nO time já foi avisado e logo te responde!`)
        } else {
          await sendEvolutionText(instance, number, `Tive um probleminha no sistema agora. 😟 Para não te deixar na mão, abre pelo portal que é garantido: ${LINK_PORTAL}/${gerarTicketId()}`)
        }
        sessions.delete(number)
        break
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("ERRO WEBHOOK:", err)
    return NextResponse.json({ ok: true })
  }
}