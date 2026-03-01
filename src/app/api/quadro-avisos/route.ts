import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Buscar todos os avisos
export async function GET() {
  try {
    const avisos = await prisma.avisos.findMany({
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(avisos)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar avisos" },
      { status: 500 }
    )
  }
}

// POST - Criar novo aviso
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { titulo, conteudo, setor } = body

    if (!titulo || !conteudo) {
      return NextResponse.json(
        { error: "Título e conteúdo são obrigatórios" },
        { status: 400 }
      )
    }

    const novoAviso = await prisma.avisos.create({
      data: {
        titulo,
        conteudo,
        setor: setor || null
      }
    })

    return NextResponse.json(novoAviso, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar aviso" },
      { status: 500 }
    )
  }
}

// PUT - Editar aviso
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, titulo, conteudo, setor } = body

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      )
    }

    const avisoAtualizado = await prisma.avisos.update({
      where: { id },
      data: {
        titulo,
        conteudo,
        setor: setor ?? null
      }
    })

    return NextResponse.json(avisoAtualizado)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar aviso" },
      { status: 500 }
    )
  }
}

// DELETE - Deletar aviso
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      )
    }

    await prisma.avisos.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Aviso deletado com sucesso" })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao deletar aviso" },
      { status: 500 }
    )
  }
}