// src/lib/tenant/resolveTenant.ts
import { prismaMaster } from "@/lib/prisma/masterClient"
import { getTenantClient } from "@/lib/prisma/tenantClient"

export async function resolveTenant(req: Request) {
  //const host = req.headers.get("host") || ""

  // exemplo: empresa1.meusistema.com
  //const slug = host.split(".")[0]
 const slug = "empresa1" // teste local
  const empresa = await prismaMaster.empresa.findUnique({
    where: { slug }
  })

  if (!empresa) {
    throw new Error("Empresa não encontrada")
  }

  const prisma = getTenantClient(empresa.databaseUrl)

  return { empresa, prisma }
}