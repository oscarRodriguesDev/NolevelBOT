import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/rate-limit";
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

function validarBotApiKey(req: NextRequest): boolean {
  const apiKey = req.headers.get("x-api-key")
  const botApiKey = process.env.BOT_API_KEY
  if (!botApiKey) return true
  return apiKey === botApiKey
}

// Endpoint
export async function GET(req: NextRequest) {
  const rateLimit = applyRateLimit(req, "memories", 20, 60 * 1000)
  if (rateLimit) return rateLimit

  if (!validarBotApiKey(req)) {
    return NextResponse.json({ error: "API key inválida" }, { status: 401 })
  }

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
  const rateLimit = applyRateLimit(req, "memories", 20, 60 * 1000)
  if (rateLimit) return rateLimit

  if (!validarBotApiKey(req)) {
    return NextResponse.json({ error: "API key inválida" }, { status: 401 })
  }

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
}