import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Mock de CPFs (Idealmente, isso viria de um banco de dados)
const CPFS_COLABORADORES = ["12345678901", "98765432100", "11122233344"]

const QUADRO_DE_AVISOS = `
1. Problemas com Email: Reinicie a senha no portal self-service.
2. Lentidão no Sistema: Manutenção programada até as 14h de hoje.
3. Solicitação de Férias: App RH Digital com 30 dias de antecedência.
4. Entrega de Atestados: Email saude@empresa.com.br em até 48h.
5. Segunda Via de Contracheque: Portal do Colaborador > Financeiro.
6. Cartão Alimentação: Verifique o saldo no App. Recargas todo dia 01.
7. EPI: Vá ao almoxarifado do contrato e assine a cautela.
8. Crachá: Informe ao supervisor imediato.
9. Vale Transporte: Atualizações até o dia 15 no RH.
10. Ponto: Ajuste via formulário com o administrativo.
`

type FlowState = "inicio" | "identificacao" | "coletar_motivo" | "escolher_abertura" | "coletar_setor"

type UserSession = {
  state: FlowState
  nome?: string
  cpf?: string
  resumo?: string
}

const sessions = new Map<string, UserSession>()

// Função auxiliar para mensagens mais cordiais
async function sendEvolutionText(instance: string, number: string, text: string) {
  try {
    await fetch(`${process.env.EVOLUTION_API_URL}/message/sendText/${instance}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.EVOLUTION_API_KEY as string
      },
      body: JSON.stringify({ 
        number: number.replace("@s.whatsapp.net", ""), 
        text,
        options: { delay: 1200, presence: "composing" } // Simula digitação para ser mais humano
      })
    })
  } catch (error) {
    console.error("Erro ao enviar mensagem Evolution:", error)
  }
}

/**
 * Envia os dados do colaborador para a API de suporte e retorna o protocolo gerado.
 */
async function enviarChamado(nome: string, cpf: string, setor: string, descricao: string) {
  try {
    // 1. Definição da URL (Garanta que a variável NEXT_PUBLIC_BASE_URL esteja no seu .env)
    const url = `https://nolevel-bot.vercel.app/tickets`;

    // 2. Chamada para a API interna ou externa
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Caso sua API precise de um Token de Admin, adicione aqui:
        // "Authorization": `Bearer ${process.env.INTERNAL_API_TOKEN}`
      },
      body: JSON.stringify({
        nome,
        cpf,
        setor,
        descricao,
        prioridade: "normal", // Valor padrão
        origem: "WhatsApp_Evolution",
        dataAbertura: new Date().toISOString()
      }),
    });

    // 3. Verificação de erros de rede ou status (404, 500, etc)
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro na API de Tickets (${response.status}):`, errorText);
      return { success: false, error: "Falha ao registrar no banco de dados." };
    }

    // 4. Captura do retorno (Geralmente o banco retorna o ID ou Número do Ticket)
    const data = await response.json();

    return { 
      success: true, 
      ticketId: data.ticket || data.id || "Gerando...", // Fallback caso o nome do campo varie
      data: data 
    };

  } catch (error) {
    console.error("🚨 Erro crítico ao enviar chamado:", error);
    return { success: false, error: "Erro de conexão com o servidor." };
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validação básica do Webhook da Evolution
    if (body.event !== "messages.upsert") return NextResponse.json({ ok: true })
    const data = body.data
    if (!data?.message || data.key?.fromMe) return NextResponse.json({ ok: true })

    const number = data.key.remoteJid
    const instance = body.instance
    const userInput = data.message.conversation || data.message.extendedTextMessage?.text || ""
    
    if (!sessions.has(number)) {
      sessions.set(number, { state: "inicio" })
      await sendEvolutionText(instance, number, "Olá! 😊 Eu sou a Hevelyn, sua assistente virtual da Nolevel. Para começarmos, como você se chama?")
      return NextResponse.json({ ok: true })
    }

    const session = sessions.get(number)!

    // LÓGICA DO FLUXO (ESTADOS)
    switch (session.state) {
      
      case "inicio":
        session.nome = userInput.trim()
        session.state = "identificacao"
        await sendEvolutionText(instance, number, `Prazer em te conhecer, ${session.nome}! ✨\nAgora, por segurança, poderia me informar seu CPF? (Apenas os 11 números)`)
        break

      case "identificacao":
        const cleanCPF = userInput.replace(/\D/g, "")
        if (cleanCPF.length === 11 && CPFS_COLABORADORES.includes(cleanCPF)) {
          session.cpf = cleanCPF
          session.state = "coletar_motivo"
          await sendEvolutionText(instance, number, "CPF confirmado com sucesso! ✅\nComo posso te ajudar hoje? Pode descrever o que está acontecendo.")
        } else {
          await sendEvolutionText(instance, number, "Poxa, não encontrei esse CPF na nossa base de colaboradores. 🤔\nPor favor, digite novamente os 11 números com atenção.")
        }
        break

      case "coletar_motivo":
        session.resumo = userInput
        
        // Chamada IA Personalizada
        const promptIA = `Você é a Hevelyn, assistente de RH/Suporte da Nolevel.
        Seja gentil, use emojis e responda de forma acolhedora.
        Tente ajudar com base nestas informações: ${QUADRO_DE_AVISOS}.
        Se a resposta estiver no quadro, explique de forma educada.
        Se não estiver, ou se o usuário parecer frustrado, diga que pode abrir um chamado.
        Mantenha a resposta curta (máximo 4 linhas).`

        const aiResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: promptIA },
            { role: "user", content: userInput }
          ],
          temperature: 0.7 // Aumentado para respostas menos mecânicas
        })

        const textoIA = aiResponse.choices[0].message.content || "Entendi sua situação."
        await sendEvolutionText(instance, number, textoIA)

        // Transição para abertura de chamado
        session.state = "escolher_abertura"
        await sendEvolutionText(instance, number, "Ficou claro ou você prefere que eu registre um chamado oficial para o time te ajudar?\n\n1️⃣ - Abrir chamado agora\n2️⃣ - Receber link para abrir depois")
        break

      case "escolher_abertura":
        if (userInput.includes("1")) {
          session.state = "coletar_setor"
          await sendEvolutionText(instance, number, "Ótimo, vou agilizar isso! Para qual setor é o chamado?\n(Vitória, Serra, Vale ou Arcelor)")
        } else if (userInput.includes("2")) {
          await sendEvolutionText(instance, number, "Sem problemas! Quando precisar, você pode abrir por aqui: https://suporte.nolevel.com.br\n\nAlgo mais em que eu possa te ajudar?")
          sessions.delete(number) // Reseta a sessão
        } else {
          await sendEvolutionText(instance, number, "Não entendi bem... Digite '1' para eu abrir agora ou '2' para te enviar o link. 😉")
        }
        break

      case "coletar_setor":
        const setor = userInput.toLowerCase().trim()
        const setoresValidos = ["vitoria", "serra", "vale", "arcelor"]

        if (!setoresValidos.includes(setor)) {
          await sendEvolutionText(instance, number, "Desculpe, ainda não atendo esse setor. Escolha entre: Vitória, Serra, Vale ou Arcelor.")
          return NextResponse.json({ ok: true })
        }

        // TENTATIVA DE CRIAÇÃO DE TICKET COM LOGS
        try {
          const ticketUrl = `$https://nolevel-bot.vercel.app/tickets`
          const ticketRes = await fetch(ticketUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nome: session.nome,
              cpf: session.cpf,
              setor,
              descricao: session.resumo,
              prioridade: "normal",
              origem: "WhatsApp"
            })
          })

          if (ticketRes.ok) {
            const ticketData = await ticketRes.json()
            await sendEvolutionText(instance, number, `Prontinho, ${session.nome}! Seu chamado foi gerado com sucesso. ✨\n\n🎫 *Protocolo:* ${ticketData.ticket || ticketData.id}\nO time entrará em contato em breve!`)
            sessions.delete(number)
          } else {
            const errorText = await ticketRes.text()
            console.error("ERRO API TICKET:", errorText)
            throw new Error("Falha na API")
          }
        } catch (err) {
          console.error("ERRO CRITICAL TICKET:", err)
          await sendEvolutionText(instance, number, "Mil desculpas, mas tive um probleminha técnico ao salvar seu chamado no sistema. 😟\nPor favor, tente novamente em instantes ou use nosso portal web.")
        }
        break
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("ERRO GERAL WEBHOOK:", err)
    return NextResponse.json({ error: "Internal Error" }, { status: 500 })
  }
}

