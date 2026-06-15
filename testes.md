# Template de Testes — Portable Testing Suite

Este documento descreve o padrão usado para criar uma central de testes automatizados com página interativa, testagem por papel de acesso e proteção de branch. Copie este arquivo para qualquer projeto Next.js e siga o passo a passo.

---

## 1. Estrutura de Arquivos

```
src/
  __tests__/
    rbac.test.ts          # Testes de permissões e hierarquia (60 testes)
    validation.test.ts    # Testes de schemas de validação Zod (43 testes)
    phoneMap.test.ts      # Testes de persistência em disco (12 testes)
    security.test.ts      # Testes de segurança e multi-tenancy (20 testes)
    rate-limit.test.ts    # Testes de rate limiting e brute force (15 testes)
    audit-log.test.ts     # Testes de log de acesso com mock Prisma (3 testes)
    smartSearch.test.ts   # Testes de busca de conhecimento com mock Prisma (6 testes)
    usedata.test.ts       # Testes de utilitários diversos (10 testes)
  app/
    api/
      testes/
        route.ts          # API que executa vitest e retorna relatório JSON
        login/
          route.ts        # API que testa acessos por papel (email+senha)
    testes/
      page.tsx            # Página interativa com botão "Executar" + relatório
  proxy.ts                # (Next.js 16) Bloqueio de rotas de teste por branch
```

---

## 2. Setup do Vitest

### `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### `package.json` (scripts)

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Instale as dependências:

```bash
npm install -D vitest @vitejs/plugin-react
```

---

## 3. Padrão dos Testes

### RBAC / Permissões (`rbac.test.ts`)

Testa as regras de criação, exclusão e visibilidade de papéis:

```ts
import { describe, it, expect } from 'vitest'
import { podeCriarRole, podeDeletarRole } from '@/lib/rbac'

describe('RBAC - podeCriarRole', () => {
  it('GOD pode criar ADMIN', () => {
    expect(podeCriarRole('GOD', 'ADMIN')).toBe(true)
  })
  it('ADMIN NAO pode criar GOD', () => {
    expect(podeCriarRole('ADMIN', 'GOD')).toBe(false)
  })
})
```

### Validação (`validation.test.ts`)

Testa schemas Zod com casos válidos e inválidos:

```ts
import { describe, it, expect } from 'vitest'
import { cpfSchema } from '@/lib/validation'

describe('Validacao - CPF', () => {
  it('aceita CPF com 11 digitos', () => {
    expect(cpfSchema.parse('12345678901')).toBe('12345678901')
  })
  it('rejeita CPF com letras', () => {
    expect(() => cpfSchema.parse('abc')).toThrow()
  })
})
```

### Persistência (`phoneMap.test.ts`)

Testa leitura/escrita em disco com `beforeEach`/`afterEach` para limpar:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'phoneMap.json')

beforeEach(() => {
  if (fs.existsSync(DATA_FILE)) fs.unlinkSync(DATA_FILE)
})
afterEach(() => {
  if (fs.existsSync(DATA_FILE)) fs.unlinkSync(DATA_FILE)
})

describe('PhoneMap', () => {
  it('registra e recupera', () => {
    registerPhone('12345678901', '11999999999', 'Hevelyn')
    expect(getPhoneByCpf('12345678901')!.telefone).toBe('11999999999')
  })
})
```

### Segurança (`security.test.ts`)

Testa princípios como menor privilégio, isolamento multi-tenancy e proteção contra escalada:

```ts
describe('Seguranca - Principio do menor privilegio', () => {
  it('ATENDENTE tem permissoes minimas', () => {
    expect(CREATE_ROLE_MAP.ATENDENTE).toEqual([])
    expect(DELETE_ROLE_MAP.ATENDENTE).toEqual([])
  })
})
```

---

## 4. API que Executa os Testes

### `app/api/testes/route.ts`

Executa `vitest run --reporter=json` via `child_process` e retorna relatório estruturado:

```ts
import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  const { stdout } = await execAsync('npx vitest run --reporter=json', {
    cwd: process.cwd(),
    timeout: 180000,
  })

  const jsonMatch = stdout.match(/\{[\s\S]*"numTotalTestSuites"[\s\S]*\}/)
  const vitestData = JSON.parse(jsonMatch![0])

  return NextResponse.json(vitestData)
}
```

Para um relatório mais rico, categorize os testes por grupo (rbac, validation, security, etc.) e inclua análise de vulnerabilidades.

---

## 5. Página Interativa

### `app/testes/page.tsx`

Componente `"use client"` com:

1. **Botão "Executar Todos os Testes"** — chama `GET /api/testes`
2. **Cards de estatísticas** — total, passados, falhos
3. **Tabelas por categoria** — cada grupo de teste com seus resultados
4. **Alertas de vulnerabilidade** — baseados em testes críticos que falharam
5. **Loader e tratamento de erro**

```tsx
"use client"
import { useState } from 'react'

