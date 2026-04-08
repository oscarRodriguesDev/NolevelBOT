import { NextResponse } from "next/server"
import { chamadoService } from "@/services/chamado.service"
import { getRequestContext } from "@/lib/request-context"

export async function GET() {
  try {
    const ctx = await getRequestContext()

    // Exemplo de uso (debug inicial)
    console.log("IP:", ctx.ip)

    const chamados = await chamadoService.listarChamados()

    return NextResponse.json(chamados)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar chamados" },
      { status: 500 }
    )
  }
}