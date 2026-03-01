// app/api/chamados/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const setor = formData.get('setor') as string
    const descricao = formData.get('descricao') as string
    const prioridade = (formData.get('prioridade') as string) ?? 'normal'
    const userName = formData.get('userName') as string
    const anexo = formData.get('anexo') as File | null

    if (!setor || !descricao || !userName) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não informados' },
        { status: 400 }
      )
    }

    let anexoUrl: string | null = null

    if (anexo && anexo.size > 0) {
      // aqui você pode implementar upload para storage (ex: Supabase Storage)
      // por enquanto apenas salva o nome do arquivo
      anexoUrl = anexo.name
    }

    const chamado = await prisma.chamado.create({
      data: {
        ticket: `TICKET-${Date.now()}`,
        setor,
        descricao,
        status: 'aberto',
        prioridade,
        anexoUrl,
      },
    })

    return NextResponse.json(chamado, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'Registro duplicado' },
        { status: 409 }
      )
    }

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

    const where: Record<string, string> = {}

    if (ticket) {
      where.ticket = ticket
    }

    if (setor) {
      where.setor = setor
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