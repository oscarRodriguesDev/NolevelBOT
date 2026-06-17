import OpenAI from "openai";
import { StatusChamado, saudacao } from "./usedata";

function getOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export const FlowState = {
  INICIO: "inicio",
  IDENTIFICACAO_CPF: "identificacao_cpf",
  IDENTIFICACAO_NOME: "identificacao_nome",
  MENU_PRINCIPAL: "menu_principal",
  COLETAR_MOTIVO: "coletar_motivo",
  VERIFICAR_AVISOS: "verificar_aviso",
  ESCOLHER_ABERTURA: "escolher_abertura",
  COLETAR_SETOR: "coletar_setor",
  PERGUNTAR_ANEXO: "perguntar_anexo",
  COLETAR_MIDIA: "coletar_midia"
} as const;

type FlowStateValues = typeof FlowState[keyof typeof FlowState];
export type UserSession = {
  state: FlowStateValues;
  nome?: string;
  cpf?: string;
  resumoHistorico?: string;
  motivoAtual?: string;
  anexoUrl?: string;
  lastInteraction: number;
};

type FileIntent = "send_file" | "no_file" | "continue";

export function detectFileIntent(input: string): FileIntent {
  const lower = input.toLowerCase();
  const palavrasEnvio = [
    "foto", "fotos", "imagem", "print", "printar", "captura",
    "comprovante", "documento", "anexo", "anexar", "pdf",
    "atestado", "atestados", "laudo", "laudos", "receita", "receitas",
    "enviar", "mandar", "subir", "upload", "arquivo", "arquivos",
    "scan", "scanner", "digitalizar", "doc", "docs",
  ];
  const palavrasNegacao = ["não", "nao", "sem", "nenhum"];
  const palavrasConfirmacao = ["sim", "quero", "ok", "claro", "pode", "mando", "vou enviar", "tenho"];

  const hasFileWord = palavrasEnvio.some(p => lower.includes(p));
  const hasNegacao = palavrasNegacao.some(p => lower.includes(p));
  const hasConfirmacao = palavrasConfirmacao.some(p => lower.includes(p));

  if (hasNegacao && hasFileWord) return "no_file";
  if (hasFileWord && hasConfirmacao) return "send_file";
  if (["sim", "quero", "ok", "claro", "pode ser", "mando", "vou"].some(v => v === lower || lower.includes(v))) return "send_file";
  if (["não", "nao", "sem arquivo", "nenhum", "sem", "nada", "só descrição", "só o problema", "sem foto", "sem documento", "sem comprovante", "sem anexo"].some(v => lower.includes(v))) return "no_file";

  return hasFileWord ? "send_file" : "continue";
}

type EmpresaConfig = {
  botName: string;
  botPrompt: string | null;
  presentation: string | null;
  serviceDesc: string | null;
  avisosDesc: string | null;
  logoUrl: string | null;
  nome: string;
};

const defaultConfig: EmpresaConfig = {
  botName: "Hevelyn",
  botPrompt: null,
  presentation: null,
  serviceDesc: null,
  avisosDesc: null,
  logoUrl: null,
  nome: "Skora",
};

async function getEmpresaConfig(empresaId?: string): Promise<EmpresaConfig> {
  if (!empresaId) return { ...defaultConfig };
  try {
    const { prisma } = await import("@/lib/prisma");
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: {
        botName: true,
        botPrompt: true,
        botPresentation: true,
        botServiceDesc: true,
        botAvisosDesc: true,
        logoUrl: true,
        nome: true,
      },
    });
    if (!empresa) return { ...defaultConfig, nome: "Skora" };
    return {
      botName: empresa.botName || "Hevelyn",
      botPrompt: empresa.botPrompt,
      presentation: empresa.botPresentation,
      serviceDesc: empresa.botServiceDesc,
      avisosDesc: empresa.botAvisosDesc,
      logoUrl: empresa.logoUrl,
      nome: empresa.nome,
    };
  } catch {
    return { ...defaultConfig };
  }
}

function montarSystemPrompt(config: EmpresaConfig, session: UserSession, chamadosResumo: string, isColetarMotivo: boolean, avisos: string, empresaNome: string, instrucaoEtapa: string): string {
  const botName = config.botName;
  const empresa = empresaNome || config.nome;

  if (config.botPrompt) {
    return [
      `Você é ${botName}, atendente da ${empresa}. ${saudacao()}`,
      `Contexto: ${session.nome || "anonimo"}, chamados: ${chamadosResumo}`,
      `INSTRUÇÃO PERSONALIZADA DA EMPRESA:\n${config.botPrompt}`,
      isColetarMotivo && avisos ? `Avisos p/ consultar:\n${avisos}\nSe o assunto bater, responda conforme o aviso. Se não, responda só: PROSSEGUIR_FLUXO` : "",
      `Instrução: ${instrucaoEtapa}`,
    ].filter(Boolean).join("\n");
  }

  const personalidade = [
    config.presentation && `Apresentação: ${config.presentation}`,
    config.serviceDesc && `Atendimento: ${config.serviceDesc}`,
    config.avisosDesc && `Avisos: ${config.avisosDesc}`,
  ].filter(Boolean).join("\n");

  return [
    `Você é ${botName}, atendente da ${empresa}. Seja breve, calorosa e direta. ${saudacao()}`,
    personalidade ? `PERSONALIDADE:\n${personalidade}` : "",
    `Contexto: ${session.nome || "anonimo"}, chamados: ${chamadosResumo}`,
    isColetarMotivo && avisos ? `Avisos p/ consultar:\n${avisos}\nSe o assunto bater, responda conforme o aviso. Se não, responda só: PROSSEGUIR_FLUXO` : "",
    `Instrução: ${instrucaoEtapa} caso não consiga coletar o motivo retorne apenas 'dont_know'`,
  ].filter(Boolean).join("\n");
}

export async function botIA3(
  session: UserSession,
  userInput: string,
  instrucaoEtapa: string,
  avisos: string,
  empresaId?: string
) {
  const statusAtual = session.cpf
    ? await StatusChamado(session.cpf)
    : [];

  const isColetarMotivo = session.state === "coletar_motivo";
  const config = await getEmpresaConfig(empresaId);

  const chamadosResumo = statusAtual.length > 0
    ? statusAtual.map((t: any) => `${t.ticket} (${t.status})`).join(", ")
    : "nenhum";

  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", //depois melhora esta gastando muito
      messages: [
        {
          role: "system",
          content: montarSystemPrompt(config, session, chamadosResumo, isColetarMotivo, avisos, "", instrucaoEtapa),
        },
        {
          role: "user",
          content: userInput,
        },
      ],
      temperature: 0.7,
      max_tokens: 120,
    });

    return response.choices[0].message.content || "Pode repetir, por favor?";
  } catch (error) {
    console.error("botIA3 error:", error);
    return "Pode repetir, por favor?";
  }
}
