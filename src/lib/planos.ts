// Tipos e funções PURAS dos planos do sistema (SaaS).
// Os planos agora vêm do banco (tabela `planos`). Este arquivo mantém os
// TIPOS e as regras de validação puras, operando sobre um objeto `Plano`.

export const MODULOS_SISTEMA = ["CORPORATIVO", "OFICINA", "COMERCIAL"] as const
export type ModuloId = (typeof MODULOS_SISTEMA)[number]

export interface Plano {
  id: string
  slug: string
  nome: string
  preco: number
  descricao: string
  /** Quantidade de módulos que a empresa pode escolher. -1 = todos. */
  maxModulos: number
  /** Limite de usuários GESTOR + ATENDENTE. -1 = ilimitado. */
  maxUsuarios: number
  /** Se o bot usa IA (OpenAI). false = script automático gravando chamados. */
  botIA: boolean
  /** Canais disponíveis para abertura de chamados */
  canais: string[]
  /** Módulos liberados automaticamente (não vazio = todos) */
  modulosAutomaticos: string[]
  ativo: boolean
  destaque: boolean
  ordem: number
  extincaoEm?: string | null
  extincaoAvisadaEm?: string | null
}

/** Converte a linha do banco em objeto Plano (normaliza -1 = ilimitado). */
export function planoDaLinha(linha: any): Plano {
  return {
    id: linha.id,
    slug: linha.slug,
    nome: linha.nome,
    preco: Number(linha.preco),
    descricao: linha.descricao || "",
    maxModulos: linha.maxModulos,
    maxUsuarios: linha.maxUsuarios,
    botIA: linha.botIA,
    canais: (linha.canais || []) as string[],
    modulosAutomaticos: (linha.modulosAutomaticos || []) as string[],
    ativo: linha.ativo,
    destaque: linha.destaque,
    ordem: linha.ordem,
    extincaoEm: linha.extincaoEm ? new Date(linha.extincaoEm).toISOString() : null,
    extincaoAvisadaEm: linha.extincaoAvisadaEm ? new Date(linha.extincaoAvisadaEm).toISOString() : null,
  }
}

/** Módulos que a empresa pode escolher conforme o plano (vazio = todos liberados). */
export function getModulosDisponiveis(plano: Plano): ModuloId[] {
  if (plano.maxModulos === -1 || plano.modulosAutomaticos.length > 0) {
    return [...MODULOS_SISTEMA]
  }
  return [...MODULOS_SISTEMA]
}

/** Verifica se o total de módulos escolhidos é válido para o plano. */
export function validarModulos(plano: Plano, modulos: string[]): { ok: boolean; modulos: ModuloId[]; error?: string } {
  const modulosValidos = modulos.filter((m) => (MODULOS_SISTEMA as readonly string[]).includes(m)) as ModuloId[]

  // Plano com módulos automáticos libera todos
  if (plano.maxModulos === -1 || plano.modulosAutomaticos.length > 0) {
    return { ok: true, modulos: [...MODULOS_SISTEMA] }
  }

  if (modulosValidos.length === 0) {
    return { ok: false, modulos: [], error: "Selecione pelo menos um módulo." }
  }
  if (modulosValidos.length > plano.maxModulos) {
    return { ok: false, modulos: modulosValidos, error: `O plano ${plano.nome} permite no máximo ${plano.maxModulos} módulo(s).` }
  }

  return { ok: true, modulos: modulosValidos }
}

/** Verifica se a empresa pode adicionar mais usuários GESTOR/ATENDENTE. */
export function dentroDoLimiteDeUsuarios(plano: Plano, totalAtuais: number): { ok: boolean; maxUsuarios: number; restantes: number } {
  const max = plano.maxUsuarios === -1 ? Infinity : plano.maxUsuarios
  const restantes = Math.max(0, max - totalAtuais)
  return { ok: totalAtuais < max, maxUsuarios: max, restantes }
}

/** Gera um slug a partir do nome da empresa (ex.: "Minha Empresa LTDA" -> "minha-empresa"). */
export function gerarSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "empresa"
}

/**
 * Gera o email automático do admin: cpf + slug da empresa + domínio.
 * Padrão: 12345678901@minha-empresa.com.br
 * O domínio pode ser trocado via env APP_EMAIL_DOMAIN (ex.: "nolevel.com.br").
 */
export function gerarEmailAdmin(cpf: string, nomeEmpresa: string): string {
  const cpfLimpo = cpf.replace(/\D/g, "")
  const slug = gerarSlug(nomeEmpresa)
  const dominio = (process.env.APP_EMAIL_DOMAIN || "com.br").replace(/^@/, "")
  return `${cpfLimpo}@${slug}.${dominio}`
}
