import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextauth"
import { getAllErrors, getError } from "@/lib/error-store"

// Retorna todos os erros armazenados ou um erro especifico pelo codigo
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== "GOD") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const url = new URL(req.url)
  const code = url.searchParams.get("code")

  if (code) {
    const err = getError(code)
    if (!err) return NextResponse.json({ error: "Código não encontrado" }, { status: 404 })
    return NextResponse.json(err)
  }

  const errors = getAllErrors()
  return NextResponse.json(errors)
}
