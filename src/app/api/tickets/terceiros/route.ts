import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionOrFail } from '@/util/permission'
import { applyRateLimit } from '@/lib/rate-limit'
import { validateOrError } from '@/lib/validate'
import { criarChamadoTerceiroSchema } from '@/lib/validation'
import { uploadFile } from '@/lib/upload'
import { ROLE } from '@prisma/client'

export const dynamic = 'force-dynamic'

const ROLES_ATENDIMENTO: ROLE[] = ["ATENDENTE", "GESTOR", "ADMIN", "GOD"]

// Remove tags HTML e limita o tamanho de uma string
function sanitizar(valor: string, maxLength = 500): string {
  return valor
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength)
}

// Abre um chamado para um terceiro/colaborador sem exigir CPF do solicitante
// Fluxo autenticado: o atendente logado identifica a empresa pela sessao.
export async function POST(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "tickets-terceiros", 30, 60 * 1000)
  if (rateLimit) return rateLimit

  const session = await getSessionOrFail(ROLES_ATENDIMENTO)
  if (!session?.user) {
    return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 })
  }

  try {
    const formData = await req.formData()

    const honeypot = formData.get("website") as string | null
    if (honeypot) {
      return NextResponse.json({ success: true })
    }

    const nome = sanitizar((formData.get("nome") as string) || "", 200)
    const colaboradorId = (formData.get("colaboradorId") as string || "").trim() || undefined
    const setor = sanitizar((formData.get("setor") as string) || "", 100)
    const descricao = sanitizar((formData.get("descricao") as string) || "", 1000)
    const prioridade = (formData.get("prioridade") as string) || "normal"
    const matricula = (formData.get("matricula") as string || "").replace(/\D/g, "").slice(0, 30) || undefined
    const cpf = (formData.get("cpf") as string || "").replace(/\D/g, "").slice(0, 11) || undefined
    const file = formData.get("anexo") as File | null

    const parsed = validateOrError(
      { nome, colaboradorId, setor, descricao, prioridade, matricula, cpf },
      criarChamadoTerceiroSchema
    )
    if (parsed instanceof NextResponse) return parsed

    const empresaId = session.user.empresaId as string

    // Confirma que a empresa possui o módulo Corporativo ativo
    const empresaModulos = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { modulos: true },
    })
    if (!empresaModulos || !empresaModulos.modulos.includes("CORPORATIVO")) {
      return NextResponse.json({ error: "Sua empresa não possui o módulo Corporativo ativo." }, { status: 403 })
    }

    // Resolve o colaborador: selecionado (colaboradorId) ou novo (nome digitado)
    let colaboradorRegistrado: { id: string; nome: string; cpf: string | null } | null = null

    if (colaboradorId) {
      colaboradorRegistrado = await prisma.colaboradores.findFirst({
        where: { id: colaboradorId, empresaId },
        select: { id: true, nome: true, cpf: true },
      })
      if (!colaboradorRegistrado) {
        return NextResponse.json({ error: "Colaborador selecionado não pertence à sua empresa" }, { status: 400 })
      }
    } else {
      // Sem correspondência no autocomplete → cadastra o novo colaborador na mesma transacao
      const novo = await prisma.colaboradores.create({
        data: {
          empresaId,
          nome: parsed.nome,
          matricula: parsed.matricula ? parsed.matricula.replace(/\D/g, "").slice(0, 30) || undefined : undefined,
          cpf: parsed.cpf ? parsed.cpf.replace(/\D/g, "").slice(0, 11) || undefined : undefined,
          telefone: parsed.telefone ? parsed.telefone.replace(/\D/g, "").slice(0, 15) || undefined : undefined,
          criadoPorUserId: session.user.id,
        },
        select: { id: true, nome: true, cpf: true },
      })
      colaboradorRegistrado = novo
    }

    let anexoUrl: string | null = null
    if (file && file.size > 0) {
      try {
        anexoUrl = await uploadFile({
          bucket: "anexo",
          folder: `terceiros/${colaboradorRegistrado.id}`,
          file,
          defaultUrl: "",
        })
      } catch (uploadError) {
        console.error("ERRO AO FAZER UPLOAD DO ANEXO:", uploadError)
      }
    }

    const ticket = `TKT-${Date.now()}`

    const chamado = await prisma.chamado.create({
      data: {
        ticket,
        nome: colaboradorRegistrado.nome,
        // CHamados de terceiro: cpf fica null quando o colaborador nao tem CPF cadastrado
        cpf: colaboradorRegistrado.cpf,
        tipo: "TERCEIRO",
        colaboradorId: colaboradorRegistrado.id,
        setor: parsed.setor,
        descricao: parsed.descricao,
        prioridade: parsed.prioridade,
        anexoUrl,
        empresaId,
        atendenteId: session.user.id,
      },
    })

    return NextResponse.json(chamado, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar chamado de terceiro:", error)
    return NextResponse.json({ error: "Erro ao criar chamado" }, { status: 500 })
  }
}