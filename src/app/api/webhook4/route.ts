import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { prisma } from "@/lib/prisma"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const CPFS_COLABORADORES = ["12345678901", "98765432100", "11122233344"]

const QUADRO_DE_AVISOS = `
1. Problemas com Email: Reinicie a senha no portal self-service da empresa.
2. Lentidão no Sistema: Manutenção programada nos servidores até as 14h de hoje.
3. Solicitação de Férias: Deve ser feita exclusivamente pelo App RH Digital com 30 dias de antecedência.
4. Entrega de Atestados: Enviar foto legível para o email saude@empresa.com.br em até 48h.
5. Segunda Via de Contracheque: Disponível no Portal do Colaborador na aba 'Financeiro'.
6. Cartão Alimentação/Refeição: Se o cartão não passou, verifique o saldo no App da operadora. Recargas ocorrem todo dia 01.
7. Substituição de EPI: Vá até o almoxarifado do seu contrato atual e assine a cautela de troca.
8. Crachá Perdido ou Danificado: Informe ao seu supervisor imediato para que ele solicite a 2ª via via malote.
9. Vale Transporte: Atualizações de trajeto devem ser solicitadas até o dia 15 de cada mês para o RH da matriz.
10. Erro no Batimento de Ponto: O ajuste deve ser feito direto com o administrativo do seu contrato via formulário de correção.
11. Uniforme Rasgado/Tamanho Errado: Solicite a troca enviando suas medidas atuais para o setor de suprimentos.
12. Pagamento não caiu: Verifique se sua conta bancária está ativa e sem restrições antes de abrir um chamado.
13. Solicitação de Adiantamento (Val): Só é permitida para quem tem mais de 3 meses de contrato, via App RH.
14. Equipamento de Trabalho com Defeito: Entregue ao fiscal de contrato para envio à manutenção.
15. Mudança de Endereço ou Telefone: Atualize seus dados no Portal do Colaborador.
16. Reembolso de Despesas: Envie notas fiscais para financeiro@empresa.com.br.
17. Treinamentos Obrigatórios: Cronograma enviado pelo SESMT.
18. Licença Maternidade/Paternidade: Solicitar via Portal.
19. Informe de Rendimentos: Disponível na aba 'Documentos'.
20. Convênio Médico: Lista de clínicas no site da seguradora.
`

type FlowState =
  | "coletar_nome"
  | "identificacao"
  | "coletar_motivo"
  | "escolher_abertura"
  | "coletar_setor"

type UserSession = {
  state: FlowState
  nome?: string
  cpf?: string
  resumo?: string
  historico: { role: "user" | "assistant"; content: string }[]
}

const sessions = new Map<string, UserSession>()

function getSession(userId: string): UserSession {
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      state: "coletar_nome",
      historico: []
    })
  }
  return sessions.get(userId)!
}

function gerarTicketId(): string {
  return `TKT-${Date.now()}`
}

async function sendEvolutionText(instance: string, number: string, text: string) {
  await fetch(`${process.env.EVOLUTION_API_URL}/message/sendText/${instance}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.EVOLUTION_API_KEY as string
    },
    body: JSON.stringify({ number, text })
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (body.event !== "messages.upsert") return NextResponse.json({ ok: true })

    const data = body.data
    if (!data || !data.message || data.key?.fromMe) {
      return NextResponse.json({ ok: true })
    }

    const number = data.key.senderPn || data.key.remoteJid
    const instance = body.instance || data.instance
    const session = getSession(number)

    const userInput =
      data.message.conversation ||
      data.message.extendedTextMessage?.text ||
      ""

    if (!userInput) return NextResponse.json({ ok: true })

    if (session.state === "coletar_nome") {
      session.nome = userInput.trim()
      session.state = "identificacao"
      await sendEvolutionText(instance, number, "Agora informe seu CPF com 11 números.")
      return NextResponse.json({ ok: true })
    }

    if (session.state === "identificacao") {
      const cleanCPF = userInput.replace(/\D/g, "")
      if (cleanCPF.length === 11 && CPFS_COLABORADORES.includes(cleanCPF)) {
        session.cpf = cleanCPF
        session.state = "coletar_motivo"
        await sendEvolutionText(instance, number, "CPF validado. Me conta o que está acontecendo.")
      } else {
        await sendEvolutionText(instance, number, "CPF inválido ou não encontrado. Digite novamente.")
      }
      return NextResponse.json({ ok: true })
    }

    if (session.state === "coletar_motivo") {
      session.historico.push({ role: "user", content: userInput })

      const promptIA = `
Você é a Hevelyn, assistente de suporte da Nolevel. Nunca saia do personagem.

Diretrizes:
- Máximo 4 linhas.
- Linguagem simples e direta.
- Se não resolver pelo quadro, ofereça abertura de chamado.

Conhecimento:
${QUADRO_DE_AVISOS}

Usuário disse: "${userInput}"
Responda apenas o texto da conversa.
`

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: promptIA }],
        temperature: 0.3
      })

      const aiResponse = response.choices[0].message.content || ""
      await sendEvolutionText(instance, number, aiResponse)

      session.resumo = userInput
      session.state = "escolher_abertura"

      await sendEvolutionText(
        instance,
        number,
        "Você prefere:\n1 - Que eu abra o chamado agora\n2 - Receber o link para abrir manualmente\n\nResponda 1 ou 2."
      )

      return NextResponse.json({ ok: true })
    }

    if (session.state === "escolher_abertura") {
      if (userInput.trim() === "1") {
        session.state = "coletar_setor"
        await sendEvolutionText(instance, number, "Informe seu setor: vitoria, serra, vale ou arcelor.")
      } else if (userInput.trim() === "2") {
        await sendEvolutionText(instance, number, "Abra seu chamado pelo link:\nhttps://seusite.com/abrir-chamado")
        session.state = "coletar_nome"
        session.nome = undefined
        session.cpf = undefined
        session.resumo = undefined
      } else {
        await sendEvolutionText(instance, number, "Responda apenas 1 ou 2.")
      }
      return NextResponse.json({ ok: true })
    }

    if (session.state === "coletar_setor") {
      const setor = userInput.toLowerCase()
      const setoresValidos = ["vitoria", "serra", "vale", "arcelor"]

      if (!setoresValidos.includes(setor)) {
        await sendEvolutionText(instance, number, "Setor inválido.")
        return NextResponse.json({ ok: true })
      }

      const ticket = gerarTicketId()

      await prisma.chamado.create({
        data: {
          ticket,
          nome: session.nome!,
          cpf: session.cpf!,
          setor,
          descricao: session.resumo!,
          prioridade: "normal",
          status: "aberto"
        }
      })

      await sendEvolutionText(instance, number, `Chamado aberto.\nNúmero: ${ticket}`)

      session.state = "coletar_nome"
      session.nome = undefined
      session.cpf = undefined
      session.resumo = undefined

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("ERRO WEBHOOK:", err)
    return NextResponse.json({ error: true }, { status: 500 })
  }
}