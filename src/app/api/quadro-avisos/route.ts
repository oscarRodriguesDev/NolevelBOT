import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionOrFail } from "@/util/permission"



/* 
export async function GET() {

  const session = await getSessionOrFail()
  const empresaId = session?.user.empresaId
   
  try {
    const avisos = await prisma.avisos.findMany({
      orderBy: { createdAt: "desc" }
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
          id: { in: vencidosIds }
        }
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

 */


export async function GET() {
  try {
    const session = await getSessionOrFail()
    const empresaId = session?.user?.empresaId

    if (!empresaId) {
      return NextResponse.json(
        { error: "Empresa não identificada" },
        { status: 401 }
      )
    }

    const avisos = await prisma.avisos.findMany({
      where: {
        empresaId,
      },
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


// POST - Criar novo aviso
export async function POST(request: Request) {
    const session = await getSessionOrFail(["ADMIN", "GESTOR", "GOD"])// Apenas usuários autenticados podem criar avisos
    const empresaId = session?.user.empresaId
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  try {
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
        empresaId: empresaId!,
        duracao,
        setor: setor || null,
        expiresAt
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
   const session = await getSessionOrFail(["ADMIN", "GESTOR", "GOD"])// Apenas usuários autenticados podem editar avisos
 
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { id, titulo, conteudo, setor,duracao, expiresAt } = body

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
        expiresAt: parsedExpiresAt
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
  const session = await getSessionOrFail(["ADMIN", "GESTOR", "GOD"])// Apenas usuários autenticados podem deletar avisos
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      )
    }

    const existe = await prisma.avisos.findUnique({
      where: { id }
    })

    if (!existe) {
      return NextResponse.json(
        { error: "Aviso não encontrado" },
        { status: 404 }
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