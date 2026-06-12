import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionOrFail } from "@/util/permission"
import { limparCPF } from "@/util/limparcpfs"

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

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    })

    if (!targetUser || targetUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Usuário não encontrado ou não é ADMIN" }, { status: 404 })
    }

    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Você não pode editar seu próprio usuário" },
        { status: 403 }
      )
    }

    const data: any = {}
    if (name) data.name = name
    if (email) data.email = email
    if (cpf) data.cpf = limparCPF(cpf)
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
      select: { id: true, role: true, empresaId: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Você não pode excluir seu próprio usuário" },
        { status: 403 }
      )
    }

    if (user.role === "GOD") {
      return NextResponse.json(
        { error: "Usuários GOD não podem ser deletados pela aplicação" },
        { status: 403 }
      )
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Usuário não é ADMIN" },
        { status: 404 }
      )
    }

    const outroAdmin = await prisma.user.findFirst({
      where: { empresaId: user.empresaId, role: "ADMIN", id: { not: id } },
      select: { id: true },
    })
    if (!outroAdmin) {
      return NextResponse.json(
        { error: "Crie outro ADMIN nesta empresa antes de remover este. A empresa precisa de pelo menos um administrador." },
        { status: 400 }
      )
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ message: "Administrador removido com sucesso" })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao remover administrador" },
      { status: 500 }
    )
  }
}
