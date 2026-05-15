import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
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
  try {
    const body = await req.json()

    const { cpf, nome, telefone, empresa } = body

    if (!cpf || !nome || !telefone) {
      return NextResponse.json(
        { error: "CPF, nome e telefone são obrigatórios" },
        { status: 400 }
      )
    }

    const leadExists = await prisma.cpfsLeads.findUnique({
      where: {
        cpf,
      },
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