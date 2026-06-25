import { NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {

  const rateLimit = await applyRateLimit(req, "webhook-teste", 60, 60 * 1000)
  if (rateLimit) return rateLimit

  try {
    const body = await req.json();

    console.log("WEBHOOK RECEBEU:", JSON.stringify(body));

    if (body?.event !== "messages.upsert") {
      return NextResponse.json({ ok: true, ignored: true, resposta: body });
    }

    const remoteJid = body?.data?.key?.remoteJid;

    if (!remoteJid) {
      return NextResponse.json({
        ok: false,
        error: "remoteJid não encontrado",
      });
    }

    const evolutionUrl = body?.server_url || "";
    const instance = body?.instance || "";

    if (!evolutionUrl) {
      return NextResponse.json({ ok: false, error: "server_url não encontrado no payload" });
    }

    if (!instance) {
      return NextResponse.json({ ok: false, error: "instance não encontrado no payload" });
    }

    const response = await fetch(
      `${evolutionUrl}/message/sendText/${instance}`,
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
      evolutionUrl,
      instance,
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