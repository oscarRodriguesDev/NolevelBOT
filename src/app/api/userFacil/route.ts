import { uploadFile } from "@/lib/upload"
import { prisma } from "@/lib/prisma"
import { ROLE } from "@prisma/client"
import { hash } from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"
import { getSessionOrFail } from "@/util/permission";

// GET - Listar empresas (apenas GOD)
export async function GET(req: NextRequest) {
  const session = await getSessionOrFail(["GOD"])
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const empresas = await prisma.empresa.findMany({
    select: {
      id: true,
      nome: true,
      cnpj: true,
    },
    orderBy: { nome: "asc" },
  })

  return NextResponse.json(empresas)
}

//assim posso criar usuario para qualquer empresa, preciso validar se
//  o empresaId existe mesmo, ou se o usuario tem acesso a ele, para evitar que um usuario
//  crie conta em uma empresa que ele não tem acesso
export async function POST(req: NextRequest) {
  const session = await getSessionOrFail(['GOD'])
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
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

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const cpf = formData.get("cpf") as string
    const password = formData.get("password") as string
    const setor = formData.get("setor") as string
    const empresaId = formData.get("empresaId") as string
    const file = formData.get("avatar") as File | null

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }
    if (!cpf || !cpf.trim()) {
      return NextResponse.json({ error: "CPF é obrigatório" }, { status: 400 })
    }
    if (!password || !password.trim()) {
      return NextResponse.json({ error: "Senha é obrigatória" }, { status: 400 })
    }
    if (!setor || !setor.trim()) {
      return NextResponse.json({ error: "Setor é obrigatório" }, { status: 400 })
    }
    if (!empresaId) {
      return NextResponse.json({ error: "empresaId é obrigatório" }, { status: 400 })
    }

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
        empresaId,
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