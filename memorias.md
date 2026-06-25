# MEMÓRIAS DO PROJETO — NolevelBOT

# nas melhorias mapeadas- quando fizer não esquecer de colocar concluido na pagina

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

### Mudança: Removidos arquivos query.js e query.sql
**Autor:** Usuário
**Arquivos:** `query.js` (deletado), `query.sql` (deletado)
**Data:** 20/06/2026
**Descrição:** Arquivos de consulta direta ao banco (Prisma + SQL) removidos do repositório. Eram usados para debug/teste manual e não fazem parte do código de produção.

### Mudança: Criado manual da plataforma (data/regras.md)
**Autor:** Vibecode
**Arquivos:** `data/regras.md` (novo)
**Data:** 20/06/2026
**Descrição:** Criado arquivo `data/regras.md` com todas as regras da plataforma: visão geral, regras de cadastro baseadas nas validações Zod (email, senha, CPF, CNPJ), regras de acesso RBAC (papéis, hierarquia, permissões, escopo de dados), sistema de módulos, status de chamados, prioridades, canais de atendimento, segurança e temas. Funciona como manual de uso completo da plataforma.

## Registro de Autoria

### Mudança: Botão "Concluído" no chamado corporativo faz reload em vez de fechar janela
**Autor:** Usuário
**Arquivos:** `src/app/corporativo/chamado/page.tsx`
**Data:** 20/06/2026
**Descrição:** O botão na tela de sucesso após criar chamado usava `window.close()` (que não funciona em abas abertas por navegação direta). Alterado para `window.location.reload()`, permitindo que o usuário faça novo chamado sem precisar navegar manualmente.

### Mudança: Login movido para a raiz (/)
**Autor:** Usuário
**Arquivos:** `src/app/page.tsx`, `src/app/login/page.tsx` (deletado)
**Data:** 12/06/2026
**Descrição:** A página de login foi movida de `/login` para `/` (raiz). O arquivo `src/app/login/page.tsx` foi deletado e seu conteúdo copiado para `src/app/page.tsx`, substituindo a landing page original.

### Mudança: Dashboard oficina enriquecido (melhores veiculos, correlacao, reincidencia, sazonalidade, tempo por defeito)
**Autor:** Vibecode
**Arquivos:** `src/app/api/dashboards/route.ts`, `src/app/oficina/(atendimento)/dashboards/page.tsx`
**Data:** 15/06/2026
**Descrição:**
- **API (`/api/dashboards`):**
  - Adicionado `melhoresVeiculos` (veículos com menos ocorrências, ordem crescente).
  - Adicionado `correlacaoDefeitoVeiculo` (cruzamento: para cada defeito, lista veículos afetados).
  - Adicionado `tempoMedioPorDefeito` (média de horas para resolver cada tipo de defeito).
  - Adicionado `reincidenciaStats` (mesmo veículo + mesmo defeito em até 15 dias, com contagem de ocorrências e intervalo).
  - Adicionado `sazonalidadeDefeitos` (defeitos agrupados por mês para identificar padrões sazonais).
- **Frontend (`oficina/dashboards/page.tsx`):**
  - Novo card "Tempo Médio por Defeito" (gráfico de barras horizontal).
  - Novo card "Melhores Veículos" (gráfico de barras com veículos de menor incidência).
  - Novo card "Reincidência (<=15dias)" (tabela com veículo, defeito, ocorrências e intervalo).
  - Nova seção "Sazonalidade de Defeitos" (tabela multi-mês com top 5 defeitos por mês).
  - Novo grid "Correlação Defeito x Veículo" (cards dinâmicos mostrando quais veículos sofrem cada defeito).
  - CSV e PDF atualizados com todos os novos indicadores.

### Mudança: Indicadores do dashboard corporativo enriquecidos (tickets_evitados, tempo médio detalhado, comparativo avisos vs evitados)
**Autor:** Vibecode
**Arquivos:** `src/app/api/dashboards/route.ts`, `src/app/corporativo/(atendimento)/dashboards/page.tsx`
**Data:** 15/06/2026
**Descrição:**
- **API (`/api/dashboards`):**
  - Adicionada query a `tickets_evitados` (filtrada por `empresaId` e `periodo`) com try-catch para não quebrar se a tabela não existir.
  - Adicionados `tempoMedioDiario` (resolvidos em <= 1 dia), `tempoMedioSemanal` (<= 7 dias), `tempoMedioMensal` (<= 30 dias).
  - Adicionados `totalEvitados`, `totalAvisos`, `taxaAutomacao` (evitados / (evitados + chamados) * 100), `economiaHoras` (evitados * tempoMedio).
  - Adicionado `evitadosPorMotivo` (top motivos que o bot resolveu).
  - Adicionado `comparativoAvisos` (agrupamento mensal de avisos criados vs chamados evitados para correlação).
  - Helpers `inPeriodo()` e `getMonthKey()` para filtrar/agrupar por período de forma consistente.
