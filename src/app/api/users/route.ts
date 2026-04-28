import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { ROLE } from "@prisma/client"
import { uploadFile } from "@/lib/upload"
import { getSessionOrFail } from "@/util/permission"
import { getServerSession } from "next-auth"


//puxar a sessao do usuario para imputar a empresaid do mesmo no user que esta sendo criado, garantindo que o usuario criado fique atrelado a empresa do criador



export async function POST(req: NextRequest) {
  const session = await getSessionOrFail(["GOD", "ADMIN", "GESTOR"])

  const empresaID = session?.user.empresaId

  console.log("empresa id do usuario logado:", empresaID)

  try {
    if (!empresaID) {
      return NextResponse.json(
        { error: "Usuário logado não possui empresa vinculada" },
        { status: 400 }
      )
    }

    const formData = await req.formData()
    const roleFromFront = formData.get("role") as string

    const roleMap: Record<string, ROLE> = {
      "XX!": "GOD",
      "X1X": "ADMIN",
      "1XX": "GESTOR",
      "X11": "ATENDENTE",
    }

    const finalRole = roleMap[roleFromFront]

    if (!finalRole) {
      return NextResponse.json({ error: "Papel inválido" }, { status: 400 })
    }

    const userRole = session.user.role

    if (userRole === "GOD") {
      return NextResponse.json(
        { error: "GOD deve usar a rota específica de criação" },
        { status: 403 }
      )
    }

    let canCreate = false

    if (userRole === "ADMIN") {
      canCreate =
        finalRole === "ADMIN" ||
        finalRole === "GESTOR" ||
        finalRole === "ATENDENTE"
    }

    if (userRole === "GESTOR") {
      canCreate = finalRole === "ATENDENTE"
    }

    if (!canCreate) {
      return NextResponse.json(
        { error: `Usuário não tem permissão para criar um ${finalRole}` },
        { status: 403 }
      )
    }

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const cpf = formData.get("cpf") as string
    const password = formData.get("password") as string
    const setor = formData.get("setor") as string
    const file = formData.get("avatar") as File | null

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
        cpf,
        password: hashedPassword,
        role: finalRole,
        setor,
        avatarUrl,
        Empresa: {
          connect: {
            id: empresaID,
          },
        },
      },
    })

    return NextResponse.json(user)
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email ou CPF já cadastrado" },
        { status: 400 }
      )
    }

    console.error("Erro:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}