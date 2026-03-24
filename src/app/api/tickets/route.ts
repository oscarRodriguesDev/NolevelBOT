// app/api/chamados/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from "@/lib/nextauth"
import type { Prisma } from '@prisma/client'
import fs from 'fs'
import { getServerSession } from 'next-auth'
export const dynamic = 'force-dynamic'
import { uploadFile } from '@/app/hooks/upload'

// helper para validar sessão
async function getSessionOrFail() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return null
  }

  return session
}


//buscar o user da session

type HistoricoItem = {
  data: string
  acao: string
  observacao?: string
  atendente?: string
}


export async function POST(req: NextRequest) {
  try {
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
      defaultUrl:'',
    })

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
      },
    })

    return NextResponse.json(chamado, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao criar chamado" },
      { status: 500 }
    )
  }
}


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const ticket = searchParams.get('ticket')
    const setor = searchParams.get('setor')
    const cpf = searchParams.get('cpf')
    const status = searchParams.get('status')
    const nome = searchParams.get('nome')
    const descricao = searchParams.get('descricao')
    const prioridade = searchParams.get('prioridade')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: Prisma.ChamadoWhereInput = {}

    if (ticket) where.ticket = ticket
    if (setor) where.setor = setor
    if (cpf) where.cpf = cpf
    if (status) where.status = status
    if (prioridade) where.prioridade = prioridade

    if (nome) {
      where.nome = {
        contains: nome,
        mode: 'insensitive',
      }
    }

    if (descricao) {
      where.descricao = {
        contains: descricao,
        mode: 'insensitive',
      }
    }

    if (startDate || endDate) {
      where.createdAt = {}

      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }

      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    const chamados = await prisma.chamado.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
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

    return NextResponse.json(chamados, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar chamados' },
      { status: 500 }
    )
  }
}




export async function PUT(req: NextRequest) {
  getSessionOrFail()

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
    const { descricao, historico, userId } = body

    if (!userId) {
      return NextResponse.json({ error: "Usuário não identificado" }, { status: 401 })
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
      return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 })
    }

    const historicoExistente: HistoricoItem[] = chamadoExistente.historico
      ? JSON.parse(chamadoExistente.historico)
      : []

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
    return NextResponse.json({ error: "Erro ao atualizar chamado" }, { status: 500 })
  }
}



export async function DELETE(req: NextRequest) {

  getSessionOrFail()
  try {
    const { searchParams } = new URL(req.url)
    const ticketNumber = searchParams.get("atendimento")

    if (!ticketNumber) {
      return NextResponse.json({ error: "Número do ticket não fornecido" }, { status: 400 })
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
          select: {
            name: true,
          },
        },
      },
    })

    if (!chamado) {
      return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 })
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
    return NextResponse.json({ error: "Erro ao mover chamado" }, { status: 500 })
  }
}