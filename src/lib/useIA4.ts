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
    "atestado", "atestados", "laudo", "laudos", "receita", 
    "receitas", "enviar", "mandar", "subir", "upload", 
    "arquivo", "arquivos", "scan", "scanner", "digitalizar", 
    "doc", "docs"
  ];

  const palavrasNegacao = ["não", "nao", "sem", "nenhum"];
  const palavrasConfirmacao = ["sim", "quero", "ok", "claro", "pode", "mando", "vou enviar", "tenho"];

  const hasFileWord = palavrasEnvio.some((p) => lower.includes(p));
  const hasNegacao = palavrasNegacao.some((p) => lower.includes(p));
  const hasConfirmacao = palavrasConfirmacao.some((p) => lower.includes(p));

  if (hasNegacao && hasFileWord) return "no_file";
  if (hasFileWord && hasConfirmacao) return "send_file";

  if (["sim", "quero", "ok", "claro", "pode ser", "mando", "vou"].some((v) => v === lower || lower.includes(v))) {
    return "send_file";
  }

  if (
    [
      "não", "nao", "sem arquivo", "nenhum", "sem", "nada", 
      "só descrição", "só o problema", "sem foto", "sem documento", 
      "sem comprovante", "sem anexo"
    ].some((v) => lower.includes(v))
  ) {
    return "no_file";
  }

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

async function getEmpresaConfig(cpf?: string): Promise<EmpresaConfig> {
  const { prisma } = await import("@/lib/prisma");

  if (!cpf) {
    return {
      botName: "Assistente",
      botPrompt: null,
      presentation: null,
      serviceDesc: null,
      avisosDesc: null,
      logoUrl: null,
      nome: "Empresa",
    };
  }

  const registroCpf = await prisma.cpfs.findUnique({
    where: { cpf },
    select: { empresaId: true },
  });

  if (!registroCpf?.empresaId) {
    throw new Error(`Empresa não encontrada para o CPF ${cpf}`);
  }

  const empresa = await prisma.empresa.findUnique({
    where: { id: registroCpf.empresaId },
    select: {
      nome: true,
      botName: true,
      botPrompt: true,
      botPresentation: true,
      botServiceDesc: true,
      botAvisosDesc: true,
      logoUrl: true,
    },
  });

  if (!empresa) {
    throw new Error(`Empresa ${registroCpf.empresaId} não encontrada`);
  }

  return {
    botName: empresa.botName || "Assistente",
    botPrompt: empresa.botPrompt,
    presentation: empresa.botPresentation,
    serviceDesc: empresa.botServiceDesc,
    avisosDesc: empresa.botAvisosDesc,
    logoUrl: empresa.logoUrl,
    nome: empresa.nome,
  };
}

function montarSystemPrompt(
  config: EmpresaConfig,
  session: UserSession,
  chamadosResumo: string,
  isColetarMotivo: boolean,
  avisos: string,
  instrucaoEtapa: string
): string {
  const botName = config.botName;
  const empresa = config.nome;
  const isIdentificado = !!session.cpf;

  // Lógica de Apresentação Dinâmica
  const intro = isIdentificado
    ? `Você deve se apresentar com o nome de seu bot ${botName}, assistente virtual da empresa ${empresa}. ${saudacao()}`
    : `Você é um assistente virtual de triagem. ${saudacao()} Seu papel é apenas acolher o usuário. NÃO DIGA SEU NOME NEM O NOME DE NENHUMA EMPRESA.`;

  // Se o usuário ainda não passou o CPF, travamos a personalidade padrão para não vazar dados
  if (!isIdentificado) {
    return [
      intro,
      `Instrução atual: ${instrucaoEtapa}`
    ].join("\n");
  }

  // Se já tem CPF, libera a personalidade e prompts personalizados da empresa
  if (config.botPrompt) {
    return [
      intro,
      `Contexto do usuário: ${session.nome || "anônimo"}`,
      `Chamados existentes: ${chamadosResumo}`,
      `INSTRUÇÃO PERSONALIZADA DA EMPRESA:\n${config.botPrompt}`,
      isColetarMotivo && avisos
        ? `Avisos para consulta:\n${avisos}\nSe o assunto corresponder ao aviso, responda conforme o aviso. Caso contrário responda apenas: PROSSEGUIR_FLUXO`
        : "",
      `Instrução atual: ${instrucaoEtapa}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  const personalidade = [
    config.presentation && `Apresentação: ${config.presentation}`,
    config.serviceDesc && `Atendimento: ${config.serviceDesc}`,
    config.avisosDesc && `Avisos: ${config.avisosDesc}`,
  ]
    .filter(Boolean)
    .join("\n");

  return [
    intro,
    personalidade ? `PERSONALIDADE:\n${personalidade}` : "",
    `Contexto do usuário: ${session.nome || "anônimo"}`,
    `Chamados existentes: ${chamadosResumo}`,
    isColetarMotivo && avisos
      ? `Avisos para consulta:\n${avisos}\nSe o assunto corresponder ao aviso, responda conforme o aviso e encerre o atendimento. Caso contrário responda apenas: PROSSEGUIR_FLUXO`
      : "",
    `Instrução atual: ${instrucaoEtapa}. Caso não consiga identificar o motivo corretamente retorne apenas: PROSSEGUIR_FLUXO`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function botIA4(
  session: UserSession,
  userInput: string,
  instrucaoEtapa: string,
  avisos: string
) {
  const statusAtual = session.cpf ? await StatusChamado(session.cpf) : [];
  const isColetarMotivo = session.state === "coletar_motivo";
  const config = await getEmpresaConfig(session.cpf);

  const chamadosResumo = statusAtual.length > 0
    ? statusAtual.map((t: any) => `${t.ticket} (${t.status})`).join(", ")
    : "nenhum";

  try {
    const openai = getOpenAI();

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: montarSystemPrompt(
            config,
            session,
            chamadosResumo,
            isColetarMotivo,
            avisos,
            instrucaoEtapa
          ),
        },
        {
          role: "user",
          content: userInput,
        },
      ],
      temperature: 0.7,
      max_tokens: 120,
    });

    return response.choices[0]?.message?.content || "Pode repetir, por favor?";
  } catch (error) {
    console.error("botIA4 error:", error);
    return "Pode repetir, por favor?";
  }
}