import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getEmpresaIdByCpf } from "@/lib/searchEmpresa"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const cpf = searchParams.get("cpf")

    let empresaId: string | null = null

    if (cpf) {
      empresaId = await getEmpresaIdByCpf(cpf)
    }

    const avisos = await prisma.avisos.findMany({
      where: empresaId
        ? {
            empresaId,
          }
        : undefined,
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