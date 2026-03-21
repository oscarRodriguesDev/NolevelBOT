import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/nextauth" // Certifique-se de que o caminho está correto
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // 1. Verificação de sessão
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // 2. Busca no banco
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        role: true,
        avatarUrl: true,
        setor: true,
        // Evite dar o select em 'password' por segurança, 
        // mesmo que você não o tenha listado aqui.
        chamados: {
          orderBy: {
            createdAt: 'desc' // Opcional: já traz os chamados ordenados
          }
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    // É uma boa prática logar o erro no servidor para debug
    console.error("[USER_GET_ERROR]:", error)
    return NextResponse.json(
      { error: "Erro interno no servidor" }, 
      { status: 500 }
    )
  }
}