- **Frontend (`dashboards/page.tsx`):**
  - 8 KPIs na primeira linha (4 originais + 4 novos: Chamados Evitados, Avisos Ativos, Taxa de Automação, Economia).
  - Card de Tempo Médio reformulado: exibe média geral + breakdown diário/semanal/mensal.
  - Novo gráfico "Avisos vs Chamados Evitados" (barras agrupadas, recharts com Legend).
  - Nova tabela "Top Motivos Evitados".
  - Card explicativo da relação entre avisos e chamados evitados.
  - CSV e PDF atualizados com todas as novas métricas.

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

### Mudança: Limpeza de arquivos obsoletos
**Autor:** Usuário
**Arquivos:** `.github/workflows/deploy-homologa.yml` (deletado), `apresentação.md` (deletado), `checkpoint.md` (deletado), `control` (deletado), `landing.json` (deletado), `next.config.ts.txt` (deletado), `recomendações.md` (deletado), `pedidos.md` (esvaziado), `ideias.md` (esvaziado)
**Data:** 17/06/2026
**Descrição:** Limpeza geral de arquivos não utilizados e obsoletos. Inclui workflow de CI/CD antigo, apresentação, checkpoint, landing page JSON, config backup, recomendações, e esvaziamento dos registros de pedidos e ideias.

### Mudança: Remove src/proxy.ts obsoleto (duplicata)
**Autor:** Vibecode
**Arquivos:** `src/proxy.ts` (deletado)
**Data:** 17/06/2026
**Descrição:**
- Havia dois arquivos `proxy.ts`: um na raiz (`proxy.ts`, 118 linhas, ativo) e outro em `src/proxy.ts` (43 linhas, obsoleto).
- O root `proxy.ts` é o middleware real do Next.js 16 (rate limiting, proteção `/api-docs`, guard ENABLE_TESTES, brute force).
- O `src/proxy.ts` era uma versão antiga, não importada por nada, sem as features de segurança recentes.
- Deletado `src/proxy.ts`. Build: ✅ sucesso.

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

### Mudança: Fix criação de ADMIN — setor vazio convertido para "all"
**Autor:** Vibecode
**Arquivos:** `src/app/api/users/route.ts`
**Data:** 18/06/2026
**Descrição:**
- Quando um GOD cria um usuário ADMIN, o frontend envia `setor = ""` (ADMIN não tem setor específico).
- A validação Zod (`z.string().min(1)`) rejeitava string vazia, resultando em erro `400 "Dados inválidos"`.
- Adicionado guard: se `finalRole === "ADMIN"` e `setor` for vazio, define `setor = "all"` antes da validação.
- Segue a convenção existente no sistema onde ADMIN sem setor exibe "all" na interface.

### Mudança: Melhoria nas mensagens de erro do validateOrError — mostra campo específico
**Autor:** Vibecode
**Arquivos:** `src/lib/validate.ts`
**Data:** 18/06/2026
**Descrição:**
- `validateOrError()` retornava `"Dados inválidos"` genérico sem indicar qual campo falhou.
- Agora extrai o primeiro campo com erro e inclui no toast (ex: `"Dados inválidos — setor: Setor é obrigatório"`), facilitando o debug.

