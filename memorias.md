# Memorias — Decisões e Alterações

> Autoria: VIBECODE

## Sessão 2026-08-14

### Integração Asaas (assinaturas SaaS) + bloqueio por pagamento
- **Schema** (`prisma/schema.prisma`): enum `statusPagamento` (PENDENTE/PAGO/ATRASADO/CANCELADO/REEMBOLSADO) + campos em `empresa`: `statusPagamento` (default PENDENTE), `asaasCustomerId?`, `asaasSubscriptionId?`, `asaasPaymentId?`, `trialAtivo` (default true).
- **Migração**: `20260814120000_add_asaas_pagamento` (criada, NÃO aplicada no banco — aplicar com `npx prisma migrate deploy`).
- **Criado** `src/lib/asaas.ts`: `criarAssinatura` (trial=7, cycle, externalReference=empresaId, cliente por cpfCnpj), `consultarCobranca`, `cancelarAssinatura`, `mapearStatusAsaas`, `isAsaasConfigured`. Sem `ASAAS_API_KEY` → fallback mock (fluxo dev intacto).
- **Criado** `src/app/api/webhooks/asaas/route.ts`: valida token (`Authorization: Bearer` ou `x-asaas-token`), consulta reversa `GET /payments/{id}` (anti-spoofing), idempotência via `TTLMap` (24h), mapeia eventos (PAYMENT_CONFIRMED/RECEIVED→PAGO e trial off; PAYMENT_OVERDUE→ATRASADO; REFUNDED→REEMBOLSADO; CANCELLED/SUBSCRIPTION_CANCELLED→CANCELADO), localiza empresa por externalReference→subscription→customer→payment, invalida cache de módulos.
- **Bloqueio de acesso**: `src/lib/nextauth.ts` — login rejeitado se `statusPagamento ≠ PAGO` e fora do trial (GOD sempre liberado). `src/lib/usedata.ts` `checkEmpresaModule` — módulo só ativo com pagamento ok (PAGO ou trial).
- **Signup** (`src/app/api/signup/route.ts`): nova empresa nasce `PENDENTE` + `trialAtivo: true`; cria assinatura Asaas (fallback mock em dev); falha no Asaas não derruba o signup.
- **Env**: `.env.example` ganhou `ASAAS_API_KEY`, `ASAAS_BASE_URL`, `ASAAS_WEBHOOK_TOKEN` (o `.env` já tinha `ASAAS_API_KEY` e `ASAAS_TOKEN_WEBHOOK`; o código aceita ambos os nomes de token).
- **Testes**: `asaas.test.ts` (6), `asaas-webhook.test.ts` (7), `asaas-bloqueio.test.ts` (5), `usedata.test.ts` atualizado (+bloqueio por pagamento). Total: 308 passando, build ok (70 rotas).
- **Decisão**: durante o trial (`trialAtivo=true`) o acesso é permitido mesmo com `statusPagamento=PENDENTE` (senão o trial não teria utilidade). Bloqueio real vale para ATRASADO/CANCELADO/REEMBOLSADO.

### WhatsApp indisponível nos planos (`/planos`)
- Recurso WhatsApp agora aparece **visualmente desativado** nos cards de planos da página pública `/planos` (`src/app/planos/page.tsx`).
- `montarRecursos()` passou a retornar objetos `{ texto, disponivel }`; WhatsApp sai com `disponivel: false`.
- Na lista de recursos, item indisponível é renderizado com cadeado (`LuLock`), texto legível (sem riscado), badge "Indisponível" e `cursor-not-allowed`.
- Ao clicar no item, dispara `toast` informando: "Abertura de chamados pelo WhatsApp: temporariamente indisponível.".
- Demais recursos continuam com check verde e sem interação.
- **Ajuste pós-revisão**: recurso NÃO é riscado/removido — apenas inativo (cadeado + badge "Indisponível"), mantendo o texto legível.

## Sessão 2026-08-02

