# CHECKPOINT - Histórico de Commits

## Branch: `vibecode`

## Commits Anteriores (até 14/05/2026)

| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `6f5ecf5` | voltando as config de um bd apenas | - |
| 2 | `4ff2732` | esqueci de salvar rota de cpf | - |
| 3 | `a6a6213` | teste | - |
| 4 | `9d74606` | teste deploy | - |
| 5 | `3fac21d` | teste deploy 2 | - |
| 6 | `ada13b0` | Merge branch 'oscar' of https://github.com/oscarRodriguesDev/NolevelBOT | - |
| 7 | `fd46790` | hotfix:ajustando post de cpfs | - |
| 8 | `ceb5b69` | create enviroment - homologação | - |
| 9 | `4233f7e` | tentativa 2 deploy homologação | - |
| 10 | `5ded5cf` | terceira tentativa | - |
| 11 | `b9e649c` | quarta tentativa | - |
| 12 | `705abd2` | quinta tentativa | - |
| 13 | `fed26e6` | sexta tentativa | - |
| 14 | `ecc69f2` | fix: atualizações do projeto, vai quebrar pois a url base para o bot ainda não foi atualizada no server | - |
| 15 | `e79d9da` | completion | - |
| 16 | `89b862e` | fix: tentando solucionar problema no bot whatsapp | - |
| 17 | `976dca4` | fix:rota para consulta de cpfs alterada | - |
| 18 | `937c9db` | fix: corrigindo problema de busca de setores | - |
| 19 | `1ba4ce8` | ajuste na busca por setores | - |
| 20 | `27d7ef6` | fix: todas as referencias a url da vercel, removidas | - |
| 21 | `ec2fbfb` | fix: problemas de chamada de api resolvidos | - |
| 22 | `0c52e50` | fix: problemas de chamada de api resolvidos | - |
| 23 | `9ba6480` | tentado subir conrainer corrigido | - |
| 24 | `de9b533` | fix: mudanças para tentar conexão com rota | - |
| 25 | `89ba539` | tentando corrigir rotas erradas 1 | - |
| 26 | `066e5f7` | logando em auth | - |
| 27 | `92b3208` | fix: ultimo antes do opencode | - |
| 28 | `357365b` | melhorarando adição de priemeiro usuraio | - |
| 29 | `61196c0` | fix: resolve problem in webhook and in chat' | - |
| 30 | `38d7684` | final | - |

## Commits em outros branches (não mesclados)

| Hash | Mensagem |
|------|----------|
| `393e193` | testes |
| `45afbea` | alteração muito importante |
| `548e04c` | alterando nome do container |
| `ee89008` | acerto |
| `25417bb` | teste |

---

## Sessão Atual: 17/05/2026

### Pendentes antes do commit:
- ~~`src/app/api/leads-network/route.ts` - POST agora detecta eventos Evolution e faz proxy para webhook-leads~~ ✅
- ~~`src/app/api/webhook-leads/route.ts` - Corrigido fetch relativo para URL absoluta~~ ✅
- ~~`memorias.md` - Adicionada seção 15 com documentação das correções~~ ✅
- ~~`src/app/api/webhook-leads/route.ts` - Refatorado: bot vira representante NoLevel, matching inteligente PT-BR~~ ✅
- ~~`src/app/api/webhook-leads/route.ts` - IA resume/naturaliza respostas dos avisos (gerarRespostaComAviso + gerarRespostaFallback)~~ ✅
- ~~`memorias.md` - Seção 16 atualizada com nova estratégia de IA~~ ✅

### Commits realizados nesta sessão:

| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `f20b837` | feat: captura de leads, docs do projeto, e melhorias no modal de usuario | 14/05/2026 |
| 2 | `adac2df` | fix: renomeia routes.ts para route.ts e corrige fetch em /leads | 14/05/2026 |
| 3 | `18ae14b` | feat: webhook-leads para captacao de leads em eventos/feiras | 14/05/2026 |
| 4 | `7b12a7d` | fix: leads-network reconhece webhook Evolution + fetch absoluto webhook-leads | 17/05/2026 |
| 5 | `8f34c05` | docs: atualiza checkpoint com hash do commit 7b12a7d | 17/05/2026 |
| 6 | `c367506` | refactor: webhook-leads como representante NoLevel, matching PT-BR inteligente, economia de IA | 17/05/2026 |
| 7 | `1060981` | docs: atualiza checkpoint com hash do commit c367506 | 17/05/2026 |
| 8 | `958a120` | refactor: webhook-leads IA resume e naturaliza respostas dos avisos | 17/05/2026 |
| 9 | `ed354d0` | fix: webhook-leads sempre resume - max 2 frases, sem fallback literal | 17/05/2026 |
| 10 | `41d9058` | fix: webhook-leads usa system role para parafrasear sem copiar texto literal | 17/05/2026 |

---

## Sessão: 19/05/2026

### Pendentes antes do commit:
- ~~`src/lib/phoneMap.ts` - Mapa CPF → telefone + instância, persistência em JSON~~ ✅
- ~~`src/app/api/webhook24/route.ts` - Registrar telefone ao validar CPF~~ ✅
- ~~`src/app/api/tickets/route.ts` - Notificações proativas no POST/PUT/DELETE~~ ✅
- ~~`memorias.md` - Seção 17 documentando notificações proativas~~ ✅

### Commits realizados nesta sessão:

| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `36e530a` | feat: notificacoes proativas no webhook24 - avisa cliente quando chamado e criado, tratado e finalizado | 19/05/2026 |
| 2 | `a6d255a` | fix: matching bidirecional de setores - reconhece setor mesmo quando nome nao contem exatamente o input | 19/05/2026 |
| 3 | `06a1d43` | fix: notificacao PUT usa 'em_atendimento' (valor real do frontend) e notifica em 'concluido' | 19/05/2026 |
| 4 | `16e5834` | feat: notifica usuario em toda atualizacao do chamado com observacao | 19/05/2026 |
| 5 | `3699ded` | feat: consulta de chamados mostra resumo completo com status, atendente, historico e observacoes | 19/05/2026 |

---

## Sessão: 19/05/2026 (Kanban Board)

### Pendentes antes do commit:
- ~~`src/app/(atendimento)/all-tickets/kanban-board.tsx` - Componente KanbanBoard com 3 colunas~~ ✅
- ~~`src/app/(atendimento)/all-tickets/page.tsx` - Alternância Lista/Kanban + toggle~~ ✅
- ~~`src/app/(atendimento)/components/modal_tandimento.tsx` - Status padronizados~~ ✅
- ~~`memorias.md` - Seção 19 documentando Kanban~~ ✅

### Commits realizados nesta sessão:

| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `3cb83f9` | feat: visualizacao Kanban com alternancia lista/kanban e status padronizados | 19/05/2026 |
| 2 | `dc7b270` | docs: atualiza checkpoint com hash 3cb83f9 | 19/05/2026 |

---

---

## Sessão: 19/05/2026 (Kanban - Drag & Drop + 5 Colunas)

### Pendentes antes do commit:
- ~~`src/app/(atendimento)/all-tickets/kanban-board.tsx` - 5 colunas + drag and drop~~ ✅
- ~~`memorias.md` - Seção 19 atualizada com drag and drop~~ ✅

### Commits realizados nesta sessão:

| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `b334756` | feat: kanban com 5 colunas e drag-and-drop para mover chamados entre status | 19/05/2026 |
| 2 | `8f1f2d5` | docs: atualiza checkpoint com hash b334756 | 19/05/2026 |

---

## Sessão: 19/05/2026 (Análise de Melhorias)

### Pendentes antes do commit:
- ~~`ideias.md` - Documento com análise completa de melhorias~~ ✅

### Commits realizados nesta sessão:

| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `2de8724` | docs: adiciona ideias.md com analise de melhorias profissionais | 19/05/2026 |
| 2 | `d5074fb` | docs: atualiza checkpoint com hash 2de8724 | 19/05/2026 |

---

## Sessão: 19/05/2026 (Implementação Itens 1-11)

### Implementações realizadas:

| Item | Descrição | Status |
|------|-----------|--------|
| 1 | Remove log de senha em plaintext em `[...nextauth]/route.ts` | ✅ |
| 2 | Corrige autenticação em PUT/DELETE de tickets (main + search) | ✅ |
| 3 | Adiciona proteção em GET empresas (exceto consulta por CPF pública) | ✅ |
| 4 | Adiciona autenticação em GET leads-network | ✅ |
| 5 | Remove dependência fantasma `prisma-client` | ✅ |
| 6 | Remove dependência obscura `toast` | ✅ |
| 7 | Configura Vitest + vitest.config.ts + scripts de teste | ✅ |
| 8 | Cria error.tsx global + error.tsx para área de atendimento | ✅ |
| 9 | Substitui 26 `alert()` por `react-hot-toast` em 8 arquivos | ✅ |
| 10 | Instala react-hook-form + zod + @hookform/resolvers + cria `src/lib/validation.ts` | ✅ |
| 11 | Adiciona `normalizarStatus()` nas rotas PUT de tickets | ✅ |

### Arquivos criados:
- `vitest.config.ts` — Configuração do Vitest
- `src/app/error.tsx` — Error boundary global
- `src/app/(atendimento)/error.tsx` — Error boundary da área logada
- `src/lib/validation.ts` — Schemas Zod para validação de formulários

### Arquivos modificados:
- `package.json` — Remove `prisma-client`, `toast`; adiciona scripts `test`, `test:watch`
- `src/app/api/auth/[...nextauth]/route.ts` — Remove console.log de senha
- `src/app/api/tickets/route.ts` — Auth real em PUT/DELETE + normalizarStatus
- `src/app/api/tickets/search/route.ts` — Auth real em PUT/DELETE + normalizarStatus
- `src/app/api/empresa/route.ts` — Auth em GET (listagem)
- `src/app/api/leads-network/route.ts` — Auth em GET
- `src/app/layout-client.tsx` — Adiciona `<Toaster />` do react-hot-toast
- `src/app/leads/page.tsx` — alert → toast
- `src/app/(atendimento)/components/modal-edit-user.tsx` — alert → toast
- `src/app/userFacil/page.tsx` — alert → toast
- `src/app/chamado/page.tsx` — alert → toast
- `src/app/chamado/[ticket]/page.tsx` — alert → toast (add import)
- `src/app/(atendimento)/cpfs/page.tsx` — alert → toast (10 ocorrências)
- `src/app/(atendimento)/gestao-de-usuarios/page.tsx` — alert → toast
- `src/app/(atendimento)/empresa/create/page.tsx` — alert → toast

### Commits realizados nesta sessão:

| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `c5923bf` | feat: implementa itens 1-11 do ideias.md - seguranca, testes, error boundaries, toast, validacao | 19/05/2026 |

---

---

## Sessão: 19/05/2026 (Implementação Itens 13-28)

### Itens implementados:

| Item | Descrição | Status |
|------|-----------|--------|
| 13 | Índices (`@@index`) em todos os modelos Prisma | ✅ |
| 14 | Tema consistente em `modal-edit-user.tsx` e `userFacil/page.tsx` | ✅ |
| 15 | Skeleton components + `loading.tsx` | ✅ |
| 16 | Componentes UI: StatusBadge, PriorityBadge, Spinner | ✅ |
| 17 | ARIA: role="dialog", aria-modal, Escape key em modais | ✅ |
| 19 | Docker: `USER node` para não rodar como root | ✅ |
| 20 | CI/CD: steps de build/lint antes do deploy | ✅ |
| 21 | Typo `ransition` → `transition` em layout.tsx | ✅ |
| 22 | `.env.example` com variáveis documentadas | ✅ |
| 23 | Typo `chammados` → `chamados` no schema | ✅ |
| 24 | Prettier configurado (`.prettierrc` + `.prettierignore`) | ✅ |
| 25 | Página de documentação da API (`/api-docs`) | ✅ |
| 27 | Tipos centralizados em `src/types/chamado.ts` | ✅ |
| 28 | Campo telefone opcional no portal de chamados | ✅ |

### Arquivos criados:
- `src/types/chamado.ts` — Tipos e funções utilitárias centralizadas
- `src/app/components/skeleton.tsx` — Skeleton, SkeletonTable, SkeletonCard
- `src/app/components/spinner.tsx` — Spinner SVG animado
- `src/app/components/status-badge.tsx` — Badge de status com cor
- `src/app/components/priority-badge.tsx` — Badge de prioridade com cor
- `src/app/(atendimento)/all-tickets/loading.tsx` — Loading state
- `src/app/api-docs/page.tsx` — Documentação da API
- `.env.example` — Template de variáveis de ambiente
- `.prettierrc` — Configuração Prettier
- `.prettierignore` — Ignora node_modules, .next, etc.

### Arquivos modificados:
- `prisma/schema.prisma` — Índices + typo `chammados` → `chamados`
- `src/app/layout.tsx` — Typo `ransition` → `transition`
- `src/app/userFacil/page.tsx` — Tema CSS variables
- `src/app/(atendimento)/components/modal-edit-user.tsx` — Tema CSS variables + ARIA
- `src/app/(atendimento)/components/modal_tandimento.tsx` — ARIA + tipos centralizados
- `src/app/(atendimento)/all-tickets/page.tsx` — Importa funções de cor do tipos central
- `src/app/(atendimento)/all-tickets/kanban-board.tsx` — Importa getPriorityColor do tipos central
- `src/app/consulta/[ticket]/page.tsx` — Importa getStatusColor do tipos central
- `src/app/api/tickets/route.ts` — Importa HistoricoItem + normalizarStatus do tipos central; aceita telefone
- `src/app/api/tickets/search/route.ts` — Importa HistoricoItem + normalizarStatus do tipos central
- `src/app/chamado/page.tsx` — Campo telefone opcional
- `dockerfile` — USER node
- `.github/workflows/deploy.yml` — Steps de build/lint
- `.github/workflows/deploy-homologa.yml` — Steps de build/lint

### Commits realizados nesta sessão:

| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `d16f650` | feat: implementa itens 13-28 do ideias.md - indices, tema, skeleton, componentes UI, ARIA, docker, CI, prettier, tipos centralizados, telefone no portal | 19/05/2026 |
| 2 | `874e232` | chore: atualiza package-lock.json para sync com docker build | 19/05/2026 |
| 3 | `f06cc6c` | fix: altera npm ci para npm install no dockerfile para evitar conflito de lockfile | 19/05/2026 |
| 4 | `907f9d1` | fix: cria diretorio /app/data com permissao para node user no dockerfile - webhook24 nao salvava phoneMap | 19/05/2026 |

---

## Sessão: 20/05/2026 (Correção Multi-Tenancy)