### Mudança: Suite de testes expandida (+34 testes, 169 total)
**Autor:** Vibecode
**Arquivos:** `src/__tests__/rate-limit.test.ts` (novo), `src/__tests__/audit-log.test.ts` (novo), `src/__tests__/smartSearch.test.ts` (novo), `src/__tests__/usedata.test.ts` (novo)
**Data:** 15/06/2026
**Descrição:**
- **rate-limit.test.ts:** 15 testes para checkRateLimit, trackFailedLogin, resetFailedLogin, needsCaptcha, getClientIp — cobre rate limiting e proteção brute force.
- **audit-log.test.ts:** 3 testes para logAcesso com mock de prisma.$executeRawUnsafe — verifica parâmetros corretos, aceitação de nulos e tolerância a falha.
- **smartSearch.test.ts:** 6 testes para obterBaseDeConhecimento com mock de Prisma — CPF não encontrado, empresa não encontrada, sem avisos, com avisos, erro de banco, filtro de expiração.
- **usedata.test.ts:** 10 testes para generateRandomTicket (formato e unicidade), saudacao (4 períodos do dia), checkEmpresaModule (mock de Prisma: módulo presente/ausente/erro).
- Total: 169 testes passando em 8 arquivos (antes 135 em 4 arquivos).

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

### Mudança: Análise completa do sistema e página pública de ideias
**Autor:** Vibecode
**Arquivos:** `ideias.md` (reescrito), `src/lib/ideias-data.ts` (novo), `src/app/ideias/page.tsx` (reescrito), `src/app/ideias/ideias-client.tsx` (novo), `proxy.ts`
**Data:** 17/06/2026
**Descrição:**
- Análise minuciosa do sistema identificando 30+ oportunidades de melhoria em 6 categorias (Segurança, Arquitetura, Performance, UX, Infraestrutura, Testes).
- `ideias.md` reescrito com 32 itens detalhados, organizados por severidade (🔴 CRÍTICO a 🔵 BAIXO) com sugestões de solução e estimativa de esforço.
- `src/lib/ideias-data.ts`: parser do markdown para dados estruturados (severidade, local, problema, sugestão, esforço).
- `src/app/ideias/page.tsx`: server component que lê e parseia `ideias.md`.
- `src/app/ideias/ideias-client.tsx`: componente cliente interativo com:
  - Filtros por severidade (CRÍTICO/ALTO/MÉDIO/BAIXO) e esforço (Pequeno/Médio/Grande)
  - Busca textual por ID, título, local, problema ou sugestão
  - Ordenação por severidade ou esforço
  - Cards expansíveis com detalhes completos
  - Tema claro/escuro via CSS variables do sistema
- `proxy.ts`: `/ideias` adicionado às rotas públicas e ao matcher.
- Build: ✅ sucesso.

### Mudança: SEG-001 — Proteção da rota /api/testes com auth GOD
**Autor:** Vibecode
**Arquivos:** `src/app/api/testes/route.ts`, `src/app/api/testes/login/route.ts`
**Data:** 17/06/2026
**Descrição:**
- `GET /api/testes`: adicionado guard `ENABLE_TESTES !== 'true'` → 404, e `getServerSession` com role GOD → 403.
- `POST /api/testes/login`: adicionado `getServerSession` com role GOD → 403 no início da função.
- Remove vulnerabilidade crítica de RCE (Remote Code Execution) pública.
- Build: ✅ sucesso.

##### Mudanças de Segurança do Usuário (não commitadas):
- **Rate limit:** `applyRateLimit()` adicionado a 23+ rotas de API
- **Upload:** Validação MIME/extension/size + allowlist bucket/folder + rate limit
- **Memórias:** Validação via `x-api-key` + `BOT_API_KEY` em `/api/memories`
- **General CPF:** API key validation + rate limit
- **Lib upload:** Validação de arquivo também em `uploadFile`/`uploadBuffer`
- **usedata.ts:** `getMemoria()`/`saveMemoria()` enviam `x-api-key`
- **Página ideias:** Status badges (✅/🔄) + opacidade para concluídos
- **Arquivos deletados:** `src/proxy.ts` (duplicata), `landing.json`, `next.config.ts.txt`, `recomendações.md`, `checkpoint.md`, `apresentação.md`, `control`, `.github/workflows/deploy-homologa.yml`

### Mudança: SEG-004 — CPF obrigatório em /api/quadro-avisos/mostrar-avisos
**Autor:** Vibecode
**Arquivos:** `src/app/api/quadro-avisos/mostrar-avisos/route.ts`, `ideias.md`
**Data:** 17/06/2026
**Descrição:**
- Rota pública retornava todos os avisos do banco quando chamada sem CPF.
- CPF agora é obrigatório (400 se ausente, 404 se CPF não encontrar empresa).
- Remove risco de exposição de dados internos de todas as empresas.
- `ideias.md` atualizado com status dos itens de segurança concluídos (tabelas com coluna Status).
- Build: ✅ sucesso.

