# MEMÓRIAS DO PROJETO — NolevelBOT

## Fluxo de Trabalho Colaborativo

### Regra de Ouro
Sempre que um pedido for feito, antes de qualquer ação:

1. **Detectar mudanças** — `git status` + `git diff` para identificar alterações não commitadas
2. **Atribuir autoria** — toda mudança não commitada é presumidamente do **Usuário**, a menos que haja evidência contrária
3. **Registrar em memorias.md** — seção "Registro de Autoria" com título sugestivo + autor
4. **Nunca desfazer** alterações do usuário sem permissão explícita
5. **Na dúvida, perguntar** — antes de qualquer alteração que possa interferir no trabalho colaborativo

### Formato de Registro de Autoria
```
## Mudança: <título sugestivo>
**Autor:** Usuário / Vibecode
**Arquivos:** <lista>
**Data:** <data>
**Descrição:** <resumo>
```

### O que NÃO fazer
- ❌ Desfazer alterações do usuário sem autorização
- ❌ Modificar arquivos que o usuário editou sem perguntar
- ❌ Assumir que mudanças não commitadas são seguras para reverter

---

## Visão Geral

NolevelBOT é uma plataforma multi-empresa de gestão de atendimento que unifica chamados (tickets), chatbot WhatsApp com IA, dashboards e módulos verticais (Corporativo, Oficina, Eventos) em um único sistema.

**Stack:** Next.js 16 + React 19 + Tailwind CSS 4 + Prisma 7 + PostgreSQL + NextAuth 4 + OpenAI + Evolution API

---

## Arquitetura

### Estrutura de Diretórios

```
src/
├── app/
│   ├── page.tsx              # Login (raiz /)
│   ├── layout.tsx            # Layout raiz com ThemeProvider
│   ├── layout-client.tsx     # ThemeProvider client-side
│   ├── providers.tsx         # Contexto de tema (useTheme)
│   ├── globals.css           # Variáveis CSS de tema
│   ├── dashboard/            # Seletor de módulos pós-login
│   ├── login/                # DELETADO (movido para /)
│   ├── components/           # Componentes compartilhados
│   │   ├── sidebar.tsx       # Sidebar única com accordion de módulos
│   │   ├── back.tsx          # Botão voltar
│   │   ├── cardUser.tsx      # Card do usuário na sidebar
│   │   ├── fileInput.tsx     # Upload de arquivos
│   │   ├── modal-edit-user.tsx # Modal de edição de usuário
│   │   ├── priority-badge.tsx # Badge de prioridade
│   │   ├── skeleton.tsx      # Skeleton loader
│   │   ├── spinner.tsx       # Spinner reutilizável
│   │   ├── status-badge.tsx  # Badge de status
│   │   └── theme-toggle.tsx  # Switch de tema
│   ├── corporativo/          # Módulo Corporativo
│   │   ├── (atendimento)/    # Layout protegido
│   │   │   ├── all-tickets/  # Kanban + Lista
│   │   │   ├── avisos/       # Quadro de avisos
│   │   │   ├── cpfs/         # CPFs autorizados
│   │   │   ├── dashboards/   # Dashboard do módulo
│   │   │   ├── empresa/      # Gestão de empresas (GOD)
│   │   │   ├── usuarios/     # Lista de usuários
│   │   │   └── gestao-de-usuarios/ # Criar usuário
│   │   ├── chamado/          # Abertura de chamado público
│   │   ├── chatbot-app/      # Chat web
│   │   ├── consulta/         # Consulta pública de chamados
│   │   └── userFacil/        # Cadastro rápido
│   ├── oficina/              # Módulo Oficina (manutenção veicular)
│   │   ├── (atendimento)/    # Layout protegido
│   │   │   ├── all-tickets/  # Kanban da oficina
│   │   │   ├── avisos/
│   │   │   ├── cpfs/         # Motoristas autorizados
│   │   │   ├── dashboards/
│   │   │   ├── usuarios/
│   │   │   └── gestao-de-usuarios/
│   │   ├── chamado/          # Abertura para motoristas
│   │   ├── chatbot-app/
│   │   ├── consulta/
│   │   └── userFacil/
│   ├── eventos/              # Módulo Eventos
│   │   ├── (atendimento)/
│   │   └── leads/
│   ├── contact/              # Página de contato
│   ├── api-docs/             # Documentação da API
│   └── api/                  # 18 endpoints (ver abaixo)
├── lib/                      # Bibliotecas utilitárias
│   ├── prisma.ts             # Singleton Prisma
│   ├── nextauth.ts           # Config NextAuth (authOptions)
│   ├── rbac.ts               # Permissões frontend
│   ├── rbac-server.ts        # Permissões backend
│   ├── useIA.ts              # IA do webhook24
│   ├── useIA2.ts             # IA do webhook25
│   ├── useIA3.ts             # IA do webhook26
│   ├── useIA4.ts             # IA do webhook27
│   ├── usedata.ts            # Hook useData
│   ├── upload.ts             # Upload Supabase Storage
│   ├── validation.ts         # Validações
│   ├── rate-limit.ts         # Rate limiting
│   ├── searchEmpresa.ts      # Busca empresa
│   ├── setores.ts            # Utilitário de setores
│   ├── smartSearch.ts        # Busca inteligente
│   └── phoneMap.ts           # Mapa telefone->CPF
├── types/                    # Tipos TypeScript
│   ├── chamado.ts            # Tipo Chamado/HistoricoItem
│   ├── leads.ts              # Tipo Lead
│   └── next-auth.d.ts        # Extensão NextAuth
└── util/                     # Utilitários
    ├── permission.ts         # hasPermission
    └── limparcpfs.ts         # Formatação CPF
```

