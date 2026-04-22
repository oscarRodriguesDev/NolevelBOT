import { NextRequest, NextResponse } from "next/server";
import { botIA } from "@/app/hooks/useIA";
import {
  validarCpf,
  StatusChamado,
  enviarChamado,
  sendEvolutionText,
  generateRandomTicket
} from "@/app/hooks/usedata";
import { Chamado } from "@prisma/client";
import { getSetores } from "@/app/hooks/setores";

const SETORES = await getSetores(process.env.NEXT_PUBLIC_CNPJ!)

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
type FlowStateValues = typeof FlowState[keyof typeof FlowState];
type UserSession = {
  state: FlowStateValues;
  nome?: string;
  cpf?: string;
  resumoHistorico?: string;
  motivoAtual?: string;
  lastInteraction: number;
};





// --- WEBHOOK POST ---
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

    // Inicialização de Sessão
    if (!session || Date.now() - session.lastInteraction > 1000 * 60 * 60 * 2) {
      session = { state: FlowState.INICIO, lastInteraction: Date.now() };
      sessions.set(number, session);
    }

    session.lastInteraction = Date.now();

    // Comandos Globais de Encerramento
    if (["sair", "encerrar", "cancelar"].includes(lowerInput)) {
      await sendEvolutionText(instance, number, "Atendimento encerrado. Se precisar de novo, é só chamar!");
      sessions.delete(number);
      return NextResponse.json({ ok: true });
    }

    switch (session.state) {
      case FlowState.INICIO: {
        // Força a IA a pedir o CPF no primeiro "Oi"
        const resposta = await botIA(session, userInput, "O usuário acabou de chegar. Dê as boas-vindas e peça OBRIGATORIAMENTE o CPF para começar o atendimento.");
        await sendEvolutionText(instance, number, resposta);
        session.state = FlowState.IDENTIFICACAO_CPF;
        break;
      }

      case FlowState.IDENTIFICACAO_CPF: {
        const cleanCPF = userInput.replace(/\D/g, "");
        
        if (cleanCPF.length !== 11) {
          await sendEvolutionText(instance, number, "Por favor, informe um CPF válido (apenas os 11 números).");
          return NextResponse.json({ ok: true });
        }

        const resCpf = await validarCpf(cleanCPF);

        if (resCpf && resCpf.valido) {
          session.cpf = cleanCPF;
          session.nome = resCpf.nome;

          // Se já tem o nome, saúda e manda o menu. Se não, pergunta o nome.
          const instrucao = session.nome 
            ? `CPF ${cleanCPF} validado. O nome dele é ${session.nome}. Saude-o e apresente as opções: ${menuString}`
            : `CPF ${cleanCPF} encontrado. Pergunte como o usuário gostaria de ser chamado.`;
          
          const resposta = await botIA(session, userInput, instrucao);
          await sendEvolutionText(instance, number, resposta);
          
          session.state = session.nome ? FlowState.MENU_PRINCIPAL : FlowState.IDENTIFICACAO_NOME;
        } else {
          await sendEvolutionText(instance, number, "Hum, não consegui validar esse CPF! Por favor, tente novamente.");
        }
        break;
      }

      case FlowState.IDENTIFICACAO_NOME: {
        session.nome = userInput;
        const resposta = await botIA(session, userInput, `Agora que já sabe o nome (${userInput}), apresente o menu: ${menuString}`);
        await sendEvolutionText(instance, number, resposta);
        session.state = FlowState.MENU_PRINCIPAL;
        break;
      }

      case FlowState.MENU_PRINCIPAL: {
        if (["1", "abrir", "chamado"].some(v => lowerInput.includes(v))) {
          await sendEvolutionText(instance, number, "Com certeza! Me conta o que está acontecendo? (Pode descrever o problema detalhadamente)");
          session.state = FlowState.COLETAR_MOTIVO;
        } 
        else if (["2", "status", "consultar", "ver"].some(v => lowerInput.includes(v))) {
          const status = await StatusChamado(session.cpf || "");
          const lista = status.length > 0 
            ? status.map((t:Chamado) => `🎫 *Ticket:* ${t.ticket}\n🔄 *Status:* ${t.status}`).join("\n\n") 
            : "Não encontrei chamados abertos no seu CPF.";
          
          await sendEvolutionText(instance, number, `Aqui estão seus chamados:\n\n${lista}\n\nPosso ajudar com algo mais?`);
        } else {
          const resposta = await botIA(session, userInput, `Tente identificar o que ele quer, caso não consiga encerre 
          amigavelmente.Não faça suposições, apenas encerre o atendimento, ao finalizar não precisa dizer boa tarde, bom dia ou boa noite,
          apenas encerre`)
          await sendEvolutionText(instance, number, resposta);
        }
        break;
      }

      case FlowState.COLETAR_MOTIVO: {
        session.motivoAtual = userInput;
        
        // A Hevelynia checa os avisos em silêncio
        const analiseIA = await botIA(
          session, 
          userInput, 
          "INSTRUÇÃO: Verifique se o problema relatado bate com os 'Avisos' do sistema. Se bater, explique o aviso e pergunte se quer abrir o chamado mesmo assim. Se NÃO bater, responda apenas: PROSSEGUIR_FLUXO"
        );

        if (analiseIA.includes("PROSSEGUIR_FLUXO")) {
          await sendEvolutionText(instance, number, `Entendido. Para qual setor devo enviar?\n\n📍 *Setores:* ${SETORES.join(", ")}`);
          session.state = FlowState.COLETAR_SETOR;
        } else {
          // IA encontrou aviso relevante e vai explicar ao usuário
          await sendEvolutionText(instance, number, analiseIA);
          session.state = FlowState.VERIFICAR_AVISOS;
        }
        break;
      }

      case FlowState.VERIFICAR_AVISOS: {
        if (["1", "sim", "quero", "continuar", "prosseguir"].some(v => lowerInput.includes(v))) {
          await sendEvolutionText(instance, number, `Perfeito, vou dar seguimento. Para qual setor deseja enviar?\n\n📍 *Setores:* ${SETORES.join(", ")}`);
          session.state = FlowState.COLETAR_SETOR;
        } else {
          await sendEvolutionText(instance, number, "Sem problemas! Se precisar de outra coisa, é só escolher uma opção do menu.\n\n" + menuString);
          session.state = FlowState.MENU_PRINCIPAL;
        }
        break;
      }

      case FlowState.COLETAR_SETOR: {
        const setor = SETORES.find(s => lowerInput.includes(s.toLowerCase()));

        if (setor) {
          const ok = await enviarChamado(session.nome || "Usuário", session.cpf || "", setor, session.motivoAtual || "");
          if (ok) {
            await sendEvolutionText(instance, number, `✅ Tudo pronto! Seu chamado para *${setor}* foi registrado.`);
          } else {
            const ticketErr = generateRandomTicket();
            await sendEvolutionText(instance, number, `O sistema de registro automático oscilou, mas seu protocolo é *${ticketErr}*. Nossa equipe já está ciente.`);
          }
          session.state = FlowState.MENU_PRINCIPAL;
          await sendEvolutionText(instance, number, "Deseja tratar de mais algum assunto?\n\n" + menuString);
        } else {
          await sendEvolutionText(instance, number, `Não reconheci esse setor. Por favor, escolha um destes: ${SETORES.join(", ")}`);
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