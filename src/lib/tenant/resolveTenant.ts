import { cookies, headers } from 'next/headers'
import { PrismaClient } from '@prisma/client'

/**
 * Interface para resposta de resolução de tenant
 */
export interface TenantContext {
  tenantId: string
  databaseUrl: string
  companyName?: string
  [key: string]: any
}

/**
 * Resolve o tenant a partir de:
 * 1. Cookie 'tenant'
 * 2. Subdomínio
 * 3. Header customizado
 * 
 * Busca a empresa no prismaMaster e retorna a config completa
 */
export async function resolveTenant(
  prismaMaster: PrismaClient,
  options?: {
    from?: 'cookie' | 'header' | 'subdomain'
    fallbackTenant?: string
  }
): Promise<TenantContext> {
  let tenantSlug: string | null = null

  try {
    // 1. Tentar ler do cookie
    const cookieStore = await cookies()
    const tenantCookie = cookieStore.get('tenant')?.value
    
    if (tenantCookie) {
      tenantSlug = tenantCookie
    }

    // 2. Fallback para subdomínio
    if (!tenantSlug) {
      const headersList = await headers()
      const host = headersList.get('host') || ''
      
      // Extrair subdomínio (exemplo: empresa1.localhost:3000 -> empresa1)
      const subdomain = host.split('.')[0]?.split(':')[0]
      
      if (subdomain && subdomain !== 'localhost' && subdomain !== 'www') {
        tenantSlug = subdomain
      }
    }

    // 3. Fallback para header customizado
    if (!tenantSlug) {
      const headersList = await headers()
      const headerTenant = headersList.get('x-tenant-id')
      
      if (headerTenant) {
        tenantSlug = headerTenant
      }
    }

    // 4. Fallback final
    if (!tenantSlug) {
      if (options?.fallbackTenant) {
        tenantSlug = options.fallbackTenant
      } else {
        throw new Error('Tenant não identificado: sem cookie, subdomínio ou header')
      }
    }

    // Buscar empresa no prismaMaster
    const empresa = await prismaMaster.empresa.findUnique({
      where: { slug: tenantSlug },
    })

    if (!empresa) {
      throw new Error(`Empresa não encontrada: ${tenantSlug}`)
    }

    // Validar databaseUrl
    if (!empresa.databaseUrl) {
      throw new Error(`Database URL não configurada para: ${tenantSlug}`)
    }

    return {
      tenantId: empresa.id,
      databaseUrl: empresa.databaseUrl,
      companyName: empresa.nome,
      ...empresa,
    }
  } catch (error) {
    console.error('[Tenant Resolution] Erro:', error)
    throw error
  }
}