### API Endpoints (58 documentados)

| Grupo | Endpoints |
|-------|-----------|
| Auth | `/api/auth/[...nextauth]` |
| Tickets | `/api/tickets`, `/api/tickets/search` |
| Empresa | `/api/empresa`, `/api/empresa/prompt` |
| Webhooks | `/api/webhook24`, `/api/webhook25`, `/api/webhook26`, `/api/webhook27`, `/api/webhook-oficina`, `/api/webhook-leads` |
| CPFs | `/api/cpfs`, `/api/cpfs/general_cpf` |
| Users | `/api/users`, `/api/users/admins` |
| Oficina | `/api/oficina/tickets` |
| Outros | `/api/chat`, `/api/dashboards`, `/api/quadro-avisos`, `/api/leads-network`, `/api/memories`, `/api/send-form`, `/api/upload`, `/api/userFacil` |

---

## RBAC (Roles)

| Role | Hierarquia | Acesso |
|------|-----------|--------|
| **GOD** | 4 (maior) | Tudo, multi-empresa, bypass de módulos |
| **ADMIN** | 3 | Gerencia sua empresa, cria GESTOR/ATENDENTE |
| **GESTOR** | 2 | Gerencia chamados do seu setor |
| **ATENDENTE** | 1 | Atende chamados do seu setor |

---

## Sistema de Módulos

Cada empresa pode ter um conjunto de módulos ativos:
- **CORPORATIVO** — Gestão de chamados, dashboard, avisos, CPFs
- **OFICINA** — Manutenção veicular para transportadoras
- **EVENTOS** — Captura de leads em feiras/eventos

GOD sempre vê todos os módulos (bypass). Sidebar única em `src/app/components/sidebar.tsx` com accordion.

---

## Tema

Sistema de tema claro/escuro com CSS variables em `globals.css`:
- `--background`, `--foreground`, `--surface`, `--surface-elevated`, `--border-subtle`
- `--primary`, `--primary-hover`, `--accent-secondary`
- `--status-new`, `--status-in-progress`, `--status-waiting`, `--status-completed`, `--status-cancelled`
- Provider: `providers.tsx` → `useTheme()` hook
- Armazenamento: localStorage chave `"theme"`, padrão dark

---

## Convenções de Código

- **Componentes:** `"use client"` quando necessário, imports com `@/` alias
- **Estilo:** Tailwind CSS 4 com variáveis CSS (evitar classes dark: fixas)
- **API Routes:** Validação de sessão via `getServerSession(authOptions)` no início
- **RBAC:** `checkPermission` do `rbac-server.ts` em rotas de API
- **Upload:** Supabase Storage bucket `anexo` (tickets) e `logo` (empresas)
- **Prisma:** Singleton em `src/lib/prisma.ts` — `import { prisma } from "@/lib/prisma"`
- **Toast:** `react-hot-toast` instalado, substituir `alert()` sempre que possível

---

## Infraestrutura

- **Docker:** Porta 3001 mapeada para 3000, redes `rede_gera` e `supabase_default`
- **Dockerfile:** Node.js, instala dependências, copia app, roda como `node` user
- **Branch principal:** `vibecode`
- **CI/CD:** GitHub Actions (deploy-homologa.yml)

---

## Histórico de Desenvolvimento (Resumo)

| Período | Marcos |
|---------|--------|
| Fev 2026 | Initial commit, primeiras funcionalidades |
| Mar 2026 | Sistema de tema, login, landing page, multi-tenant |
| Abr 2026 | RBAC, permissões, CRUD empresa, multi-tenant consolidado |
| Mai 2026 | Webhooks (24, 25, 26, 27), leads, kanban, testes, segurança, bot dinâmico |
| Jun 2026 | Módulo oficina, sistema de módulos por empresa, sidebar única, login unificado, dashboards |

