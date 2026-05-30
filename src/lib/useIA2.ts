import OpenAI from "openai";
import { StatusChamado, saudacao } from "./usedata";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

export async function botIA2(
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: [
            `Você é ${botName || "Hevelyn"}, atendente da ${empresa}. Seja breve, calorosa e direta. ${saudacao()}`,
            `Contexto: ${session.nome || "anonimo"}, chamados: ${chamadosResumo}`,
            isColetarMotivo ? `Avisos p/ consultar:\n${avisos}\nSe o assunto bater, responda conforme o aviso. Se não, responda só: PROSSEGUIR_FLUXO` : "",
            `Instrução: ${instrucaoEtapa}`,
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
  } catch (error) {
    console.error("botIA2 error:", error)
    return "Pode repetir, por favor?"
  }
}
