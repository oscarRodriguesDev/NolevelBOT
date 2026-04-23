// app/api/empresa/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrFail } from '@/util/permission'
import { getSetores } from '@/app/hooks/setores'

// CREATE
export async function POST(req: NextRequest) {
  const session = await getSessionOrFail(["GOD"])
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
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
    const cpf = searchParams.get('cpf')

    if (!cpf) {
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

    const registro = await prisma.cpfs.findUnique({
      where: { cpf },
      select: {
        Empresa: {
          select: {
            id: true,
            nome: true,
            cnpj: true,
            setores: true,
          }
        }
      }
    })

    if (!registro?.Empresa) {
      return NextResponse.json(
        { error: "Empresa não encontrada para este CPF" },
        { status: 404 }
      )
    }

    return NextResponse.json(registro.Empresa)

  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar empresa" },
      { status: 500 }
    )
  }
}