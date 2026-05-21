import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionOrFail } from "@/util/permission"

export async function GET() {
  const session = await getSessionOrFail(["GOD"])
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        role: true,
        setor: true,
        Empresa: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(admins)
  } catch (error) {
    console.error("Erro ao listar admins:", error)
    return NextResponse.json(
      { error: "Erro ao listar administradores" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSessionOrFail(["GOD"])
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, name, email, cpf, setor, empresaId } = body

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
    }

    const data: any = {}
    if (name) data.name = name
    if (email) data.email = email
    if (cpf) data.cpf = cpf
    if (setor) data.setor = setor
    if (empresaId) data.empresaId = empresaId

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        role: true,
        setor: true,
        Empresa: { select: { id: true, nome: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Erro ao atualizar admin:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar administrador" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionOrFail(["GOD"])
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Usuário não encontrado ou não é ADMIN" },
        { status: 404 }
      )
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ message: "Administrador removido com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar admin:", error)
    return NextResponse.json(
      { error: "Erro ao remover administrador" },
      { status: 500 }
    )
  }
}
