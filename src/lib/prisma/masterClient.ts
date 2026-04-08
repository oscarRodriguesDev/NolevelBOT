import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Global cache para PrismaMaster
declare global {
  var prismaMasterInstance: PrismaClient | undefined
}

/**
 * Obtém ou cria a instância global de PrismaClient para o banco Master
 * Utiliza cache global para reutilizar a conexão
 * 
 * @returns PrismaClient instância para banco master
 * @throws Error se DATABASE_URL não estiver configurada
 */
export function getPrismaMaster(): PrismaClient {
  // Retornar instância em cache se existir
  if (global.prismaMasterInstance) {
    return global.prismaMasterInstance
  }

  // Validar DATABASE_URL
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurada para banco Master')
  }

  // Criar novo Pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10, // Limite maior para master pois gerencia múltiplos tenants
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })

  // Criar adapter
  const adapter = new PrismaPg(pool)

  // Criar instância
  global.prismaMasterInstance = new PrismaClient({
    adapter,
    errorFormat: 'pretty',
  })

  return global.prismaMasterInstance
}

/**
 * Desconecta a instância global de PrismaMaster
 */
export async function disconnectPrismaMaster(): Promise<void> {
  if (global.prismaMasterInstance) {
    await global.prismaMasterInstance.$disconnect()
    global.prismaMasterInstance = undefined
  }
}

/**
 * Exportar como prismaMaster para compatibilidade com código existente
 */
export const prismaMaster = getPrismaMaster()
