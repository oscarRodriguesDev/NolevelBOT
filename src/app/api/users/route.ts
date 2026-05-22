import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { ROLE } from "@prisma/client"
import { uploadFile } from "@/lib/upload"
import { getSessionOrFail } from "@/util/permission"
import { limparCPF } from "@/util/limparcpfs"
import { podeCriarRole, roleParaDisplay, rolesQuePodeCriar } from "@/lib/rbac"
import { getServerSessionRBAC } from "@/lib/rbac-server"

const roleMap: Record<string, ROLE> = {
  "XX!": "GOD",
  "X1X": "ADMIN",
  "1XX": "GESTOR",
  "X11": "ATENDENTE",
}

export async function POST(req: NextRequest) {
  const { session, error } = await getServerSessionRBAC(["GOD", "ADMIN", "GESTOR"])
  if (error) return error

  try {
    const formData = await req.formData()
    const roleFromFront = formData.get("role") as string
    const finalRole = roleMap[roleFromFront]

    if (!finalRole) {
      return NextResponse.json({ error: "Papel inválido" }, { status: 400 })
    }

    const userRole = session!.role

    if (!podeCriarRole(userRole, finalRole)) {
      const permitidas = rolesQuePodeCriar(userRole).map(roleParaDisplay).join(", ")
      return NextResponse.json(
        { error: `Você não pode criar ${roleParaDisplay(finalRole)}. Você pode criar apenas: ${permitidas}` },
        { status: 403 }
      )
    }

    let empresaID = session!.empresaId

    if (userRole === "GOD") {
      const selectedEmpresa = formData.get("empresaId") as string
      if (selectedEmpresa) {
        const empresaExiste = await prisma.empresa.findUnique({ where: { id: selectedEmpresa } })
        if (!empresaExiste) {
          return NextResponse.json({ error: "Empresa selecionada não existe" }, { status: 400 })
        }
        empresaID = selectedEmpresa
      } else {
        return NextResponse.json({ error: "GOD deve selecionar uma empresa" }, { status: 400 })
      }
    } else {
      const empresaExiste = await prisma.empresa.findUnique({ where: { id: empresaID } })
      if (!empresaExiste) {
        return NextResponse.json({ error: "Empresa não encontrada" }, { status: 400 })
      }
    }

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const cpf = limparCPF(formData.get("cpf") as string || "")
    const password = formData.get("password") as string
    const setor = formData.get("setor") as string
    const file = formData.get("avatar") as File | null

    if (!name?.trim()) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    if (!email?.trim()) return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    if (!cpf) return NextResponse.json({ error: "CPF é obrigatório" }, { status: 400 })
    if (!password?.trim()) return NextResponse.json({ error: "Senha é obrigatória" }, { status: 400 })
    if (!setor?.trim()) return NextResponse.json({ error: "Setor é obrigatório" }, { status: 400 })

    if (userRole === "GESTOR") {
      if (setor !== session!.setor) {
        return NextResponse.json(
          { error: "Gestor só pode criar usuários no próprio setor" },
          { status: 403 }
        )
      }
    }

    if (userRole === "ADMIN") {
      const empresa = await prisma.empresa.findUnique({
        where: { id: empresaID },
        select: { setores: true },
      })
      if (empresa && !empresa.setores.includes(setor)) {
        return NextResponse.json(
          { error: "Setor não pertence à sua empresa" },
          { status: 403 }
        )
      }
    }

    const cpfExistente = await prisma.user.findFirst({
      where: { cpf, empresaId: empresaID },
    })
    if (cpfExistente) {
      return NextResponse.json({ error: "CPF já cadastrado nesta empresa" }, { status: 400 })
    }

    const emailExistente = await prisma.user.findUnique({ where: { email } })
    if (emailExistente) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

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
        empresaId: empresaID,
      },
    })

    await prisma.cpfs.upsert({
      where: { cpf },
      update: { nome: name, empresaId: empresaID },
      create: { cpf, nome: name, empresaId: empresaID },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email ou CPF já cadastrado" },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { session, error } = await getServerSessionRBAC(["GOD", "ADMIN", "GESTOR"])
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const role = searchParams.get("role")

    const userRole = session!.role
    const empresaId = session!.empresaId
    const userSetor = session!.setor

    const where: any = {}

    if (userRole === "GOD") {
      if (role) where.role = role
    } else if (userRole === "ADMIN") {
      where.empresaId = empresaId
      if (role) where.role = role
    } else if (userRole === "GESTOR") {
      where.empresaId = empresaId
      where.setor = userSetor
      where.role = "ATENDENTE"
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        role: true,
        setor: true,
        avatarUrl: true,
        empresaId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao listar usuários" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const { session, error } = await getServerSessionRBAC(["GOD", "ADMIN", "GESTOR"])
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, empresaId: true, setor: true, cpf: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (targetUser.role === "GOD") {
      return NextResponse.json(
        { error: "Usuários GOD não podem ser deletados pela aplicação" },
        { status: 403 }
      )
    }

    const userRole = session!.role
    const userEmpresaId = session!.empresaId
    const userSetor = session!.setor

    if (userRole === "GOD") {
      if (!["ADMIN", "GESTOR", "ATENDENTE"].includes(targetUser.role)) {
        return NextResponse.json({ error: "Permissão negada" }, { status: 403 })
      }
    } else if (userRole === "ADMIN") {
      if (!["GESTOR", "ATENDENTE"].includes(targetUser.role)) {
        return NextResponse.json({ error: "Permissão negada" }, { status: 403 })
      }
      if (targetUser.empresaId !== userEmpresaId) {
        return NextResponse.json({ error: "Usuário não pertence à sua empresa" }, { status: 403 })
      }
    } else if (userRole === "GESTOR") {
      if (targetUser.role !== "ATENDENTE") {
        return NextResponse.json({ error: "Permissão negada" }, { status: 403 })
      }
      if (targetUser.empresaId !== userEmpresaId) {
        return NextResponse.json({ error: "Usuário não pertence à sua empresa" }, { status: 403 })
      }
      if (targetUser.setor !== userSetor) {
        return NextResponse.json({ error: "Atendente não pertence ao seu setor" }, { status: 403 })
      }
    }

    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ message: "Usuário removido com sucesso" })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao remover usuário" }, { status: 500 })
  }
}