### Mudança: SEG-006 — TTLMap com cleanup de 10 min para sessions em memória
**Autor:** Vibecode
**Arquivos:** `src/lib/ttl-map.ts` (novo), `src/app/api/webhook26/route.ts`, `src/app/api/webhook27/route.ts`, `src/app/api/webhook-oficina/route.ts`, `src/app/api/webhook-leads/route.ts`, `src/app/api/chat/route.ts`, `src/app/api/chat-corporativo/route.ts`, `src/app/api/chat-operacional/route.ts`, `ideias.md`
**Data:** 17/06/2026
**Descrição:**
- Criado `TTLMap` em `src/lib/ttl-map.ts`: wrapper de Map com TTL configurável (10 min), cleanup automático a cada 30s com `setInterval().unref()`.
- Substituídos `new Map()` → `new TTLMap(10 * 60 * 1000)` nos 7 arquivos.
- Removida verificação manual `Date.now() - session.lastInteraction > 2h` (agora automática).
- `ideias.md`: SEG-006 marcado como ✅.
- Build: ✅ sucesso.

### Mudança: SEG-008 — Validação Zod integrada nas rotas de API
**Autor:** Vibecode
**Arquivos:** `src/lib/validate.ts` (novo), `src/lib/validation.ts`, `src/app/api/users/route.ts`, `src/app/api/tickets/route.ts`, `src/app/api/empresa/route.ts`, `src/app/api/leads-network/route.ts`, `src/app/api/send-form/route.ts`, `src/app/api/quadro-avisos/route.ts`, `ideias.md`
**Data:** 17/06/2026
**Descrição:**
- Criado helper `validateOrError(data, schema)` em `src/lib/validate.ts`: usa `safeParse()` do Zod e retorna `NextResponse` com erros padronizados se falhar.
- Adicionados schemas: `sendFormSchema`, `createAvisoSchema`, `updateAvisoSchema`, `updateUserSchema`.
- Aplicado em 7 rotas que recebem input do usuário (POST/PUT), substituindo validações manuais frágeis.
- `ideias.md`: SEG-008 marcado como ✅.
- Build: ✅ sucesso.

### Mudança: Validação de formulário de avisos + remoção userFacil + refactor modal atendimento
**Autor:** Usuário
**Arquivos:** `src/app/components/shared-avisos.tsx`, `src/app/corporativo/userFacil/page.tsx` (deletado), `src/app/corporativo/(atendimento)/components/modal_tandimento.tsx`, `src/app/oficina/chamado/page.tsx`, `src/app/api/users/route.ts`, `next.config.ts`, `.gitignore`
**Data:** 19/06/2026
**Descrição:**
- **shared-avisos.tsx:** GOD removido de `podeEscolherSetor` (agora só ADMIN pode escolher setor). Adicionada validação visual no formulário: título (mín 2 caracteres), conteúdo (mín 10 caracteres), duração (mín 1 dia). Botão submit desabilitado se validações falharem. Removido bloco de erro message e botão cancelar.
- **userFacil/page.tsx:** Página de criação rápida de usuário deletada.
- **modal_tandimento.tsx:** `atualizarChamado` refatorado: agora usa o retorno do PUT para atualizar estados, sem fazer segunda requisição GET. Adicionado try/catch e escopo corrigido da variável `descricaoAtualizada`.
- **oficina/chamado/page.tsx:** Adicionado loading state (`searching`) durante validação de matrícula. Tipagem corrigida (`any` → `Chamado`/`avisos`). Mensagem "Matrícula inválida" exibida quando inválida. Overlay de busca com spinner. Botão "Concluído" muda para "Concluir" e faz reload. CSS variables corrigidas (`var(--primary)` → `var(--primary)`).
- **api/users/route.ts:** DELETE agora executa em transação: deleta CPF associado antes de deletar o usuário. Mensagem de sucesso atualizada.
- **next.config.ts:** Uma das URLs do Supabase comentada.
- **.gitignore:** `/app/ideias` adicionado.

### Mudança: SEG-009 — DELETE /api/cpfs seguro contra concorrência
**Autor:** Vibecode
**Arquivos:** `src/app/api/cpfs/route.ts`, `ideias.md`
**Data:** 17/06/2026
**Descrição:**
- `prisma.cpfs.delete({ where: { cpf } })` substituído por `prisma.cpfs.deleteMany({ where: { cpf, empresaId } })`.
- Em cenários de concorrência (TOCTOU entre a verificação e a exclusão), a exclusão agora só afeta registros da mesma empresa.
- `ideias.md`: SEG-009 marcado como ✅.
- Build: ✅ sucesso.

