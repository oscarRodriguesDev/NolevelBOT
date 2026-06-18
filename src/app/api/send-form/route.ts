import { NextRequest, NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/rate-limit"
import { validateOrError } from "@/lib/validate"
import { sendFormSchema } from "@/lib/validation"

export async function POST(req: NextRequest) {
  const rateLimit = applyRateLimit(req, "send-form", 5, 60 * 1000)
  if (rateLimit) return rateLimit
  try {
    const body = await req.json()
    const parsed = validateOrError(body, sendFormSchema)
    if (parsed instanceof NextResponse) return parsed

    const { nome, email, empresa, telefone, mensagem } = parsed
    const data = new URLSearchParams()
  data.append("entry.1191434689", nome)
  data.append("entry.2001611283", email)
  data.append("entry.965945209", empresa)
  data.append("entry.1531831745", telefone)
  data.append("entry.1357906064", mensagem)

    await fetch(
      "https://docs.google.com/forms/u/3/d/e/1FAIpQLSdKOOiuXs8HAH95P-Hpt7PxMYBxmk77wHcHtuULmGhR_vySCA/formResponse",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: data.toString(),
      
      }
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Falha ao enviar" }, { status: 500 })
  }
}