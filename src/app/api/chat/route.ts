import { Chamado } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SETORES = ["RH", "TI", "Financeiro", "Comercial", "Vendas", "Suporte", "Manutenção", "Logística", "Medicina", "Segurança", "Limpeza", "Juridico"]
const empresa = 'Nolevel';
const LINK_PORTAL = `https://nolevel-bot.vercel.app`;
const LINK_CHAMADOS = `${LINK_PORTAL}/chamado`;
const lINK_CONSULTA = `${LINK_PORTAL}/consulta`;

type FlowState = "inicio" | "identificacao_cpf" | "identificacao_nome" | "menu_principal" | "coletar_motivo" | "verificar_aviso" | "escolher_abertura" | "coletar_setor"

type UserSession = {
  state: FlowState
  nome?: string
  cpf?: string
  resumoHistorico?: string
  motivoAtual?: string
  lastInteraction: number
}

const sessions = new Map<string, UserSession>()

interface Colaborador {
  nome: string;
  cpf: string;
}

// --- FUNÇÕES AUXILIARES ---

async function validarCPF(cpfDigitado: string): Promise<{ valido: boolean, nome?: string }> {
  try {
    const response = await fetch(`https://nolevel-bot.vercel.app/api/cpfs`, { cache: 'no-store' });
    if (!response.ok) return { valido: false };
    const listaDeCpfs: Colaborador[] = await response.json();
    const cpfLimpo = cpfDigitado.replace(/\D/g, "");
    const colaborador = listaDeCpfs.find((item: Colaborador) => item.cpf.replace(/\D/g, "") === cpfLimpo);
    return colaborador ? { valido: true, nome: colaborador.nome } : { valido: false };
  } catch (error) {
    return { valido: false };
  }
}

function saudacao() {
  const hora = new Date().getHours()
  if (hora >= 5 && hora < 12) return "Bom dia"
  if (hora >= 12 && hora < 18) return "Boa tarde"
  return "Boa noite"
}

async function buscarAvisos() {
  try {
    const res = await fetch(`https://nolevel-bot.vercel.app/api/quadro-avisos`, { cache: "no-store" })
    const data = await res.json()
    return data.map((a: { titulo: string; conteudo: string }) => `📢 *${a.titulo}*: ${a.conteudo}`).join("\n") || "Sem avisos no momento."
  } catch { return "Sem avisos." }
}

async function getMemoria(cpf: string) {
  try {
    const res = await fetch(`https://nolevel-bot.vercel.app/api/memories?cpf=${cpf}`, { cache: 'no-store' })
    return res.ok ? (await res.json())?.resumo : null
  } catch { return null }
}

async function StatusChamado(cpf: string) {
  try {
    const res = await fetch(`https://nolevel-bot.vercel.app/api/tickets?cpf=${cpf}`)
    return res.ok ? await res.json() : []
  } catch { return [] }
}

async function enviarChamado(nome: string, cpf: string, setor: string, descricao: string) {
  try {
    const formData = new FormData()
    formData.append("nome", nome); formData.append("cpf", cpf);
    formData.append("setor", setor); formData.append("descricao", descricao);
    const res = await fetch(`https://nolevel-bot.vercel.app/api/tickets`, { method: "POST", body: formData });
    return res.ok
  } catch { return false }
}

// --- NÚCLEO DA IA (ALINHADO COM WHATSAPP) ---

