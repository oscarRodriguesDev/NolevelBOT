import { authOptions } from "@/lib/nextauth"
import { getServerSession } from "next-auth"

export async function getSessionOrFail(roles: string[] = []) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return null
  }

  if (roles.length > 0) {
    const userRole = session.user.role

    if (!roles.includes(userRole)) {
      return null
    }
  }

  return session
}