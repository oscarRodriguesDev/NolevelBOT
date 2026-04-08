import { resolveTenant } from "@/lib/tenant"
import { getTenantPrisma } from "@/lib/prisma-tenant"

export async function GET() {
  const tenant = await resolveTenant()

  if (!tenant.databaseUrl) {
    return Response.json({ error: "Empresa sem databaseUrl" })
  }

  const prisma = getTenantPrisma(tenant.databaseUrl)

  const chamados = await prisma.chamado.findMany()

  return Response.json(chamados)
}