### Bugs corrigidos:

| # | Severidade | Arquivo | Problema | Fix |
|---|-----------|---------|----------|-----|
| 1 | 🔴 Crítico | `api/cpfs/route.ts` — DELETE | Deletava CPF de qualquer empresa | Adicionado findFirst com empresaId antes de deletar |
| 2 | 🔴 Crítico | `api/tickets/route.ts` — PUT | Atualizava chamado de qualquer empresa | Adicionado empresaId no where |
| 3 | 🔴 Crítico | `api/tickets/route.ts` — DELETE | Movia chamado de qualquer empresa | Adicionado empresaId no where |
| 4 | 🔴 Crítico | `api/tickets/search/route.ts` — GET | Retornava chamados de todas empresas | Adicionado empresaId quando autenticado |
| 5 | 🔴 Crítico | `gestao-de-usuarios/page.tsx` | Setores da empresa errada | Fix via empresa GET role-aware |
| 6 | 🔴 Crítico | `api/empresa/route.ts` — GET | Retornava todas empresas | GOD vê todas, demais vêem só a própria |

### Commits realizados nesta sessão:

| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `ec91ead` | fix: corrige vazamento de dados multi-tenancy entre empresas | 20/05/2026 |
| 2 | `3e4b99c` | docs: atualiza checkpoint com hash ec91ead | 20/05/2026 |
| 3 | `19438aa` | docs: adiciona hash 3e4b99c no checkpoint | 20/05/2026 |
| 4 | `53a681c` | docs: add hash 19438aa ao checkpoint | 20/05/2026 |
| 5 | `fdc5cf9` | fix: tickets GET role-aware + consulta publica usa search route | 20/05/2026 |
| 6 | `faa6265` | docs: atualiza memorias e checkpoint com fixes 7 e 8 | 20/05/2026 |

---

## Sessão: 20/05/2026 (GOD Cria Usuários + Lista de Admins)

### Mudanças realizadas:

| # | Mudança | Descrição |
|---|---------|-----------|
| 1 | `api/users/route.ts` | GOD agora pode criar usuários no mesmo form (seletor de empresa + todas roles liberadas) |
| 2 | `api/users/admins/route.ts` (novo) | GET lista admins, PUT edita, DELETE remove (tudo restrito a GOD) |
| 3 | `gestao-de-usuarios/page.tsx` | GOD vê seletor de empresa + papel Master no formulário |
| 4 | `cpfs/page.tsx` | GOD vê tabela de admins com nome, CPF, empresa, setor, editar/apagar |

### Detalhes

- **API `/api/users/admins`**: GET (listar), PUT (editar nome/email/cpf/setor), DELETE (remover admin por id)
- **Formulário de criação**: GOD vê campo extra "Empresa" para selecionar a empresa destino
- **Lista de admins**: Exibida na página de CPFs, visível apenas para GOD, com edição inline e exclusão com confirmação

### Commits realizados nesta sessão:

| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `ab2654c` | feat: GOD cria usuarios no form padrao + lista de admins na pagina de CPFs | 20/05/2026 |
| 2 | `f084359` | docs: atualiza memorias e checkpoint com feat GOD/admins | 20/05/2026 |
| 3 | `730a028` | docs: add hash f084359 ao checkpoint | 20/05/2026 |

| # | Fix | Descrição |
|---|-----|-----------|
| 7 | Tickets GET role-aware | Só ATENDENTE filtra por setor; ADMIN/GESTOR/GOD veem todos setores |
| 8 | Consulta pública | /consulta e /consulta/[ticket] agora usam /api/tickets/search (funciona sem auth) |

### Commits realizados nesta sessão:

| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `ec91ead` | fix: corrige vazamento de dados multi-tenancy entre empresas | 20/05/2026 |
| 2 | `3e4b99c` | docs: atualiza checkpoint com hash ec91ead | 20/05/2026 |
| 3 | `19438aa` | docs: adiciona hash 3e4b99c no checkpoint | 20/05/2026 |
| 4 | `53a681c` | docs: add hash 19438aa ao checkpoint | 20/05/2026 |
| 5 | `fdc5cf9` | fix: tickets GET role-aware + consulta publica usa search route | 20/05/2026 |
| 6 | `faa6265` | docs: atualiza memorias e checkpoint com fixes 7 e 8 | 20/05/2026 |

---

## Sessão: 21/05/2026 — RBAC Completo + Telas de Usuários

### Pendentes (RBAC):
- ~~`src/lib/rbac.ts` — Sistema centralizado de permissões RBAC~~ ✅
- ~~`src/app/api/users/route.ts` — RBAC completo + auto-registro CPF~~ ✅
- ~~`src/app/api/users/admins/route.ts` — Bloqueio exclusão GOD~~ ✅
- ~~`src/app/api/userFacil/route.ts` — Validação podeCriarRole + auto CPF~~ ✅
- ~~`src/app/api/cpfs/route.ts` — ATENDENTE só manual, lote restrito~~ ✅
- ~~`src/app/api/tickets/route.ts` — GET/PUT/DELETE com setor filter~~ ✅
- ~~`src/app/api/tickets/search/route.ts` — PUT/DELETE com setor filter~~ ✅
- ~~`src/app/(atendimento)/components/sidebar.tsx` — Menu dinâmico por role~~ ✅
- ~~`src/app/(atendimento)/gestao-de-usuarios/page.tsx` — Roles + lista RBAC~~ ✅
- ~~`src/app/(atendimento)/cpfs/page.tsx` — Lote escondido ATENDENTE~~ ✅
- ~~`src/app/(atendimento)/empresa/page.tsx` — Redireciona não-GOD~~ ✅
- ~~`src/app/(atendimento)/empresa/create/page.tsx` — Redireciona não-GOD~~ ✅
- ~~`memorias.md` — Seção 24 documentando RBAC~~ ✅

### Pendentes (Empresa CRUD + Telas de Usuários):
- ~~`src/app/api/empresa/route.ts` — PUT/DELETE para GOD~~ ✅
- ~~`src/app/(atendimento)/empresa/page.tsx` — Cards clicáveis → `/empresa/[id]/usuarios`~~ ✅
- ~~`src/app/(atendimento)/empresa/[id]/usuarios/page.tsx` — Listagem/edição/exclusão (GOD)~~ ✅
- ~~`src/app/(atendimento)/usuarios/page.tsx` — Listagem/edição/exclusão (ADMIN/GESTOR/GOD)~~ ✅
- ~~`src/app/(atendimento)/components/sidebar.tsx` — "Usuários" + "Criar Usuário"~~ ✅
- ~~`src/lib/rbac-server.ts` — Server-only session helper~~ ✅
- ~~`memorias.md` — Seção 25 documentando telas de usuários~~ ✅

### Commits realizados nesta sessao:

| # | Hash | Mensagem | Data |
|---|------|----------|------|
### Commits realizados nesta sessão (RBAC + Telas):

| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `1288fa5` | feat: implementa RBAC completo com validacoes backend, auto-registro de CPF, menus dinamicos e protecao contra exclusao de GOD | 21/05/2026 |
| 2 | `54ecb1b` | feat: adiciona PUT e DELETE em api/users com validacao RBAC para editar/excluir usuarios | 21/05/2026 |
| 3 | `f044ee0` | feat: adiciona editar e excluir empresa com PUT/DELETE na API e botoes na pagina | 21/05/2026 |
| 4 | `aeaf54d` | feat: GOD ve usuarios por empresa + pagina /usuarios para ADMIN/GESTOR com edicao inline | 21/05/2026 |

