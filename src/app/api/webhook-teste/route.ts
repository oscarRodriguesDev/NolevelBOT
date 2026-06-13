import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  console.log("WEBHOOK RECEBEU:", JSON.stringify(body));

  try {
    const response = await fetch(
      "https://evolution.nolevel.hiskra.com.br/instance/fetchInstances",
      {
        headers: {
          apikey: process.env.EVOLUTION_API_KEY || "",
        },
      }
    );

    const data = await response.text();

    console.log("EVOLUTION RESPONDEU:", data);

    return NextResponse.json({
      ok: true,
      evolution: data,
    });
  } catch (error) {
    console.error("ERRO FETCH:", error);

    return NextResponse.json({
      ok: false,
      error: String(error),
    });
  }
}