### Página de Planos (`/planos`)
- Criada a rota `src/app/planos/page.tsx` com página pública de compra de planos.
- Define 3 planos alinhados à landing page:
  - **Start** — R$ 299,99/mês
  - **Profissional** (destaque "Recomendado") — R$ 699,99/mês
  - **Enterprise** — R$ 989,90/mês
- Valores provisórios e centralizados em `src/lib/planos.ts` (fonte única).
- CTA "Assinar" aponta para `/assinar?plano=<slug>`.
- Usuários logados veem painel de **troca de plano** (upgrade/downgrade simulado).

### Página de Contato (`/contact`)
- Adicionado bloco com botão **"Ver planos e assinar"** que redireciona para `/planos`.

### Fluxo SaaS / Auto-onboarding (assinar)
- **Regras de negócio por plano** centralizadas em `src/lib/planos.ts`:
  - **START**: 1 módulo à escolha, até 5 usuários (gestores+atendentes), bot sem IA (script), abertura de chamados só pelo app.
  - **PROFISSIONAL**: 2 módulos à escolha, até 15 usuários, bot com IA (app + WhatsApp).
  - **ENTERPRISE**: todos os módulos, até 30 usuários, bot com IA, WhatsApp + Telegram (futuro).
  - Usuários que abrem chamados: ilimitados em todos os planos.
- **`POST /api/signup`** (pública): cria empresa + ADMIN em transação atômica. Sem pagamento por enquanto (acesso liberado simulado).
- **`/assinar?plano=<slug>`**: formulário com dados da empresa (nome, CNPJ, setores), escolha de módulos e dados do admin (nome, CPF, senha).
- **Email do admin gerado automaticamente**: `cpf@slug-empresa.com.br` (domínio via `APP_EMAIL_DOMAIN`, default `com.br`).
- **Limite de usuários**: aplicado no `POST /api/users` — conta GESTOR+ATENDENTE; ADMIN e GOD não consomem o limite.
- **Bot sem IA**: `src/lib/bot-script.ts` — respostas determinísticas/script para plano START; decidido via `responderBot` no `chat-handler.ts` com cache do plano na sessão.
- **Troca de plano**: `PUT /api/empresa/plano` (GOD qualquer empresa; ADMIN/GESTOR da própria). Atualiza plano e valida módulos.
- **Schema**: novo enum `plano` (START/PROFISSIONAL/ENTERPRISE) e campo `empresa.plano` default START. Migração `20260802213428_add_plano_empresa`.

### GOD
- Fluxo manual (criar empresa + admin) permanece intacto como opção.

### Painel "Minha Empresa" (ADMIN/GESTOR)
- Criada rota `src/app/minha-empresa/page.tsx` + `layout.tsx` (sidebar + header, sem exigir módulo contratado).
- O ADMIN/GESTOR da própria empresa pode:
  - Ver e copiar as **URLs dos webhooks** dos módulos que comprou.
  - Ver, copiar e **regenerar o token do webhook** (`evolution_token`).
  - Editar dados da empresa (nome, CNPJ, setores, logo) — mesmos campos do GOD, restrito à própria empresa.
  - Configurar provedor BYO (provider, evolution_url, api_key) e o assistente virtual (bot).
- Sidebar: nova seção fixa "Empresa → Minha Empresa" para ADMIN/GESTOR, visível independente dos módulos.
- Backend liberado:
  - `GET /api/empresa?id=` agora retorna `evolution_token` e `api_key` para ADMIN/GESTOR da própria empresa (antes só GOD).
  - `PUT /api/empresa` aceita ADMIN/GESTOR da própria empresa, mas **somente GOD altera `modulos`** (ADMIN/GESTOR mudam módulos via troca de plano).
  - `/api/empresa/prompt` (GET/POST/PUT/DELETE) aceita ADMIN/GESTOR da própria empresa.

