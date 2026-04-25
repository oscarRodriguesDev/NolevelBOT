import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { ROLE } from "@prisma/client"
import { uploadFile } from "@/lib/upload"
import { getSessionOrFail } from "@/util/permission"
import { getServerSession } from "next-auth"


//puxar a sessao do usuario para imputar a empresaid do mesmo no user que esta sendo criado, garantindo que o usuario criado fique atrelado a empresa do criador





export async function POST(req: NextRequest) {

  const userLogado = await getServerSession()
  const empresaID = userLogado?.user.empresaId
  // 1. Liberamos a rota para quem tem poder de criação
  // Note que ATENDENTE ficou de fora pois ele não cria ninguém.
  const session = await getSessionOrFail(["GOD", "ADMIN", "GESTOR"])



  try {
    const formData = await req.formData()
    const roleFromFront = formData.get("role") as string

    const roleMap: Record<string, ROLE> = {
      // "XX!": "GOD",
      "X1X": "ADMIN",
      "1XX": "GESTOR",
      "X11": "ATENDENTE"
    }

    const finalRole = roleMap[roleFromFront]

    if (!finalRole) {
      return NextResponse.json({ error: "Papel inválido" }, { status: 400 })
    }

    // --- LÓGICA DE HIERARQUIA ---
    const userRole = session?.user.role

    let canCreate = false

    if (userRole === "ADMIN") {
      canCreate =
        finalRole === "ADMIN" ||
        finalRole === "GESTOR" ||
        finalRole === "ATENDENTE"
    } else if (userRole === "GESTOR") {
      canCreate = finalRole === "ATENDENTE"
    } else {
      // GOD ou qualquer outro papel não pode criar aqui
      canCreate = false
    }

    if (!canCreate&& userRole === "GOD") {
      return NextResponse.json(
        { error: `Atenção GOD, a rota para criação mudou, favor consultar a documentação!` },
        { status: 403 }
      )
    }
    if (!canCreate) {
      return NextResponse.json(
        { error: `Usuário não tem permissão para criar um ${finalRole}` },
        { status: 403 }
      )
    }

    // --- PROCESSAMENTO ---
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const cpf = formData.get("cpf") as string
    const password = formData.get("password") as string
    const setor = formData.get("setor") as string
    const file = formData.get("avatar") as File | null
    const empresaId = formData.get(empresaID as string) as string

    /*nessa rota somente usuarios da empresa podem ser criados, então god não cria aqui
    */

    const avatarUrl = await uploadFile({
      bucket: "profile",
      folder: "",
      file,
      defaultUrl: "../../../../public/users/default-avatar.png",
    })

    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        empresaId: empresaId, // Certifique-se de que o ID da empresa seja passado corretamente
        cpf,
        password: hashedPassword,
        role: finalRole,
        setor,
        avatarUrl,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Erro:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