---

### Mudança: Validação de módulo da empresa nos webhooks
**Autor:** Vibecode
**Arquivos:** `src/lib/usedata.ts`, `src/app/api/webhook26/route.ts`, `src/app/api/webhook27/route.ts`, `src/app/api/webhook-oficina/route.ts`
**Data:** 13/06/2026
**Descrição:**
- Criada função `checkEmpresaModule(empresaId, modulo)` em `usedata.ts` que consulta os módulos ativos da empresa.
- **webhook26 e 27:** Após validar CPF e obter `empresaId`, verifica se a empresa possui módulo CORPORATIVO ativo. Se não tiver, informa o usuário com a lista de módulos disponíveis da empresa e orienta a usar o canal correto. Se tiver, fluxo normal.
- **webhook-oficina:** Após validar matrícula e obter `empresaId`, verifica se a empresa possui módulo OFICINA ativo. Mesmo comportamento de orientação.

### Mudança: Fix loop de redirect no proxy (ERR_TOO_MANY_REDIRECTS)
**Autor:** Vibecode
**Arquivos:** `src/proxy.ts`
**Data:** 13/06/2026
**Descrição:**
- Adicionado `&& pathname !== "/"` no bloco `if (!token)` para evitar redirect infinito quando a raiz é a tela de login.
- Adicionado `token?.role` (optional chaining) no check de `/god` para resolver erro de tipo TS.

## Preferências do Projeto

- **Idioma:** Português (Brasil) — código, commits, docs
- **Branch ativa:** `vibecode`
- **Estilo:** Cauteloso, consultivo, sem quebras
- **Prisma:** Nunca alterar schema sem consulta, nunca rodar migrations automaticamente
- **API:** Nunca alterar rotas de API sem permissão
- **.github:** Nunca mexer nos workflows

---

### Mudança: Upload de fotos + avisos no formulário de oficina e chatbots
**Autor:** Vibecode
**Arquivos:** `src/app/api/oficina/tickets/route.ts`, `src/app/oficina/chamado/page.tsx`, `src/app/corporativo/chatbot-app/page.tsx`, `src/app/oficina/chatbot-app/page.tsx`
**Data:** 12/06/2026
**Descrição:**
- **API `/api/oficina/tickets`:** POST agora aceita multipart/form-data com upload de arquivo (`anexo`). Suporta content-type JSON e FormData. Salva `anexoUrl` no chamado via Supabase Storage.
- **Formulário Oficina (`oficina/chamado`):** Substituída simulação por chamada real à API. Adicionado `FileUpload` para envio de fotos. Adicionada validação de matrícula (onBlur busca setores da empresa e avisos relacionados). Adicionado seletor de setor de destino. Adicionado painel de avisos exibido automaticamente quando há avisos relevantes.
- **Chatbots (corporativo e oficina):** Adicionado botão de anexar foto (paperclip) no input. Upload via `/api/upload` para Supabase. Exibição de imagem inline no balão de mensagem. Botão "Avisos" (megafone) no header que busca e exibe avisos da empresa em painel recolhível.

### Mudança: Setor exibe "all" para ADMIN sem setor definido
**Autor:** Vibecode
**Arquivos:** `src/app/corporativo/(atendimento)/usuarios/page.tsx`, `src/app/eventos/(atendimento)/usuarios/page.tsx`, `src/app/oficina/(atendimento)/usuarios/page.tsx`, `src/app/god/usuarios/page.tsx`, `src/app/god/admins/page.tsx`, `src/app/corporativo/(atendimento)/empresa/[id]/usuarios/page.tsx`
**Data:** 12/06/2026
**Descrição:** Quando um usuário ADMIN tem setor vazio (pois herda todos os setores), a coluna "Setor" agora exibe "all" em vez de ficar em branco ou mostrar "—".

## Registro de Autoria

### Mudança: Login movido para a raiz (/)
**Autor:** Usuário
**Arquivos:** `src/app/page.tsx`, `src/app/login/page.tsx` (deletado)
**Data:** 12/06/2026
**Descrição:** A página de login foi movida de `/login` para `/` (raiz). O arquivo `src/app/login/page.tsx` foi deletado e seu conteúdo copiado para `src/app/page.tsx`, substituindo a landing page original.

### Mudança: Instruções de colaboração atualizadas
**Autor:** Usuário
**Arquivos:** `prompt .md`
**Data:** 12/06/2026
**Descrição:** Adicionadas regras de colaboração: verificar mudanças do usuário antes de agir, nunca desfazer alterações sem permissão, perguntar na dúvida.

