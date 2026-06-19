import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
export const dynamic = 'force-dynamic'
import { uploadFile } from '@/lib/upload'
import { validateOrError } from '@/lib/validate'
import { createTicketSchema, isValidCPF } from '@/lib/validation'
import { getSessionOrFail } from '@/util/permission'
import { getPhoneByCpf, registerPhone } from '@/lib/phoneMap'
import { sendEvolutionText } from '@/lib/usedata'
import type { HistoricoItem } from '@/types/chamado'
import { normalizarStatus } from '@/types/chamado'
import { getTicketWhereClause } from '@/lib/rbac'
import { ROLE } from '@prisma/client'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

type ContatoTelefone = { telefone: string; instance: string } | null

async function buscarContato(cpf: string, chamadoId?: string): Promise<ContatoTelefone> {
  const contato = getPhoneByCpf(cpf)
  if (contato && contato.instance !== 'web') return contato

  if (chamadoId) {
    try {
      const chamado = await prisma.chamado.findUnique({
        where: { id: chamadoId },
        select: { historico: true },
      })
      if (chamado?.historico) {
        const historico: HistoricoItem[] = JSON.parse(chamado.historico)
        const entradaTel = historico.find(h => h.acao === "TELEFONE")
        if (entradaTel?.observacao) {
          return { telefone: entradaTel.observacao, instance: 'web' }
        }
      }
    } catch { }
  }

  return contato
}

async function notificarCliente(cpf: string, ticket: string, etapa: 'criado' | 'atualizado' | 'finalizado', nomeAtendente?: string, observacao?: string, chamadoId?: string) {
  try {
    const contato = await buscarContato(cpf, chamadoId)
    if (!contato || contato.instance === 'web') return

    let mensagem = ''
    if (etapa === 'criado') {
      mensagem = `Olá! Seu chamado *${ticket}* foi criado com sucesso! Nossa equipe já foi notificada e em breve alguém começará a tratar.`
    } else if (etapa === 'finalizado') {
      mensagem = `Olá! Seu chamado *${ticket}* foi finalizado. Agradecemos pelo contato! Se precisar de algo, é só nos chamar novamente.`
    } else {
      mensagem = `Olá! Seu chamado *${ticket}* foi atualizado${nomeAtendente ? ` por *${nomeAtendente}*` : ''}.${observacao ? `\n\n📝 *Informação:* ${observacao}` : ''}\n\nFique tranquilo que estamos acompanhando.`
    }

    await sendEvolutionText(contato.instance, contato.telefone, mensagem)
  } catch (error) {
    console.error('Erro ao notificar cliente:', error)
  }
}

