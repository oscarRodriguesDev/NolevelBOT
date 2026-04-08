import { PrismaClient } from '@prisma/client'
import { getTenantPrisma } from '@/lib/prisma/tenantClient'
import { resolveTenant, TenantContext } from '@/lib/tenant/resolveTenant'

/**
 * Resultado completo de contexto do tenant
 */
export interface TenantContextResult {
  tenant: TenantContext
  prisma: PrismaClient
}

/**
 * Obtém o contexto completo do tenant:
 * 1. Resolve qual tenant é
 * 2. Obtém o PrismaClient para esse tenant (com cache)
 * 3. Retorna ambos
 * 
 * Uso em Route Handlers:
 * export const runtime = "nodejs"
 * 
 * export async function GET(req: Request) {
 *   const { tenant, prisma } = await getTenantContext(prismaMaster)
 *   // Use prisma para queries do tenant
 * }
 */
export async function getTenantContext(
  prismaMaster: PrismaClient,
  options?: {
    from?: 'cookie' | 'header' | 'subdomain'
    fallbackTenant?: string
  }
): Promise<TenantContextResult> {
  try {
    // 1. Resolver tenant
    const tenant = await resolveTenant(prismaMaster, options)

    // 2. Obter PrismaClient para esse tenant
    const prisma = await getTenantPrisma(tenant.databaseUrl)

    return {
      tenant,
      prisma,
    }
  } catch (error) {
    console.error('[getTenantContext] Erro:', error)
    throw error
  }
}

/**
 * Versão simplificada que retorna apenas o PrismaClient
 * Útil quando você já conhece a databaseUrl
 */
export async function getTenantPrismaOnly(
  databaseUrl: string
): Promise<PrismaClient> {
  return getTenantPrisma(databaseUrl)
}