export default function TestesPage() {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<any>(null)

  const executar = async () => {
    setLoading(true)
    const res = await fetch('/api/testes')
    const data = await res.json()
    setReport(data)
    setLoading(false)
  }

  return (
    <div>
      <button onClick={executar} disabled={loading}>
        {loading ? 'Executando...' : 'Executar Todos os Testes'}
      </button>
      {report && <pre>{JSON.stringify(report, null, 2)}</pre>}
    </div>
  )
}
```

---

## 6. Teste de Acessos por Papel

### `app/api/testes/login/route.ts`

API que:

1. Recebe `{ email, password }`
2. Autentica via Prisma + bcrypt (compare)
3. Executa testes RBAC + multi-tenancy contra o usuário real
4. Retorna matriz de permissões, vulnerabilidades e isolamento

```ts
export async function POST(request: Request) {
  const { email, password } = await request.json()

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await compare(password, user.password!))) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
  }

  const testes = [
    { nome: 'Pode criar ADMIN', resultado: podeCriarRole(user.role, 'ADMIN'), esperado: user.role === 'GOD' },
    { nome: 'Pode deletar GOD', resultado: podeDeletarRole(user.role, 'GOD'), esperado: false },
    // ... mais testes
  ]

  return NextResponse.json({ usuario: user, testes, seguro: true })
}
```

### Página — Seção "Teste de Acessos por Papel"

Inclua inputs de email + senha, botão "Testar Acesso", e exiba:

- Matriz de permissões (criação/exclusão por papel)
- Resultados dos 12+ testes com pass/fail
- Alertas de vulnerabilidade crítica

---

## 7. Proteção das Rotas de Teste (Next.js 16)

### `src/proxy.ts`

Bloqueia rotas de teste a menos que `ENABLE_TESTES=true`. O guard deve vir **antes** da lógica de autenticação para evitar que o proxy tente redirecionar usuários não logados para `/`:

```ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const publicRoutes = [
  '/corporativo/chamado',
  '/corporativo/chatbot-app',
  '/corporativo/consulta',
  '/oficina/chamado',
  '/oficina/chatbot-app',
  '/oficina/consulta',
  '/contact',
  '/api-docs',
]

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Guard ENABLE_TESTES: bloqueia rotas de teste em produção
  if (process.env.ENABLE_TESTES !== 'true') {
    if (
      pathname === '/testes' ||
      pathname.startsWith('/testes/') ||
      pathname === '/api/testes' ||
      pathname.startsWith('/api/testes/')
    ) {
      return new NextResponse(null, { status: 404 })
    }
  }

  const token = await getToken({ req })

  const isPublic = publicRoutes.some(route =>
    pathname.startsWith(route) || pathname === route.replace(/\/$/, '')
  )
  if (isPublic || pathname === '/oficina') {
    return NextResponse.next()
  }

  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (!token) {
    if (pathname === "/") {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL("/", req.url))
  }

  if (pathname.startsWith('/god') && token.role !== 'GOD') {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/corporativo/:path*", "/oficina/:path*", "/eventos/:path*", "/god/:path*", "/dashboard/:path*", "/testes/:path*", "/api/testes/:path*"],
}
```

> **Nota**: Next.js 16 usa `proxy.ts`. Em versões anteriores, use `middleware.ts` com `export function middleware(...)`.

### `.env`

```env
# Testes (apenas na branch testes)
# ENABLE_TESTES=true  # Descomente apenas na branch testes
```

---

## 8. Git Hooks — Fluxo Sink-Only

Para proteger a branch `testes` (ela puxa de todas, ninguém puxa dela):

### `.githooks/pre-merge-commit`

```sh
#!/bin/sh
CURRENT_BRANCH=$(git symbolic-ref HEAD 2>/dev/null | sed 's|refs/heads/||')
[ "$CURRENT_BRANCH" = "testes" ] && exit 0

MERGE_MSG=$(head -1 .git/MERGE_MSG 2>/dev/null)
case "$MERGE_MSG" in
  *testes*)
    echo "BLOQUEADO: merge de 'testes' em '$CURRENT_BRANCH'"
    exit 1
    ;;
esac
exit 0
```

### `.githooks/pre-push`

```sh
#!/bin/sh
PROTECTED="testes"
CURRENT=$(git symbolic-ref HEAD 2>/dev/null | sed 's|refs/heads/||')
[ "$CURRENT" != "$PROTECTED" ] && exit 0

while read LOCAL_REF LOCAL_SHA REMOTE_REF REMOTE_SHA; do
  REMOTE_BRANCH=$(echo "$REMOTE_REF" | sed 's|refs/heads/||')
  [ "$REMOTE_BRANCH" = "$PROTECTED" ] && continue
  echo "BLOQUEADO: push de '$PROTECTED' para '$REMOTE_BRANCH'"
  exit 1
done
exit 0
```

Ativação:

```bash
git config core.hooksPath .githooks
```

---

## 9. Checklist para Novo Projeto

- [ ] Instalar `vitest` + `@vitejs/plugin-react`
- [ ] Criar `vitest.config.ts`
- [ ] Adicionar scripts `test` e `test:watch` no `package.json`
- [ ] Criar `src/__tests__/` com ao menos 4 arquivos de teste
- [ ] Criar testes para `rate-limit.ts` (checkRateLimit, trackFailedLogin, getClientIp)
- [ ] Criar testes para `audit-log.ts` (logAcesso com mock de prisma)
- [ ] Criar testes para `smartSearch.ts` (obterBaseDeConhecimento com mock de prisma)
- [ ] Criar testes para `usedata.ts` (generateRandomTicket, saudacao, checkEmpresaModule)
- [ ] Criar `src/app/api/testes/route.ts` (roda vitest via exec)
- [ ] Criar `src/app/api/testes/login/route.ts` (teste de acesso por papel)
- [ ] Criar `src/app/testes/page.tsx` (página interativa)
- [ ] Adicionar `ENABLE_TESTES` no `proxy.ts` ou `middleware.ts`
- [ ] Adicionar `ENABLE_TESTES` no `.env.example`
- [ ] Criar `.githooks/pre-merge-commit` + `.githooks/pre-push`
- [ ] Rodar `npm run build` e verificar zero erros
- [ ] Commitar na branch `testes` (nunca em `main`/`dev`)