---

## Sessão: 21/05/2026 — Segurança, Refatoração e Frontend

### Pendentes antes do commit:
- ~~`src/app/api/users/route.ts` — Bloquear auto-edição (PUT) e auto-exclusão (DELETE)~~ ✅
- ~~`src/app/api/users/admins/route.ts` — Bloquear auto-edição (PUT) e auto-exclusão (DELETE)~~ ✅
- ~~`src/app/(atendimento)/usuarios/page.tsx` — Ocultar ações para o próprio usuário~~ ✅
- ~~`src/app/(atendimento)/empresa/[id]/usuarios/page.tsx` — Ocultar ações para o próprio usuário~~ ✅
- ~~`src/app/(atendimento)/cpfs/page.tsx` — Ocultar ações admin para o próprio GOD~~ ✅
- ~~`src/app/(atendimento)/gestao-de-usuarios/page.tsx` — Remover listagem de usuários~~ ✅
- ~~Profissionalizar frontend (exceto landing page)~~ ✅
  - ~~Login~~ ✅
  - ~~Chamados (all-tickets)~~ ✅
  - ~~Avisos~~ ✅
  - ~~CPFs~~ ✅
  - ~~Gestão de Usuários~~ ✅
  - ~~Usuários~~ ✅
  - ~~Empresa Usuários~~ ✅
  - ~~Criar Empresa~~ ✅
- ~~`src/app/globals.css` — Adicionar variáveis de sombra~~ ✅
- ~~`memorias.md` — Seções 26-29 documentando mudanças~~ ✅
- ~~`checkpoint.md` — Atualizado~~ ✅

### Commits realizados nesta sessão:
| 1 | `9bcfe38` | feat: bloqueia auto-edição/exclusão, remove listagem de criação, profissionaliza frontend | 21/05/2026 |
| 2 | `68831a6` | docs: atualiza checkpoint e memorias com hash 9bcfe38 | 21/05/2026 |

---

## Sessão: 21/05/2026 — Melhorias Criação de Usuário (GESTOR + CPF)

### Pendentes antes do commit:
- ~~`src/app/(atendimento)/gestao-de-usuarios/page.tsx` — GESTOR: setor auto-preenchido e bloqueado~~ ✅
- ~~`src/app/(atendimento)/gestao-de-usuarios/page.tsx` — CPF: apenas números + formatação XXX.XXX.XXX-XX~~ ✅
- ~~`memorias.md` — Seção 30 documentando mudanças~~ ✅
- ~~`checkpoint.md` — Atualizado~~ ✅
- ~~Build validado~~ ✅

### Commits realizados nesta sessão:
| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `ad81aa5` | `feat: gestor setor auto-preenchido, cpf formatado e numerico` | 21/05/2026 |
| 2 | `33ad2b9` | `atualização: usadoata refatorado para prisma direto, admin setor livre, exclusao empresa em cascata` | 22/05/2026 |
| 3 | `5d6f112` | `testes: remove seção de admins da pagina cpfs` | 23/05/2026 |

---

## Sessão: 23/05/2026 — Tasks do `tasks.txt`

### Resumo
Implementação completa de todas as tasks do arquivo `src/tasks.txt`, incluindo notificações WhatsApp, reconhecimento de empresa pelo bot, botão voltar, alinhamento chat/webhook24, correção do formulário de leads e regras RBAC de exclusão com substitutos.

### Tasks implementadas

| # | Task | Descrição | Arquivos |
|---|------|-----------|----------|
| 1 | Notificações WhatsApp | registerPhone adicionado ao webhook22 e webhook23; fallback de telefone via historico do chamado; notificação ignora instância 'web' | `webhook22/route.ts`, `webhook23/route.ts`, `tickets/route.ts` |
| 2 | Bot reconhece empresa | Empresa name não é mais hardcoded — `botIA()` busca nome real da empresa pelo CPF do usuário | `useIA.ts` |
| 3 | Botão voltar | Adicionado botão Voltar com `window.history.back()` + ícone FaArrowLeft | `consulta/[ticket]/page.tsx` |
| 4 | Chat = webhook24 | Chat API reescrita para espelhar webhook24: exibição rica de status, fallback `generateRandomTicket`, sessão 2h, labels com emojis | `api/chat/route.ts` |
| 5 | Form /leads | CPF é limpo (só dígitos) antes de enviar; erro mostra mensagem específica da API | `leads/page.tsx` |
| 6 | Gestor deleta atendente | Já implementado anteriormente; verificado que GESTOR só deleta ATENDENTE do mesmo setor | `api/users/route.ts` |
| 7 | Admin deleta gestor | Admin pode deletar GESTOR, mas deve existir outro GESTOR na empresa como substituto | `api/users/route.ts` |
| 8 | Admin deleta admin | Admin só pode ser deletado se houver outro ADMIN na mesma empresa; GOD também respeita esta regra | `api/users/route.ts` |
| 9 | Card mostra Role | CardUser agora exibe o papel do usuário (GOD/ADMIN/GESTOR/ATENDENTE) em badge | `cardUser.tsx` |

### Detalhes técnicos

#### Task 1 — Phone persistence em chamado
- `tickets/route.ts`: `buscarContato()` criada — primeiro checa phoneMap, depois busca no historico do chamado por entrada `{ acao: "TELEFONE" }`
- Ao criar chamado com telefone via portal web, o telefone é salvo no historico como JSON
- `notificarCliente()` agora aceita `chamadoId` e usa `buscarContato()` em vez de `getPhoneByCpf()` diretamente
- Se a instância for 'web', a notificação é ignorada (não há como enviar WhatsApp sem Evolution API)
- `registerPhone()` adicionado nos webhooks 22 e 23 (que não tinham)

#### Task 2 — Nome da empresa dinâmico
- `useIA.ts`: Constante `empresa = 'Nolevel'` removida
- Função `getEmpresaName(cpf)` criada — busca empresaId pelo CPF, depois o nome da empresa no banco
- Chamada dentro de `botIA()` a cada interação, garantindo que o contexto da IA tenha o nome correto da empresa
- Fallback para 'Nolevel' se não encontrar

#### Task 4 — Chat API alinhada com webhook24
- `statusLabels` com emojis e labels padronizados
- Sessão expira em 2h (antes era 1h)
- Comando de saída padronizado (apenas "sair", "encerrar", "cancelar")
- Exibição de chamados agora inclui: ticket, status com label, data, setor, atendente, último histórico, descrição
- `generateRandomTicket` como fallback quando criação de chamado falha
- Mensagens de confirmação alinhadas com webhook24

#### Tasks 7-8 — Regras de substituto na exclusão
No `DELETE` de `api/users/route.ts`:
- Ao deletar GESTOR (por ADMIN): verifica se existe outro GESTOR na mesma empresa
- Ao deletar ADMIN (por GOD/ADMIN): verifica se existe outro ADMIN na mesma empresa
- Se não houver substituto, retorna 400 com mensagem clara
- ATENDENTES não precisam de substituto (já implementado)

### Commits realizados nesta sessão:
| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `d0c4a9d` | `feat: tasks do tasks.txt - notificacoes whatsapp, empresa dinamica, botao voltar, chat alinhado webhook24, leads fix, rbac substitutos, card role` | 23/05/2026 |

