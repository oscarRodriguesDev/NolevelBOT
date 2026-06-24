import OpenAI from "openai";
import { saudacao } from "./usedata";

function getOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export const FlowState = {
  INICIO: "inicio",
  IDENTIFICACAO_CPF: "identificacao_cpf",
  MENU_PRINCIPAL: "menu_principal",
  COLETAR_MOTIVO: "coletar_motivo",
  PERGUNTAR_ANEXO: "perguntar_anexo",
  COLETAR_MIDIA: "coletar_midia",
  CONFIRMAR: "confirmar",
  COLETAR_SETOR: "coletar_setor",
} as const;

type FlowStateValues = typeof FlowState[keyof typeof FlowState];

export type CorporateSession = {
  state: FlowStateValues;
  nome?: string;
  cpf?: string;
  memoria?: string;
  motivoAtual?: string;
  anexoUrl?: string;
  empresaId?: string;
  empresaNome?: string;
  lastInteraction: number;
};

type FileIntent = "send_file" | "no_file" | "continue";

export function detectFileIntent(input: string): FileIntent {
  const lower = input.toLowerCase();
  const envio = ["foto", "imagem", "print", "comprovante", "documento", "anexo", "pdf", "arquivo"];
  const negacao = ["não", "nao", "sem", "nenhum"];
  const confirmacao = ["sim", "quero", "ok", "claro", "tenho"];
  const hasFile = envio.some(p => lower.includes(p));
  const hasNeg = negacao.some(p => lower.includes(p));
  const hasConf = confirmacao.some(p => lower.includes(p));
  if (hasNeg && hasFile) return "no_file";
  if (hasFile && hasConf) return "send_file";
  if (["sim", "quero", "ok", "claro", "tenho"].some(v => v === lower || lower.includes(v))) return "send_file";
  if (hasFile) return "send_file";
  return "continue";
}

type EmpresaConfig = {
  botName: string;
  botPrompt: string | null;
  nome: string;
};

async function getEmpresaConfig(empresaId?: string): Promise<EmpresaConfig> {
  const { prisma } = await import("@/lib/prisma");
  if (!empresaId) return { botName: "Hevelyn", botPrompt: null, nome: "Empresa" };
  const empresa = await prisma.empresa.findUnique({
    where: { id: empresaId },
    select: { nome: true, botName: true, botPrompt: true },
  });
  if (!empresa) return { botName: "Hevelyn", botPrompt: null, nome: "Empresa" };
  return {
    botName: empresa.botName || "Hevelyn",
    botPrompt: empresa.botPrompt,
    nome: empresa.nome,
  };
}

function montarPrompt(
  config: EmpresaConfig,
  session: CorporateSession,
  avisos: string,
  instrucao: string
): string {
  const { botName, nome: empresa } = config;
  const linhas: string[] = [];

  if (session.cpf) {
    linhas.push(`Você é ${botName}, assistente da ${empresa}. ${saudacao()}!`);
    linhas.push(`Usuário: ${session.nome || "anonimo"}`);
    if (session.memoria) {
      linhas.push(`Memória: ${session.memoria}`);
    }
    if (avisos && !avisos.includes("Sem avisos")) {
      linhas.push(`Avisos: ${avisos}`);
    }
    linhas.push("Escopo: atender chamados corporativos. Fora disso, reconduza com educação.");
  } else {
    linhas.push(`Assistente de triagem da ${empresa}. ${saudacao()}. Nao se apresente.`);
  }

  linhas.push(`Agora: ${instrucao}`);
  if (instrucao.includes("opções") || instrucao.includes("menu")) {
    linhas.push("Se nao identificar, retorne: NAO_IDENTIFIQUEI");
  }

  return linhas.filter(Boolean).join("\n");
}

export async function botIA(
  session: CorporateSession,
  userInput: string,
  instrucao: string,
  avisos: string
): Promise<string> {
  const config = await getEmpresaConfig(session.empresaId);
  const prompt = montarPrompt(config, session, avisos, instrucao);

  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: userInput },
      ],
      temperature: 0.7,
      max_tokens: 140,
    });
    return response.choices[0]?.message?.content || "Pode repetir, por favor?";
  } catch {
    return "Pode repetir, por favor?";
  }
}