### Mudança: SEG-010 — PUT /api/users/user-active exige senha atual
**Autor:** Vibecode
**Arquivos:** `src/app/api/users/user-active/route.ts`, `ideias.md`
**Data:** 17/06/2026
**Descrição:**
- Se email ou password forem enviados no formData, o campo `currentPassword` é obrigatório.
- A senha atual é validada via `bcrypt.compare()` contra o hash no banco.
- Se inválida, retorna 403 "Senha atual incorreta".
- `ideias.md`: SEG-010 marcado como ✅.
- Build: ✅ sucesso.

### Mudança: Rebranding Nolevel → Skora (texto visível)
**Autor:** Vibecode
**Arquivos:** `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/api-docs/page.tsx`, `src/app/components/sidebar.tsx`, `src/app/corporativo/(atendimento)/components/header.tsx`, `src/app/eventos/(atendimento)/components/header.tsx`, `src/app/oficina/(atendimento)/components/header.tsx`, `src/app/dashboard/page.tsx`, `src/lib/useIA.ts`, `src/lib/useIA2.ts`, `src/lib/useIA3.ts`
**Data:** 16/06/2026
**Descrição:**
- Substituídas todas as ocorrências de "Nolevel" por "Skora" no texto visível da aplicação (títulos, headers, sidebar, login, fallbacks de nome de empresa nos webhooks).
- Mantidas intactas: nomenclaturas de rotas, arquivos, pacotes, variáveis de ambiente, CI/CD e schema do Prisma.
- Build: ✅ sucesso

### Mudança: ARQ-002 — Chat handler unificado com preservação de particularidades
**Autor:** Vibecode
**Arquivos:** `src/lib/chat-handler.ts` (novo), `src/app/api/chat/route.ts`, `src/app/api/chat-corporativo/route.ts`, `src/app/api/chat-operacional/route.ts`
**Data:** 17/06/2026
**Descrição:**
- Os 3 arquivos de chat (~413 linhas cada) compartilhavam ~95% do código, mas com diferenças críticas:
  - **chat** (web): começa com `FlowState.IDENTIFICACAO_CPF`, instrução de motivo simples
  - **chat-corporativo**: começa com `FlowState.INICIO`, instrução de motivo detalhada (AVISO_RESOLVE/PROSSEGUIR_FLUXO)
  - **chat-operacional**: idêntico ao corporativo exceto pela chave de rate limit
- Criado `src/lib/chat-handler.ts` com `handleChatRequest(req, config)` onde `ChatConfig` recebe as 3 diferenças:
  - `rateLimitKey`: string
  - `hasInicioFlow`: boolean
  - `coletarMotivoInstruction?`: string opcional
- Cada `route.ts` virou thin wrapper de ~7 linhas importando o handler
- ~1.235 linhas eliminadas
- Build: ✅ sucesso. Commit: `579227c`

### Mudança: ARQ-003 — Remoção do webhook26 (duplicado do webhook27)
**Autor:** Vibecode
**Arquivos:** `src/app/api/webhook26/route.ts` (deletado), `src/lib/useIA3.ts` (deletado), `src/app/api-docs/page.tsx`
**Data:** 17/06/2026
**Descrição:**
- webhook26 era versão anterior do webhook27, mantido por legado mas sem uso
- `src/app/api/webhook26/route.ts` deletado (já estava unstaged)
- `src/lib/useIA3.ts` deletado (único consumer era webhook26)
- `src/app/api-docs/page.tsx`: entrada do webhook26 removida
- 620 linhas eliminadas
- Build: ✅ sucesso. Commit: `f6c6ac1`

