import { NextRequest, NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/rate-limit"
import { validateOrError } from "@/lib/validate"
import { createUserSchema, updateUserSchema } from "@/lib/validation"
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

// Cria um novo usuario com role, empresa e validacoes RBAC
export async function POST(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "users", 20, 60 * 1000)
  if (rateLimit) return rateLimit
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

    if (!empresaID) {
      const userDb = await prisma.user.findUnique({
        where: { id: session!.id },
        select: { empresaId: true },
      })
      if (userDb?.empresaId) {
        empresaID = userDb.empresaId
      }
    }

    if (!empresaID) {
      return NextResponse.json(
        { error: "Sua sessão não possui empresa vinculada. Faça login novamente." },
        { status: 400 }
      )
    }

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
    let setor = formData.get("setor") as string
    const file = formData.get("avatar") as File | null

    if (finalRole === "ADMIN" && !setor) {
      setor = "all"
    }

    const parsed = validateOrError({ name, email, cpf, password, setor, empresaId: empresaID, role: finalRole }, createUserSchema)
    if (parsed instanceof NextResponse) return parsed

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

// Lista usuarios com filtros por role, empresa e setor (RBAC)
export async function GET(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "users", 60, 60 * 1000)
  if (rateLimit) return rateLimit
  const { session, error } = await getServerSessionRBAC(["GOD", "ADMIN", "GESTOR"])
  if (error) return error

  try {
    const { searchParams } = new URL(req.url)
    const role = searchParams.get("role")
    const empresaIdParam = searchParams.get("empresaId")

    const userRole = session!.role
    const empresaId = session!.empresaId
    const userSetor = session!.setor

    const where: any = {}

    if (userRole === "GOD") {
      if (empresaIdParam) where.empresaId = empresaIdParam
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
        Empresa: {
          select: { nome: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao listar usuários" }, { status: 500 })
  }
}

// Exclui um usuario com verificacao de substituto e permissoes RBAC
export async function DELETE(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "users", 20, 60 * 1000)
  if (rateLimit) return rateLimit
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

    if (session!.id === id) {
      return NextResponse.json(
        { error: "Você não pode excluir seu próprio usuário" },
        { status: 403 }
      )
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
      if (targetUser.role === "GESTOR") {
        const outroGestor = await prisma.user.findFirst({
          where: { empresaId: userEmpresaId, role: "GESTOR", id: { not: id } },
        })
        if (!outroGestor) {
          return NextResponse.json(
            { error: "É necessário criar outro GESTOR antes de excluir este. A empresa não pode ficar sem gestores." },
            { status: 400 }
          )
        }
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

    if (targetUser.role === "ADMIN") {
      const outroAdmin = await prisma.user.findFirst({
        where: { empresaId: targetUser.empresaId, role: "ADMIN", id: { not: id } },
      })
      if (!outroAdmin) {
        return NextResponse.json(
          { error: "É necessário ter outro ADMIN antes de excluir este. A empresa não pode ficar sem administradores." },
          { status: 400 }
        )
      }
    }

    // Execução em transação para garantir que ambos sejam deletados
    await prisma.$transaction(async (tx) => {
      // Deleta o registro na tabela de CPFs se o campo CPF existir no usuário
      if (targetUser.cpf) {
        await tx.cpfs.deleteMany({
          where: { cpf: targetUser.cpf },
        })
      }

      // Deleta o usuário
      await tx.user.delete({ where: { id } })
    })

    return NextResponse.json({ message: "Usuário e registro de CPF removidos com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar usuário:", error)
    return NextResponse.json({ error: "Erro ao remover usuário" }, { status: 500 })
  }
}
// Atualiza dados de um usuario com validacao RBAC e CPF/email duplicados
export async function PUT(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "users", 20, 60 * 1000)
  if (rateLimit) return rateLimit
  const { session, error } = await getServerSessionRBAC(["GOD", "ADMIN", "GESTOR"])
  if (error) return error

  try {
    const body = await req.json()

    const parsed = validateOrError(body, updateUserSchema)
    if (parsed instanceof NextResponse) return parsed

    const { id, name, email, cpf, setor, empresaId, role } = parsed

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, empresaId: true, setor: true, cpf: true, email: true, name: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (session!.id === id) {
      return NextResponse.json(
        { error: "Você não pode editar seu próprio usuário" },
        { status: 403 }
      )
    }

    if (targetUser.role === "GOD") {
      return NextResponse.json({ error: "Usuários GOD não podem ser editados pela aplicação" }, { status: 403 })
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
        return NextResponse.json({ error: "Você só pode editar GESTOR ou ATENDENTE" }, { status: 403 })
      }
      if (targetUser.empresaId && targetUser.empresaId !== userEmpresaId) {
        return NextResponse.json({ error: "Usuário não pertence à sua empresa" }, { status: 403 })
      }
    } else if (userRole === "GESTOR") {
      if (targetUser.role !== "ATENDENTE") {
        return NextResponse.json({ error: "Você só pode editar ATENDENTE" }, { status: 403 })
      }
      if (targetUser.empresaId && targetUser.empresaId !== userEmpresaId) {
        return NextResponse.json({ error: "Usuário não pertence à sua empresa" }, { status: 403 })
      }
      if (targetUser.setor !== userSetor) {
        return NextResponse.json({ error: "Atendente não pertence ao seu setor" }, { status: 403 })
      }
    }

    const data: any = {}
    if (name) data.name = name
    if (email) data.email = email
    if (cpf) data.cpf = limparCPF(cpf)
    if (setor) data.setor = setor
    if (empresaId && userRole === "GOD") data.empresaId = empresaId

    if (!targetUser.empresaId && userEmpresaId && userRole !== "GOD") {
      data.empresaId = userEmpresaId
    }

    if (email && email !== targetUser.email) {
      const emailExiste = await prisma.user.findUnique({ where: { email } })
      if (emailExiste && emailExiste.id !== id) {
        return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
      }
    }

    if (cpf && limparCPF(cpf) !== targetUser.cpf) {
      const cpfExiste = await prisma.user.findFirst({
        where: { cpf: limparCPF(cpf), empresaId: empresaId || targetUser.empresaId },
      })
      if (cpfExiste && cpfExiste.id !== id) {
        return NextResponse.json({ error: "CPF já cadastrado nesta empresa" }, { status: 400 })
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, name: true, email: true, cpf: true,
        role: true, setor: true, empresaId: true, avatarUrl: true,
      },
    })

    if (cpf && limparCPF(cpf)) {
      const cleanCpf = limparCPF(cpf)
      await prisma.cpfs.upsert({
        where: { cpf: cleanCpf },
        update: { nome: name || targetUser.name, empresaId: empresaId || targetUser.empresaId },
        create: { cpf: cleanCpf, nome: name || targetUser.name, empresaId: empresaId || targetUser.empresaId },
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 })
  }
}
