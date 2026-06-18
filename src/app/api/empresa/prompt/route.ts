import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { getServerSessionRBAC } from "@/lib/rbac-server";
import OpenAI from "openai";

function getOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function GET(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "empresa-prompt", 30, 60 * 1000)
  if (rateLimit) return rateLimit
  const { session, error } = await getServerSessionRBAC(["GOD"]);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const empresaId = searchParams.get("empresaId");

  if (!empresaId) {
    return NextResponse.json({ error: "empresaId é obrigatório" }, { status: 400 });
  }

  try {
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: {
        id: true,
        nome: true,
        botName: true,
        botPresentation: true,
        botServiceDesc: true,
        botAvisosDesc: true,
        botPrompt: true,
        logoUrl: true,
      },
    });

    if (!empresa) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    return NextResponse.json(empresa);
  } catch (err) {
    return NextResponse.json({ error: "Erro ao buscar configuração" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "empresa-prompt", 20, 60 * 1000)
  if (rateLimit) return rateLimit
  const { session, error } = await getServerSessionRBAC(["GOD"]);
  if (error) return error;

  try {
    const body = await req.json();
    const { empresaId, botPresentation, botServiceDesc, botAvisosDesc, botName } = body;

    const isPreview = empresaId === "preview";

    if (!empresaId) {
      return NextResponse.json({ error: "empresaId é obrigatório" }, { status: 400 });
    }

    let nomeEmpresa = "Empresa";
    let nomeBot = botName || "Hevelyn";
    let empresaExistente = null;

    if (!isPreview) {
      empresaExistente = await prisma.empresa.findUnique({
        where: { id: empresaId },
        select: { id: true, nome: true, botName: true },
      });

      if (!empresaExistente) {
        return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
      }

      nomeBot = botName || empresaExistente.botName || "Hevelyn";
      nomeEmpresa = empresaExistente.nome;
    }

    const descricoes = [
      botPresentation ? `APRESENTAÇÃO: ${botPresentation}` : null,
      botServiceDesc ? `ATENDIMENTO: ${botServiceDesc}` : null,
      botAvisosDesc ? `AVISOS: ${botAvisosDesc}` : null,
    ].filter(Boolean).join("\n");

    const systemPrompt = `Você é um especialista em criar prompts para assistentes virtuais. 
Com base nas descrições fornecidas, crie um prompt personalizado para o assistente ${nomeBot} da empresa ${nomeEmpresa}.
O prompt deve ser em português, direto, e conter instruções claras sobre:
1. Como o assistente deve se apresentar
2. Como o assistente deve conduzir o atendimento
3. Como o assistente deve apresentar os avisos

Regras:
- Seja conciso e objetivo
- Mantenha o tom profissional e acolhedor
- Inclua regras específicas mencionadas nas descrições
- Máximo de 500 caracteres`;

    let promptGerado = "";
    try {
      const response = await getOpenAI().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: descricoes || "Crie um prompt padrão de atendimento." },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });
      promptGerado = response.choices[0].message.content || "";
    } catch (err) {
      console.error("Erro ao gerar prompt com OpenAI:", err);
      promptGerado = `Você é ${nomeBot}, atendente da ${nomeEmpresa}. Seja educado e prestativo.`;
    }

    if (!isPreview) {
      const updateData: any = {};
      if (botPresentation !== undefined) updateData.botPresentation = botPresentation;
      if (botServiceDesc !== undefined) updateData.botServiceDesc = botServiceDesc;
      if (botAvisosDesc !== undefined) updateData.botAvisosDesc = botAvisosDesc;
      if (botName !== undefined) updateData.botName = botName;
      updateData.botPrompt = promptGerado;

      await prisma.empresa.update({
        where: { id: empresaId },
        data: updateData,
      });
    }

    return NextResponse.json({
      botPrompt: promptGerado,
      botPresentation,
      botServiceDesc,
      botAvisosDesc,
      botName: nomeBot,
    });
  } catch (err) {
    console.error("Erro ao gerar prompt:", err);
    return NextResponse.json({ error: "Erro ao gerar prompt" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "empresa-prompt", 20, 60 * 1000)
  if (rateLimit) return rateLimit
  const { session, error } = await getServerSessionRBAC(["GOD"]);
  if (error) return error;

  try {
    const body = await req.json();
    const { empresaId, botPrompt, botName, botPresentation, botServiceDesc, botAvisosDesc } = body;

    if (!empresaId) {
      return NextResponse.json({ error: "empresaId é obrigatório" }, { status: 400 });
    }

    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { id: true },
    });

    if (!empresa) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    const data: any = {};
    if (botPrompt !== undefined) data.botPrompt = botPrompt;
    if (botName !== undefined) data.botName = botName;
    if (botPresentation !== undefined) data.botPresentation = botPresentation;
    if (botServiceDesc !== undefined) data.botServiceDesc = botServiceDesc;
    if (botAvisosDesc !== undefined) data.botAvisosDesc = botAvisosDesc;

    await prisma.empresa.update({
      where: { id: empresaId },
      data,
    });

    return NextResponse.json({ message: "Configuração atualizada com sucesso" });
  } catch (err) {
    return NextResponse.json({ error: "Erro ao atualizar configuração" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "empresa-prompt", 15, 60 * 1000)
  if (rateLimit) return rateLimit
  const { session, error } = await getServerSessionRBAC(["GOD"]);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const empresaId = searchParams.get("empresaId");

    if (!empresaId) {
      return NextResponse.json({ error: "empresaId é obrigatório" }, { status: 400 });
    }

    await prisma.empresa.update({
      where: { id: empresaId },
      data: {
        botPrompt: null,
        botPresentation: null,
        botServiceDesc: null,
        botAvisosDesc: null,
        botName: null,
      },
    });

    return NextResponse.json({ message: "Configuração do bot removida" });
  } catch (err) {
    return NextResponse.json({ error: "Erro ao remover configuração" }, { status: 500 });
  }
}
