import { uploadFile } from "@/app/hooks/upload"
import { ROLE } from "@prisma/client"
import { hash } from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"

import { getPrisma } from "@/lib/prisma-context"

export async function POST(req: NextRequest) {
  try {
    // agora usa o prisma do tenant automaticamente
    const prisma = await getPrisma()

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
      return NextResponse.json(
        { error: "Papel inválido" },
        { status: 400 }
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
      defaultUrl:
        "https://tcgvuhoyojgdnzobmxxl.supabase.co/storage/v1/object/public/profile/cfa70ab9-e566-4bc4-ae53-97c83f24e7e9.jpeg",
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
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Erro:", error)
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    )
  }
}