### Mudança: Upload direto ao Supabase via signed URL (bypass 413 Vercel)
**Autor:** Vibecode
**Arquivos:** `src/app/api/upload-signed/route.ts` (novo), `src/lib/upload-client.ts` (novo), `src/app/oficina/chatbot-app/page.tsx`, `src/app/corporativo/chatbot-app/page.tsx`, `src/app/corporativo/(atendimento)/empresa/page.tsx`, `src/app/corporativo/(atendimento)/empresa/create/page.tsx`
**Data:** 22/06/2026
**Descrição:**
- `/api/upload` retornava 413 na Vercel (limite de 4.5MB do hobby plan) porque o upload passava pelo servidor Next.js.
- Criado `/api/upload-signed`: endpoint que valida metadados (bucket, folder, extensão, MIME, tamanho) e gera uma signed URL via `supabase.storage.createSignedUploadUrl()`. O upload do arquivo vai diretamente do cliente para o Supabase, sem passar pelo servidor Next.js, eliminando o limite de tamanho da Vercel.
- Criado `src/lib/upload-client.ts` com `uploadFileDirect()`: helper client-side que obtém a signed URL e faz o PUT direto para o Supabase, retornando a URL pública.
- Atualizados 4 callers: chatbots (oficina + corporativo) e páginas de empresa (edit + create) para usar `uploadFileDirect()` em vez de `/api/upload`.
- `/api/upload` mantido para compatibilidade com possíveis callers não mapeados.
- Build: ✅ sucesso.

### Mudança: Bloqueio inteligente de chamados repetitivos no webhook-corporativo (refinado)
**Autor:** Vibecode
**Arquivos:** `src/app/api/webhook-corporativo/route.ts`
**Data:** 24/06/2026
**Descrição:**
- `verificarChamadoRelacionado` agora carrega memória do usuário (`getMemoria(cpf)`) e passa contexto completo (setor, status, data, descrição) para a IA.
- Prompt enriquecido instrui a IA a considerar tipo de problema, setor, sintomas e continuidade.
- Fix: verificação movida para ANTES do bloco `semAvisos`, rodando em todos os fluxos (com ou sem avisos).
- Build: ✅ sucesso.

### Mudança: Bloqueio inteligente de chamados repetitivos no webhook-corporativo
**Autor:** Vibecode
**Arquivos:** `src/app/api/webhook-corporativo/route.ts`
**Data:** 24/06/2026
**Descrição:**
- Substituída função `verificarChamadosAbertos` por `verificarChamadoRelacionado(cpf, motivo)`.
- O usuário descreve o problema normalmente, a IA analisa se o motivo é **relacionado** a algum chamado já aberto.
- Se relacionado: exibe status do chamado existente e bloqueia.
- Se for assunto diferente: permite abertura normalmente.
- A verificação ocorre em `COLETAR_MOTIVO` após a análise de avisos.
- Build: ✅ sucesso.

### Mudança: Comentários descritivos em todas as funções do código
**Autor:** Vibecode
**Arquivos:** ~141 arquivos .ts/.tsx em src/
**Data:** 24/06/2026
**Descrição:**
- Adicionados ~360 comentários de linha única em português (`// descricao`) antes de funções nomeadas, componentes React e funções exportadas.
- Ignorados: arrow functions anônimas, tipos, testes, node_modules, .next e arquivos de controle colaborativo.
- useIA.ts e useIA2.ts removidos (órfãos, zero imports).
- Build: ✅ sucesso. Commit: `cd2df22`

### Mudança: IA corporativa no webhook-corporativo + lib useIA-corporativa
**Autor:** Vibecode
**Arquivos:** `src/lib/useIA-corporativa.ts` (novo), `src/app/api/webhook-corporativo/route.ts` (refatorado), `src/app/api/webhook-corporativo/gerar-memoria.ts` (novo)
**Data:** 24/06/2026
**Descrição:**
- Criada `src/lib/useIA-corporativa.ts`: lib de IA corporativa com prompt enxuto (~50% menos tokens que useIA4), `max_tokens: 140`, suporte a `resumoPersona` (memórias do usuário via getMemoria/saveMemoria), e `detectFileIntent` próprio.
- Refatorado `/api/webhook-corporativo`: agora usa IA (`botIA()`) para interações naturais em vez de respostas fixas. Fluxo completo: identificação por CPF, menu principal, coleta de motivo com análise de avisos (AVISO_RESOLVE), anexo opcional, confirmação e setor. Integrado `getMemoria()` para carregar persona ao validar CPF.
- Criado `gerar-memoria.ts`: gera resumo de 1-2 frases sobre o usuário via OpenAI após criar chamado, salvo em `resumoPersona` via `saveMemoria()`.
- Economia de tokens: prompt mais curto, sem repetição de instruções, `temperature: 0.7` e `max_tokens: 140` (vs 180 do useIA4). Recondução mais agressiva para evitar off-topic.
- Build: ✅ sucesso.