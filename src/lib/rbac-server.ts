import { ROLE } from "@prisma/client"
import { authOptions } from "@/lib/nextauth"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export type UserSession = {
  id: string
  email: string
  empresaId: string
  cpf: string
  name: string
  role: ROLE
  setor: string
}

export async function getServerSessionRBAC(allowedRoles?: ROLE[]): Promise<{
  session: UserSession | null
  error: NextResponse | null
}> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: "Não autenticado" }, { status: 401 }) }
  }

  const userRole = session.user.role as ROLE
  const user = session.user as unknown as UserSession

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(userRole)) {
      return { session: null, error: NextResponse.json({ error: "Permissão negada" }, { status: 403 }) }
    }
  }

  return { session: user, error: null }
}