### Mudança: Arquivos de memória e checkpoint populados
**Autor:** Vibecode
**Arquivos:** `memorias.md`, `checkpoint.md`
**Data:** 12/06/2026
**Descrição:** `memorias.md` populado com guia completo do projeto (arquitetura, componentes, API, RBAC, convenções). `checkpoint.md` populado com estado atual da sessão, commits e tarefas pendentes.

### Mudança: Dashboards reescritos por módulo (Corporativo, Oficina, Eventos)
**Autor:** Vibecode
**Arquivos:** `src/app/api/dashboards/route.ts`, `src/app/corporativo/(atendimento)/dashboards/page.tsx`, `src/app/oficina/(atendimento)/dashboards/page.tsx`, `src/app/eventos/(atendimento)/dashboards/page.tsx`
**Data:** 12/06/2026
**Descrição:** 
- API `/api/dashboards` reescrita: filtra por `empresaId` do usuário (multi-tenant), aceita query `modulo` (corporativo/oficina/eventos), adiciona 6+ métricas (statusStats, prioridadeStats, totalAbertos, totalFechados, taxaConclusao, defeitosStats, funcoesStats, veiculosStats). Detecção de tickets OFICINA via parse do JSON na `descricao`.
- **Corporativo:** Dashboard com KPIs (total, abertos, concluídos, taxa), gráfico de pizza de status, barras de prioridade, tempo médio, chamados por setor, evolução temporal, top motivos.
- **Oficina:** Dashboard com KPIs (solicitações, em aberto, concluídas, tempo médio), gráfico de pizza de status, barras de funções, barras de veículos, defeitos mais comuns (extraídos do JSON da descricao), evolução temporal, ranking por veículo.
- **Eventos:** Dashboard com KPIs (chamados, abertos, leads captados, conclusão), gráfico de pizza de status, tempo médio, leads por período, chamados por setor, evolução temporal, top motivos, últimos leads.

### Mudança: Reforço de segurança RBAC nas rotas administrativas
**Autor:** Vibecode
**Arquivos:** `src/app/api/dashboards/route.ts`, `src/app/api/cpfs/route.ts`, `src/app/api/quadro-avisos/route.ts`, `src/app/api/tickets/search/route.ts`, `src/app/eventos/(atendimento)/layout.tsx`, `src/app/corporativo/(atendimento)/layout.tsx`, `src/app/corporativo/(atendimento)/dashboards/page.tsx`, `src/app/eventos/(atendimento)/dashboards/page.tsx`, `src/app/eventos/(atendimento)/usuarios/page.tsx`
**Data:** 12/06/2026
**Descrição:**
- `api/dashboards/route.ts`: Adicionado filtro `setor` via `getTicketWhereClause` para GESTOR (antes via toda empresa). GOD respeita `empresaId`.
- `api/cpfs/route.ts`: Removido ATENDENTE do POST (CPF não é papel de atendente).
- `api/quadro-avisos/route.ts`: GET agora filtra por `setor` para GESTOR/ATENDENTE (cada um vê só avisos do seu setor).
- `api/tickets/search/route.ts`: GET agora usa `getTicketWhereClause` para filtrar por setor (ATENDENTE/GESTOR).
- Layouts: Corporativo, Oficina, Eventos agora checam módulo ativo na empresa (`CORPORATIVO`/`OFICINA`/`EVENTOS`). Redirecionam para `/dashboard` se não tiver acesso.
- Dashboards corporativo/eventos: Adicionado `useEffect` com `router.push` para redirecionar quando sem permissão (igual oficina já fazia).
- `eventos/usuarios/page.tsx`: Redirect corrigido de `/corporativo/all-tickets` para `/eventos/all-tickets`.

### Mudança: Relatorios CSV e PDF enriquecidos nos dashboards
**Autor:** Vibecode
**Arquivos:** `src/app/corporativo/(atendimento)/dashboards/page.tsx`, `src/app/oficina/(atendimento)/dashboards/page.tsx`, `src/app/eventos/(atendimento)/dashboards/page.tsx`
**Data:** 12/06/2026
**Descrição:**
- CSV agora inclui seção de indicadores (total, abertos, concluídos, taxa, tempo médio), status, prioridade, setores, motivos, evolução temporal — antes só 2 colunas.
- PDF com suporte a múltiplas páginas (`checkPage`), seções completas com todos os dados disponíveis no dashboard, data de geração.
- **Corporativo:** KPIs, Chamados por Setor, Status, Prioridade, Top Motivos, Evolução Temporal.
- **Oficina:** KPIs, Status, Defeitos, Funções, Veículos, Evolução Temporal.
- **Eventos:** KPIs, Status, Chamados por Setor, Top Motivos, Leads por Período, Evolução Temporal.

