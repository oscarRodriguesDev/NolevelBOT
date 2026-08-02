// Modo script: bot sem IA para planos que não contratam OpenAI.
// Responde de forma determinística, apenas gravando chamados.

// Slug do plano (ex.: "start", "profissional"). Valores em minúsculo.
export type PlanoBot = string

export interface EmpresaBotInfo {
  plano: PlanoBot
  nomeEmpresa: string | null
}

// Busca o plano e nome da empresa associados ao CPF
export async function getEmpresaBotInfo(cpf?: string): Promise<EmpresaBotInfo> {
  if (!cpf) return { plano: "start", nomeEmpresa: null }
  try {
    const { prisma } = await import("@/lib/prisma")
    const registro = await prisma.cpfs.findUnique({
      where: { cpf },
      select: { Empresa: { select: { plano: true, nome: true } } },
    })
    const plano = (registro?.Empresa?.plano as PlanoBot) || "start"
    return { plano, nomeEmpresa: registro?.Empresa?.nome || null }
  } catch {
    return { plano: "start", nomeEmpresa: null }
  }
}

// Busca apenas o plano (compatibilidade)
export async function getPlanoBotPorCpf(cpf?: string): Promise<PlanoBot> {
  const info = await getEmpresaBotInfo(cpf)
  return info.plano
}

// Se o plano (slug) contrata IA, consulta a tabela `planos`.
// Fallback seguro: planos antigos PROFISSIONAL/ENTERPRISE mantêm IA.
export async function planoTemBotIA(plano: PlanoBot): Promise<boolean> {
  if (!plano) return false
  try {
    const { prisma } = await import("@/lib/prisma")
    const planoRegistro = await prisma.planos.findUnique({
      where: { slug: String(plano).toLowerCase() },
      select: { botIA: true },
    })
    if (planoRegistro) return planoRegistro.botIA
  } catch {
    // ignore — fallback abaixo
  }
  const legacy = String(plano).toUpperCase()
  return legacy === "PROFISSIONAL" || legacy === "ENTERPRISE"
}

/**
 * Resposta determinística do bot para o estado atual (sem OpenAI).
 * Retorna a mensagem fixa; os estados que dependem de IA no fluxo são
 * substituídos por atalhos de script (ex.: sempre prossegue para o setor).
 */
export function botScriptResposta(
  estado: string,
  nomeUsuario?: string,
  nomeEmpresa?: string
): string {
  switch (estado) {
    case "inicio":
      return "Olá! Bem-vindo ao atendimento. Para começar, informe seu CPF."
    case "identificacao_cpf":
      return `Olá, ${nomeUsuario || "tudo bem"}! Este é o atendimento da ${nomeEmpresa || "empresa"}. Escolha uma opção:\n1. Abrir Chamado\n2. Consultar Chamado\n3. Sair`
    case "identificacao_nome":
    case "mostrar_aviso":
      return `Prazer, ${nomeUsuario || "tudo bem"}! Escolha uma opção:\n1. Abrir Chamado\n2. Consultar Chamado\n3. Sair`
    case "menu_principal":
      return "Posso ajudar com abertura e consulta de chamados. Digite 1 para abrir um chamado, 2 para consultar ou 3 para sair."
    case "coletar_motivo":
      // Sem IA: não analisa avisos, apenas segue para o setor
      return "PROSSEGUIR_FLUXO"
    case "verificar_avisos":
      return "PROSSEGUIR_FLUXO"
    case "perguntar_anexo":
      return "Não entendi. Precisa enviar uma foto do problema? (Sim/Não)"
    case "coletar_midia":
      return "Não identifiquei a foto. Envie a imagem pelo botão de anexar ou digite 'não' se não quiser enviar."
    default:
      return "Pode repetir, por favor?"
  }
}
