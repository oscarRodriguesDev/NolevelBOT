
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
  const logado = await getServerSession(authOptions)

  // 1. Verificação de Segurança
  if (!logado?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    // IMPORTANTE: Use formData() em vez de json() para aceitar arquivos
    const formData = await req.formData()
    
    const userId = logado.user.id
    const password = formData.get("password") as string | null
    const file = formData.get("avatarFile") as File | null // Nome deve bater com o front

    const dataToUpdate: Prisma.userUpdateInput = {}

    // 2. Hash da Senha
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10)
      dataToUpdate.password = hashedPassword
    }

    // 3. Upload do Arquivo (Se houver)
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

    // 4. Validação de alteração
    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { error: "Nenhum dado para atualizar" },
        { status: 400 }
      )
    }

    // 5. Update no Banco
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