### Build
- `npm run build` — compilado com sucesso ✅

---

### Build
- `npm run build` — compilado com sucesso ✅

---

## Sessão: 30/05/2026 — Fix Webhook25: Download de mídia via webhookBase64

### Problema
Fotos enviadas via WhatsApp (webhook25) não chegavam ao Supabase Storage porque `downloadEvolutionMedia()` chamava o endpoint inexistente `/message/downloadMedia/{instance}` na Evolution API v2.3.0 (sempre 404).

### Solução
1. **Habilitado `webhookBase64: true`** na instância Hevelyn via `POST /webhook/set/Hevelyn` com `{ webhook: { ..., base64: true } }` (o campo chama-se `base64` na API REST, mapeado para `webhookBase64` no banco)
2. **`downloadEvolutionMedia()` modificado** em `src/lib/usedata.ts` — aceita `base64Override?: string` para decodificar base64 diretamente
3. **Webhook25 atualizado** em `src/app/api/webhook25/route.ts` — passa `data.message?.base64` como terceiro argumento

### Commits realizados nesta sessão:
| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `9431f06` | `fix: webhook25 download de midia via webhookBase64 ao inves de endpoint REST inexistente` | 30/05/2026 |

---

## Sessão: 30/05/2026 — Bot name dinâmico por instância + empresa do banco

### Objetivo
O nome do assistente virtual agora vem do nome da instância configurada na Evolution API (via `body.instance`), permitindo personalização por empresa. A empresa mencionada pelo bot também passa a ser dinâmica (buscada do banco via `getEmpresaName()`).

### Mudanças realizadas

#### `src/lib/useIA.ts` e `src/lib/useIA2.ts`
- `botIA()` e `botIA2()` agora aceitam parâmetro opcional `botName?: string`
- System prompt muda de `"Você é a Hevelyn..."` para `` `Você é ${botName || "Hevelyn"}...` ``
- `getEmpresaName()` já existia e buscava nome real da empresa no banco — mantido

#### Webhooks 22, 23, 24, 25
- Todos passam `const instance = body.instance` como `botName` para `botIA()`/`botIA2()`
- **webhook24** e **webhook25**: Saudações hardcoded `"Olá! Eu sou a Hevelyn..."` substituídas por `` `Olá! Eu sou a ${instance}...` ``

#### `src/app/api/chat/route.ts`
- Adicionada constante `BOT_NAME` de `process.env.BOT_NAME` com fallback `"Hevelyn"`
- Todas as chamadas a `botIA()` passam `BOT_NAME`

#### `src/app/api/webhook-leads/route.ts`
- `gerarRespostaInteligente()` aceita `botName`
- System prompt `` `Você é a Hevelyn...` `` → `` `Você é ${botName || "Hevelyn"}...` ``
- Saudações: `"Sou a Hevelyn"` → `` `Sou a ${instance}` ``
- Referências a "NoLevel" mantidas (é o contexto de estande da própria NoLevel)

#### `src/app/chatbot-app/page.tsx`
- Componente renomeado de `MobileHevelynChat` → `MobileChat`
- `BOT_NAME` de `process.env.NEXT_PUBLIC_BOT_NAME` com fallback `"Hevelyn"`
- Mensagens de erro e "digitando..." usam `BOT_NAME` dinâmico

### Arquivos modificados (13)
| Arquivo | Mudança |
|---------|---------|
| `src/lib/useIA.ts` | `botIA()` aceita `botName` |
| `src/lib/useIA2.ts` | `botIA2()` aceita `botName` |
| `src/app/api/webhook22/route.ts` | Passa `instance` como `botName` |
| `src/app/api/webhook23/route.ts` | Passa `instance` como `botName` |
| `src/app/api/webhook24/route.ts` | Saudação dinâmica + `instance` como `botName` |
| `src/app/api/webhook25/route.ts` | Saudação dinâmica + `instance` como `botName` |
| `src/app/api/chat/route.ts` | Usa `BOT_NAME` env var |
| `src/app/api/webhook-leads/route.ts` | System prompt + saudações dinâmicas |
| `src/app/chatbot-app/page.tsx` | `BOT_NAME` + textos dinâmicos |
| `checkpoint.md` | Atualizado |
| `memorias.md` | Atualizado |

### Build
- `npm run build` — compilado com sucesso ✅

### Commits realizados nesta sessão:
| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `9431f06` | `feat: bot name dinamico por instancia + empresa do banco` | 30/05/2026 |

---

## Sessão: 30/05/2026 — Mitigação POST /api/tickets (Rate Limit + CPF + Honeypot)

### Contexto
Teste de penetração identificou `POST /api/tickets` sem autenticação. Como a rota precisa ser pública (qualquer CPF cadastrado pode abrir chamado), foram aplicadas 3 camadas de mitigação que não bloqueiam usuários legítimos.

### Implementações realizadas:

| # | Camada | Arquivo | Descrição |
|---|--------|---------|-----------|
| 1 | Rate limiting | `src/lib/rate-limit.ts` | Máx 3 chamados/IP a cada 60 min |
| 2 | Honeypot anti-bot | `src/app/chamado/page.tsx` | Campo oculto que bots preenchem |
| 3 | Validação CPF | `src/lib/validation.ts` | Algoritmo oficial de dígitos verificadores |
| 4 | Sanitização | `src/app/api/tickets/route.ts` | Strip HTML, limites de tamanho por campo |
| 5 | Integração | `src/app/api/tickets/route.ts` | Rate limit, honeypot, CPF check no POST |

### Commits realizados nesta sessão:
| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `2410222` | `fix: mitiga criacao de chamados anonimos - rate limit por IP, validacao CPF, honeypot anti-bot e sanitizacao` | 30/05/2026 |
| 2 | `e1c1c3f` | `docs: atualiza memorias e checkpoint com mitigacao de seguranca no POST /api/tickets` | 30/05/2026 |

---

## Sessão: 30/05/2026 — Proteção de Login (CAPTCHA após 3 tentativas falhas)

### Contexto
Vulnerabilidade 4.5-4.6 do relatório: força bruta no login sem rate limiting. Solução: CAPTCHA (Cloudflare Turnstile) exigido após 3 tentativas falhas no mesmo email, sem bloquear a conta permanentemente.

### Implementações realizadas:

| # | Mudança | Arquivos |
|---|---------|----------|
| 1 | Rastreio de tentativas falhas por email | `src/lib/rate-limit.ts` |
| 2 | Validação Turnstile no authorize do NextAuth | `src/lib/nextauth.ts` |
| 3 | Refatoração: authOptions centralizado (remove duplicação) | `src/app/api/auth/[...nextauth]/route.ts` |
| 4 | Widget Turnstile condicional no frontend | `src/app/login/page.tsx` |
| 5 | Tipagem global window.turnstile | `src/types/next-auth.d.ts` |
| 6 | Variáveis de ambiente Turnstile | `.env.example` |

### Commits realizados nesta sessão:
| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `d3755d2` | `feat: captcha apos 3 tentativas de login falhas com Cloudflare Turnstile + refatora authOptions eliminando duplicacao` | 30/05/2026 |

---

## Sessão: 02/06/2026 — Webhook26 + useIA3.ts + Prompt Personalizado por Empresa

### Resumo
Criação do webhook26 que utiliza prompt de IA personalizado por empresa, configurado via formulário no cadastro da empresa. Inclui logo upload via Supabase, geração de prompt com OpenAI a partir de 3 descrições (apresentação, atendimento, avisos), e lazy initialization da OpenAI em todos os módulos para permitir build sem API key.