### Planos dinâmicos (GOD pode criar/editar/extinguir)
- **Decisão do usuário**: planos saem do código estático e passam a viver na tabela `planos` do banco.
- ADMIN troca de plano apenas comprando/reduzindo (`PUT /api/empresa/plano`); **não edita valores**.
- **Exclusão de plano = extinção agendada (30 dias)**:
  1. GOD solicita via API (action `extinguir`).
  2. Plano fica `ativo=false` imediatamente (não é mais vendável).
  3. Todas as empresas do plano são notificadas via `avisos` (aviso na plataforma).
  4. Após 30 dias (`processarExtincoesVencidas`), empresas são migradas para o plano **mais vantajoso sem aumento de custo** (maior `ordem` com `preco <=` do extinto; senão o mais barato).
  5. GOD pode cancelar (action `cancelar_extincao`) ou forçar exclusão (action `forcar_exclusao`).
- **Destaque**: GOD decide qual plano é "Recomendado" (campo `destaque`).
- **Schema**: model `planos` (slug unique, nome, preco, descricao, maxModulos default -1 = ilimitado, maxUsuarios default 5, botIA, canais[], modulosAutomaticos[], ativo, destaque, ordem, extincaoEm, extincaoAvisadaEm, timestamps, index [ativo, ordem]). `empresa.plano` virou **String** (slug) default `"start"`; enum `plano` removido.
- **Migração**: `20260802192500_add_planos_dinamicos` (cria tabela, seed dos 3 planos com os mesmos valores provisórios, converte `empresa.plano` para slug lowercase, dropa enum).
- **`src/lib/planos.ts`**: agora só TIPOS (`Plano`) e funções PURAS sobre o objeto (`planoDaLinha`, `getModulosDisponiveis`, `validarModulos` com -1/modulosAutomaticos = todos, `dentroDoLimiteDeUsuarios`, `gerarSlug`, `gerarEmailAdmin`). `PLANOS`/`ORDEM_PLANOS`/`planoSlugParaId` removidos.
- **`src/lib/planos-server.ts`** (novo, acessa banco): `getTodosPlanos`, `getPlanosAtivos`, `getPlanoPorSlug`, `getPlanoMigracao`, `processarExtincoesVencidas`, `solicitarExtincao`, `cancelarExtincao`.
- **`src/app/api/planos/route.ts`** (novo): GET público (planos ativos; `?todos=true` GOD; roda `processarExtincoesVencidas` lazy), POST/PUT GOD-only, DELETE GOD-only (actions `extinguir`, `cancelar_extincao`, `forcar_exclusao`).
- **`src/lib/bot-script.ts`**: `PlanoBot = string` (slug); `planoTemBotIA` agora **async** (consulta `planos`, fallback legado PROFISSIONAL/ENTERPRISE). `chat-handler.ts` ajustado.
- **Consumidores refatorados**: `api/signup`, `api/users`, `api/empresa/plano`, `planos/page.tsx` (fetch `/api/planos`, tipo `PlanoApi`, troca com slug minúsculo), `assinar/page.tsx` (fetch `/api/planos`, `useEffect`, early returns), `minha-empresa/page.tsx` (nome do plano via `/api/planos`).
- **UI do GOD**: `src/app/god/planos/page.tsx` — CRUD completo (listar/buscar, criar, editar valores/limites/módulos/canais, toggle destaque, toggle ativo, solicitar extinção com confirmação detalhada, cancelar extinção). Item "Planos" adicionado na sidebar do GOD.
- **Testes**: `src/__tests__/planos.test.ts` reescrito para as funções puras com fixtures (7 testes). Build ok (69 rotas); 288 testes passando (Vitest).

### Acesso do GOD à gestão de planos pela página pública
- A página pública `/planos` agora detecta a role GOD (`useSession`):
  - **GOD** enxerga **todos** os planos (inclui inativos/em extinção via `/api/planos?todos=true`), com badge de status ("Ativo" / "Inativo" / "Extinção dd/mm") no card.
  - Banner "Modo administrador (GOD)" com link para `/god/planos`.
  - Botões **Editar** (→ `/god/planos`) e **Excluir** (solicita extinção em 30 dias via DELETE `/api/planos?id=&action=extinguir`) em cada card.
