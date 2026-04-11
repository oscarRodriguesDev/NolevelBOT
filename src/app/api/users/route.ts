import { NextRequest, NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma-context"
import { hash } from "bcryptjs"
import { ROLE } from "@prisma/client"
import { uploadFile } from "@/app/hooks/upload"
import { getSessionOrFail } from "@/util/permission"

export async function POST(req: NextRequest) {
  // Valida sessão e permissões
  const session = await getSessionOrFail(["GOD", "ADMIN", "GESTOR"])

  try {
    // Prisma já resolve o tenant automaticamente (seu contexto atual)
    const prisma = await getPrisma()

    // Captura os dados enviados via multipart/form-data
    const formData = await req.formData()

    // Papel vindo do frontend (codificado)
    const roleFromFront = formData.get("role") as string 

    // Mapeamento seguro de roles
    const roleMap: Record<string, ROLE> = {
      "XX!": "GOD",
      "X1X": "ADMIN",
      "1XX": "GESTOR",
      "X11": "ATENDENTE"
    }

    const finalRole = roleMap[roleFromFront]

    // Validação de role inválida
    if (!finalRole) {
      return NextResponse.json({ error: "Papel inválido" }, { status: 400 })
    }

    // Role do usuário logado
    const userRole = session?.user.role

    // Controle de permissão hierárquica
    let canCreate = false

    if (userRole === "GOD") {
      canCreate = true
    } else if (userRole === "ADMIN") {
      if (finalRole !== "GOD") canCreate = true
    } else if (userRole === "GESTOR") {
      if (finalRole === "ATENDENTE") canCreate = true
    }

    // Bloqueia criação sem permissão
    if (!canCreate) {
      return NextResponse.json(
        { error: `Um ${userRole} não tem permissão para criar um ${finalRole}` },
        { status: 403 }
      )
    }

    // Dados básicos do usuário
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const cpf = formData.get("cpf") as string
    const password = formData.get("password") as string
    const setor = formData.get("setor") as string

    // Arquivo de avatar
    const file = formData.get("avatar") as File | null

    // Aqui está a mudança importante:
    // usamos o tenantSlug vindo da sessão para isolar o upload
    const tenantSlug = 'dev-teste' //aqui preciso pegar o nome do slug ainda

    // Upload agora usa bucket fixo + path por tenant
    const avatarUrl = await uploadFile({
      tenantSlug,
      folder: "avatars", // organização interna
      file,
      fileName: cpf, // opcional: nome previsível (ex: CPF)
      defaultUrl: "/users/default-avatar.png",
    })

    // Hash da senha
    const hashedPassword = await hash(password, 10)

    // Criação do usuário no banco do tenant
    const user = await prisma.user.create({
      data: {
        name,
        email,
        cpf,
        password: hashedPassword,
        role: finalRole,
        setor: setor || "Atendente",
        avatarUrl,
      },
    })

    return NextResponse.json(user)

  } catch (error) {
    console.error("Erro:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}