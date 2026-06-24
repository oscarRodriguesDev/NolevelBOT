import { authOptions } from "@/lib/nextauth"
import { getServerSession } from "next-auth"
import { ROLE } from "@prisma/client"

// Obtem sessao do servidor ou retorna nulo se sem permissao
export async function getSessionOrFail(roles: ROLE[] = []) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return null
  }

  if (roles.length > 0) {
    const userRole = session.user.role as ROLE
    if (!roles.includes(userRole)) {
      return null
    }
  }

  return session
}
