import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/nextauth" // Certifique-se de que o caminho está correto
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"
import { uploadFile } from "@/app/hooks/upload"


export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // 1. Verificação de sessão
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // 2. Busca no banco
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        role: true,
        avatarUrl: true,
        setor: true,
        // Evite dar o select em 'password' por segurança, 
        // mesmo que você não o tenha listado aqui.
        chamados: {
          orderBy: {
            createdAt: 'desc' // Opcional: já traz os chamados ordenados
          }
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    // É uma boa prática logar o erro no servidor para debug
    console.error("[USER_GET_ERROR]:", error)
    return NextResponse.json(
      { error: "Erro interno no servidor" }, 
      { status: 500 }
    )
  }
}


export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, password, avatarUrl } = body

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 }
      )
    }

    if (!password && avatarUrl === undefined) {
      return NextResponse.json(
        { error: "Nenhum dado para atualização" },
        { status: 400 }
      )
    }

    const dataToUpdate: Prisma.userUpdateInput = {}

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      dataToUpdate.password = hashedPassword
    }

    if (avatarUrl !== undefined) {
      dataToUpdate.avatarUrl = avatarUrl
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    )
  }
}

//alteração de imagem ainda não disponivel nessa versão