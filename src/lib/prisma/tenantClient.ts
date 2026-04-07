import { PrismaClient } from "@/lib/prisma/tenant"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = globalThis as any

if (!globalForPrisma.tenants) {
  globalForPrisma.tenants = new Map()
}

export function getTenantClient(url: string) {
  if (!globalForPrisma.tenants.has(url)) {
    const pool = new Pool({
      connectionString: url,
    })

    const adapter = new PrismaPg(pool)

    globalForPrisma.tenants.set(
      url,
      new PrismaClient({
        adapter,
      })
    )
  }

  return globalForPrisma.tenants.get(url)
}