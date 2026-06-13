import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Webhook teste funcionando",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("WEBHOOK TESTE RECEBIDO:");
    console.log(JSON.stringify(body, null, 2));

    return NextResponse.json({
      ok: true,
      received: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro webhook teste:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Erro ao processar webhook",
      },
      { status: 500 }
    );
  }
}