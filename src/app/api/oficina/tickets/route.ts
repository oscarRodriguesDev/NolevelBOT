import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const matricula = searchParams.get('matricula')?.replace(/\D/g, '')

    if (!matricula) {
      return NextResponse.json({ error: 'Matrícula obrigatória' }, { status: 400 })
    }

    const registro = await prisma.cpfs.findFirst({
      where: { cpf: matricula },
      select: {
        nome: true,
        empresaId: true,
        Empresa: {
          select: {
            id: true,
            setores: true,
          },
        },
      },
    })

    if (!registro) {
      return NextResponse.json({ error: 'Matrícula não encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      nome: registro.nome,
      empresaId: registro.empresaId,
      setores: registro.Empresa?.setores || [],
    })
  } catch (error) {
    console.error('Erro ao validar matrícula:', error)
    return NextResponse.json({ error: 'Erro ao validar matrícula' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { matricula, nome, funcao, numeroOnibus, data, defeito, setor } = body

    const campos: string[] = []
    if (!matricula) campos.push('matricula')
    if (!nome) campos.push('nome')
    if (!funcao) campos.push('funcao')
    if (!numeroOnibus) campos.push('numeroOnibus')
    if (!data) campos.push('data')
    if (!defeito) campos.push('defeito')
    if (!setor) campos.push('setor')
    if (campos.length > 0) {
      return NextResponse.json({ error: `Campos obrigatórios: ${campos.join(', ')}` }, { status: 400 })
    }

    const registro = await prisma.cpfs.findFirst({ where: { cpf: matricula } })
    if (!registro) {
      return NextResponse.json({ error: 'Matrícula não encontrada' }, { status: 404 })
    }

    const descricao = JSON.stringify({ funcao, numeroOnibus, data, defeito })
    const ticket = `TKT-${Date.now()}`

    const chamado = await prisma.chamado.create({
      data: {
        ticket,
        nome,
        cpf: matricula,
        setor,
        descricao,
        prioridade: 'normal',
        empresaId: registro.empresaId,
      },
    })

    return NextResponse.json(chamado, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar chamado da oficina:', error)
    return NextResponse.json({ error: 'Erro ao criar chamado' }, { status: 500 })
  }
}
