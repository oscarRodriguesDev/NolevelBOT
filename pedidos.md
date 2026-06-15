# Pedidos e Solicitações do Usuário

## PED-001: Reforçar segurança RBAC nas rotas administrativas
**Data:** 12/06/2026
**Descrição:** Proteger rotas administrativas dos módulos por role. GOD deve ter visão global de usuários mas sem acesso a cadastros (CPFs), chamados e dashboards de outras empresas. ADMIN vê tudo da própria empresa. GESTOR vê apenas seu setor. ATENDENTE vê apenas chamados do seu setor. Manter regras existentes e melhorar para não falharem.

## PED-002: Dashboard Global para GOD
**Data:** 12/06/2026
**Descrição:** Criar dashboard global do GOD com métricas da plataforma (empresas, usuários, chamados, CPFs, leads) e da própria empresa do GOD. Incluir gráficos (status, roles, setores, empresas, evolução temporal), tabela de empresas com atividade, logs recentes e seção "Minha Empresa".

## PED-003: Seção "Plataforma" na sidebar para GOD
**Data:** 12/06/2026
**Descrição:** Adicionar seção "Plataforma" na sidebar, visível apenas para GOD, com links para Dashboard Global (/god/dashboard) e Empresas (/corporativo/empresa).

## PED-004: Log de acesso no login
**Data:** 12/06/2026
**Descrição:** Salvar log na tabela `logs_de_acesso` toda vez que um usuário fizer login no sistema. Incluir CPF, nome, empresa, módulo (CORPORATIVO como padrão) e ação "login".

## PED-005: Corrigir setor na criação de avisos
**Data:** 12/06/2026
**Descrição:** O campo setor do formulário de avisos deve ser fixo (bloqueado) para GESTOR/ATENDENTE (usa o próprio setor do usuário) e um select com os setores da empresa para ADMIN/GOD. A mesma regra deve ser aplicada no backend (POST e PUT).

## PED-006: Tratamento de rotas inexistentes (404 inteligente)
**Data:** 12/06/2026
**Descrição:** Qualquer rota que não exista deve: se logado → redirecionar para /dashboard (seleção de módulo); se não logado → redirecionar para / (login); como fallback, página de erro 404 customizada com botões para login ou seleção de módulo. Também corrigir proxy.ts que redirecionava para /login (inexistente) e /all-tricks (inexistente).

## PED-007: Exibir "all" para ADMIN sem setor na listagem de usuários
**Data:** 12/06/2026
**Descrição:** Na coluna "Setor" das páginas de listagem de usuários, quando o usuário for ADMIN e não tiver um setor definido (pois herda todos os setores), exibir "all" em vez de campo vazio ou "—".

## PED-008: Upload de fotos e avisos no formulário de oficina e chatbots
**Data:** 12/06/2026
**Descrição:** Adicionar capacidade de enviar foto do problema/documentação no formulário de chamado da oficina e nos chatbots (corporativo e oficina). Também exibir avisos relacionados ou específicos para o usuário quando houver.

## PED-009: Fix redirect loop no proxy (ERR_TOO_MANY_REDIRECTS)
**Data:** 12/06/2026
**Descrição:** Corrigir loop infinito de redirecionamento em `/` quando usuário não autenticado. O proxy redirecionava `!/token` → `/`, e como `/` está no matcher, o proxy interceptava novamente e redirecionava de volta para `/`, infinitamente. A correção adiciona um guard para dar `NextResponse.next()` se pathname === "/" e não há token.

## PED-010: Atualizar rotina de testes — proteção e documentação
**Data:** 12/06/2026
**Descrição:** Atualizar a infraestrutura de testes: adicionar guard `ENABLE_TESTES` no proxy para bloquear `/testes` e `/api/testes` em produção (retornando 404), incluir essas rotas no matcher do proxy, e atualizar o template `testes.md` para refletir o proxy real com lógica de autenticação completa.

## PED-011: Correção de vulnerabilidades — Grupo A (proxy + headers)
**Data:** 13/06/2026
**Descrição:** Implementar correções de segurança do Grupo A do plano de ação:
- A1: Remover header `X-Powered-By` via `poweredByHeader: false` no next.config.ts
- A2: Adicionar headers de segurança (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) via `headers()` no next.config.ts
- A3: Proteger `/api-docs` no proxy.ts — removido de publicRoutes, exige autenticação via JWT token
- A4: Rate limiting para page routes (`/` e `/dashboard`) no proxy.ts com store em memória (60 req/min e 120 req/min respectivamente)
- A5: Bloqueio brute force por IP — tracking de acessos não autenticados a páginas protegidas (20 tentativas a cada 15 min)

## PED-012: Proteger /api/cpfs/general_cpf com API Key (B1)
**Data:** 13/06/2026
**Descrição:** Adicionar autenticação via header `X-API-Key` no GET de `/api/cpfs/general_cpf`. A chave é validada contra a env var `BOT_API_KEY`. Bots existentes precisam enviar o header com a chave configurada no .env.

## PED-013: Atualizar suite de testes para cobrir novas funcionalidades
**Data:** 15/06/2026
**Descrição:** Criar testes para módulos adicionados recentemente que não estavam cobertos:
- `rate-limit.test.ts` — checkRateLimit, trackFailedLogin, resetFailedLogin, needsCaptcha, getClientIp (15 testes)
- `audit-log.test.ts` — logAcesso com parâmetros e tratamento de erro (3 testes)
- `smartSearch.test.ts` — obterBaseDeConhecimento com mocks de Prisma (6 testes)
- `usedata.test.ts` — generateRandomTicket, saudacao, checkEmpresaModule (10 testes)
- Total: 169 testes (antes 135, +34 novos)
