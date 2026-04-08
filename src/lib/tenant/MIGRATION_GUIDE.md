# Guia de Refactor Multi-Tenant Centralizado

## Objetivo
Centralizar toda a lógica de resolução de tenant e gerenciamento de conexões Prisma para eliminar duplicação de código e evitar vazamento de conexões.

## Arquivos Criados

### 1. `/src/lib/prisma/tenantClient.ts`
- **Cache global** de PrismaClient por databaseUrl
- **Pool de conexões** limitado a 5 conexões por tenant
- Funções para obter, desconectar e obter info de cache
- Função síncrona `getTenantClient()` para compatibilidade com código legado
- Função assíncrona `getTenantPrisma()` para novos códigos

### 2. `/src/lib/tenant/resolveTenant.ts`
- Resolve tenant a partir de:
  1. Cookie `tenant`
  2. Subdomínio (ex: empresa1.localhost)
  3. Header `x-tenant-id`
  4. Fallback configurável
- Busca empresa no `prismaMaster`
- Retorna `TenantContext` com tenantId, databaseUrl, companyName, etc.

### 3. `/src/lib/tenant/getTenantContext.ts`
- **Função principal** para use em routes
- Combina `resolveTenant` + `getTenantPrisma`
- Retorna objeto: `{ tenant, prisma }`
- Uso: `const { tenant, prisma } = await getTenantContext(prismaMaster)`

---

## Como Refatorar Rotas

### ANTES (padrão antigo)
```typescript
export const dynamic = "force-dynamic"

import { PrismaClient as PrismaMaster } from "@/lib/prisma/master"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { cookies } from "next/headers"

// Master setup
const poolMaster = new Pool({
  connectionString: process.env.DATABASE_URL,
})
const adapterMaster = new PrismaPg(poolMaster)
const prismaMaster = new PrismaMaster({ adapter: adapterMaster })

// Helper duplicado em cada rota
async function getTenantPrisma() {
  const cookieStore = await cookies()
  const tenantSlug = cookieStore.get("tenant")?.value

  if (!tenantSlug) throw new Error("Tenant não identificado")

  const empresa = await prismaMaster.empresa.findFirst({
    where: { slug: tenantSlug },
  })

  const poolTenant = new Pool({
    connectionString: empresa.databaseUrl,
  })
  const adapterTenant = new PrismaPg(poolTenant)
  return new PrismaClient({ adapter: adapterTenant })
}

export async function GET(req: Request) {
  const prisma = await getTenantPrisma() // ❌ Cria nova conexão sempre!
  
  const tickets = await prisma.tickets.findMany()
  return NextResponse.json(tickets)
}
```

### DEPOIS (padrão novo)
```typescript
export const runtime = "nodejs"

import { getTenantContext } from "@/lib/tenant/getTenantContext"
import { getPrismaMaster } from "@/lib/prisma/masterClient"

export async function GET(req: Request) {
  const prismaMaster = getPrismaMaster()
  const { tenant, prisma } = await getTenantContext(prismaMaster)
  
  // Use prisma para queries do tenant
  const tickets = await prisma.tickets.findMany()
  
  return NextResponse.json(tickets)
}
```

---

## Checklist de Refactor

Para cada rota em `/src/app/api/**/*.ts`:

- [ ] Adicionar `export const runtime = "nodejs"` no topo
- [ ] Remover Pool/PrismaPg manual setup (Master e Tenant)
- [ ] Remover função `getTenantPrisma()` local
- [ ] Importar `getTenantContext` e `getPrismaMaster`
- [ ] Substituir `const prisma = await getTenantPrisma()` por:
  ```typescript
  const prismaMaster = getPrismaMaster()
  const { tenant, prisma } = await getTenantContext(prismaMaster)
  ```
- [ ] Testar a rota após mudança
- [ ] Verificar logs para erros de conexão

---

## Benefícios

✅ **Sem duplicação**: Uma única implementação centralizada  
✅ **Sem vazamento de conexões**: Cache global reutiliza connections  
✅ **Performance melhorada**: Menos overhead de setup  
✅ **Fácil debug**: `getCacheInfo()` mostra clientes em cache  
✅ **Compatible**: Suporta dev com hot reload e produção  
✅ **Type-safe**: TypeScript completo com Prisma  

---

## Troubleshooting

### "Tenant não identificado"
- Verificar se cookie `tenant` está sendo enviado
- Verificar se subdomínio está correto
- Verificar se header `x-tenant-id` foi enviado

### "Empresa não encontrada"
- Verificar se slug existe no banco master
- Verificar se `prismaMaster` está apontando para banco correto

### "Connection timeout"
- Verificar `DATABASE_URL` da empresa
- Verificar limite de conexões (max: 5)
- Usar `getCacheInfo()` para debugar clients em cache

### "P1001: Can't reach database server"
- Verificar `databaseUrl` da empresa
- Verificar conectividade com banco tenant
- Verificar credenciais
