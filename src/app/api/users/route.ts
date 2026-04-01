import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { ROLE } from "@prisma/client"
import { uploadFile } from "@/app/hooks/upload"




export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const cpf = formData.get("cpf") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as string
    const setor = formData.get("setor") as string
    const file = formData.get("avatar") as File | null

    const allowedRoles: ROLE[] = ["GOD", "ADMIN", "GESTOR", "ATENDENTE"]

    if (!allowedRoles.includes(role as ROLE)) {
      return NextResponse.json(
        { error: "Role inválida" },
        { status: 400 }
      )
    }

    const avatarUrl = await uploadFile({
      bucket: "profile",
      folder: "",
      file,
      defaultUrl: "https://seu-dominio.com/default-avatar.png",
    })

    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        cpf,
        password: hashedPassword,
        role: role as ROLE,
        setor,
        avatarUrl,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    )
  }
}
