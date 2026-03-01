import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const CPFS_COLABORADORES = ["12345678901", "98765432100", "11122233344"]

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

type FlowState = "inicio" | "identificacao" | "coletar_motivo" | "escolher_abertura" | "coletar_setor"

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
    const typingDelay = Math.min(Math.max(1500, text.length * 30), 4000); // Dinâmico mas controlado
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
    
    // Recupera ou cria sessão
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
          await sendEvolutionText(instance, number, `Prazer em te conhecer, ${session.nome}! ✨\n\nPara eu acessar seu painel de colaborador, poderia me digitar seu CPF? (Apenas os números).`)
        } else {
          const cleanCPF = userInput.replace(/\D/g, "")
          if (cleanCPF.length === 11 && CPFS_COLABORADORES.includes(cleanCPF)) {
            session.cpf = cleanCPF
            session.state = "coletar_motivo"
            await sendEvolutionText(instance, number, `Certo, localizei você! ✅\n\nComo posso te ajudar hoje? Pode me descrever sua dúvida ou o que está acontecendo.`)
          } else {
            await sendEvolutionText(instance, number, `Poxa, não achei esse CPF aqui no sistema. 🤔\n\nTenta digitar novamente, conferindo se os 11 números estão certinhos.`)
          }
        }
        break

      case "coletar_motivo":
        session.resumo = userInput
        const aiResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: `Você é a Hevelyn, assistente virtual da Nolevel. 
              Seja educada, humana e use emojis.
              Responda com base no Quadro de Avisos: ${QUADRO_DE_AVISOS}.
              Se a resposta estiver no quadro, resuma-a gentilmente. 
              Se não estiver, diga que não tem essa informação específica agora e que o melhor é abrir um chamado.` },
            { role: "user", content: userInput }
          ],
          temperature: 0.7
        })

        const respostaIA = aiResponse.choices[0].message.content || "Entendi sua solicitação."
        await sendEvolutionText(instance, number, respostaIA)
        
        session.state = "escolher_abertura"
        await sendEvolutionText(instance, number, `Deseja que eu registre um chamado oficial para você agora?\n\n1️⃣ - Sim, abrir chamado\n2️⃣ - Não, obrigado`)
        break

      case "escolher_abertura":
        const cleanInput = userInput.trim()
        if (cleanInput === "1" || cleanInput.toLowerCase().includes("sim") || cleanInput.toLowerCase().includes("quero")) {
          session.state = "coletar_setor"
          await sendEvolutionText(instance, number, `Ótimo! Vou agilizar isso. Para qual setor você quer enviar o chamado?\n\n📍 Vitória\n📍 Serra\n📍 Vale\n📍 Arcelor`)
        } else {
          await sendEvolutionText(instance, number, `Tudo bem! Fico à disposição. Se mudar de ideia ou precisar de outra coisa, é só me chamar. 👋`)
          sessions.delete(number)
        }
        break

      case "coletar_setor":
        const setor = userInput.toLowerCase().trim()
        const setoresValidos = ["vitoria", "serra", "vale", "arcelor"]

        if (!setoresValidos.some(s => setor.includes(s))) {
          await sendEvolutionText(instance, number, `Ops, não reconheci esse setor. 🤔\n\nPor favor, escolha entre: Vitória, Serra, Vale ou Arcelor.`)
          return NextResponse.json({ ok: true })
        }

        // Extrai o nome exato do setor
        const setorFinal = setoresValidos.find(s => setor.includes(s))!

        await sendEvolutionText(instance, number, `Só um segundinho, ${session.nome}, estou gerando seu protocolo... ⏳`)

        const resultado = await enviarChamado(session.nome || "", session.cpf || "", setorFinal, session.resumo || "")

        if (resultado.success) {
          await sendEvolutionText(instance, number, `Prontinho! ✨\n\nSeu chamado foi registrado para o setor *${setorFinal.toUpperCase()}*.\n🎫 Protocolo: *${resultado.ticketId}*\n\nO time vai analisar e entrará em contato em breve!`)
        } else {
          await sendEvolutionText(instance, number, `Houve um pequeno erro no sistema de tickets, mas não se preocupe. 😟\n\nVocê pode abrir diretamente pelo nosso site: https://nolevel-bot.vercel.app/chamado`)
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