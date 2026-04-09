/* import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Funções de banco
async function getResumoPersona(cpf: string) {
  try {
    return await prisma.resumoPersona.findUnique({ where: { cpf } });
  } catch (error) {
    console.error("Erro Prisma Get:", error);
    return null;
  }
}

async function upsertResumoPersona(cpf: string, nome: string, resumo: string) {
  try {
    await prisma.resumoPersona.upsert({
      where: { cpf },
      update: { nome, resumo },
      create: { cpf, nome, resumo },
    });
  } catch (error) {
    console.error("Erro Prisma Upsert:", error);
  }
}

// Endpoint
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cpf = searchParams.get("cpf");

  if (!cpf) {
    return NextResponse.json({ error: "CPF não fornecido" }, { status: 400 });
  }

  const persona = await getResumoPersona(cpf);
  if (!persona) {
    return NextResponse.json({ error: "Memória não encontrada" }, { status: 404 });
  }

  return NextResponse.json(persona);
}

export async function POST(req: NextRequest) {
  try {
    const { cpf, nome, resumo } = await req.json();

    if (!cpf || !nome || !resumo) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    await upsertResumoPersona(cpf, nome, resumo);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro POST /memories:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
} */

  //testar depois com o bot


  import { NextRequest, NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma-context"
import { PrismaClient } from "@prisma/client"

// Funções de banco
async function getResumoPersona(prisma: PrismaClient, cpf: string) {
  try {
    return await prisma.resumoPersona.findUnique({ where: { cpf } })
  } catch (error) {
    console.error("Erro Prisma Get:", error)
    return null
  }
}

async function upsertResumoPersona(prisma: PrismaClient, cpf: string, nome: string, resumo: string) {
  try {
    await prisma.resumoPersona.upsert({
      where: { cpf },
      update: { nome, resumo },
      create: { cpf, nome, resumo },
    })
  } catch (error) {
    console.error("Erro Prisma Upsert:", error)
  }
}

// Endpoint
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cpf = searchParams.get("cpf")

  if (!cpf) {
    return NextResponse.json({ error: "CPF não fornecido" }, { status: 400 })
  }

  try {
    const prisma = await getPrisma()

    const persona = await getResumoPersona(prisma, cpf)

    if (!persona) {
      return NextResponse.json({ error: "Memória não encontrada" }, { status: 404 })
    }

    return NextResponse.json(persona)
  } catch (error) {
    console.error("Erro GET /memories:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const prisma = await getPrisma()

    const { cpf, nome, resumo } = await req.json()

    if (!cpf || !nome || !resumo) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    await upsertResumoPersona(prisma, cpf, nome, resumo)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro POST /memories:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}