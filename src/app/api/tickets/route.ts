// app/api/chamados/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import fs from 'fs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const nome = formData.get('nome') as string
    const cpf = formData.get('cpf') as string
    const setor = formData.get('setor') as string
    const descricao = formData.get('descricao') as string
    const prioridade = (formData.get('prioridade') as string) || 'normal'
    const file = formData.get('anexo') as File | null

    if (!nome || !cpf || !setor || !descricao) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    let anexoUrl: string | null = null

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const fileName = `${Date.now()}-${file.name}`
      const filePath = `uploads/${fileName}`

      await fs.promises.writeFile(filePath, buffer)

      anexoUrl = `/${filePath}`
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
      },
    })

    return NextResponse.json(chamado, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar chamado' },
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

    // Atualiza o chamado com novo status, atendente e histórico
    const chamadoAtualizado = await prisma.chamado.updateMany({
      where: { ticket: { equals: ticketNumber.trim(), mode: "insensitive" } },
      data: {
        status: estagio,
        atendente: "Carlos Mock",
        historico: JSON.stringify([{
          data: new Date(),
          acao: `Status alterado para ${estagio} por Carlos Mock`
        }])
      }
    })

    if (chamadoAtualizado.count === 0) {
      return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 })
    }

    // Retorna o chamado atualizado
    const atualizado = await prisma.chamado.findFirst({
      where: { ticket: { equals: ticketNumber.trim(), mode: "insensitive" } }
    })

    return NextResponse.json(atualizado, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao atualizar chamado" }, { status: 500 })
  }
}





export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ticketNumber = searchParams.get("atendimento")

    if (!ticketNumber) {
      return NextResponse.json({ error: "Número do ticket não fornecido" }, { status: 400 })
    }

    // Busca o chamado
    const chamado = await prisma.chamado.findFirst({
      where: { ticket: { equals: ticketNumber.trim(), mode: "insensitive" } }
    })

    if (!chamado) {
      return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 })
    }

    // Move para tickets_fechados
    await prisma.tickets_fechados.create({
      data: {
        ticket: chamado.ticket,
        nome: chamado.nome,
        cpf: chamado.cpf,
        setor: chamado.setor,
        historico: chamado.descricao,
        prioridade: chamado.prioridade,
        atendente: chamado.atendente,
        createdAt: chamado.createdAt,
        anexoUrl: chamado.anexoUrl || null
      }
    })

    // Deleta da tabela principal
    await prisma.chamado.delete({
      where: { id: chamado.id }
    })

    return NextResponse.json({ message: "Chamado movido para tickets fechados" }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao mover chamado" }, { status: 500 })
  }
}