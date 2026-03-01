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

    const where: Prisma.ChamadoWhereInput = {}

    if (ticket) {
      where.ticket = ticket
    }

    if (setor) {
      where.setor = setor
    }

    if (cpf) {
      where.cpf = cpf
    }

    if (status) {
      where.status = status
    }

    if (nome) {
      where.nome = {
        contains: nome,
        mode: 'insensitive',
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