import { NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/rate-limit";

const EVOLUTION_URL = "https://evolution.nolevel.hiskra.com.br";
const INSTANCE = "bot";

export async function POST(req: Request) {
  const rateLimit = await applyRateLimit(req, "webhook-teste", 60, 60 * 1000)
  if (rateLimit) return rateLimit

  try {
    const body = await req.json();

    console.log("WEBHOOK RECEBEU:", JSON.stringify(body));

    if (body?.event !== "messages.upsert") {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const remoteJid = body?.data?.key?.remoteJid;

    if (!remoteJid) {
      return NextResponse.json({
        ok: false,
        error: "remoteJid não encontrado",
      });
    }

    const response = await fetch(
      `${EVOLUTION_URL}/message/sendText/${INSTANCE}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.EVOLUTION_API_KEY || "",
        },
        body: JSON.stringify({
          number: remoteJid,
          text: "teste passed",
        }),
      }
    );

    const result = await response.text();

    console.log("SEND TEXT STATUS:", response.status);
    console.log("SEND TEXT RESPONSE:", result);

    return NextResponse.json({
      ok: true,
      status: response.status,
      response: result,
    });
  } catch (error) {
    console.error("ERRO:", error);

    return NextResponse.json({
      ok: false,
      error: String(error),
    });
  }
}