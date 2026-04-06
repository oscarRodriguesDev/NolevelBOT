import { PrismaClient } from "@/lib/prisma/master"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

export const prismaMaster = new PrismaClient({
  adapter,
})