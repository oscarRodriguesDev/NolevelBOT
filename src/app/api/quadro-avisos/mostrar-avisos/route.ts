import { NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { getEmpresaIdByCpf } from "@/lib/searchEmpresa"

// Retorna avisos validos para um CPF, removendo automaticamente os vencidos
export async function GET(req: Request) {
  const rateLimit = await applyRateLimit(req, "mostrar-avisos", 30, 60 * 1000)
  if (rateLimit) return rateLimit
  try {
    const { searchParams } = new URL(req.url)
    const cpf = searchParams.get("cpf")

    if (!cpf) {
      return NextResponse.json(
        { error: "CPF é obrigatório para consultar avisos" },
        { status: 400 }
      )
    }

    const empresaId = await getEmpresaIdByCpf(cpf)

    if (!empresaId) {
      return NextResponse.json(
        { error: "Nenhuma empresa encontrada para este CPF" },
        { status: 404 }
      )
    }

    const avisos = await prisma.avisos.findMany({
      where: { empresaId },
      orderBy: { createdAt: "desc" },
    })

    const agora = new Date()

    const validos = []
    const vencidosIds: string[] = []

    for (const aviso of avisos) {
      if (!aviso.duracao) {
        validos.push(aviso)
        continue
      }

      const dias = Number(aviso.duracao)
      if (isNaN(dias)) {
        validos.push(aviso)
        continue
      }

      const dataExpiracao = new Date(aviso.createdAt)
      dataExpiracao.setDate(dataExpiracao.getDate() + dias)

      if (agora > dataExpiracao) {
        vencidosIds.push(aviso.id)
      } else {
        validos.push(aviso)
      }
    }

    if (vencidosIds.length > 0) {
      await prisma.avisos.deleteMany({
        where: {
          id: { in: vencidosIds },
        },
      })
    }

    return NextResponse.json(validos)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar avisos" },
      { status: 500 }
    )
  }
}