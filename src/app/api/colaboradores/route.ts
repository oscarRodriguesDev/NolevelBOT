import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrFail } from '@/util/permission'
import { applyRateLimit } from '@/lib/rate-limit'
import { validateOrError } from '@/lib/validate'
import { colaboradorSchema } from '@/lib/validation'
import { ROLE } from '@prisma/client'

export const dynamic = 'force-dynamic'

const ROLES_ATENDIMENTO: ROLE[] = ["ATENDENTE", "GESTOR", "ADMIN", "GOD"]

// Mascara parte do CPF para exibicao em sugestoes (ex.: 123.***.***-00)
function mascararCpf(cpf: string | null): string | null {
  if (!cpf) return null
  const d = cpf.replace(/\D/g, "")
  if (d.length !== 11) return cpf
  return `${d.slice(0, 3)}.***.${d.slice(6, 9)}-${d.slice(9)}`
}

// Autocomplete de colaboradores cadastrados na empresa
export async function GET(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "colaboradores-list", 60, 60 * 1000)
  if (rateLimit) return rateLimit

  const session = await getSessionOrFail(ROLES_ATENDIMENTO)
  if (!session?.user) {
    return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const search = (searchParams.get("search") || "").trim()
    const limitParam = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)))

    const where = {
      empresaId: session.user.empresaId as string,
      ...(search
        ? { nome: { contains: search, mode: "insensitive" as const } }
        : {}),
    }

    const colaboradores = await prisma.colaboradores.findMany({
      where,
      orderBy: { nome: "asc" },
      take: limitParam,
      select: {
        id: true,
        nome: true,
        matricula: true,
        cpf: true,
        telefone: true,
      },
    })

    return NextResponse.json(colaboradores.map(c => ({
      ...c,
      cpf: mascararCpf(c.cpf),
    })))
  } catch (error) {
    console.error("Erro ao buscar colaboradores:", error)
    return NextResponse.json({ error: "Erro ao buscar colaboradores" }, { status: 500 })
  }
}

// Cadastra um novo colaborador/terceiro na empresa
export async function POST(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "colaboradores-create", 30, 60 * 1000)
  if (rateLimit) return rateLimit

  const session = await getSessionOrFail(ROLES_ATENDIMENTO)
  if (!session?.user) {
    return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 })
    }

    const parsed = validateOrError(body, colaboradorSchema)
    if (parsed instanceof NextResponse) return parsed

    const nome = parsed.nome.trim()
    const matricula = parsed.matricula?.replace(/\D/g, "").slice(0, 30) || null
    const cpf = parsed.cpf?.replace(/\D/g, "").slice(0, 11) || null
    const telefone = parsed.telefone?.replace(/\D/g, "").slice(0, 15) || null

    // Evita duplicidade por CPF dentro da mesma empresa
    if (cpf) {
      const existente = await prisma.colaboradores.findFirst({
        where: { empresaId: session.user.empresaId, cpf },
        select: { id: true, nome: true },
      })
      if (existente) {
        return NextResponse.json(
          { error: `Colaborador já cadastrado com este CPF: ${existente.nome}` },
          { status: 409 }
        )
      }
    }

    // Evita duplicidade por matricula dentro da mesma empresa
    if (matricula) {
      const existente = await prisma.colaboradores.findFirst({
        where: { empresaId: session.user.empresaId, matricula },
        select: { id: true, nome: true },
      })
      if (existente) {
        return NextResponse.json(
          { error: `Colaborador já cadastrado com esta matrícula: ${existente.nome}` },
          { status: 409 }
        )
      }
    }

    const colaborador = await prisma.colaboradores.create({
      data: {
        empresaId: session.user.empresaId,
        nome,
        matricula: matricula || undefined,
        cpf: cpf || undefined,
        telefone: telefone || undefined,
        criadoPorUserId: session.user.id,
      },
      select: { id: true, nome: true, matricula: true, cpf: true, telefone: true },
    })

    return NextResponse.json(colaborador, { status: 201 })
  } catch (error) {
    console.error("Erro ao cadastrar colaborador:", error)
    return NextResponse.json({ error: "Erro ao cadastrar colaborador" }, { status: 500 })
  }
}