### Arquivos criados
| Arquivo | Descrição |
|---------|-----------|
| `src/lib/useIA3.ts` | Módulo IA com botIA3(), getEmpresaConfig(), montarSystemPrompt(), detectFileIntent() — lazy OpenAI |
| `src/app/api/webhook26/route.ts` | Webhook que carrega empresa.botPrompt via CPF lookup |
| `src/app/api/empresa/prompt/route.ts` | API GOD GET/POST/PUT/DELETE para gerenciar prompts do bot |
| `src/app/api/upload/route.ts` | Endpoint genérico de upload para Supabase (logo) |

### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `prisma/schema.prisma` | 6 novos campos em `empresa`: logoUrl, botName, botPresentation, botServiceDesc, botAvisosDesc, botPrompt |
| `src/app/api/empresa/route.ts` | POST/GET/PUT incluem novos campos |
| `src/app/(atendimento)/empresa/create/page.tsx` | Logo upload + bot config + gerar prompt com IA |
| `src/app/(atendimento)/empresa/page.tsx` | Logo, badge "Bot configurado", modal de bot config + botão Usuários |
| `src/lib/useIA.ts` | Lazy initialization OpenAI |
| `src/lib/useIA2.ts` | Lazy initialization OpenAI |
| `src/app/api/webhook-leads/route.ts` | Lazy initialization OpenAI |

### Commits realizados nesta sessão:
| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `5afb8c4` | `feat: webhook26 com useIA3.ts - prompt personalizado por empresa, logo upload, e geracao de prompt com IA` | 02/06/2026 |

### Build
- `npm run build` — compilado com sucesso ✅

---

## Sessão: 10/06/2026 — Módulo Oficina: Frontend de Manutenção de Veículos

### Contexto
Criação do módulo `oficina` para empresa de transporte público. Motoristas registram pedidos de manutenção de veículos ao final do turno. Frontend apenas (sem API). Reaproveita modelo `Chamado` existente.

### Arquivos modificados (13):

| Arquivo | Mudança |
|---------|---------|
| `src/app/(modulo-oficina)` → `src/app/oficina` | Renomeado para resolver conflito de rotas com `(modulo-corporativo)` |
| `oficina/(atendimento)/layout.tsx` | Título "Oficina / Manutenção de Veículos" |
| `oficina/(atendimento)/components/sidebar.tsx` | Menus com prefixo `/oficina/...`; Solicitações, Motoristas |
| `oficina/(atendimento)/components/modal_tandimento.tsx` | Adaptado labels, tipo via `categoria` |
| `oficina/(atendimento)/all-tickets/page.tsx` | Colunas p/ manutenção; mapping API → tipo/veiculo/matricula |
| `oficina/(atendimento)/all-tickets/kanban-board.tsx` | Colunas renomeadas, badge tipo |
| `oficina/(atendimento)/cpfs/page.tsx` | State `matricula`, label "Matrícula", botão "Cadastrar CPF" mantido |
| `oficina/(atendimento)/dashboards/page.tsx` | Descrição "manutenção de veículos" |
| `oficina/(atendimento)/error.tsx` | "Erro na área da oficina" |
| `oficina/chamado/page.tsx` | **Reescrito** — formulário manutenção veicular; fix LuCheckCircle → LuCheck |
| `oficina/consulta/page.tsx` | Busca por matrícula (6 dígitos) |
| `oficina/consulta/[ticket]/page.tsx` | Exibe dados de manutenção |
| `src/types/chamado.ts` | Adicionados campos opcionais: categoria, veiculo, matricula, discriminacao, tipo |
| `memorias.md` | Adicionada seção 46 detalhando o módulo oficina |
| `checkpoint.md` | Registro desta sessão |

### Correções durante build
| Erro | Causa | Solução |
|------|-------|---------|
| Rotas conflitantes | `(modulo-oficina)` e `(modulo-corporativo)` resolvem mesmas URLs | Renomeado para `oficina` (sem parênteses) → URLs `/oficina/...` |
| `LuCheckCircle` não existe | Ícone inexistente em `react-icons/lu` | Substituído por `LuCheck` |
| `categoria` não existe no tipo `Chamado` | Type `@/types/chamado` não tinha campo | Adicionado como opcional |
| `setCpf`/`fetchCpfs` não encontrados | State renomeado para `matricula`/`fetchMotoristas` | Ajustado para nomes corretos |
| API não retorna `tipo`/`veiculo`/`matricula` | Dados vêm do modelo `Chamado` (cpf, setor, descricao, prioridade) | Mapping no fetch de `all-tickets` |

---

## Sessão: 10/06/2026 — Webhook-Oficina + Formulário Web para Motoristas

### Objetivo
Criar um canal de comunicação para motoristas de empresa de transporte público registrarem defeitos de veículos via WhatsApp (webhook-oficina) e formulário web (/oficina), sem alterar o schema do Prisma.

### Decisões de arquitetura
- **Sem alteração no Prisma**: dados reutilizam campos existentes do model `Chamado`
- **Matrícula como identificador**: armazenada no campo `cpf` da tabela `cpfs` (já existente)
- **Chamado reutilizado**: `nome` (motorista), `cpf` (matrícula), `descricao` (JSON com função, ônibus, data, defeito), `setor` (setor da empresa), `telefone` (whatsapp)
- **Nova API dedicada**: `/api/oficina/tickets` — POST (criar) + GET (validar matrícula)
- **Nenhuma rota existente foi alterada**

### Arquivos criados

#### `src/app/api/oficina/tickets/route.ts`
- **GET `?matricula=X`**: valida matrícula e retorna nome do motorista + setores da empresa
- **POST**: cria chamado com dados estruturados (funcao, numeroOnibus, data, defeito em JSON na descricao)

#### `src/app/api/webhook-oficina/route.ts`
Fluxo completo do bot WhatsApp para motoristas:
1. **INICIO** → "Digite sua matrícula"
2. **IDENTIFICACAO_MATRICULA** → valida na tabela `cpfs`, busca nome
3. **COLETAR_FUNCAO** → "Qual sua função?"
4. **COLETAR_ONIBUS** → "Número do ônibus?"
5. **COLETAR_DATA** → "Data do ocorrido?"
6. **COLETAR_DEFEITO** → "Descreva o defeito"
7. **CONFIRMAR** → exibe resumo, pergunta confirmação
8. **COLETAR_SETOR** → lista setores da empresa, cria chamado

#### `src/app/oficina/page.tsx`
Formulário web público com 2 etapas:
1. **Etapa 1 (matrícula)**: motorista digita matrícula → valida via GET `/api/oficina/tickets`
2. **Etapa 2 (formulário)**: campos: função, nº ônibus, data, defeito, setor (nome auto-preenchido)
3. **Sucesso**: tela de confirmação

### Regras de negócio
- ✅ Motorista é identificado pela matrícula (armazenada na tabela `cpfs`)
- ✅ Matrícula deve ser cadastrada previamente pelo admin (mesmo fluxo de CPFs)
- ✅ Chamados da oficina aparecem no `/all-tickets` (setor filtrável)
- ✅ Sessão do WhatsApp expira após 2h de inatividade
- ✅ Comandos "sair", "encerrar", "cancelar" funcionam no bot
- ✅ Formulário web é público (sem login), mas apenas matrículas cadastradas funcionam
- ✅ Nenhuma migração ou alteração no Prisma necessária

