import { NextRequest, NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { getServerSessionRBAC } from "@/lib/rbac-server"
import {
  getPlanosAtivos,
  getTodosPlanos,
  getPlanoPorSlug,
  solicitarExtincao,
  cancelarExtincao,
  processarExtincoesVencidas,
} from "@/lib/planos-server"
import { validarModulos } from "@/lib/planos"

// Lista planos ativos (público) ou todos (GOD). Também processa extinções vencidas.
export async function GET(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "planos-list", 60, 60 * 1000)
  if (rateLimit) return rateLimit

  // processa extinções agendadas que venceram (lazy cron)
  try {
    await processarExtincoesVencidas()
  } catch (e) {
    console.error("Erro ao processar extinções:", e)
  }

  const { searchParams } = new URL(req.url)
  const todos = searchParams.get("todos") === "true"

  if (todos) {
    const { session, error } = await getServerSessionRBAC(["GOD"])
    if (error) return error
    const planos = await getTodosPlanos()
    return NextResponse.json(planos)
  }

  const planos = await getPlanosAtivos()
  return NextResponse.json(planos)
}

// Cria um novo plano (GOD)
export async function POST(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "planos-write", 15, 60 * 1000)
  if (rateLimit) return rateLimit
  const { session, error } = await getServerSessionRBAC(["GOD"])
  if (error) return error

  try {
    const body = await req.json()
    const { slug, nome, preco, descricao, maxModulos, maxUsuarios, botIA, canais, modulosAutomaticos, ativo, destaque, ordem } = body

    if (!slug || !nome || preco == null) {
      return NextResponse.json({ error: "slug, nome e preco são obrigatórios" }, { status: 400 })
    }

    const slugLimpo = String(slug).toLowerCase().replace(/[^a-z0-9-]/g, "")
    if (!slugLimpo) {
      return NextResponse.json({ error: "Slug inválido" }, { status: 400 })
    }

    const existente = await prisma.planos.findUnique({ where: { slug: slugLimpo } })
    if (existente) {
      return NextResponse.json({ error: "Já existe um plano com esse slug" }, { status: 409 })
    }

    const novo = await prisma.planos.create({
      data: {
        slug: slugLimpo,
        nome: String(nome),
        preco: Number(preco),
        descricao: descricao != null ? String(descricao) : "",
        maxModulos: maxModulos != null ? Number(maxModulos) : 1,
        maxUsuarios: maxUsuarios != null ? Number(maxUsuarios) : 5,
        botIA: Boolean(botIA),
        canais: Array.isArray(canais) ? canais : [],
        modulosAutomaticos: Array.isArray(modulosAutomaticos) ? modulosAutomaticos : [],
        ativo: ativo != null ? Boolean(ativo) : true,
        destaque: Boolean(destaque),
        ordem: ordem != null ? Number(ordem) : 0,
      },
    })

    return NextResponse.json(novo, { status: 201 })
  } catch (err) {
    console.error("Erro ao criar plano:", err)
    return NextResponse.json({ error: "Erro ao criar plano" }, { status: 500 })
  }
}

// Atualiza um plano (GOD). Não altera extincaoEm aqui (ver action específica).
export async function PUT(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "planos-write", 15, 60 * 1000)
  if (rateLimit) return rateLimit
  const { session, error } = await getServerSessionRBAC(["GOD"])
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID do plano é obrigatório" }, { status: 400 })
    }

    const existente = await prisma.planos.findUnique({ where: { id } })
    if (!existente) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const data: any = {}

    if (body.nome !== undefined) data.nome = String(body.nome)
    if (body.preco !== undefined) data.preco = Number(body.preco)
    if (body.descricao !== undefined) data.descricao = String(body.descricao)
    if (body.maxModulos !== undefined) data.maxModulos = Number(body.maxModulos)
    if (body.maxUsuarios !== undefined) data.maxUsuarios = Number(body.maxUsuarios)
    if (body.botIA !== undefined) data.botIA = Boolean(body.botIA)
    if (body.canais !== undefined) data.canais = Array.isArray(body.canais) ? body.canais : []
    if (body.modulosAutomaticos !== undefined) data.modulosAutomaticos = Array.isArray(body.modulosAutomaticos) ? body.modulosAutomaticos : []
    if (body.ativo !== undefined) data.ativo = Boolean(body.ativo)
    if (body.destaque !== undefined) data.destaque = Boolean(body.destaque)
    if (body.ordem !== undefined) data.ordem = Number(body.ordem)
    // slug só muda se livre de conflito
    if (body.slug !== undefined) {
      const slugLimpo = String(body.slug).toLowerCase().replace(/[^a-z0-9-]/g, "")
      if (!slugLimpo) {
        return NextResponse.json({ error: "Slug inválido" }, { status: 400 })
      }
      const conflito = await prisma.planos.findUnique({ where: { slug: slugLimpo } })
      if (conflito && conflito.id !== id) {
        return NextResponse.json({ error: "Já existe um plano com esse slug" }, { status: 409 })
      }
      data.slug = slugLimpo
    }

    const atualizado = await prisma.planos.update({ where: { id }, data })
    return NextResponse.json(atualizado)
  } catch (err) {
    console.error("Erro ao atualizar plano:", err)
    return NextResponse.json({ error: "Erro ao atualizar plano" }, { status: 500 })
  }
}

// Ações de extinção / cancelamento / exclusão (GOD)
export async function DELETE(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "planos-write", 15, 60 * 1000)
  if (rateLimit) return rateLimit
  const { session, error } = await getServerSessionRBAC(["GOD"])
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const action = searchParams.get("action") || "extinguir"

    if (!id) {
      return NextResponse.json({ error: "ID do plano é obrigatório" }, { status: 400 })
    }

    const existente = await prisma.planos.findUnique({ where: { id } })
    if (!existente) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 })
    }

    if (action === "cancelar_extincao") {
      await cancelarExtincao(id)
      return NextResponse.json({ message: "Extinção cancelada. Plano reativado." })
    }

    if (action === "extinguir") {
      const { getPlanoPorSlug } = await import("@/lib/planos-server")
      const plano = await getPlanoPorSlug(existente.slug)
      if (!plano) {
        return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 })
      }
      const notificadas = await solicitarExtincao(plano)
      return NextResponse.json({
        message: `Extinção do plano ${plano.nome} agendada para daqui 30 dias. ${notificadas} empresa(s) notificada(s).`,
        notificadas,
      })
    }

    if (action === "forcar_exclusao") {
      // uso interno/god: exclui de verdade sem migração (atenção)
      await prisma.planos.delete({ where: { id } })
      return NextResponse.json({ message: "Plano excluído definitivamente." })
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
  } catch (err) {
    console.error("Erro na ação de plano:", err)
    return NextResponse.json({ error: "Erro ao processar ação" }, { status: 500 })
  }
}
