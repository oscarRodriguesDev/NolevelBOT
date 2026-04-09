// /src/app/api/chamados/route.ts

import { NextRequest, NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"

import { getPrisma } from "@/lib/prisma-context"
import { chamadoRepository } from "@/repositories/chamado.repository"

import { uploadFile } from "@/app/hooks/upload"
import { getSessionOrFail } from "@/util/permission"

export const dynamic = "force-dynamic"

type HistoricoItem = {
  data: string
  acao: string
  observacao?: string
  atendente?: string
}

// ================= POST =================
export async function POST(req: NextRequest) {
  try {
    const prisma = await getPrisma()

    const formData = await req.formData()

    const nome = formData.get("nome") as string
    const cpf = formData.get("cpf") as string
    const setor = formData.get("setor") as string
    const descricao = formData.get("descricao") as string
    const prioridade = (formData.get("prioridade") as string) || "normal"
    const file = formData.get("anexo") as File | null

    if (!nome || !cpf || !setor || !descricao) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      )
    }

    const anexoUrl = await uploadFile({
      bucket: "documents",
      folder: cpf,
      file,
      defaultUrl: "",
    })

    const chamado = await chamadoRepository.create(
      {
        nome,
        cpf,
        setor,
        descricao,
        prioridade,
        anexoUrl: anexoUrl || undefined,
      },
      prisma
    )

    return NextResponse.json(chamado, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao criar chamado" },
      { status: 500 }
    )
  }
}

// ================= GET =================
export async function GET(req: NextRequest) {
  try {
    const prisma = await getPrisma()

    const session = await getSessionOrFail()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      )
    }

    const userSetor = session.user.setor

    const { searchParams } = new URL(req.url)

    const ticket = searchParams.get("ticket")
    const setor = searchParams.get("setor")
    const cpf = searchParams.get("cpf")
    const status = searchParams.get("status")
    const nome = searchParams.get("nome")
    const descricao = searchParams.get("descricao")
    const prioridade = searchParams.get("prioridade")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: Prisma.ChamadoWhereInput = {}

    where.setor = userSetor

    if (ticket) where.ticket = ticket
    if (cpf) where.cpf = cpf
    if (status) where.status = status
    if (prioridade) where.prioridade = prioridade

    if (setor && setor === userSetor) {
      where.setor = setor
    }

    if (nome) {
      where.nome = {
        contains: nome,
        mode: "insensitive",
      }
    }

    if (descricao) {
      where.descricao = {
        contains: descricao,
        mode: "insensitive",
      }
    }

    if (startDate || endDate) {
      where.createdAt = {}

      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const chamados = await prisma.chamado.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        atendente: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    })

    return NextResponse.json(chamados, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar chamados" },
      { status: 500 }
    )
  }
}

// ================= PUT =================
export async function PUT(req: NextRequest) {
  try {
    const prisma = await getPrisma()

    await getSessionOrFail()

    const { searchParams } = new URL(req.url)
    const ticketNumber = searchParams.get("atendimento")
    const estagio = searchParams.get("estagio")

    if (!ticketNumber || !estagio) {
      return NextResponse.json(
        { error: "Parâmetros inválidos" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { descricao, historico, userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: "Usuário não identificado" },
        { status: 401 }
      )
    }

    const chamadoExistente = await prisma.chamado.findFirst({
      where: {
        ticket: {
          equals: ticketNumber.trim(),
          mode: "insensitive",
        },
      },
    })

    if (!chamadoExistente) {
      return NextResponse.json(
        { error: "Chamado não encontrado" },
        { status: 404 }
      )
    }

    const historicoExistente: HistoricoItem[] = chamadoExistente.historico
      ? JSON.parse(chamadoExistente.historico)
      : []

    const novosItens: HistoricoItem[] = historico
      ? JSON.parse(historico)
      : []

    const itensFiltrados = novosItens.filter(
      (novo) =>
        !historicoExistente.some(
          (antigo) =>
            antigo.data === novo.data &&
            antigo.acao === novo.acao &&
            antigo.observacao === novo.observacao
        )
    )

    const novoHistorico = [
      ...historicoExistente,
      ...itensFiltrados,
    ]

    const chamadoAtualizado = await prisma.chamado.update({
      where: { ticket: ticketNumber.trim() },
      data: {
        status: estagio,
        atendenteId: userId,
        descricao: descricao || chamadoExistente.descricao,
        historico: JSON.stringify(novoHistorico),
      },
      include: {
        atendente: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    })

    return NextResponse.json(chamadoAtualizado, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao atualizar chamado" },
      { status: 500 }
    )
  }
}

// ================= DELETE =================
export async function DELETE(req: NextRequest) {
  try {
    const prisma = await getPrisma()

    await getSessionOrFail()

    const { searchParams } = new URL(req.url)
    const ticketNumber = searchParams.get("atendimento")

    if (!ticketNumber) {
      return NextResponse.json(
        { error: "Número do ticket não fornecido" },
        { status: 400 }
      )
    }

    const chamado = await prisma.chamado.findFirst({
      where: {
        ticket: {
          equals: ticketNumber.trim(),
          mode: "insensitive",
        },
      },
      include: {
        atendente: {
          select: { name: true },
        },
      },
    })

    if (!chamado) {
      return NextResponse.json(
        { error: "Chamado não encontrado" },
        { status: 404 }
      )
    }

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

    await prisma.chamado.delete({
      where: { id: chamado.id },
    })

    return NextResponse.json(
      { message: "Chamado movido para tickets fechados" },
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao mover chamado" },
      { status: 500 }
    )
  }
}