import { uploadFile } from "@/lib/upload"
import { applyRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { ROLE } from "@prisma/client"
import { hash } from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"
import { getSessionOrFail } from "@/util/permission"
import { limparCPF } from "@/util/limparcpfs"
import { podeCriarRole, roleParaDisplay, rolesQuePodeCriar } from "@/lib/rbac"

const roleMap: Record<string, ROLE> = {
  "XX!": "GOD",
  "X1X": "ADMIN",
  "1XX": "GESTOR",
  "X11": "ATENDENTE",
}

export async function GET() {
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

export async function POST(req: NextRequest) {
  const rateLimit = applyRateLimit(req, "userFacil", 20, 60 * 1000)
  if (rateLimit) return rateLimit
  const session = await getSessionOrFail(["GOD"])
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await req.formData()

    const roleFromFront = formData.get("role") as string
    const finalRole = roleMap[roleFromFront]

    if (!finalRole) {
      return NextResponse.json({ error: "Papel inválido" }, { status: 400 })
    }

    if (!podeCriarRole("GOD", finalRole)) {
      const permitidas = rolesQuePodeCriar("GOD").map(roleParaDisplay).join(", ")
      return NextResponse.json(
        { error: `GOD só pode criar: ${permitidas}` },
        { status: 403 }
      )
    }

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const cpf = limparCPF(formData.get("cpf") as string || "")
    const password = formData.get("password") as string
    const setor = formData.get("setor") as string
    const empresaId = formData.get("empresaId") as string
    const file = formData.get("avatar") as File | null

    if (!name?.trim()) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    if (!email?.trim()) return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    if (!cpf) return NextResponse.json({ error: "CPF é obrigatório" }, { status: 400 })
    if (!password?.trim()) return NextResponse.json({ error: "Senha é obrigatória" }, { status: 400 })
    if (!setor?.trim()) return NextResponse.json({ error: "Setor é obrigatório" }, { status: 400 })
    if (!empresaId) return NextResponse.json({ error: "empresaId é obrigatório" }, { status: 400 })

    const empresaExiste = await prisma.empresa.findUnique({ where: { id: empresaId } })
    if (!empresaExiste) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 400 })
    }

    const avatarUrl = await uploadFile({
      bucket: "profile",
      folder: "",
      file,
      defaultUrl: "https://tcgvuhoyojgdnzobmxxl.supabase.co/storage/v1/object/public/profile/cfa70ab9-e566-4bc4-ae53-97c83f24e7e9.jpeg",
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

    await prisma.cpfs.upsert({
      where: { cpf },
      update: { nome: name, empresaId },
      create: { cpf, nome: name, empresaId },
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
