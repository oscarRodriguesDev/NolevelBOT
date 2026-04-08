import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

// Pool de conexão com PostgreSQL (baixo nível)
// Isso é o que o Prisma vai usar por baixo com o novo engine
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Adapter que conecta o Prisma ao driver pg
const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, // obrigatório no novo engine "client"
    log: ["error", "warn"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}