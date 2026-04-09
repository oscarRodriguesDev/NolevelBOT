import { NextRequest, NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma-context"
import { hash } from "bcryptjs"
import { ROLE } from "@prisma/client"
import { uploadFile } from "@/app/hooks/upload"
import { getSessionOrFail } from "@/util/permission"



export async function POST(req: NextRequest) {
  const session = await getSessionOrFail(["GOD", "ADMIN", "GESTOR"])

  try {
    const prisma = await getPrisma()

    const formData = await req.formData()
    const roleFromFront = formData.get("role") as string 

    const roleMap: Record<string, ROLE> = {
      "XX!": "GOD",
      "X1X": "ADMIN",
      "1XX": "GESTOR",
      "X11": "ATENDENTE"
    }

    const finalRole = roleMap[roleFromFront]

    if (!finalRole) {
      return NextResponse.json({ error: "Papel inválido" }, { status: 400 })
    }

    const userRole = session?.user.role

    let canCreate = false

    if (userRole === "GOD") {
      canCreate = true
    } else if (userRole === "ADMIN") {
      if (finalRole !== "GOD") canCreate = true
    } else if (userRole === "GESTOR") {
      if (finalRole === "ATENDENTE") canCreate = true
    }

    if (!canCreate) {
      return NextResponse.json(
        { error: `Um ${userRole} não tem permissão para criar um ${finalRole}` },
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
        setor : setor || 'Atendente', //corrigir envio do setor no front end
        avatarUrl,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Erro:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}