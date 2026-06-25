import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
export const dynamic = 'force-dynamic'
import { getSessionOrFail } from '@/util/permission'
import { getTicketWhereClause } from '@/lib/rbac'
import { uploadFile, deleteStorageFile } from '@/lib/upload'
import type { HistoricoItem } from '@/types/chamado'
import { normalizarStatus } from '@/types/chamado'
import { ROLE } from '@prisma/client'

// Cria um novo chamado via busca publica com upload de anexo
export async function POST(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "tickets-search", 10, 60 * 1000)
  if (rateLimit) return rateLimit
  try {
    const formData = await req.formData()

    const nome = formData.get("nome") as string
    const cpf = formData.get("cpf") as string
    const setor = formData.get("setor") as string
    const descricao = formData.get("descricao") as string
    const prioridade = (formData.get("prioridade") as string) || "normal"
    const file = formData.get("anexo") as File | null

    if (!nome || !cpf || !setor || !descricao) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 })
    }

    const cpfRecord = await prisma.cpfs.findFirst({ where: { cpf } })
    if (!cpfRecord) {
      return NextResponse.json({ error: "CPF não encontrado na empresa" }, { status: 404 })
    }

    const empresaId = cpfRecord.empresaId

    let anexoUrl: string | null = null
    if (file) {
      try {
        anexoUrl = await uploadFile({
          bucket: "anexo",
          folder: cpf,
          file,
          defaultUrl: "",
        })
      } catch (uploadError) {
        console.error("ERRO AO FAZER UPLOAD DO ANEXO:", uploadError)
      }
    }

    const ticket = `TKT-${Date.now()}`

    const chamado = await prisma.chamado.create({
      data: {
        ticket,
        nome,
        cpf,
        setor,
        descricao,
        prioridade,
        anexoUrl,
        empresaId,
      },
    })

    return NextResponse.json(chamado, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao criar chamado" }, { status: 500 })
  }
}

// Busca chamados por CPF, ticket ou listagem geral com filtro de permissao
export async function GET(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "tickets-search", 30, 60 * 1000)
  if (rateLimit) return rateLimit
  try {
    const { searchParams } = new URL(req.url)
    const cpf = searchParams.get("cpf")
    const ticket = searchParams.get("ticket")

    const session = await getSessionOrFail()

    if (ticket) {
      const chamados = await prisma.chamado.findMany({
        where: { ticket },
        orderBy: { createdAt: "desc" },
        include: {
          atendente: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      })
      return NextResponse.json(chamados)
    }

    if (cpf) {
      const chamados = await prisma.chamado.findMany({
        where: { cpf },
        orderBy: { createdAt: "desc" },
        include: {
          atendente: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      })
      return NextResponse.json(chamados)
    }

    const userRole = session?.user?.role as ROLE | undefined
    const userSetor = session?.user?.setor || ""
    const empresaId = session?.user?.empresaId || ""

    const where: Prisma.ChamadoWhereInput = getTicketWhereClause(userRole || "ATENDENTE", userSetor, empresaId)

    const chamados = await prisma.chamado.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        atendente: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    })

    return NextResponse.json(chamados)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar chamados" }, { status: 500 })
  }
}

// Atualiza status e historico de um chamado pela busca
export async function PUT(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "tickets-search", 20, 60 * 1000)
  if (rateLimit) return rateLimit
  const session = await getSessionOrFail()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const ticketNumber = searchParams.get("atendimento")
    const estagio = searchParams.get("estagio")

    if (!ticketNumber) {
      return NextResponse.json({ error: "Número do ticket não fornecido" }, { status: 400 })
    }

    if (!estagio) {
      return NextResponse.json({ error: "Estágio não fornecido" }, { status: 400 })
    }

    const body = await req.json()
    const { descricao, historico } = body
    const userId = session.user.id
    const empresaId = session.user.empresaId
    const userRole = session.user.role as ROLE
    const userSetor = session.user.setor

    const chamadoExistente = await prisma.chamado.findFirst({
      where: {
        ticket: { equals: ticketNumber.trim(), mode: "insensitive" },
        empresaId,
      },
    })

    if (!chamadoExistente) {
      return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 })
    }

    if (userRole === "ATENDENTE" || userRole === "GESTOR") {
      if (chamadoExistente.setor !== userSetor) {
        return NextResponse.json({ error: "Você só pode atender chamados do seu setor" }, { status: 403 })
      }
    }

    const historicoExistente: HistoricoItem[] = chamadoExistente.historico
      ? JSON.parse(chamadoExistente.historico) : []

    const novosItens: HistoricoItem[] = historico ? JSON.parse(historico) : []

    const itensFiltrados = novosItens.filter((novo) =>
      !historicoExistente.some(
        (antigo) =>
          antigo.data === novo.data &&
          antigo.acao === novo.acao &&
          antigo.observacao === novo.observacao
      )
    )

    const novoHistorico: HistoricoItem[] = [...historicoExistente, ...itensFiltrados]

    const chamadoAtualizado = await prisma.chamado.update({
      where: { ticket: ticketNumber.trim() },
      data: {
        status: normalizarStatus(estagio),
        atendenteId: userId,
        descricao: descricao || chamadoExistente.descricao,
        historico: JSON.stringify(novoHistorico),
      },
      include: {
        atendente: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    })

    return NextResponse.json(chamadoAtualizado, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao atualizar chamado" }, { status: 500 })
  }
}

// Finaliza um chamado movendo-o para tickets fechados pela busca
export async function DELETE(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "tickets-search", 15, 60 * 1000)
  if (rateLimit) return rateLimit
  const session = await getSessionOrFail()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const ticketNumber = searchParams.get("atendimento")

    if (!ticketNumber) {
      return NextResponse.json({ error: "Número do ticket não fornecido" }, { status: 400 })
    }

    const empresaId = session.user.empresaId
    const userRole = session.user.role as ROLE
    const userSetor = session.user.setor

    const chamado = await prisma.chamado.findFirst({
      where: {
        ticket: { equals: ticketNumber.trim(), mode: "insensitive" },
        empresaId,
      },
      include: {
        atendente: { select: { name: true } },
      },
    })

    if (!chamado) {
      return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 })
    }

    if (userRole === "ATENDENTE" || userRole === "GESTOR") {
      if (chamado.setor !== userSetor) {
        return NextResponse.json({ error: "Você só pode finalizar chamados do seu setor" }, { status: 403 })
      }
    }

    await deleteStorageFile(chamado.anexoUrl)

    await prisma.tickets_fechados.create({
      data: {
        ticket: chamado.ticket,
        nome: chamado.nome,
        cpf: chamado.cpf,
        setor: chamado.setor,
        historico: chamado.historico,
        prioridade: chamado.prioridade,
        atendente: chamado.atendente?.name || null,
        createdAt: chamado.createdAt,
        anexoUrl: chamado.anexoUrl || null,
      },
    })

    await prisma.chamado.delete({ where: { id: chamado.id } })

    return NextResponse.json({ message: "Chamado movido para tickets fechados" }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao mover chamado" }, { status: 500 })
  }
}