### Build
- `npm run build` — compilado com sucesso ✅

### Commits realizados nesta sessão:
| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `36d54de` | `feat: modulo oficina - frontend manutencao de veiculos com matricula, tipo de registro e discriminacao` | 10/06/2026 |
| 2 | a ser commitado | `fix: rename modulo-oficina to oficina, fix build errors, update links` | 10/06/2026 |
| 3 | `6633b5a` | `feat: webhook-oficina + formulario web para motoristas de transporte publico registrarem defeitos de veiculos` | 10/06/2026 |
| 4 | `669b1e9` | `docs: atualiza checkpoint e memorias com webhook-oficina e formulario para motoristas` | 10/06/2026 |

### Build
- `npm run build` — compilado com sucesso ✅

---

## Sessão: 11/06/2026 — Documento de Apresentação Comercial

### Objetivo
Criar `apresentação.md` — documento completo de apresentação do sistema NolevelBOT para prospecção de clientes, explicando o que o sistema é, o que faz e como se adapta a diferentes empresas.

### Conteúdo do documento
- Visão geral do sistema
- Funcionalidades (chamados, chatbot WhatsApp, leads, dashboards, avisos, módulo oficina)
- Modelo multi-tenant e personalização por empresa
- Controle de acesso RBAC
- Canais de atendimento (WhatsApp, portal web, chat)
- Casos de uso reais (suporte multi-cliente, transporte público, captura de leads, multi-departamentos)
- Tecnologia, segurança, implantação e evolução

### Commits realizados nesta sessão:
| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `11b0a6e` | `docs: cria apresentacao.md com descricao completa do sistema para prospeccao de clientes` | 11/06/2026 |

---

## Sessão: 11/06/2026 — Sistema de Módulos por Empresa

### Objetivo
Implementar controle de acesso por módulos da empresa. Cada empresa criada pelo GOD pode ter um ou mais módulos habilitados (CORPORATIVO, OFICINA, EVENTOS), e todos os usuários vinculados àquela empresa só acessam os módulos permitidos.

### O que foi feito

#### 1. API `empresa/route.ts` — `modulos` no POST/GET/PUT
- POST aceita `modulos` (array de strings)
- GET retorna `modulos` nos selects (GOD list, empresa por ID, lookup por CPF)
- GET aceita `?id=X` para buscar empresa específica por ID
- PUT aceita `modulos` para atualização

#### 2. Frontend `empresa/create/page.tsx` — Seleção de módulos na criação
- Novos icones: Wrench (OFICINA), Headphones (CORPORATIVO), CalendarCheck (EVENTOS)
- Seção "Módulos da Empresa" com 3 cards clicáveis (toggle on/off)
- Cada card mostra: ícone, nome e descrição do módulo
- Estado visual: selecionado = fundo primary + borda destacada
- `modulos` enviado no body do POST

#### 3. Frontend `empresa/page.tsx` — Exibição e edição de módulos
- Interface `Empresa` estendida com `modulos: string[]`
- Badges coloridos por módulo (azul CORPORATIVO, laranja OFICINA, roxo EVENTOS)
- Edição inline: checkboxes (toggle buttons) para selecionar/desselecionar módulos
- Atualização via PUT com `modulos` no body

#### 4. Sidebar `(atendimento)` — Filtragem por módulos
- `useEffect` busca `/api/empresa?id=X` para carregar módulos da empresa
- `temModulo()` helper: GOD sempre vê tudo; demais users filtram
- Menus CORPORATIVO (Dashboard, Chamados, Avisos, CPFs): só aparecem se empresa tem `CORPORATIVO`
- Menu Oficina: só aparece se empresa tem `OFICINA` + role mínima GESTOR
- Menus de sistema (Usuários, Criar Usuário, Empresas): SEMPRE visíveis baseado na role (não dependem de módulo)

#### 5. Sidebar `oficina` — Filtragem por módulos
- Mesma estrutura: busca módulos via API, `temModulo('OFICINA')` para filtrar
- Menus da oficina (Dashboard, Solicitações, Avisos, Motoristas): só se `OFICINA`
- Menus de sistema (Usuários, Criar Usuário): SEMPRE visíveis

#### 6. Layout `oficina` — Bloqueio de acesso
- Verifica se empresa tem módulo OFICINA (fetch via API)
- GOD passa direto; não-GOD sem OFICINA é redirecionado para `/dashboards`
- Spinner de loading enquanto verifica
- Se não autorizado, retorna null (não renderiza nada)

### Arquivos modificados (6)
| Arquivo | Mudança |
|---------|---------|
| `src/app/api/empresa/route.ts` | POST/GET/PUT com modulos; GET por ID |
| `src/app/(atendimento)/empresa/create/page.tsx` | Seletor de módulos na criação |
| `src/app/(atendimento)/empresa/page.tsx` | Badges e edição de módulos |
| `src/app/(atendimento)/components/sidebar.tsx` | Filtra menus por módulos |
| `src/app/oficina/(atendimento)/components/sidebar.tsx` | Filtra menus por módulos |
| `src/app/oficina/(atendimento)/layout.tsx` | Bloqueia acesso sem módulo OFICINA |

### Build
- `npm run build` — compilado com sucesso ✅