### Mudança: Reforço de segurança RBAC nas rotas administrativas
**Autor:** Vibecode
**Arquivos:** `src/app/page.tsx`, `src/app/login/page.tsx` (deletado), `src/proxy.ts`, `src/app/api/dashboards/route.ts`, `src/app/api/tickets/route.ts`, `src/app/corporativo/(atendimento)/dashboards/page.tsx`, `src/app/oficina/(atendimento)/dashboards/page.tsx`, `src/app/eventos/(atendimento)/dashboards/page.tsx`, `src/app/oficina/(atendimento)/all-tickets/page.tsx`, `src/app/dashboard/page.tsx`, `.gitignore`, `checkpoint.md`, `ideias.md`, `memorias.md`, `prompt .md`, `pedidos.md` (novo)
**Data:** 12/06/2026
**Descrição:**
- `src/app/page.tsx` totalmente substituída: landing page removida, agora é a tela de login com formulário (email/senha), Turnstile após 3 tentativas falhas, toggle de tema, redirect via `next-auth`.
- `src/app/login/page.tsx` deletado (login unificado em `/`).
- `src/proxy.ts`: removido `/login` do matcher e das rotas protegidas; `/login` redirecionamento alterado para `/`; removido `/admin` das rotas protegidas.
- `src/app/api/dashboards/route.ts`: adicionado query param `modulo`, parse de descricao JSON para detectar tickets de oficina, métricas expandidas (statusStats, defeitosStats, funcoesStats, veiculosStats, taxaConclusao).
- `src/app/oficina/(atendimento)/all-tickets/page.tsx`: paginação adicionada (controles anterior/próximo, botões de página), filtros resetam página para 1, `updateFilter` helper, estado `page`/`total`/`totalPages`.
- Dashboards refinados com KPIs, pizza de status, gráficos por módulo.

### Mudança: Model logs_de_acesso e migration
**Autor:** Usuário
**Arquivos:** `prisma/schema.prisma`, `prisma/migrations/20260612150058_created_logs_de_user/`
**Data:** 12/06/2026
**Descrição:** Adicionado model `logs_de_acesso` ao schema do Prisma e executada migration para criar a tabela no banco de dados.

### Mudança: Dashboard Global GOD (API + Página)
**Autor:** Usuário
**Arquivos:** `src/app/api/dashboards/god/route.ts`, `src/app/god/dashboard/page.tsx`
**Data:** 12/06/2026
**Descrição:** Criada rota de API `/api/dashboards/god` que retorna métricas globais (empresas, usuários, chamados, CPFs, leads, status, setores, evolução temporal, logs recentes) e dados da própria empresa do GOD. Criada página `/god/dashboard` com KPIs, gráficos (pizza status/roles, barras setores/empresas, linha evolução), tabela de empresas com atividade e logs recentes.

### Mudança: Log de acesso no login (audit-log.ts)
**Autor:** Vibecode
**Arquivos:** `src/lib/audit-log.ts` (novo), `src/lib/nextauth.ts`
**Data:** 12/06/2026
**Descrição:** Criado utilitário `logAcesso()` em `src/lib/audit-log.ts` que insere registros na tabela `logs_de_acesso`. Integrado no fluxo de login em `nextauth.ts` — após autenticação bem-sucedida, salva CPF, nome, empresa e ação "login". Inclui try-catch para não quebrar o login se o log falhar.
**Fix:** `prisma.logs_de_acesso.create()` não funcionava em runtime com `@prisma/adapter-pg` (model não exposto via proxy). Substituído por `prisma.$executeRawUnsafe()` com INSERT direto.

### Mudança: Fix setor em avisos — frontend e backend
**Autor:** Vibecode
**Arquivos:** `src/app/corporativo/(atendimento)/avisos/page.tsx`, `src/app/eventos/(atendimento)/avisos/page.tsx`, `src/app/oficina/(atendimento)/avisos/page.tsx`, `src/app/api/quadro-avisos/route.ts`
**Data:** 12/06/2026
**Descrição:** 
- **Frontend:** GESTOR/ATENDENTE veem campo setor bloqueado com seu próprio setor. ADMIN/GOD veem um select com os setores da empresa (buscados via `/api/empresa`). Setor forçado no payload do submit conforme a role.
- **Backend:** POST e PUT de `/api/quadro-avisos` forçam `setor = user.setor` para GESTOR/ATENDENTE, ignorando o valor enviado no body. ADMIN/GOD mantêm o valor enviado.

