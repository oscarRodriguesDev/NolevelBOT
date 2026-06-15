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

<<<<<<< HEAD
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
=======
## PED-009: Validar módulo da empresa nos webhooks (26, 27 e webhook-oficina)
**Data:** 13/06/2026
**Status:** ✅ Concluído
**Descrição:** Cada webhook agora valida se a empresa vinculada ao CPF/matrícula possui o módulo ativo correspondente antes de permitir abertura de chamado:
- webhook26 e 27 → validam módulo CORPORATIVO
- webhook-oficina → valida módulo OFICINA
- Se a empresa não tiver o módulo, o usuário é informado e orientado a usar o canal correto.
- Se a empresa tiver o módulo, o fluxo segue normalmente.

## PED-010: Corrigir loop de redirect (ERR_TOO_MANY_REDIRECTS) no proxy
**Data:** 13/06/2026
**Status:** ✅ Concluído
**Descrição:** Proxy redirecionava usuários sem token de `/` para `/` infinitamente porque a raiz agora é a tela de login. Adicionada condição `&& pathname !== "/"` no redirect de não-autenticado. Também corrigido `token.role` → `token?.role` para TypeScript.

## PED-011: Corrigir erro useHeader em /god/admins
**Data:** 14/06/2026
**Status:** ✅ Concluído
**Descrição:** Página `/god/admins` estava importando `useHeader` do layout `corporativo/(atendimento)`, mas a rota `/god` tem seu próprio layout sem o `HeaderProvider`. Removido o hook e adicionado título inline no JSX.

## PED-012: HeaderContext adicionado ao layout god
**Data:** 14/06/2026
**Status:** ✅ Concluído
**Descrição:** Adicionado `HeaderContext.Provider` com `useHeader()` no layout `/god`. Páginas god/admins e god/usuarios agora usam o hook corretamente. Header visual (Nolevel • titulo + descricao + ThemeToggle) aparece nas páginas god.

## PED-013: Consulta pública de tickets sem autenticação
**Data:** 14/06/2026
**Status:** ✅ Concluído
**Descrição:** As páginas públicas de consulta (corporativo/consulta e oficina/consulta) não funcionavam porque a API `/api/tickets/search` exigia autenticação e aplicava filtro role-based. Agora, buscas por `ticket` ou `cpf` sem sessão são públicas e retornam os chamados diretamente.

## PED-014: Formulário corporativo/chamado adaptado do modelo oficina
**Data:** 14/06/2026
**Status:** ✅ Concluído
**Descrição:** Página /corporativo/chamado reescrita para seguir o mesmo layout/estilo de /oficina/chamado, com CPF formatado, validação ao sair do campo, setores carregados via API, avisos, upload e submit para /api/tickets.

## PED-015: Edição inline de ADMINS em god/usuarios
**Data:** 14/06/2026
**Status:** ✅ Concluído
**Descrição:** Adicionada edição inline (nome e email) para usuários ADMIN na página god/usuarios. GOD pode editar nome e email de qualquer ADMIN de qualquer empresa. Botão de deletar convertido para ícone. Regra de deleção de ADMIN mantida (back-end exige substituto).

## PED-016: Corrigir busca de avisos no smartSearch por CPF
**Data:** 15/06/2026
**Status:** ✅ Concluído
**Descrição:** A função `obterBaseDeConhecimento()` em `smartSearch.ts` estava tentando filtrar `avisos` usando `Empresa: usuario.empresa` (nome da empresa), mas a tabela `avisos` usa `empresaId` (UUID). Corrigido com lookup em duas etapas: 1) busca o nome da empresa em `cpfsLeads.empresa`, 2) busca o ID da empresa em `empresa.nome`, 3) filtra `avisos` por `empresaId`. Também corrigido `consultarLeadPorCpf()` no webhook-leads que fazia auto-requisição HTTP GET para endpoint inexistente — agora consulta Prisma diretamente.

## PED-017: Fix loop no webhook27 — COLETAR_MOTIVO sem avisos não pode ir para MENU_PRINCIPAL
**Data:** 15/06/2026
**Status:** ✅ Concluído
**Descrição:** Webhook27 entrava em loop quando o usuário descrevia o problema no estado COLETAR_MOTIVO e não havia avisos cadastrados. A IA não recebia as instruções de PROSSEGUIR_FLUXO (bloco instrucaoAvisos pulado quando sem avisos), seguia a reconducao (apresentar menu) e o else do webhook setava MENU_PRINCIPAL. Fix: quando não há avisos, skipping a análise da IA e indo direto para PERGUNTAR_ANEXO.
>>>>>>> ab2e515b19cde2af985ada629608206a6c43fddf
