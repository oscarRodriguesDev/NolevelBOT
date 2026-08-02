// Acesso aos planos via banco de dados (tabela `planos`) + lógica de extinção.
import { prisma } from "@/lib/prisma"
import { Plano, planoDaLinha, validarModulos } from "@/lib/planos"

const PLANO_SELECT = {
  id: true,
  slug: true,
  nome: true,
  preco: true,
  descricao: true,
  maxModulos: true,
  maxUsuarios: true,
  botIA: true,
  canais: true,
  modulosAutomaticos: true,
  ativo: true,
  destaque: true,
  ordem: true,
  extincaoEm: true,
  extincaoAvisadaEm: true,
} as const

/** Todos os planos (GOD). */
export async function getTodosPlanos(): Promise<Plano[]> {
  const linhas = await prisma.planos.findMany({ orderBy: [{ ordem: "asc" }] })
  return linhas.map(planoDaLinha)
}

/** Planos ativos e não extintos (público). */
export async function getPlanosAtivos(): Promise<Plano[]> {
  const linhas = await prisma.planos.findMany({
    where: { ativo: true, extincaoEm: null },
    orderBy: [{ ordem: "asc" }],
  })
  return linhas.map(planoDaLinha)
}

/** Busca um plano por slug ou id. */
export async function getPlanoPorSlug(slug?: string | null): Promise<Plano | null> {
  if (!slug) return null
  const s = slug.toLowerCase()
  const linha = await prisma.planos.findFirst({
    where: { OR: [{ slug: s }, { id: slug }] },
  })
  return linha ? planoDaLinha(linha) : null
}

/** Plano mais vantajoso (sem prejuízo financeiro) para migração de extinção.
 *  Regra: escolhe o plano ativo com MAIOR `ordem` cujo preço seja
 *  menor ou igual ao do plano extinto (empresa não paga mais).
 *  Se não houver opção mais barata, usa o mais barato disponível.
 */
export async function getPlanoMigracao(planoExtinto: Plano): Promise<Plano | null> {
  const disponiveis = await getPlanosAtivos()
  if (disponiveis.length === 0) return null

  const compativeis = disponiveis.filter((p) => p.slug !== planoExtinto.slug && p.preco <= planoExtinto.preco)
  if (compativeis.length > 0) {
    // maior ordem (mais vantajoso) entre os que não aumentam o preço
    return compativeis.sort((a, b) => b.ordem - a.ordem || b.preco - a.preco)[0]
  }
  // sem opção mais barata: migra para o mais barato (evita aumento)
  return [...disponiveis].sort((a, b) => a.preco - b.preco || a.ordem - b.ordem)[0]
}

/** Processa extinções vencidas: migra as empresas para o plano alvo. */
export async function processarExtincoesVencidas(): Promise<{ migradas: number; extintos: number }> {
  const agora = new Date()
  const extintos = await prisma.planos.findMany({
    where: { extincaoEm: { not: null, lte: agora } },
    select: PLANO_SELECT,
  })
  if (extintos.length === 0) return { migradas: 0, extintos: 0 }

  let migradas = 0
  for (const linhaExtinta of extintos) {
    const planoExtinto = planoDaLinha(linhaExtinta)
    const alvo = await getPlanoMigracao(planoExtinto)
    if (!alvo) continue

    const empresas = await prisma.empresa.findMany({
      where: { plano: planoExtinto.slug },
      select: { id: true, modulos: true },
    })

    for (const emp of empresas) {
      const { modulos: modulosFinais } = validarModulos(alvo, (emp.modulos || []).map(String))
      await prisma.empresa.update({
        where: { id: emp.id },
        data: { plano: alvo.slug, modulos: modulosFinais as any },
      })
      migradas++
    }

    // marca como inativo (mantém histórico; não é mais vendido)
    await prisma.planos.update({ where: { id: planoExtinto.id }, data: { ativo: false } })
  }

  return { migradas, extintos: extintos.length }
}

/** Solicita a extinção de um plano: agenda 30 dias e notifica as empresas.
 *  Retorna a quantidade de empresas notificadas.
 */
export async function solicitarExtincao(plano: Plano): Promise<number> {
  const dataExtincao = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  const empresas = await prisma.empresa.findMany({
    where: { plano: plano.slug },
    select: { id: true, nome: true },
  })

  // cria aviso na plataforma para cada empresa afetada
  await prisma.avisos.createMany({
    data: empresas.map((e) => ({
      empresaId: e.id,
      titulo: `Plano ${plano.nome} será extinto`,
      conteudo: `O plano ${plano.nome} será extinto em 30 dias (${dataExtincao.toLocaleDateString("pt-BR")}). Sua empresa será migrada automaticamente para o plano mais vantajoso, sem aumento de custo. Qualquer dúvida, fale com o suporte.`,
      setor: null,
      expiresAt: dataExtincao,
    })),
  })

  await prisma.planos.update({
    where: { id: plano.id },
    data: {
      extincaoEm: dataExtincao,
      extincaoAvisadaEm: new Date(),
      ativo: false, // deixa de ser vendido imediatamente
    },
  })

  return empresas.length
}

/** Cancela uma extinção agendada (GOD desiste). */
export async function cancelarExtincao(planoId: string): Promise<void> {
  await prisma.planos.update({
    where: { id: planoId },
    data: { extincaoEm: null, extincaoAvisadaEm: null, ativo: true },
  })
}
