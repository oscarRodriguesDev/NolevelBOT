// app/api/chamados/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const ticket = formData.get('ticket') as string
    const setor = formData.get('setor') as string
    const descricao = formData.get('descricao') as string
    const prioridade = formData.get('prioridade') as string | null
    const anexoUrl = formData.get('anexoUrl') as string | null

    if (!ticket || !setor || !descricao) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não informados' },
        { status: 400 }
      )
    }

    const chamado = await prisma.chamado.create({
      data: {
        ticket,
        setor,
        descricao,
        status: 'aberto',
        prioridade: prioridade ?? 'normal',
        anexoUrl: anexoUrl ?? null,
      },
    })

    return NextResponse.json(chamado, { status: 201 })
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ticket já existe' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar chamado' },
      { status: 500 }
    )
  }
}