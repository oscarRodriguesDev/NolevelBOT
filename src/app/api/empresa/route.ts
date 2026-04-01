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
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cnpj = searchParams.get("cnpj")

    if (!cnpj) {
      const empresas = await prisma.empresa.findMany({
        select: {
          id: true,
          nome: true,
          cnpj: true,
          setores: true,
        },
      })

      return NextResponse.json(empresas)
    }

    const empresa = await prisma.empresa.findUnique({
      where: { cnpj },
      select: {
        id: true,
        nome: true,
        cnpj: true,
        setores: true,
      },
    })

    if (!empresa) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(empresa)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar empresa" },
      { status: 500 }
    )
  }
}