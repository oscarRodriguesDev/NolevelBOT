import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrFail } from '@/util/permission'

export async function POST(req: NextRequest) {
  const session = await getSessionOrFail(["GOD"])
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await req.json()

    const data: any = {
      nome: body.nome,
      cnpj: body.cnpj,
      setores: body.setores || [],
    }

    if (body.modulos !== undefined) data.modulos = body.modulos
    if (body.logoUrl !== undefined) data.logoUrl = body.logoUrl
    if (body.botName !== undefined) data.botName = body.botName
    if (body.botPresentation !== undefined) data.botPresentation = body.botPresentation
    if (body.botServiceDesc !== undefined) data.botServiceDesc = body.botServiceDesc
    if (body.botAvisosDesc !== undefined) data.botAvisosDesc = body.botAvisosDesc
    if (body.botPrompt !== undefined) data.botPrompt = body.botPrompt

    const empresa = await prisma.empresa.create({ data })

    return NextResponse.json(empresa)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar empresa' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cpf = searchParams.get('cpf')
    const id = searchParams.get('id')

    if (id) {
      const session = await getSessionOrFail(["GOD", "ADMIN", "GESTOR", "ATENDENTE"])
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      if (session.user.role !== "GOD" && session.user.empresaId !== id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const empresa = await prisma.empresa.findUnique({
        where: { id },
        select: {
          id: true,
          nome: true,
          cnpj: true,
          setores: true,
          modulos: true,
          logoUrl: true,
          botName: true,
          botPresentation: true,
          botServiceDesc: true,
          botAvisosDesc: true,
          botPrompt: true,
        },
      })

      if (!empresa) {
        return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })
      }

      return NextResponse.json(empresa)
    }

    if (!cpf) {
      const session = await getSessionOrFail(["GOD", "ADMIN", "GESTOR"])
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const userRole = session.user.role
      const userEmpresaId = session.user.empresaId

      if (userRole === "GOD") {
        const empresas = await prisma.empresa.findMany({
          select: {
            id: true,
            nome: true,
            cnpj: true,
            setores: true,
            modulos: true,
            logoUrl: true,
            botName: true,
            botPresentation: true,
            botServiceDesc: true,
            botAvisosDesc: true,
            botPrompt: true,
          },
        })
        return NextResponse.json(empresas)
      }

      const empresa = await prisma.empresa.findUnique({
        where: { id: userEmpresaId },
        select: {
          id: true,
          nome: true,
          cnpj: true,
          setores: true,
          modulos: true,
          logoUrl: true,
          botName: true,
          botPresentation: true,
          botServiceDesc: true,
          botAvisosDesc: true,
          botPrompt: true,
        },
      })

      if (!empresa) {
        return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })
      }

      return NextResponse.json(empresa)
    }

    const registro = await prisma.cpfs.findUnique({
      where: { cpf },
      select: {
        Empresa: {
          select: {
            id: true,
            nome: true,
            cnpj: true,
            setores: true,
            modulos: true,
            logoUrl: true,
            botName: true,
            botPresentation: true,
            botServiceDesc: true,
            botAvisosDesc: true,
            botPrompt: true,
          }
        }
      }
    })

    if (!registro?.Empresa) {
      return NextResponse.json({ error: "Empresa não encontrada para este CPF" }, { status: 404 })
    }

    return NextResponse.json(registro.Empresa)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar empresa" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSessionOrFail(["GOD"])
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const body = await req.json()

    if (!id) {
      return NextResponse.json({ error: "ID da empresa é obrigatório" }, { status: 400 })
    }

    const empresaExiste = await prisma.empresa.findUnique({ where: { id } })
    if (!empresaExiste) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })
    }

    const data: any = {}
    if (body.nome) data.nome = body.nome
    if (body.cnpj) data.cnpj = body.cnpj
    if (body.setores !== undefined) data.setores = body.setores
    if (body.modulos !== undefined) data.modulos = body.modulos
    if (body.logoUrl !== undefined) data.logoUrl = body.logoUrl
    if (body.botName !== undefined) data.botName = body.botName
    if (body.botPresentation !== undefined) data.botPresentation = body.botPresentation
    if (body.botServiceDesc !== undefined) data.botServiceDesc = body.botServiceDesc
    if (body.botAvisosDesc !== undefined) data.botAvisosDesc = body.botAvisosDesc
    if (body.botPrompt !== undefined) data.botPrompt = body.botPrompt

    const empresa = await prisma.empresa.update({
      where: { id },
      data,
      select: { id: true, nome: true, cnpj: true, setores: true, modulos: true, logoUrl: true, botName: true, botPrompt: true },
    })

    return NextResponse.json(empresa)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar empresa" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionOrFail(["GOD"])
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID da empresa é obrigatório" }, { status: 400 })
    }

    const empresaExiste = await prisma.empresa.findUnique({ where: { id } })
    if (!empresaExiste) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })
    }

    await prisma.$transaction([
      prisma.avisos.deleteMany({ where: { empresaId: id } }),
      prisma.chamado.deleteMany({ where: { empresaId: id } }),
      prisma.cpfs.deleteMany({ where: { empresaId: id } }),
      prisma.user.deleteMany({ where: { empresaId: id } }),
      prisma.empresa.delete({ where: { id } }),
    ])

    return NextResponse.json({ message: "Empresa e todos os dados vinculados foram removidos" })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao remover empresa" }, { status: 500 })
  }
}