<<<<<<< HEAD
### Mudança: Fix redirect loop no proxy (ERR_TOO_MANY_REDIRECTS)
**Autor:** Vibecode
**Arquivos:** `src/proxy.ts`
**Data:** 12/06/2026
**Descrição:** Quando o usuário não autenticado acessava `/`, o proxy redirecionava para `/` (mesma URL), que era novamente interceptada pelo matcher, causando loop infinito. Adicionado guard para dar `NextResponse.next()` quando pathname === "/" e não há token, permitindo que a página de login renderize normalmente.

### Mudança: Proteção ENABLE_TESTES e atualização da rotina de testes
**Autor:** Vibecode
**Arquivos:** `src/proxy.ts`, `testes.md`
**Data:** 12/06/2026
**Descrição:**
- Adicionado guard `ENABLE_TESTES` no proxy — rotas `/testes` e `/api/testes` retornam 404 a menos que `ENABLE_TESTES=true` no ambiente.
- Adicionado `/testes/:path*` e `/api/testes/:path*` ao matcher do proxy para que o guard seja executado.
- Atualizado `testes.md` (seção 7) para refletir o proxy real com lógica de autenticação completa, não apenas o bloco de proteção isolado.


### Mudança: Proteção do GET general_cpf com API Key (B1)
**Autor:** Vibecode
**Arquivos:** `src/app/api/cpfs/general_cpf/route.ts`, `.env`, `.env.example`, `pedidos.md`, `checkpoint.md`
**Data:** 13/06/2026
**Descrição:** Adicionada função `validarBotApiKey()` que valida header `X-API-Key` contra env var `BOT_API_KEY`. O GET de `/api/cpfs/general_cpf` agora retorna 401 se a chave não for enviada ou for inválida. Bots existentes precisam ser atualizados para enviar o header com a chave configurada.