async function hevelynIA(session: UserSession, userInput: string, instrucaoEtapa: string) {
  const avisos = await buscarAvisos();
  const statusAtual = session.cpf ? await StatusChamado(session.cpf) : "Nenhum CPF informado";
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
            Você é a Hevelyn, atendente virtual da ${empresa}. 
            PERSONA: Cordial, empática e direta. Use a saudação: ${saudacao()}.
            
            DIRETRIZ DE AVISOS (CRÍTICO):
            Antes de qualquer abertura de chamado, verifique os avisos: ${avisos}.
            - Se o relato do usuário bater com um aviso, explique a situação e pergunte se quer continuar.
            - Se não houver aviso relacionado, responda apenas: PROSSEGUIR_FLUXO.

            CONTEXTO DO USUÁRIO:
            - Nome: ${session.nome || "Ainda não informado"}
            - CPF: ${session.cpf || "Ainda não informado"}
            - Chamados Atuais: ${JSON.stringify(statusAtual)}
            
            ETAPA ATUAL: ${session.state}
            INSTRUÇÃO ESPECÍFICA: ${instrucaoEtapa}

            ENCERRAMENTO E LINKS (IMPORTANTE):
            - Sempre que encerrar ou oferecer ajuda extra, apresente os links de forma clara e direta.
            - Para garantir que sejam clicáveis no chat, envie a URL completa e pura.
            - Link para abertura: ${LINK_CHAMADOS}
            - Link para consulta: ${lINK_CONSULTA}
            - Exemplo de formato: "Você também pode acessar nosso portal: ${LINK_CHAMADOS}"
          `
        },
        { role: "user", content: userInput }
      ],
      temperature: 0.5
    })
    return response.choices[0].message.content || "Pode repetir, por favor?"
  } catch { return "Tive um probleminha técnico, mas pode continuar." }
}
// --- ROTA POST ---

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const userInput = body.message?.trim() || ""
    const sessionId = body.sessionId || "web-user"

    let session = sessions.get(sessionId)
    if (!session || (Date.now() - session.lastInteraction > 1000 * 60 * 60)) {
      session = { state: "inicio", lastInteraction: Date.now() }
      sessions.set(sessionId, session)
    }
    session.lastInteraction = Date.now()

    const lowerInput = userInput.toLowerCase()

    if (["obrigado", "tchau", "sair", "encerrar", "cancelar"].some(w => lowerInput.includes(w))) {
      const tchau = await hevelynIA(session, userInput, "Despeça-se amigavelmente, sem dizer boa noite, ou boa tarde, apenas  informando que o atendimento foi encerrado.")
      sessions.delete(sessionId)
      return NextResponse.json({ reply: tchau })
    }

    switch (session.state) {
      case "inicio": {
        const resp = await hevelynIA(session, userInput, `O usuário acabou de chegar. 
          Dê as boas-vindas se apresente,   e peça OBRIGATORIAMENTE o CPF para começar o atendimento.`)
        session.state = "identificacao_cpf"
        sessions.set(sessionId, session)
        return NextResponse.json({ reply: resp })
      }

      case "identificacao_cpf": {
        const cleanCPF = userInput.replace(/\D/g, "")
        if (cleanCPF.length !== 11) {
          return NextResponse.json({ reply: "Por favor, informe um CPF válido (apenas os 11 números)." })
        }

        const resCpf = await validarCPF(cleanCPF)
        if (resCpf.valido) {
          session.cpf = cleanCPF
          session.nome = resCpf.nome
          session.resumoHistorico = await getMemoria(cleanCPF)

          const instrucao = session.nome 
            ? `CPF ${cleanCPF} validado. O nome dele é ${session.nome}. Saude-o e apresente as opções: 1. Abrir Chamado, 2. Consultar Chamado`
            : `CPF ${cleanCPF} validado. Pergunte como o usuário gostaria de ser chamado.`;
          
          const resposta = await hevelynIA(session, userInput, instrucao);
          session.state = session.nome ? "menu_principal" : "identificacao_nome";
          sessions.set(sessionId, session)
          return NextResponse.json({ reply: resposta })
        } else {
          return NextResponse.json({ reply: "Infelizmente não encontrei seu CPF na nossa base de colaboradores. Pode digitar novamente?" })
        }
      }

      case "identificacao_nome": {
        session.nome = userInput
        session.state = "menu_principal"
        const resp = await hevelynIA(session, userInput, "Agora que já sabe o nome, apresente as opções: 1. Abrir Chamado, 2. Consultar Chamado")
        sessions.set(sessionId, session)
        return NextResponse.json({ reply: resp })
      }

      case "menu_principal": {
        if (["1", "abrir", "chamado"].some(v => lowerInput.includes(v))) {
          session.state = "coletar_motivo"
          sessions.set(sessionId, session)
          return NextResponse.json({ reply: "Com certeza! Me conta o que está acontecendo? (Pode descrever o problema detalhadamente)" })
        }
        if (["2", "status", "consultar"].some(v => lowerInput.includes(v))) {
          const status = await StatusChamado(session.cpf!)
          const lista = status.length > 0 
            ? status.map((t: Chamado) => `🎫 *Ticket:* ${t.ticket} - Status: ${t.status}`).join("\n")
            : "Não encontrei chamados abertos para você."
          return NextResponse.json({ reply: `${lista}\n\nPosso ajudar com algo mais?` })
        }
        
        const resposta = await hevelynIA(session, userInput, `Tente identificar o que ele quer, caso não consiga encerre 
          amigavelmente.Não faça suposições, apenas encerre o atendimento, ao finalizar não precisa dizer boa tarde, bom dia ou boa noite,
          apenas encerre`)
        return NextResponse.json({ reply: resposta })
      }

      case "coletar_motivo": {
        session.motivoAtual = userInput
        const analiseIA = await hevelynIA(
          session, 
          userInput, 
          "INSTRUÇÃO: Verifique se o problema relatado bate com os 'Avisos' do sistema. Se bater, explique o aviso e pergunte se quer abrir o chamado mesmo assim. Se NÃO bater, responda apenas: PROSSEGUIR_FLUXO"
        );

        if (analiseIA.includes("PROSSEGUIR_FLUXO")) {
          session.state = "coletar_setor"
          sessions.set(sessionId, session)
          return NextResponse.json({ reply: `Entendido. Para qual setor devo enviar?\n\n📍 *Setores:* ${SETORES.join(", ")}` })
        } else {
          session.state = "verificar_aviso"
          sessions.set(sessionId, session)
          return NextResponse.json({ reply: analiseIA })
        }
      }

      case "verificar_aviso": {
        if (["1", "sim", "quero", "continuar", "prosseguir"].some(v => lowerInput.includes(v))) {
          session.state = "coletar_setor"
          sessions.set(sessionId, session)
          return NextResponse.json({ reply: `Perfeito, vou dar seguimento. Para qual setor deseja enviar?\n\n📍 *Setores:* ${SETORES.join(", ")}` })
        } else {
          session.state = "menu_principal"
          sessions.set(sessionId, session)
          return NextResponse.json({ reply: "Sem problemas! Como posso ajudar agora?\n\n1. Abrir Chamado\n2. Consultar Chamado" })
        }
      }

      case "coletar_setor": {
        const setor = SETORES.find(s => lowerInput.includes(s.toLowerCase()))
        if (!setor) return NextResponse.json({ reply: `Não reconheci esse setor. Escolha um destes: ${SETORES.join(", ")}` })

        const ok = await enviarChamado(session.nome!, session.cpf!, setor, session.motivoAtual!)
        session.state = "menu_principal"
        sessions.set(sessionId, session)
        return NextResponse.json({ 
          reply: ok ? `✅ Tudo pronto! Seu chamado para *${setor}* foi registrado. Deseja tratar de mais algum assunto?` : "Erro ao criar chamado. Tente novamente mais tarde." 
        })
      }
    }

    return NextResponse.json({ reply: "Desculpe, ocorreu um erro no fluxo. Como posso ajudar?" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ reply: "Houve um erro interno." }, { status: 500 })
  }
}