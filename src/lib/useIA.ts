import { buscarAvisos, StatusChamado, saudacao } from "./usedata";
import OpenAI from "openai";

function getOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const LINK_PORTAL = process.env.NEXT_PUBLIC_BASE_URL_WP
const LINK_CHAMADOS = `${LINK_PORTAL}/chamado`;

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
  lastInteraction: number;
};

async function getEmpresaName(cpf?: string): Promise<string> {
  if (!cpf) return 'Nolevel'
  try {
    const { prisma } = await import('@/lib/prisma')
    const { getEmpresaIdByCpf } = await import('@/lib/searchEmpresa')
    const empresaId = await getEmpresaIdByCpf(cpf)
    if (!empresaId) return 'Nolevel'
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { nome: true },
    })
    return empresa?.nome || 'Nolevel'
  } catch {
    return 'Nolevel'
  }
}

export async function botIA(
  session: UserSession,
  userInput: string,
  instrucaoEtapa: string,
  avisos: string,
  botName?: string
) {
  const statusAtual = session.cpf
    ? await StatusChamado(session.cpf)
    : []

  const isColetarMotivo = session.state === "coletar_motivo"
  const empresa = await getEmpresaName(session.cpf)

  const chamadosResumo = statusAtual.length > 0
    ? statusAtual.map((t: any) => `${t.ticket} (${t.status})`).join(", ")
    : "nenhum"

  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", //depois melhora esta gastando muito
      messages: [
        {
          role: "system",
          content: [
            `Você é ${botName || "Hevelyn"}, atendente da ${empresa}. Seja breve, calorosa e direta. ${saudacao()}`,
            `Contexto: ${session.nome || "anonimo"}, chamados: ${chamadosResumo}`,
            isColetarMotivo ? `Avisos p/ consultar:\n${avisos}\nSe o assunto bater, responda conforme o aviso. Se não, responda só: PROSSEGUIR_FLUXO` : "",
            `Instrução: ${instrucaoEtapa}`,
            `Se pedirem documento/foto/comprovante: "${LINK_CHAMADOS}" pra abrir chamado com anexo.`
          ].filter(Boolean).join("\n")
        },
        {
          role: "user",
          content: userInput
        }
      ],
      temperature: 0.7,
      max_tokens: 120
    })

    return response.choices[0].message.content || "Pode repetir, por favor?"
  } catch {
    return "Tive um probleminha técnico, mas pode continuar."
  }
}
