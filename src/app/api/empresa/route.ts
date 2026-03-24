// app/api/empresa/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// CREATE
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const empresa = await prisma.empresa.create({
      data: {
        nome: body.nome,
        cnpj: body.cnpj,
        setores: body.setores || [],
      },
    })

    return NextResponse.json(empresa)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar empresa' }, { status: 500 })
  }
}

// READ ALL
export async function GET() {
  try {
    const empresas = await prisma.empresa.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(empresas)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar empresas' }, { status: 500 })
  }
}