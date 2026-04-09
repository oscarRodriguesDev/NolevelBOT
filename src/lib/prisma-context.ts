// /src/lib/prisma-context.ts

import { resolveTenant } from "@/lib/tenant"
import { getTenantPrisma } from "@/lib/prisma-tenant"

// Ponto único de acesso ao banco (100% multi-tenant, sem fallback)
export async function getPrisma() {
  const tenant = await resolveTenant()

  // Falha explícita se não houver tenant válido
  if (!tenant || !tenant.databaseUrl) {
    throw new Error("Tenant não resolvido ou sem databaseUrl")
  }

  // Retorna o Prisma conectado ao banco da empresa
  return getTenantPrisma(tenant.databaseUrl)
}