import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'
import { getSessionOrFail } from '@/util/permission'
import { getTicketWhereClause } from '@/lib/rbac'
import { ROLE } from '@prisma/client'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

// Busca unificada de chamados por nome, CPF, matrícula ou número do chamado (?q=)
export async function GET(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "tickets-busca", 30, 60 * 1000)
  if (rateLimit) return rateLimit

  const session = await getSessionOrFail()
  if (!session?.user) {
    return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get("q") || "").trim()
    if (!q) {
      return NextResponse.json(
        { error: "Informe nome, CPF, matrícula ou número do chamado" },
        { status: 400 }
      )
    }

    const limitParam = parseInt(searchParams.get("limit") || "30", 10)
    const limit = Math.min(50, Math.max(1, Number.isNaN(limitParam) ? 30 : limitParam))

    const qDigits = q.replace(/\D/g, "")
    const userRole = session.user.role as ROLE
    const userSetor = session.user.setor || ""
    const empresaId = session.user.empresaId || ""
    const base = getTicketWhereClause(userRole, userSetor, empresaId)

    // OR principal: número do chamado, nome gravado no chamado,
    // CPF do chamado (sem máscara) e colaborador TERCEIRO (nome/matrícula/CPF)
    const orClauses: Prisma.ChamadoWhereInput[] = [
      { ticket: { contains: q, mode: "insensitive" } },
      { nome: { contains: q, mode: "insensitive" } },
    ]

    if (qDigits.length > 0) {
      orClauses.push({ cpf: { contains: qDigits } })
    }

    orClauses.push({
      colaborador: {
        is: {
          OR: [
            { nome: { contains: q, mode: "insensitive" } },
            { matricula: { contains: qDigits.length > 0 ? qDigits : q } },
            ...(qDigits.length > 0 ? [{ cpf: { contains: qDigits } }] : []),
          ],
        },
      },
    })

    const andClauses: Prisma.ChamadoWhereInput[] = [{ empresaId: base.empresaId }]

    if (userRole === "ATENDENTE" || userRole === "GESTOR") {
      andClauses.push({ setor: base.setor })
    }

    andClauses.push({ OR: orClauses })

    const where: Prisma.ChamadoWhereInput = { AND: andClauses }

    const chamados = await prisma.chamado.findMany({
      where,
      include: {
        atendente: { select: { id: true, name: true, email: true, avatarUrl: true } },
        colaborador: { select: { id: true, nome: true, matricula: true, cpf: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return NextResponse.json(chamados)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao buscar chamados" }, { status: 500 })
  }
}