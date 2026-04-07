import { NextResponse } from "next/server"
import { getSessionOrFail } from "@/util/permission"
import { cookies } from "next/headers"

// master
import { prismaMaster } from "@/lib/prisma/masterClient"

// tenant
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

export const dynamic = "force-dynamic"

async function getTenantPrisma() {
  const cookieStore = await cookies()
  const tenantSlug = cookieStore.get("tenant")?.value

  if (!tenantSlug) throw new Error("Tenant não identificado")

  const empresa = await prismaMaster.empresa.findFirst({
    where: { slug: tenantSlug },
  })

  if (!empresa) throw new Error("Empresa não encontrada")

  const pool = new Pool({
    connectionString: empresa.databaseUrl,
  })

  const adapter = new PrismaPg(pool)

  const prisma = new PrismaClient({
    adapter,
  } as any)

  return prisma
}

// GET
export async function GET() {
  try {
    const prisma = await getTenantPrisma()

    const avisos = await prisma.avisos.findMany({
      orderBy: { createdAt: "desc" },
    })

    const agora = new Date()

    const validos = []
    const vencidosIds: string[] = []

    for (const aviso of avisos) {
      if (!aviso.duracao) {
        validos.push(aviso)
        continue
      }

      const dias = Number(aviso.duracao)
      if (isNaN(dias)) {
        validos.push(aviso)
        continue
      }

      const dataExpiracao = new Date(aviso.createdAt)
      dataExpiracao.setDate(dataExpiracao.getDate() + dias)

      if (agora > dataExpiracao) {
        vencidosIds.push(aviso.id)
      } else {
        validos.push(aviso)
      }
    }

    if (vencidosIds.length > 0) {
      await prisma.avisos.deleteMany({
        where: {
          id: { in: vencidosIds },
        },
      })
    }

    return NextResponse.json(validos)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar avisos" },
      { status: 500 }
    )
  }
}

// POST
export async function POST(request: Request) {
  const session = await getSessionOrFail(["ADMIN", "GESTOR", "GOD"])
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const prisma = await getTenantPrisma()

    const body = await request.json()
    const { titulo, conteudo, setor, duracao } = body

    if (!titulo || !conteudo) {
      return NextResponse.json(
        { error: "Título e conteúdo são obrigatórios" },
        { status: 400 }
      )
    }

    let expiresAt: Date | null = null

    if (duracao) {
      const dias = Number(duracao)

      if (!isNaN(dias)) {
        const agora = new Date()
        agora.setDate(agora.getDate() + dias)
        expiresAt = agora
      }
    }

    const novoAviso = await prisma.avisos.create({
      data: {
        titulo,
        conteudo,
        duracao,
        setor: setor || null,
        expiresAt,
      },
    })

    return NextResponse.json(novoAviso, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar aviso" },
      { status: 500 }
    )
  }
}

// PUT
export async function PUT(request: Request) {
  const session = await getSessionOrFail(["ADMIN", "GESTOR", "GOD"])
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const prisma = await getTenantPrisma()

    const body = await request.json()
    const { id, titulo, conteudo, setor, duracao, expiresAt } = body

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      )
    }

    let parsedExpiresAt: Date | null = null

    if (expiresAt) {
      const date = new Date(expiresAt)
      if (!isNaN(date.getTime())) {
        parsedExpiresAt = date
      }
    }

    const avisoAtualizado = await prisma.avisos.update({
      where: { id },
      data: {
        titulo,
        conteudo,
        duracao,
        setor: setor ?? null,
        expiresAt: parsedExpiresAt,
      },
    })

    return NextResponse.json(avisoAtualizado)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar aviso" },
      { status: 500 }
    )
  }
}

// DELETE
export async function DELETE(request: Request) {
  const session = await getSessionOrFail(["ADMIN", "GESTOR", "GOD"])
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const prisma = await getTenantPrisma()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      )
    }

    const existe = await prisma.avisos.findUnique({
      where: { id },
    })

    if (!existe) {
      return NextResponse.json(
        { error: "Aviso não encontrado" },
        { status: 404 }
      )
    }

    await prisma.avisos.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Aviso deletado com sucesso" })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao deletar aviso" },
      { status: 500 }
    )
  }
}