### Mudança: Correção de vulnerabilidades Grupo A (proxy + headers de segurança)
**Autor:** Vibecode
**Arquivos:** `next.config.ts`, `proxy.ts`, `pedidos.md`, `checkpoint.md`, `memorias.md`
**Data:** 13/06/2026
**Descrição:**
- **A1:** `poweredByHeader: false` no `next.config.ts` remove header `X-Powered-By: Next.js`
- **A2:** `async headers()` no `next.config.ts` adiciona `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- **A3:** `/api-docs` removido de `publicRoutes` no proxy, agora verifica JWT token antes de permitir acesso. Matcher atualizado com `/api-docs/:path*`
- **A4:** Rate limit para `/` (60 req/min/IP) e `/dashboard` (120 req/min/IP) via `Map` em memória no proxy (best-effort, funciona para instância única)
- **A5:** Tracking de brute force por IP em acessos não autenticados a páginas protegidas (20 tentativas a cada 15 min por IP)

# Informação super importante pra vc não errar mais isso: font documentação Nextjs

Proxy
Última atualização: 20 de dezembro de 2025
Proxy
É bom saber : a partir do Next.js 16, o Middleware passou a se chamar Proxy para melhor refletir sua finalidade. A funcionalidade permanece a mesma.

O proxy permite executar código antes que uma solicitação seja concluída. Em seguida, com base na solicitação recebida, você pode modificar a resposta reescrevendo-a, redirecionando-a, modificando os cabeçalhos da solicitação ou da resposta ou respondendo diretamente.

Casos de uso
Alguns cenários comuns em que o Proxy é eficaz incluem:

Modificar cabeçalhos para todas as páginas ou para um subconjunto delas.
Reescrever para páginas diferentes com base em testes A/B ou experimentos
Redirecionamentos programáticos baseados nas propriedades da solicitação recebida.
Para redirecionamentos simples, considere usar a redirectsconfiguração next.config.tspadrão. O proxy deve ser usado quando você precisar acessar os dados da requisição ou uma lógica mais complexa.

O Proxy não foi projetado para busca lenta de dados. Embora o Proxy possa ser útil para verificações otimistas, como redirecionamentos baseados em permissões, ele não deve ser usado como uma solução completa de gerenciamento de sessão ou autorização.

Usar `fetch` com options.cache`, options.next.revalidate` ou options.next.tags`,` não tem efeito no Proxy.

Convenção
Crie um arquivo proxy.ts(ou .js) na raiz do projeto, ou dentro dele srcse aplicável, para que ele esteja localizado no mesmo nível que pagesou app.

Observação : Embora apenas um proxy.tsarquivo seja suportado por projeto, você ainda pode organizar sua lógica de proxy em módulos. Separe as funcionalidades de proxy em arquivos separados .tse .jsimporte-os para o seu proxy.tsarquivo principal. Isso permite um gerenciamento mais organizado do proxy específico de cada rota, agregando-o para um proxy.tscontrole centralizado. Ao impor um único arquivo de proxy, você simplifica a configuração, evita possíveis conflitos e otimiza o desempenho, evitando múltiplas camadas de proxy.

Exemplo
Você pode exportar sua função proxy como uma exportação padrão ou como uma proxyexportação nomeada:

proxy.ts
TypeScript

TypeScript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url))
}
 
// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }
 
export const config = {
  matcher: '/about/:path*',
}
A matcherconfiguração permite filtrar o Proxy para ser executado em caminhos específicos. Consulte a documentação do Matcher para obter mais detalhes sobre a correspondência de caminhos.
=======
### Mudança: Página god/admins reescrita para Criar Usuário
**Autor:** Usuário
**Arquivos:** `src/app/god/admins/page.tsx`, `.gitignore`, `src/app/api/webhook-teste/route.txt` (novo)
**Data:** 14/06/2026
**Descrição:** 
- Página de administradores (`/god/admins`) completamente reescrita: agora é uma página de criação de usuário com suporte a avatar, seleção de empresa, papel, setor e senha.
- `.gitignore` adicionada entrada `/api/webhook-teste`
- Novo arquivo `src/app/api/webhook-teste/route.txt` criado (não rastreado)

### Mudança: Formulário corporativo/chamado adaptado do modelo oficina
**Autor:** Vibecode
**Arquivos:** `src/app/corporativo/chamado/page.tsx`
**Data:** 14/06/2026
**Descrição:**
- Página reescrita para seguir o mesmo layout/estilo de `/oficina/chamado`.
- CPF com formatação automática (000.000.000-00) e validação ao sair do campo.
- Ao validar CPF via `/api/empresa?cpf=...`, busca setores da empresa e avisos.
- Campos: Nome, CPF, Telefone (opcional), Descrição, Setor de Destino (select após validar CPF), upload de arquivo.
- Seção de avisos exibida automaticamente quando há avisos relacionados.
- Submit para `/api/tickets` (POST).

### Mudança: Consulta pública de tickets (CPF/matrícula) sem autenticação
**Autor:** Vibecode
**Arquivos:** `src/app/api/tickets/search/route.ts`
**Data:** 14/06/2026
**Descrição:**
- `GET /api/tickets/search`: quando busca por `ticket` → sempre público, sem autenticação.
- Quando busca por `cpf` sem sessão → público, busca direta por CPF.
- Quando busca por `cpf` com sessão (usuário logado) → mantém o filtro role-based via `getTicketWhereClause`.
- Corrige as páginas públicas `/corporativo/consulta`, `/corporativo/consulta/[ticket]`, `/oficina/consulta`, `/oficina/consulta/[ticket]` que não funcionavam por falta de autenticação.

### Mudança: HeaderContext adicionado ao layout god
**Autor:** Vibecode
**Arquivos:** `src/app/god/layout.tsx`, `src/app/god/admins/page.tsx`, `src/app/god/usuarios/page.tsx`
**Data:** 14/06/2026
**Descrição:**
- Adicionado `HeaderContext.Provider` + `useHeader()` exportado no layout `/god`.
- Adicionado componente `<Header>` no layout god (mesmo estilo do corporativo/oficina/eventos), com ThemeToggle.
- Páginas `/god/admins` e `/god/usuarios` agora importam `useHeader` do `../layout` (god) em vez de ter título inline.
- Caminho do header reutilizado: `@/app/corporativo/(atendimento)/components/header`.

### Mudança: Edição inline de ADMINS em god/usuarios
**Autor:** Vibecode
**Arquivos:** `src/app/god/usuarios/page.tsx`
**Data:** 14/06/2026
**Descrição:**
- Adicionada edição inline (nome e email) para usuários ADMIN na página god/usuarios.
- Botão "Editar" (ícone lápis) aparece apenas para role ADMIN.
- Ao editar, as células viram inputs com botões Salvar/ Cancelar (Check/X).
- Botão "Remover" trocado de texto para ícone (Trash2), igual ao padrão do corporativo.
- Delete continua com regra do backend: ADMIN só pode ser removido se houver substituto na mesma empresa.

### Mudança: Fix useHeader em /god/admins
**Autor:** Vibecode
**Arquivos:** `src/app/god/admins/page.tsx`
**Data:** 14/06/2026
**Descrição:** 
- Removido import e uso de `useHeader` (proveniente do layout `corporativo/(atendimento)`) que causava erro "useHeader must be used within provider" porque a página está sob rota `/god`, que tem layout próprio sem esse contexto.
- Adicionado título inline "Criar Novo Usuário" no JSX da página para substituir o header que era definido via contexto.

### Mudança: Chatbots apontando para novas rotas de API
**Autor:** Usuário
**Arquivos:** `src/app/corporativo/chatbot-app/page.tsx`, `src/app/oficina/chatbot-app/page.tsx`
**Data:** 14/06/2026
**Descrição:**
- Chatbot corporativo: endpoint `/api/chat` alterado para `/api/chat-corporativo`.
- Chatbot oficina: endpoint `/api/chat` alterado para `/api/chat-operacional`.
- Novos diretórios não rastreados: `src/app/api/chat-corporativo/` e `src/app/api/chat-operacional/`.

### Mudança: Consulta pública da oficina — matrícula de 6 para 8 dígitos
**Autor:** Usuário
**Arquivos:** `src/app/oficina/consulta/page.tsx`
**Data:** 14/06/2026
**Descrição:**
- Validação `matriculaValida` (4-8 dígitos) adicionada antes de buscar.
- `maxLength` alterado de 6 para 8.
- Botão desabilitado baseado em `matriculaValida` em vez de `!matricula`.

### Mudança: Deleção do módulo /oficina/userFacil
**Autor:** Usuário
**Arquivos:** `src/app/oficina/userFacil/page.tsx` (deletado)
**Data:** 14/06/2026
**Descrição:** Página `/oficina/userFacil` deletada.

### Mudança: smartSearch adaptado para buscar por CPF
**Autor:** Usuário
**Arquivos:** `src/lib/smartSearch.ts`
**Data:** 14/06/2026
**Descrição:**
- `obterBaseDeConhecimento()` agora recebe `cpf: string` como parâmetro.
- Busca o registro na tabela `cpfsLeads` pelo CPF para descobrir o nome da empresa.
- Consulta avisos usando o nome da empresa extraído do CPF, em vez de `PUBLIC_NAME_EMPRESA`.

### Mudança: Rota pública /eventos/leads adicionada ao proxy
**Autor:** Usuário
**Arquivos:** `src/proxy.ts`
**Data:** 14/06/2026
**Descrição:** `/eventos/leads` adicionado ao array `publicRoutes` para permitir acesso sem autenticação.

### Mudança: Alterações em webhook-leads e consulta corporativa
**Autor:** Usuário
**Arquivos:** `src/app/api/webhook-leads/route.ts`, `src/app/corporativo/consulta/page.tsx`, `src/app/api/tickets/search/route.ts`
**Data:** 14/06/2026
**Descrição:** Ajustes pontuais nos arquivos.

### Mudança: Correção da busca de avisos no smartSearch e webhook-leads
**Autor:** Vibecode
**Arquivos:** `src/lib/smartSearch.ts`, `src/app/api/webhook-leads/route.ts`
**Data:** 15/06/2026
**Descrição:**
- **smartSearch.ts:** `obterBaseDeConhecimento(cpf)` agora faz lookup em 3 etapas: 1) busca `cpfsLeads` pelo CPF para obter o nome da empresa (`empresa`), 2) busca `empresa` pelo nome para obter o `id`, 3) filtra `avisos` por `empresaId`. Antes tentava `where: { Empresa: usuario.empresa }` que não funciona porque `avisos` usa FK `empresaId`.
- **webhook-leads/route.ts:** `consultarLeadPorCpf()` agora consulta Prisma diretamente (`prisma.cpfsLeads.findUnique`) em vez de fazer auto-requisição HTTP GET para `/api/webhook-leads?cpf=...` (endpoint GET inexistente causava 405).

### Mudança: Fix loop no webhook27 — COLETAR_MOTIVO sem avisos ia para MENU_PRINCIPAL
**Autor:** Vibecode
**Arquivos:** `src/app/api/webhook27/route.ts`
**Data:** 15/06/2026
**Descrição:**
- No estado `COLETAR_MOTIVO`, quando não há avisos cadastrados, `buscarAvisos` + `buscarAvisosPorCpf` retornam "Sem avisos." ou "Sem avisos no momento.".
- A função `botIA4()` em `useIA4.ts` pula o bloco `instrucaoAvisos` quando o texto é exatamente "Sem avisos." ou "Sem avisos no momento." (linha 162-174), então a IA não recebe as instruções sobre `PROSSEGUIR_FLUXO` e `AVISO_RESOLVE`.
- Sem essas instruções, a IA segue a `reconducao` (que manda reconduzir para o menu) e apresenta as opções novamente.
- O `else` no webhook27 envia a resposta da IA e seta `MENU_PRINCIPAL`, criando um loop infinito.
- **Fix:** Quando não há avisos, o fluxo agora pula a análise da IA e vai direto para `PERGUNTAR_ANEXO` (perguntar sobre anexos), eliminando o loop.
>>>>>>> ab2e515b19cde2af985ada629608206a6c43fddf
