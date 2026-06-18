import { NextRequest, NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/rate-limit"
import { validateOrError } from "@/lib/validate"
import { createLeadSchema } from "@/lib/validation"
import { prisma } from "@/lib/prisma"
import { getSessionOrFail } from "@/util/permission"

export async function GET(req: NextRequest) {
  const rateLimit = applyRateLimit(req, "leads-network", 30, 60 * 1000)
  if (rateLimit) return rateLimit
  try {
    const { searchParams } = new URL(req.url)
    const cpf = searchParams.get("cpf")

    // Consulta por CPF é pública (escopo natural) — usada pelo webhook-leads
    if (cpf) {
      const cpfLimpo = cpf.replace(/\D/g, "")
      const lead = await prisma.cpfsLeads.findUnique({
        where: { cpf: cpfLimpo },
      })

      if (!lead) {
        return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 })
      }

      return NextResponse.json(lead, { status: 200 })
    }

    // Listagem geral requer autenticação
    const session = await getSessionOrFail(["GOD", "ADMIN", "GESTOR"])
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const leads = await prisma.cpfsLeads.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(leads, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar leads" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const rateLimit = applyRateLimit(req, "leads-network", 30, 60 * 1000)
  if (rateLimit) return rateLimit
  try {
    const body = await req.json()

    // Detecta se é um evento da Evolution API (webhook)
    if (body.event === "messages.upsert") {
      const webhookUrl = new URL("/api/webhook-leads", req.url).toString()
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      return NextResponse.json({ ok: true })
    }

    const parsed = validateOrError(body, createLeadSchema)
    if (parsed instanceof NextResponse) return parsed

    const { cpf, nome, telefone, empresa } = parsed

    const leadExists = await prisma.cpfsLeads.findUnique({
      where: { cpf },
    })

    if (leadExists) {
      return NextResponse.json(
        { error: "Lead já cadastrado" },
        { status: 409 }
      )
    }

    const lead = await prisma.cpfsLeads.create({
      data: {
        cpf,
        nome,
        telefone,
        empresa,
      },
    })

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar lead" },
      { status: 500 }
    )
  }
}