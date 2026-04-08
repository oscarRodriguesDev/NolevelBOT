import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Type para cache global
declare global {
  var prismaClients: Map<string, PrismaClient> | undefined
}

// Inicializar map global se não existir
if (!global.prismaClients) {
  global.prismaClients = new Map()
}

/**
 * Obtém ou cria um PrismaClient para um banco de dados específico
 * Utiliza cache global para reutilizar conexões
 * 
 * @param databaseUrl - URL de conexão do PostgreSQL
 * @returns PrismaClient instância
 * @throws Error se databaseUrl inválida
 */
export async function getTenantPrisma(databaseUrl: string): Promise<PrismaClient> {
  // Validar databaseUrl
  if (!databaseUrl || typeof databaseUrl !== 'string') {
    throw new Error('Database URL inválida ou não fornecida')
  }

  // Retornar cliente em cache se existir
  if (global.prismaClients?.has(databaseUrl)) {
    return global.prismaClients.get(databaseUrl)!
  }

  // Criar novo Pool com limite de conexões
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 5, // Máximo de conexões simultâneas por tenant
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })

  // Criar adapter PrismaPg com o Pool
  const adapter = new PrismaPg(pool)

  // Criar nova instância de PrismaClient
  const prismaClient = new PrismaClient({
    adapter,
    errorFormat: 'pretty',
  })

  // Armazenar em cache global
  global.prismaClients?.set(databaseUrl, prismaClient)

  // Conectar ao banco (validar conexão)
  try {
    await prismaClient.$executeRaw`SELECT 1`
  } catch (error) {
    console.error('[Prisma] Erro ao conectar ao banco:', error)
    // Remover do cache se falhar na conexão
    global.prismaClients?.delete(databaseUrl)
    throw error
  }

  return prismaClient
}

/**
 * Função síncrona para obter cliente (compatibilidade com códigos existentes)
 * NÃO recomendado para novos códigos - use getTenantPrisma ao invés
 */
export function getTenantClient(url: string): PrismaClient {
  if (!url || typeof url !== 'string') {
    throw new Error('Database URL inválida ou não fornecida')
  }

  // Se já está em cache, retorna direto
  if (global.prismaClients?.has(url)) {
    return global.prismaClients.get(url)!
  }

  // Criar novo Pool com limite de conexões
  const pool = new Pool({
    connectionString: url,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })

  // Criar adapter PrismaPg com o Pool
  const adapter = new PrismaPg(pool)

  // Criar nova instância de PrismaClient
  const prismaClient = new PrismaClient({
    adapter,
    errorFormat: 'pretty',
  })

  // Armazenar em cache global
  global.prismaClients?.set(url, prismaClient)

  return prismaClient
}

/**
 * Desconecta um cliente Prisma específico e remove do cache
 */
export async function disconnectTenantPrisma(databaseUrl: string): Promise<void> {
  const prismaClient = global.prismaClients?.get(databaseUrl)
  
  if (prismaClient) {
    await prismaClient.$disconnect()
    global.prismaClients?.delete(databaseUrl)
  }
}

/**
 * Desconecta todos os clientes Prisma (útil em shutdown)
 */
export async function disconnectAllPrismaClients(): Promise<void> {
  if (global.prismaClients) {
    const promises = Array.from(global.prismaClients.values()).map(
      (client) => client.$disconnect().catch((e) => console.error('[Prisma] Erro ao desconectar:', e))
    )
    
    await Promise.all(promises)
    global.prismaClients.clear()
  }
}

/**
 * Obtém informações sobre clientes em cache (útil para debug)
 */
export function getCacheInfo(): { 
  clientCount: number
  databaseUrls: string[]
} {
  return {
    clientCount: global.prismaClients?.size || 0,
    databaseUrls: Array.from(global.prismaClients?.keys() || []),
  }
}
