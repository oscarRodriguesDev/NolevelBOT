import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

// Cache global por tenant
const globalForPrisma = globalThis as unknown as {
  prismaTenants: Map<string, PrismaClient>
}

if (!globalForPrisma.prismaTenants) {
  globalForPrisma.prismaTenants = new Map()
}

export function getTenantPrisma(databaseUrl: string) {
  const cached = globalForPrisma.prismaTenants.get(databaseUrl)
  if (cached) return cached

  // Cria pool manual com a URL do tenant
  const pool = new Pool({
    connectionString: databaseUrl,
  })

  // Adapter que conecta o Prisma ao pool dinâmico
  const adapter = new PrismaPg(pool)

  const prisma = new PrismaClient({
    adapter,
  })

  globalForPrisma.prismaTenants.set(databaseUrl, prisma)

  return prisma
}