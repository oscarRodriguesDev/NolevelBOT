import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'
import { uploadFile } from '@/lib/upload'

export async function GET(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "oficina-tickets", 30, 60 * 1000)
  if (rateLimit) return rateLimit
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
            modulos: true,
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
      modulos: registro.Empresa?.modulos || [],
    })
  } catch (error) {
    console.error('Erro ao validar matrícula:', error)
    return NextResponse.json({ error: 'Erro ao validar matrícula' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "oficina-tickets", 10, 60 * 1000)
  if (rateLimit) return rateLimit
  try {
    const contentType = req.headers.get('content-type') || ''
    const isMultipart = contentType.includes('multipart/form-data')

    let matricula = ''
    let nome = ''
    let funcao = ''
    let numeroOnibus = ''
    let data = ''
    let defeito = ''
    let setor = ''
    let file: File | null = null

    if (isMultipart) {
      const formData = await req.formData()
      matricula = (formData.get('matricula') as string) || ''
      nome = (formData.get('nome') as string) || ''
      funcao = (formData.get('funcao') as string) || ''
      numeroOnibus = (formData.get('numeroOnibus') as string) || ''
      data = (formData.get('data') as string) || ''
      defeito = (formData.get('defeito') as string) || ''
      setor = (formData.get('setor') as string) || ''
      file = formData.get('anexo') as File | null
    } else {
      const body = await req.json()
      matricula = body.matricula || ''
      nome = body.nome || ''
      funcao = body.funcao || ''
      numeroOnibus = body.numeroOnibus || ''
      data = body.data || ''
      defeito = body.defeito || ''
      setor = body.setor || ''
    }

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

    const empresaModulos = await prisma.empresa.findUnique({
      where: { id: registro.empresaId },
      select: { modulos: true }
    })

    if (!empresaModulos || !empresaModulos.modulos.includes("OFICINA")) {
      return NextResponse.json({ error: "Sua empresa não possui o módulo Operacional (Oficina) ativo." }, { status: 403 })
    }

    let anexoUrl: string | null = null
    if (file && file.size > 0) {
      try {
        anexoUrl = await uploadFile({
          bucket: 'anexo',
          folder: matricula,
          file,
          defaultUrl: '',
        })
      } catch (uploadError) {
        console.error('ERRO AO FAZER UPLOAD DO ANEXO:', uploadError)
      }
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
        anexoUrl,
      },
    })

    return NextResponse.json(chamado, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar Pedido de Manutenção:', error)
    return NextResponse.json({ error: 'Erro ao criar Pedido de Manutenção' }, { status: 500 })
  }
}
