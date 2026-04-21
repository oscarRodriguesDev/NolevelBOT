
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"
import { getSessionOrFail } from "@/util/permission"
import { uploadFile } from "@/app/hooks/upload"
import { authOptions } from "@/lib/nextauth"
import { getServerSession } from "next-auth"


export async function GET() {
  const session = await getSessionOrFail()
  if(!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {

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
        empresaId: true,
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
  const logado = await getServerSession(authOptions)


  if (!logado?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const formData = await req.formData()

    const userId = logado.user.id

    const name = formData.get("name") as string | null
    const email = formData.get("email") as string | null
    const setor = formData.get("setor") as string | null
    const password = formData.get("password") as string | null

    const file = formData.get("avatarFile") as File | null

    console.log(file)
    console.log(file?.size)

    const dataToUpdate: Prisma.UserUpdateInput = {}

    if (name) dataToUpdate.name = name
    if (email) dataToUpdate.email = email
    if (setor) dataToUpdate.setor = setor

    if (password?.trim()) {
      dataToUpdate.password = await bcrypt.hash(password, 10)
    }

    if (file && file.size > 0) {
      const uploadedUrl = await uploadFile({
      bucket: "profile",
      folder: "",
      file,
      defaultUrl:
        "https://tcgvuhoyojgdnzobmxxl.supabase.co/storage/v1/object/public/profile/cfa70ab9-e566-4bc4-ae53-97c83f24e7e9.jpeg",
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
        setor: true,
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