function sanitizar(valor: string, maxLength = 500): string {
  return valor
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength)
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const rateCheck = await checkRateLimit(`tickets:${ip}`, 3, 60 * 60 * 1000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Muitas solicitações deste IP. Aguarde antes de tentar novamente." },
        { status: 429 }
      )
    }

    const formData = await req.formData()



    console.log('==== NOVA REQUISIÇÃO ====')
    console.log('nome:', formData.get('nome'))
    console.log('cpf:', formData.get('cpf'))
    console.log('setor:', formData.get('setor'))
    console.log('descricao:', formData.get('descricao'))
    console.log('prioridade:', formData.get('prioridade'))
    console.log('telefone:', formData.get('telefone'))
    console.log('anexo:', formData.get('anexo'))

    const honeypot = formData.get("website") as string | null
    if (honeypot) {
      return NextResponse.json({ success: true })
    }

    const nome = sanitizar(formData.get("nome") as string || "", 100)
    const cpfRaw = (formData.get("cpf") as string || "").replace(/\D/g, "")
    const setor = sanitizar(formData.get("setor") as string || "", 100)
    const descricao = sanitizar(formData.get("descricao") as string || "", 1000)
    const prioridade = (formData.get("prioridade") as string) || "normal"
    const telefone = (formData.get("telefone") as string || "").replace(/\D/g, "").slice(0, 15) || null
    const file = formData.get("anexo") as File | null

    const parsed = validateOrError({ nome, cpf: cpfRaw, setor, descricao, prioridade }, createTicketSchema)
    if (parsed instanceof NextResponse) return parsed

    const cpfRecord = await prisma.cpfs.findFirst({ where: { cpf: cpfRaw } })
    if (!cpfRecord) {
      return NextResponse.json({ error: "CPF não encontrado na empresa" }, { status: 404 })
    }

    const empresaModulos = await prisma.empresa.findUnique({
      where: { id: cpfRecord.empresaId },
      select: { modulos: true }
    })

    if (!empresaModulos || !empresaModulos.modulos.includes("CORPORATIVO")) {
      return NextResponse.json({ error: "Sua empresa não possui o módulo Corporativo ativo." }, { status: 403 })
    }

    const empresaId = cpfRecord.empresaId

    let anexoUrl: string | null = null
    if (file && file.size > 0) {
      try {
        anexoUrl = await uploadFile({
          bucket: "anexo",
          folder: cpfRaw,
          file,
          defaultUrl: "",
        })
      } catch (uploadError) {
        console.error("ERRO AO FAZER UPLOAD DO ANEXO:", uploadError)
      }
    }

    const ticket = `TKT-${Date.now()}`

    const historicoTelefone = telefone
      ? JSON.stringify([{ data: new Date().toISOString(), acao: "TELEFONE", observacao: telefone }])
      : undefined

    const chamado = await prisma.chamado.create({
      data: {
        ticket,
        nome,
        cpf: cpfRaw,
        setor,
        descricao,
        prioridade,
        anexoUrl,
        empresaId,
        historico: historicoTelefone,
      },
    })

    if (telefone) {
      registerPhone(cpfRaw, telefone, 'web')
    }

    notificarCliente(cpfRaw, ticket, 'criado', undefined, undefined, chamado.id)

    return NextResponse.json(chamado, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao criar chamado" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionOrFail()
    if (!session?.user) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
    }

    const userRole = session.user.role as ROLE
    const userSetor = session.user.setor
    const empresaId = session.user.empresaId
    const { searchParams } = new URL(req.url)
    const ticket = searchParams.get("ticket")
    const setor = searchParams.get("setor")
    const cpf = searchParams.get("cpf")
    const status = searchParams.get("status")
    const nome = searchParams.get("nome")
    const descricao = searchParams.get("descricao")
    const prioridade = searchParams.get("prioridade")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const baseWhere = getTicketWhereClause(userRole, userSetor, empresaId)

    const where: Prisma.ChamadoWhereInput = {
      empresaId: baseWhere.empresaId,
    }

    if (userRole === "ATENDENTE" || userRole === "GESTOR") {
      where.setor = baseWhere.setor
    }

    if (ticket) where.ticket = ticket
    if (cpf) where.cpf = cpf
    if (status) where.status = status
    if (prioridade) where.prioridade = prioridade

    if (setor) {
      if (userRole === "GOD" || userRole === "ADMIN") {
        where.setor = setor
      }
    }

    if (nome) {
      where.nome = { contains: nome, mode: "insensitive" }
    }

    if (descricao) {
      where.descricao = { contains: descricao, mode: "insensitive" }
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
    const skip = (page - 1) * limit

    const [chamados, total] = await Promise.all([
      prisma.chamado.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          atendente: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      }),
      prisma.chamado.count({ where }),
    ])

    return NextResponse.json({
      data: chamados,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar chamados" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSessionOrFail()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
    const { descricao, historico } = body
    const userId = session.user.id
    const empresaId = session.user.empresaId
    const userRole = session.user.role as ROLE
    const userSetor = session.user.setor

    const chamadoExistente = await prisma.chamado.findFirst({
      where: {
        ticket: { equals: ticketNumber.trim(), mode: "insensitive" },
        empresaId,
      },
    })

    if (!chamadoExistente) {
      return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 })
    }

    if (userRole === "ATENDENTE" || userRole === "GESTOR") {
      if (chamadoExistente.setor !== userSetor) {
        return NextResponse.json({ error: "Você só pode atender chamados do seu setor" }, { status: 403 })
      }
    }

    let historicoExistente: HistoricoItem[] = []
    if (chamadoExistente.historico) {
      try {
        historicoExistente = JSON.parse(chamadoExistente.historico)
      } catch {
        historicoExistente = []
      }
    }

    let novosItens: HistoricoItem[] = []
    if (historico) {
      try {
        novosItens = JSON.parse(historico)
      } catch {
        novosItens = []
      }
    }

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
      where: { id: chamadoExistente.id },
      data: {
        status: normalizarStatus(estagio),
        atendenteId: userId,
        descricao: descricao || chamadoExistente.descricao,
        historico: JSON.stringify(novoHistorico),
      },
      include: {
        atendente: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    })

    let observacao = ''
    try {
      const historicoParsed: HistoricoItem[] = JSON.parse(historico || '[]')
      const ultimo = historicoParsed[historicoParsed.length - 1]
      if (ultimo?.observacao) observacao = ultimo.observacao
    } catch { }

    const etapa = estagio.toLowerCase() === 'concluido' ? 'finalizado' : 'atualizado'
    notificarCliente(chamadoExistente.cpf, chamadoExistente.ticket, etapa, chamadoAtualizado.atendente?.name, observacao, chamadoExistente.id)

    return NextResponse.json(chamadoAtualizado, { status: 200 })
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro ao atualizar chamado"
    console.error("Erro ao atualizar chamado:", mensagem)
    return NextResponse.json({ error: mensagem }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionOrFail()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const ticketNumber = searchParams.get("atendimento")

    if (!ticketNumber) {
      return NextResponse.json({ error: "Número do ticket não fornecido" }, { status: 400 })
    }

    const empresaId = session.user.empresaId
    const userRole = session.user.role as ROLE
    const userSetor = session.user.setor

    const chamado = await prisma.chamado.findFirst({
      where: {
        ticket: { equals: ticketNumber.trim(), mode: "insensitive" },
        empresaId,
      },
      include: {
        atendente: { select: { name: true } },
      },
    })

    if (!chamado) {
      return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 })
    }

    if (userRole === "ATENDENTE" || userRole === "GESTOR") {
      if (chamado.setor !== userSetor) {
        return NextResponse.json({ error: "Você só pode finalizar chamados do seu setor" }, { status: 403 })
      }
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

    await prisma.chamado.delete({ where: { id: chamado.id } })

    notificarCliente(chamado.cpf, chamado.ticket, 'finalizado', chamado.atendente?.name, undefined, chamado.id)

    return NextResponse.json({ message: "Chamado movido para tickets fechados" }, { status: 200 })
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Erro ao mover chamado"
    console.error("Erro ao mover chamado:", mensagem)
    return NextResponse.json({ error: mensagem }, { status: 500 })
  }
}
