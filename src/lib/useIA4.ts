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
  COLETAR_MIDIA: "coletar_midia",
  MOSTRAR_AVISO: "mostrar_aviso"
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
  avisos: string,
  instrucaoEtapa: string
): string {
  const botName = config.botName;
  const empresa = config.nome;
  const isIdentificado = !!session.cpf;

  const intro = isIdentificado
    ? `Você deve se apresentar com o nome de seu bot ${botName}, assistente virtual da empresa ${empresa}. ${saudacao()}`
    : `Você é um assistente virtual de triagem. ${saudacao()} Seu papel é apenas acolher o usuário. NÃO DIGA SEU NOME NEM O NOME DE NENHUMA EMPRESA.`;

  if (!isIdentificado) {
    return [
      intro,
      `Instrução atual: ${instrucaoEtapa}`
    ].join("\n");
  }

  const reconducao = `IMPORTANTE: Seu propósito é exclusivamente ajudar o usuário com abertura e consulta de chamados técnicos de acordo com os setores da empresa ${empresa}. Se o usuário tentar fazer perguntas fora deste contexto (como assuntos pessoais, fofocas, conhecimentos gerais, etc.), reconduza-o educadamente para as opções do menu: ${"1. Abrir Chamado, 2. Consultar Chamado, 3. Sair"}. Não responda perguntas fora do escopo de atendimento.`;

  let instrucaoAvisos = "";
  if (avisos && avisos !== "Sem avisos." && avisos !== "Sem avisos no momento.") {
    if (session.state === FlowState.VERIFICAR_AVISOS || session.state === FlowState.MENU_PRINCIPAL || session.state === FlowState.MOSTRAR_AVISO) {
      instrucaoAvisos = `Aviso para este CPF:\n${avisos}\n
      Ação OBRIGATÓRIA: Apresente APENAS este aviso de forma natural, acolhedora e humana.
      Se o aviso não for relevante, retorne apenas PROSSEGUIR_FLUXO.`;
    } 
    else if (session.state === FlowState.COLETAR_MOTIVO) {
      instrucaoAvisos = `Avisos disponíveis:\n${avisos}\n
      Ação OBRIGATÓRIA: Analise se o MOTIVO relatado pelo usuário corresponde a algum destes avisos. Considere correspondência mesmo que o aviso não use as mesmas palavras, desde que o assunto seja relacionado.
      - Se corresponder E o aviso RESOLVER completamente o problema do usuário: retorne APENAS a mensagem iniciando com "AVISO_RESOLVE:" seguido da explicação empática. Não ofereça opções.
      - Se corresponder MAS o aviso NÃO resolver completamente: explique o aviso de forma natural e acolhedora relacionando com o motivo do usuário, e pergunte se ele precisa de ajuda com outra coisa, apresentando as opções: 1. Abrir Chamado, 2. Consultar Chamado, 3. Sair. NÃO sugira abrir chamado sobre este assunto.
      - Se NÃO corresponder a NENHUM aviso: retorne APENAS a palavra PROSSEGUIR_FLUXO.`;
    }
  }

  const base = [
    intro,
    `Contexto do usuário: ${session.nome || "anônimo"}`,
    `Chamados existentes: ${chamadosResumo}`,
    reconducao,
    instrucaoAvisos,
  ].filter(Boolean);

  if (config.botPrompt) {
    return [
      ...base,
      `INSTRUÇÃO PERSONALIZADA DA EMPRESA:\n${config.botPrompt}`,
      `Instrução atual: ${instrucaoEtapa}`
    ].filter(Boolean).join("\n");
  }

  const personalidade = [
    config.presentation && `Apresentação: ${config.presentation}`,
    config.serviceDesc && `Atendimento: ${config.serviceDesc}`,
    config.avisosDesc && `Avisos: ${config.avisosDesc}`,
  ].filter(Boolean).join("\n");

  return [
    ...base,
    personalidade ? `PERSONALIDADE:\n${personalidade}` : "",
    `Instrução atual: ${instrucaoEtapa}. Caso não consiga identificar a ação da etapa corretamente, retorne apenas: PROSSEGUIR_FLUXO`,
  ].filter(Boolean).join("\n");
}

export async function botIA4(
  session: UserSession,
  userInput: string,
  instrucaoEtapa: string,
  avisos: string
) {
  const statusAtual = session.cpf ? await StatusChamado(session.cpf) : [];
  const config = await getEmpresaConfig(session.cpf);

  const chamadosResumo = statusAtual.length > 0
    ? statusAtual.map((t: any) => `${t.ticket} (${t.status})`).join(", ")
    : "nenhum";

  try {
    const openai = getOpenAI();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: montarSystemPrompt(
            config,
            session,
            chamadosResumo,
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
      max_tokens: 180, // Aumentado para garantir que mensagens empáticas não sejam cortadas
    });

    return response.choices[0]?.message?.content || "Pode repetir, por favor?";
  } catch (error) {
    console.error("botIA4 error:", error);
    return "Pode repetir, por favor?";
  }
}