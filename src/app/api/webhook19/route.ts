import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  buscarAvisos,
  getMemoria,
  validarCpf,
  saveMemoria,
  saudacao,
  StatusChamado,
  enviarChamado,
  sendEvolutionText,
  generateRandomTicket
} from "@/app/hooks/usedata";
import { Chamado } from "@prisma/client";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SETORES = ["RH", "TI", "Financeiro", "Comercial", "Vendas", "Suporte", "Manutenção", "Logística", "Medicina", "Segurança", "Limpeza", "Juridico"] as const;

const avisos = await buscarAvisos(); // utlizar os avisos

const FlowState = {
  INICIO: "inicio",
  IDENTIFICACAO_CPF: "identificacao_cpf",
  IDENTIFICACAO_NOME: "identificacao_nome",
  MENU_PRINCIPAL: "menu_principal",
  COLETAR_MOTIVO: "coletar_motivo",
  VERIFICAR_AVISOS: "verificar_aviso",
  ESCOLHER_ABERTURA: "escolher_abertura",
  COLETAR_SETOR: "coletar_setor"
} as const;

const menuString = "1. Abrir Chamado, 2. Consultar Chamado";
const sessions = new Map<string, UserSession>();
const empresa = 'Nolevel';
const LINK_PORTAL = `https://nolevel-bot.vercel.app`;


// --- FUNÇÃO DE VALIDAÇÃO CORRIGIDA ---


type FlowStateValues = typeof FlowState[keyof typeof FlowState];

type UserSession = {
  state: FlowStateValues;
  nome?: string;
  cpf?: string;
  resumoHistorico?: string;
  motivoAtual?: string;
  lastInteraction: number;
};



