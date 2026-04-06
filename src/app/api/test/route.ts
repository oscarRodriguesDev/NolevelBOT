// app/api/test/route.ts
import { resolveTenant } from "@/lib/tenant/resolveTenant"

export async function GET(req: Request) {
  const { empresa, prisma } = await resolveTenant(req)

  const users = await prisma.user.findMany()

  return Response.json({
    empresa: empresa.nome,
    users
  })
}