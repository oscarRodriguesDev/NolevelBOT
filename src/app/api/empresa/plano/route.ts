import { NextRequest, NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { getServerSessionRBAC } from "@/lib/rbac-server"
import { validarModulos } from "@/lib/planos"
import { getPlanoPorSlug } from "@/lib/planos-server"

// Troca de plano da empresa (upgrade/downgrade) — SaaS
// GOD troca de qualquer empresa; ADMIN/GESTOR trocam da própria.
export async function PUT(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "empresa-plano", 15, 60 * 1000)
  if (rateLimit) return rateLimit
  const { session, error } = await getServerSessionRBAC(["GOD", "ADMIN", "GESTOR"])
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const body = await req.json()
    const { plano, modulos } = body

    if (!plano) {
      return NextResponse.json({ error: "Plano é obrigatório" }, { status: 400 })
    }
    const planoRegistro = await getPlanoPorSlug(String(plano))
    if (!planoRegistro || !planoRegistro.ativo) {
      return NextResponse.json({ error: "Plano inválido ou indisponível" }, { status: 400 })
    }
    const planoId = planoRegistro.slug

    // Resolve qual empresa pode ser alterada
    let empresaId = id || session!.empresaId
    if (session!.role === "GOD" && !id) {
      return NextResponse.json({ error: "Informe o id da empresa" }, { status: 400 })
    }
    if (session!.role !== "GOD" && session!.empresaId !== empresaId) {
      return NextResponse.json({ error: "Você só pode alterar o plano da sua empresa" }, { status: 403 })
    }

    const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } })
    if (!empresa) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })
    }

    // Valida módulos conforme o novo plano
    const { ok, modulos: modulosFinais, error: modulosError } = validarModulos(planoRegistro, modulos || empresa.modulos as string[])
    if (!ok) {
      return NextResponse.json({ error: modulosError || "Módulos inválidos para o plano" }, { status: 400 })
    }

    const atualizada = await prisma.empresa.update({
      where: { id: empresaId },
      data: {
        plano: planoId,
        modulos: modulosFinais as any,
      },
      select: {
        id: true,
        nome: true,
        plano: true,
        modulos: true,
      },
    })

    return NextResponse.json({
      message: `Plano alterado para ${planoRegistro.nome}`,
      ...atualizada,
    })
  } catch (err) {
    console.error("Erro ao trocar plano:", err)
    return NextResponse.json({ error: "Erro ao trocar plano" }, { status: 500 })
  }
}

// Retorna o plano atual da empresa
export async function GET(req: NextRequest) {
  const { session, error } = await getServerSessionRBAC(["GOD", "ADMIN", "GESTOR"])
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id") || session!.empresaId

    if (session!.role !== "GOD" && session!.empresaId !== id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const empresa = await prisma.empresa.findUnique({
      where: { id },
      select: { id: true, nome: true, plano: true, modulos: true },
    })
    if (!empresa) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })
    }

    return NextResponse.json(empresa)
  } catch (err) {
    return NextResponse.json({ error: "Erro ao buscar plano" }, { status: 500 })
  }
}
