import { NextRequest, NextResponse } from "next/server"
import { validarCpf } from "@/app/hooks/usedata"

export async function GET(req: NextRequest) {
  try {
    const cpf = req.nextUrl.searchParams.get("cpf")
    if (!cpf) return NextResponse.json({ success: false, error: "CPF não informado" }, { status: 400 })

    const resultado = await validarCpf(cpf)
    return NextResponse.json({ success: true, valido: resultado.valido, nome: resultado.nome || null })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: "Erro ao validar CPF" }, { status: 500 })
  }
}