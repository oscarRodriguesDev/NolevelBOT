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
