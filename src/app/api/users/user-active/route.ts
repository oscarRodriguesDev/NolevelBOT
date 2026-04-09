import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"
import { getSessionOrFail } from "@/util/permission"
import { uploadFile } from "@/app/hooks/upload"
import { authOptions } from "@/lib/nextauth"
import { getServerSession } from "next-auth"
import { getPrisma } from "@/lib/prisma-context"

export async function GET() {
  const session = await getSessionOrFail()

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const prisma = await getPrisma()

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
        chamados: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("[USER_GET_ERROR]:", error)
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  const logado = await getServerSession(authOptions)

  if (!logado?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const prisma = await getPrisma()

    const formData = await req.formData()

    const userId = logado.user.id
    const password = formData.get("password") as string | null
    const file = formData.get("avatarFile") as File | null

    const dataToUpdate: Prisma.userUpdateInput = {}

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10)
      dataToUpdate.password = hashedPassword
    }

    if (file && file.size > 0) {
      const uploadedUrl = await uploadFile({
        bucket: "profile",
        folder: "",
        file: file,
      })

      if (uploadedUrl) {
        dataToUpdate.avatarUrl = uploadedUrl
      }
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { error: "Nenhum dado para atualizar" },
        { status: 400 }
      )
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
    console.error("ERRO NO PUT:", error)
    return NextResponse.json(
      { error: "Erro interno ao atualizar" },
      { status: 500 }
    )
  }
}