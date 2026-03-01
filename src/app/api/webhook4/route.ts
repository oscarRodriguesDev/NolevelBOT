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

// --- FUNÇÕES DE HUMANIZAÇÃO ---

function obterSaudacao() {
  const hora = new Date().getHours()
  if (hora < 12) return "Bom dia"
  if (hora < 18) return "Boa tarde"
  return "Boa noite"
}

async function sendEvolutionText(instance: string, number: string, text: string) {
  try {
    // Simula tempo de leitura/digitação: 50ms por caractere (mínimo 1.5s)
    const typingDelay = Math.max(1500, text.length * 50);
    
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
    return { success: true, ticketId: data.ticket || "Gerado" };
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
    const session = sessions.get(number) || { state: "inicio", lastInteraction: Date.now() }

    // Reinicia se ficar muito tempo parado (ex: 2 horas)
    if (Date.now() - session.lastInteraction > 1000 * 60 * 60 * 2) {
      session.state = "inicio"
    }
    session.lastInteraction = Date.now()
    sessions.set(number, session)

    switch (session.state) {
      case "inicio":
        await sendEvolutionText(instance, number, `${obterSaudacao()}! Sou a Hevelyn da Nolevel. 😊 Antes de começarmos, com quem eu falo?`)
        session.state = "identificacao"
        break

      case "identificacao":
        if (!session.nome) {
          session.nome = userInput.trim()
          await sendEvolutionText(instance, number, `Prazer em te conhecer, ${session.nome}! ✨ Por uma questão de segurança, poderia me passar seu CPF? Só os números já servem.`)
        } else {
          const cleanCPF = userInput.replace(/\D/g, "")
          if (cleanCPF.length === 11 && CPFS_COLABORADORES.includes(cleanCPF)) {
            session.cpf = cleanCPF
            session.state = "coletar_motivo"
            await sendEvolutionText(instance, number, `Perfeito, localizei você aqui. Como posso te ajudar hoje? Pode me contar o que está acontecendo.`)
          } else {
            await sendEvolutionText(instance, number, `Ih, não consegui validar esse CPF... 🤔 Tem certeza que os números estão certinhos? Tenta digitar de novo para mim.`)
          }
        }
        break

      case "coletar_motivo":
        session.resumo = userInput
        const aiResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: `Você é a Hevelyn, uma assistente de suporte humano e empática. 
              REGRAS:
              1. Responda de forma natural, como se estivesse no WhatsApp.
              2. Use o quadro: ${QUADRO_DE_AVISOS}.
              3. Se a solução estiver no quadro, explique calmamente.
              4. Se não estiver, diga que compreende e pergunte se o usuário quer que você registre um chamado oficial.
              5. Nunca use listas numeradas rígidas, prefira parágrafos curtos.` },
            { role: "user", content: userInput }
          ],
          temperature: 0.8 // Mais criatividade/humanização
        })

        const resposta = aiResponse.choices[0].message.content || "Entendi sua situação."
        await sendEvolutionText(instance, number, resposta)
        
        session.state = "escolher_abertura"
        await sendEvolutionText(instance, number, `Consegui te ajudar ou você prefere que eu registre um chamado oficial para o pessoal do suporte resolver isso para você?`)
        break

      case "escolher_abertura":
        const input = userInput.toLowerCase()
        if (input.includes("sim") || input.includes("quero") || input.includes("abrir") || input.includes("1")) {
          session.state = "coletar_setor"
          await sendEvolutionText(instance, number, `Combinado! Só preciso que me diga qual o seu setor (Vitória, Serra, Vale ou Arcelor).`)
        } else {
          await sendEvolutionText(instance, number, `Entendido! Qualquer coisa, estou por aqui. Ah, se precisar abrir um chamado depois por conta própria, o link é este: https://nolevel-bot.vercel.app/chamado/web. Até mais! 👋`)
          sessions.delete(number)
        }
        break

      case "coletar_setor":
        const setor = userInput.toLowerCase().trim()
        const setoresValidos = ["vitoria", "serra", "vale", "arcelor"]

        if (!setoresValidos.includes(setor)) {
          await sendEvolutionText(instance, number, `Putz, não conheço esse setor. Escolhe um desses aqui: Vitória, Serra, Vale ou Arcelor.`)
          return NextResponse.json({ ok: true })
        }

        await sendEvolutionText(instance, number, `Só um segundinho, estou registrando tudo agora...`)

        const resultado = await enviarChamado(session.nome || "", session.cpf || "", setor, session.resumo || "")

        if (resultado.success) {
          await sendEvolutionText(instance, number, `Prontinho! O número do seu chamado é ${resultado.ticketId}. O pessoal vai analisar e te dar um retorno o quanto antes, tá bom? ✨`)
        } else {
          await sendEvolutionText(instance, number, `Poxa, o sistema de chamados deu um erro agora... 😕 Mas não vamos te deixar na mão! Tenta abrir manualmente por aqui: https://nolevel-bot.vercel.app/chamado/externo`)
        }
        sessions.delete(number)
        break
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("ERRO GERAL:", err)
    return NextResponse.json({ ok: true })
  }
}