async function hevelynIA(session: UserSession, userInput: string, instrucaoEtapa: string) {
  const avisos = await buscarAvisos();
  const statusAtual = session.cpf ? await StatusChamado(session.cpf) : "Nenhum CPF informado";
  const saudacaoTexto = saudacao(); // Chamando a função para pegar o texto real

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
            Você é a Hevelyn, atendente virtual da ${empresa}. 
            REGRAS: Se apresente de forma cordial. Use a saudação: ${saudacaoTexto}.
            Nunca saia do papel. Seja empática e direta.
            Ao atender o usuario, depois de todas as validações antes de transferir o atendimento, 
            verifique se no quadro de avisos: ${avisos || "Nenhum"} tem algum tem algo relacionado a duvida ou solicitação dele.

            Sua função principal é ajudar os clientes a resolver suas dúvidas e solicitações, impedir que problemas comuns cheguem
            no administrativo da empresa, portanto, apenas se o problema não tiver solução no quadro de avisos: ${avisos || "Nenhum"},
            ele deve ser transferido e mesmo assim, isso deve ser feito apenas se o usuario declarar esse desejo.

             **tente mostrar opções como um menu mesmo, ou seja, 1. Abrir Chamado, 2. Consultar Chamado. (use emogis representativos)
             
      .
            
            CONTEXTO:
            - Nome: ${session.nome || "Não identificado"}
            - CPF: ${session.cpf || "Não identificado"}
            - memoria: ${await getMemoria(session.cpf || "") || "Nenhum"}
            - Histórico: ${session.resumoHistorico || "Nenhum"}
            - Avisos: ${avisos || "Nenhum"}
            - Chamados: ${JSON.stringify(statusAtual)}
            - Etapa Atual: ${session.state}
            - Instrução: ${instrucaoEtapa}
            - Menu: ${menuString}
          `
        },
        { role: "user", content: userInput }
      ],
      temperature: 0.5
    });
    return response.choices[0].message.content || "Poderia repetir?";
  } catch (error) {
    console.error("Erro OpenAI:", error);
    return `Olá! ${saudacaoTexto}. Estou com uma instabilidade técnica, mas podemos continuar com as opções: ${menuString}`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.event !== "messages.upsert") return NextResponse.json({ ok: true });

    const data = body.data;
    if (!data?.message || data.key?.fromMe) return NextResponse.json({ ok: true });

    const number = data.key.remoteJid;
    const instance = body.instance;

    const userInput = (
      data.message.conversation ||
      data.message.extendedTextMessage?.text ||
      ""
    ).trim();

    const lowerInput = userInput.toLowerCase();

    let session = sessions.get(number);

    if (!session || Date.now() - session.lastInteraction > 1000 * 60 * 60 * 2) {
      session = { state: FlowState.INICIO, lastInteraction: Date.now() };
      sessions.set(number, session);
    }

    session.lastInteraction = Date.now();

    if (["sair", "encerrar", "cancelar"].includes(lowerInput)) {
      await sendEvolutionText(instance, number, "Atendimento encerrado.");
      sessions.delete(number);
      return NextResponse.json({ ok: true });
    }

    switch (session.state) {
      case FlowState.INICIO: {
        await sendEvolutionText(
          instance,
          number,
          "Olá! Eu sou a Hevelyn.\n\nPara começar, informe seu CPF."
        );
        session.state = FlowState.IDENTIFICACAO_CPF;
        break;
      }

      case FlowState.IDENTIFICACAO_CPF: {
        const cleanCPF = userInput.replace(/\D/g, "");
        const resCpf = await validarCpf(cleanCPF);

        if (resCpf && resCpf.valido) {
          session.cpf = cleanCPF;
          session.nome = resCpf.nome;

          if (session.nome) {
            await sendEvolutionText(
              instance,
              number,
              `Olá, *${session.nome}*!\n\n${menuString}`
            );
            session.state = FlowState.MENU_PRINCIPAL;
          } else {
            await sendEvolutionText(
              instance,
              number,
              "CPF validado. Como devo te chamar?"
            );
            session.state = FlowState.IDENTIFICACAO_NOME;
          }
        } else {
          await sendEvolutionText(
            instance,
            number,
            "CPF não encontrado. Digite novamente apenas números."
          );
        }
        break;
      }

      case FlowState.IDENTIFICACAO_NOME: {
        session.nome = userInput;
        await sendEvolutionText(
          instance,
          number,
          `Prazer, *${session.nome}*.\n\n${menuString}`
        );
        session.state = FlowState.MENU_PRINCIPAL;
        break;
      }

      case FlowState.MENU_PRINCIPAL: {
        if (["1", "abrir"].some(v => lowerInput.includes(v))) {
          await sendEvolutionText(
            instance,
            number,
            "Por favor, descreva o motivo do seu chamado da forma mais detalhada possível."
          );
          session.state = FlowState.COLETAR_MOTIVO;
        } 
        else if (["2", "status", "consultar"].some(v => lowerInput.includes(v))) {
          const status = await StatusChamado(session.cpf || "");
          if (status && status.length > 0) {
            const lista = status
              .map((t: any) => `*Ticket:* ${t.ticket}\n*Status:* ${t.status}`)
              .join("\n\n");
            await sendEvolutionText(instance, number, lista);
          } else {
            await sendEvolutionText(instance, number, "Nenhum chamado encontrado.");
          }
          session.state = FlowState.MENU_PRINCIPAL;
        } else {
          await sendEvolutionText(instance, number, "Não entendi. Escolha uma das opções do menu.");
        }
        break;
      }

      case FlowState.COLETAR_MOTIVO: {
        session.motivoAtual = userInput;

        // --- VERIFICAÇÃO SILENCIOSA DE AVISOS ---
        const avisos = await buscarAvisos();
        let avisoEncontrado = false;

        if (avisos && avisos.length > 0) {
          const prompt = `
            O usuário quer abrir um chamado com o seguinte relato: "${userInput}"
            
            Existem estes avisos internos no sistema:
            ${JSON.stringify(avisos)}

            Analise se algum aviso resolve ou explica o problema do usuário.
            - Se houver relação: Explique o que está acontecendo de forma prestativa, aja como se você já soubesse da informação. Termine perguntando: "Mesmo assim, você ainda deseja abrir um novo chamado? (1. Sim / 2. Não)"
            - Se NÃO houver relação: Responda apenas a palavra: SEM_AVISO
            
            IMPORTANTE: Nunca mencione "quadro de avisos", "sistema de alertas" ou "base de dados". Fale como se fosse um conhecimento seu.
          `;

          const analise = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }]
          });

          const respostaIA = analise.choices[0].message.content || "";

          if (!respostaIA.includes("SEM_AVISO")) {
            await sendEvolutionText(instance, number, respostaIA);
            session.state = FlowState.VERIFICAR_AVISOS;
            avisoEncontrado = true;
          }
        }

        // Se nenhum aviso foi relevante, segue o fluxo normal
        if (!avisoEncontrado) {
          await sendEvolutionText(
            instance,
            number,
            `Entendido. Para qual setor deseja encaminhar este chamado?\n\n*Setores:* ${SETORES.join(", ")}`
          );
          session.state = FlowState.COLETAR_SETOR;
        }
        break;
      }

      case FlowState.VERIFICAR_AVISOS: {
        // Se o usuário insistir após o aviso ou disser sim
        if (["1", "sim", "quero"].some(v => lowerInput.includes(v))) {
          await sendEvolutionText(
            instance,
            number,
            `Ok, vamos prosseguir. Para qual setor deseja encaminhar?\n\n*Setores:* ${SETORES.join(", ")}`
          );
          session.state = FlowState.COLETAR_SETOR;
        } else {
          await sendEvolutionText(
            instance,
            number,
            "Perfeito. Fico à disposição se precisar de algo mais!\n\n" + menuString
          );
          session.state = FlowState.MENU_PRINCIPAL;
        }
        break;
      }

      case FlowState.COLETAR_SETOR: {
        const setor = SETORES.find(s => lowerInput.includes(s.toLowerCase()));

        if (setor) {
          const ok = await enviarChamado(
            session.nome || "Usuário",
            session.cpf || "",
            setor,
            session.motivoAtual || ""
          );

          if (ok) {
            await sendEvolutionText(instance, number, `✅ Chamado aberto com sucesso para o setor *${setor}*!`);
          } else {
            const ticketErr = generateRandomTicket();
            await sendEvolutionText(instance, number, `Houve um problema na integração, mas seu protocolo manual é: ${ticketErr}`);
          }
          session.state = FlowState.MENU_PRINCIPAL;
          await sendEvolutionText(instance, number, menuString);
        } else {
          await sendEvolutionText(
            instance,
            number,
            `Setor não reconhecido. Por favor, escolha um destes: ${SETORES.join(", ")}`
          );
        }
        break;
      }
    }

    sessions.set(number, session);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro crítico no webhook:", error);
    return NextResponse.json({ ok: true });
  }
}