### Regras de negócio
- ✅ GOD sempre vê todos os módulos (bypass total)
- ✅ Empresa sem módulo CORPORATIVO: não vê Dashboard, Chamados, Avisos, CPFs
- ✅ Empresa sem módulo OFICINA: não vê link para Oficina; não acessa /oficina/*
- ✅ Menus de sistema (Usuários, Criar Usuário, Empresas) são sempre visíveis por role
- ✅ Controle tanto no frontend (sidebar) quanto no backend (layout redirect)
- ✅ Nenhuma alteração no Prisma schema (migration já executada pelo usuário)
- ✅ Nenhuma alteração em rotas de API existentes (além da empresa)
- ✅ `prisma generate` executado para sincronizar tipos

---

## Sessão: 11/06/2026 — Sidebar Único com Accordion de Módulos

### Objetivo
Substituir sidebars separadas (`corporativo/(atendimento)/components/sidebar.tsx` e `oficina/(atendimento)/components/sidebar.tsx`) por uma sidebar única em `src/app/components/sidebar.tsx` que mostra botões accordion para cada módulo que a empresa do usuário possui.

### O que foi feito

#### 1. Componentes compartilhados movidos
- `cardUser.tsx` movido de ambos os módulos para `src/app/components/cardUser.tsx` (import atualizado para `@/app/components/modal-edit-user`)
- `modal-edit-user.tsx` movido para `src/app/components/modal-edit-user.tsx`
- Sidebars antigas, cardUser e modal-edit-user deletados de ambos os módulos

#### 2. Sidebar único (`src/app/components/sidebar.tsx`)
- **Accordion por módulo**: cada módulo (CORPORATIVO, OFICINA) tem um botão expansível
- **Busca de módulos**: fetch `/api/empresa?id=X` no mount para saber quais módulos a empresa possui
- **Abertura automática**: o módulo cuja rota está ativa abre automaticamente; se nenhum, o primeiro disponível abre
- **Múltiplos abertos**: usuário pode expandir vários módulos simultaneamente
- **Ícones**: LuHeadphones (Corporativo), LuWrench (Oficina) nos accordions; LuChevronDown/Right para indicar estado
- **Sub-menus indentados**: links dentro de cada módulo com borda lateral e padding
- **Sistema de menus**: Usuários, Criar Usuário, Empresas aparecem DENTRO de cada módulo (rotas específicas: `/corporativo/...` e `/oficina/...`)
- **Usuários/Criar Usuário**: role-based (GOD/ADMIN/GESTOR)
- **Empresas**: apenas GOD
- **Card de usuário**: exibido no footer com foto, nome, email, role, botões de config/logout
- **Versão**: exibida no rodapé via `packageJson.version`
- **Responsivo**: botão hamburger em mobile, overlay escuro, sidebar desliza

#### 3. Layouts atualizados
- `corporativo/(atendimento)/layout.tsx`: importa `Sidebar` de `@/app/components/sidebar`
- `oficina/(atendimento)/layout.tsx`: importa `Sidebar` de `@/app/components/sidebar`

### Arquivos criados
| Arquivo | Descrição |
|---------|-----------|
| `src/app/components/sidebar.tsx` | Sidebar único com accordion de módulos |
| `src/app/components/cardUser.tsx` | Card de usuário compartilhado |
| `src/app/components/modal-edit-user.tsx` | Modal de edição de perfil compartilhado |

### Arquivos deletados
| Arquivo |
|---------|
| `src/app/corporativo/(atendimento)/components/sidebar.tsx` |
| `src/app/corporativo/(atendimento)/components/cardUser.tsx` |
| `src/app/corporativo/(atendimento)/components/modal-edit-user.tsx` |
| `src/app/oficina/(atendimento)/components/sidebar.tsx` |
| `src/app/oficina/(atendimento)/components/cardUser.tsx` |
| `src/app/oficina/(atendimento)/components/modal-edit-user.tsx` |

### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `src/app/corporativo/(atendimento)/layout.tsx` | Importa Sidebar de `@/app/components/sidebar` |
| `src/app/oficina/(atendimento)/layout.tsx` | Importa Sidebar de `@/app/components/sidebar` |

### Build
- `npm run build` — compilado com sucesso ✅

---

## Sessão: 11/06/2026 — Login Unificado + Seletor de Módulos (/login + /dashboard)

### Objetivo
Unificar o login fora dos módulos corporativo/oficina: usuário faz login em `/login`, é redirecionado para `/dashboard` onde vê cards dos módulos que sua empresa possui, clica e acessa o módulo desejado.

### Mudanças realizadas

#### 1. Página `/login` unificada (`src/app/login/page.tsx`)
- Baseada na versão corporativo, imports com `@/app/components/back.tsx`
- Redirect para `/dashboard` em vez de `/corporativo/dashboards`
- CAPTCHA Turnstile mantido (após 3 tentativas falhas)

#### 2. Página `/dashboard` — Seletor de módulos (`src/app/dashboard/page.tsx`)
- Se não logado, redirect para `/login`
- Fetch `/api/empresa?id=X` para saber módulos disponíveis
- GOD vê todos os módulos (CORPORATIVO, OFICINA, EVENTOS)
- Cards clicáveis com ícone, nome e descrição por módulo
- Loading state (spinner) e empty state ("Nenhum módulo disponível")
- Header com logo + ThemeToggle, footer com versão

#### 3. Login antigos deletados
- `src/app/corporativo/login/page.tsx` — removido
- `src/app/oficina/login/page.tsx` — removido

### Build
- `npm run build` — compilado com sucesso ✅ (55 páginas, zero erros)

### Commits
| # | Hash | Mensagem | Data |
|---|------|----------|------|
| 1 | `a2191b5` | `feat: login unificado em /login + seletor de modulos em /dashboard` | 11/06/2026 |
| 2 | `7c5ad70` | `docs: atualiza checkpoint com hash a2191b5` | 11/06/2026 |
| 3 | `bd01923` | `fix: atendente nao herdava empresa do admin - fallback ao banco se session.empresaId estiver vazio` | 11/06/2026 |
| 4 | `6d09f6d` | `fix: admin nao conseguia corrigir atendente sem empresaid - put permite edicao e auto-preenche` | 11/06/2026 |

### Pendentes antes do commit:
- ~~`src/app/api/users/route.ts` — Adicionar fallback ao banco se `session!.empresaId` estiver vazio~~ ✅
- ~~`memorias.md` — Seção 52 documentando o fix~~ ✅
- ~~`checkpoint.md` — Atualizado~~ ✅
- ~~`npm run build` — compilado com sucesso ✅~~ ✅

---

## Sessão: 11/06/2026 — Fix Atendente sem empresaId (parte 2)

### Pendentes:
- ~~`src/app/api/users/route.ts` — PUT: validação tolera null, auto-fill empresaId~~ ✅
- ~~`memorias.md` — Seção 53 documentando o fix~~ ✅
- ~~`checkpoint.md` — Atualizado~~ ✅
- ~~`npm run build` — compilado com sucesso ✅~~ ✅

---

## Sessão: 11/06/2026 — Fix redirects /dashboards → /dashboard

### Pendentes:
- ~~`src/app/oficina/(atendimento)/layout.tsx` — redirect: /dashboards → /dashboard~~ ✅
- ~~`src/app/corporativo/(atendimento)/empresa/page.tsx` — redirect: /dashboards → /dashboard~~ ✅
- ~~`src/app/corporativo/(atendimento)/empresa/create/page.tsx` — redirect: /dashboards → /dashboard~~ ✅
- ~~`src/app/corporativo/(atendimento)/empresa/[id]/usuarios/page.tsx` — redirect: /dashboards → /dashboard~~ ✅
- ~~`src/app/corporativo/(atendimento)/usuarios/page.tsx` — redirect: /dashboards → /dashboard~~ ✅
- ~~`memorias.md` — Seção 54 documentando o fix~~ ✅
- ~~`checkpoint.md` — Atualizado~~ ✅
- ~~`npm run build` — compilado com sucesso ✅~~ ✅

---

## Sessão: 11/06/2026 — Coleta opcional foto + avisos específicos + ATENDENTE redirect + nome empresa

### Pendentes antes do commit:
- ~~`src/app/api/webhook-oficina/route.ts` — Coleta opcional de foto (PERGUNTAR_ANEXO + COLETAR_MIDIA)~~ ✅
- ~~`src/app/api/webhook-oficina/route.ts` — Separar avisos específicos (matrícula) dos gerais (veículo)~~ ✅
- ~~`src/app/components/sidebar.tsx` — Dashboard invisível para ATENDENTE~~ ✅
- ~~`src/app/oficina/(atendimento)/usuarios/page.tsx` — Redirect ATENDENTE → /oficina/all-tickets~~ ✅
- ~~`src/app/corporativo/(atendimento)/usuarios/page.tsx` — Redirect ATENDENTE → /corporativo/all-tickets~~ ✅
- ~~`src/app/api/users/route.ts` — GET inclui Empresa.nome no select~~ ✅
- ~~`src/app/corporativo/(atendimento)/usuarios/page.tsx` — Exibir nome da empresa~~ ✅
- ~~`src/app/oficina/(atendimento)/usuarios/page.tsx` — Exibir nome da empresa~~ ✅
- ~~`memorias.md` — Seção 55 documentando as mudanças~~ ✅
- ~~`checkpoint.md` — Atualizado~~ ✅
- ~~`npm run build` — compilado com sucesso ✅~~ ✅
