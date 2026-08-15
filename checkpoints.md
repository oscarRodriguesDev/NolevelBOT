# Checkpoints — Estado da Sessão

## 2026-08-15 (Escolha Trial vs Pagamento imediato)

### Estado final
- **Nova regra de negócio**: no cadastro, o usuário escolhe entre **trial grátis de 7 dias** (default) e **pagamento imediato**. Quem já consumiu a degustação não pode usar trial de novo (pagamento obrigatório).
- **Banco**: novo campo `empresa.trialUsado Boolean @default(false)` (rastreia quem já recebeu a degustação). Migração `20260815150000_add_trial_usado` criada manualmente (o `migrate dev` quebra na shadow database por ordem alfabética das migrações históricas) e **aplicada** via `migrate deploy`. Banco consistente (8 migrações).
- **`POST /api/signup`**: aceita `usarTrial` (default `true`). Com trial → `trialAtivo=true`, `trialUsado=true`, resposta **sem** `pagamentoUrl` (pula pagamento). Sem trial → `trialAtivo=false`, `trialUsado=false`, resposta com `pagamentoUrl`.
- **`POST /api/empresa/pagamento`**: assinatura Asaas agora com `trial: 0` (**pagamento imediato, sem `paymentDelay`**) e `trialAtivo=false` no update. `GET` devolve `trialUsado`/`trialDisponivel`/`trialAtivo`.
- **`src/lib/assinatura.ts`**: `ResumoAssinatura` ganhou `trialUsado`; `GET /api/empresa/assinatura` o devolve.
- **Front `/assinar`**: checkbox "Usar teste grátis de 7 dias" (default marcado). Trial → toast + redirect para `/` (login). Pagamento → redirect para `/pagamento?t=...`. Botão muda o texto conforme a escolha.
- **Front `/pagamento`**: banner "Trial já utilizado — pagamento obrigatório" quando `trialUsado=true`; removida a menção a "trial após a confirmação" (não se aplica mais).
- **Painel `minha-empresa`**: card "Degustação utilizada" quando `trialUsado` e fora do trial.
- **Testes**: `pagamento-api.test.ts` atualizado (trial=0, trialUsado no GET, update com trialAtivo=false) + novo `signup-trial.test.ts` (6 casos: default trial, pagamento imediato, sem campo, plano inativo, CNPJ duplicado). **359 passando** (23 arquivos). **Build**: ok.
- **Validação real (dev :3300)**: signup trial (sem pagamentoUrl) e pagamento imediato (com pagamentoUrl) → GET cobrança com trialDisponivel → POST pagamento ok (mock). Dados de teste removidos.
- **Pendências externas (inalteradas)**: webhook Asaas no painel, `ASAAS_WEBHOOK_TOKEN`/`ASAAS_API_KEY` no Vercel, redeploy do branch `vibecode`.

## 2026-08-15 (BUG do redirect pós-cadastro — RESOLVIDO)

### Estado final
- **Causa raiz do BUG**: a migração `20260814120000_add_asaas_pagamento` NÃO estava registrada na tabela `_prisma_migrations` do banco (Supabase). As colunas (`statusPagamento`, `trialAtivo`, `asaasCustomerId/SubscriptionId/PaymentId`) e o tipo enum existiam por **aplicação manual anterior**, mas o `migrate status` a apontava como pendente → `migrate deploy` falhava (`type "statusPagamento" already exists`) → estado inconsistente podia derrubar o signup sem `pagamentoUrl`.
- **Correção aplicada**: `npx prisma migrate resolve --applied 20260814120000_add_asaas_pagamento`. Agora `migrate status` = "Database schema is up to date!". `prisma generate` executado.
- **Validação real do fluxo (servidor dev :3300, dados de teste criados e removidos do banco)**:
  - `POST /api/signup` → **201** + `pagamentoUrl` `/pagamento?t=<token>` ✅
  - `GET /api/empresa/pagamento?t=` → dados da cobrança (plano/valor/modo/trial) ✅
  - `POST /api/empresa/pagamento` (cartão de teste) → assinatura criada, `ok:true` (mock local, sem `ASAAS_API_KEY`) ✅
  - Página `/pagamento?t=` → HTTP 200 ✅
- **Melhoria no front** (`src/app/assinar/page.tsx`): removido `useRouter`; se `pagamentoUrl` não vier, toast de erro explícito no lugar do redirect silencioso para `/`.
- **Testes**: 353 passando (22 arquivos). **Build**: ok (75 rotas).
- **Pendências restantes (config externa, não código)**:
  - Redeployar o branch `vibecode` no Vercel (garantir código novo em produção/preview).
  - No painel Asaas: apontar webhook para `https://<domínio>/api/webhooks/asaas`.
  - No Vercel: definir `ASAAS_WEBHOOK_TOKEN` (código aceita também `ASAAS_TOKEN_WEBHOOK`).
  - Confirmar `ASAAS_API_KEY` no Vercel (sandbox `$aact_hmlg_...`; se produção, `ASAAS_BASE_URL=https://api.asaas.com/v3`).

## 2026-08-15 (Pagamento real no Asaas — página própria)

### Estado final
- **Alterado** `src/lib/asaas.ts`: `criarAssinatura` real — tokeniza cartão (`POST /creditCards`) + cria assinatura (`POST /subscriptions`) com **valor real do plano** e trial via `paymentDelay`. Antes enviava `value: 0` sem cartão (API rejeitava e o erro era engolido → parecia mock). Novos `getAsaasModo()` e `mascararChave()`. PCI: cartão nunca persistido/logado.
- **Criado** `src/lib/token-pagamento.ts`: token HMAC (`NEXTAUTH_SECRET`, validade 1h) para a página de pagamento pós-signup (sem sessão, sem migração).
- **Alterado** `src/app/api/signup/route.ts`: não cria mais assinatura; retorna `pagamentoUrl` (`/pagamento?t=...`).
- **Criado** `POST/GET /api/empresa/pagamento`: GET devolve dados da cobrança; POST valida cartão e cria a assinatura no Asaas, salvando os ids. Falha do Asaas vira `storeError` + resposta 502 com código rastreável.
- **Criado** `src/app/pagamento/page.tsx`: página própria de pagamento (formulário de cartão com máscaras, cartão de teste da sandbox 5162 3062 1493 2319 · 08/29 · 318, feedback com código de erro).
- **Alterado** `src/app/assinar/page.tsx`: redireciona para a página de pagamento após criar a conta.
- **Criado** `GET /api/asaas/diagnostico` (ADMIN/GOD): modo (mock/sandbox/producao), chave mascarada, teste real da API.
- **Testes**: `asaas.test.ts` (8), `token-pagamento.test.ts` (5), `pagamento-api.test.ts` (9). **353 passando** (Vitest). **Build**: ok (75 rotas).
- **Config Vercel**: `ASAAS_API_KEY` (nome exato). Chave sandbox usa URL default; chave de produção exigiria `ASAAS_BASE_URL=https://api.asaas.com/v3`.
- **Pendência (amanhã — ver `pedidos.md`)**: BUG — após o cadastro, não redireciona para a página de dados de pagamento (`/pagamento?t=...`).
- **Pendente (sessões anteriores, inalterado)**: aplicar migração `20260814120000_add_asaas_pagamento` (`npx prisma migrate deploy`), apontar webhook Asaas p/ `/api/webhooks/asaas` e configurar `ASAAS_WEBHOOK_TOKEN` no Vercel.

## 2026-08-14

### Estado final
- **Criado**: `POST /api/auth/verificar-acesso` — retorna motivo do bloqueio de login por pagamento (ATRASADO/CANCELADO/REEMBOLSADO/PENDENTE) com mensagem amigável; não revela conta inexistente; falha de banco não bloqueia fluxo.
- **Alterado**: `src/app/page.tsx` — login consulta a verificação antes do `signIn` e mostra o motivo específico do bloqueio (sem incrementar falhas/captcha).
- **Alterado**: `src/lib/nextauth.ts` — bloqueio por pagamento não conta mais como senha errada.
- **Testes**: `verificar-acesso.test.ts` (9 testes). **336 passando** (Vitest). **Build**: ok (72 rotas).
- **Pendente (sessões anteriores, inalterado)**: aplicar migração `20260814120000_add_asaas_pagamento` (`npx prisma migrate deploy`) e apontar webhook Asaas p/ `/api/webhooks/asaas`.

## 2026-08-14 (Assinatura/Financeiro)
- **Criado**: `src/lib/assinatura.ts` — cálculo de trial (createdAt + 7d), dias restantes, formatação BR, resumo de assinatura.
- **Criado**: `GET /api/empresa/assinatura` — RBAC ADMIN/GOD; ADMIN só da própria empresa; vencimento da recorrência via Asaas (`nextDueDate` + ciclo).
- **Criado**: `consultarAssinatura` em `src/lib/asaas.ts` (GET /subscriptions/{id}, mock em dev).
- **Alterado**: `src/app/minha-empresa/page.tsx` — seção "Assinatura e Financeiro" visível apenas para ADMIN (plano, status, trial com dias restantes, vencimento/ciclo, avisos de bloqueio).
- **Testes**: `assinatura.test.ts` + `assinatura-api.test.ts` (19 testes). **327 passando** (Vitest). **Build**: ok (71 rotas).
- **Pendente (sessão anterior, inalterado)**: aplicar migração `20260814120000_add_asaas_pagamento` (`npx prisma migrate deploy`) e apontar webhook Asaas p/ `/api/webhooks/asaas`.

## 2026-08-14 (Asaas)
- **Criado**: `src/lib/asaas.ts` — criarAssinatura, consultarCobranca, cancelarAssinatura, mapearStatusAsaas, fallback mock sem API key.
- **Criado**: `src/app/api/webhooks/asaas/route.ts` — token + consulta reversa + idempotência (TTLMap 24h) + mapeamento de eventos + invalida cache de módulos.
- **Alterado**: `prisma/schema.prisma` — enum `statusPagamento` + 4 campos novos em `empresa`.
- **Criada**: migração `20260814120000_add_asaas_pagamento` — **NÃO aplicada** (rodar `npx prisma migrate deploy` antes de subir).
- **Alterado**: `src/lib/nextauth.ts` — bloqueio de login por pagamento (PAGO ou trial; GOD liberado).
- **Alterado**: `src/lib/usedata.ts` — `checkEmpresaModule` considera statusPagamento/trialAtivo.
- **Alterado**: `src/app/api/signup/route.ts` — empresa nasce PENDENTE + trialAtivo=true; cria assinatura Asaas.
- **Alterado**: `.env.example` — vars Asaas documentadas.
- **Testes**: +18 novos (`asaas`, `asaas-webhook`, `asaas-bloqueio`, `usedata` atualizado). **308 passando** (Vitest). **Build**: ok (70 rotas).
- **Pendente**: aplicar migração no banco (`npx prisma migrate deploy`) e apontar o webhook no painel Asaas: `https://<domínio>/api/webhooks/asaas` com token `ASAAS_WEBHOOK_TOKEN`/`ASAAS_TOKEN_WEBHOOK`.

## 2026-08-14 (planos - WhatsApp)
- **Alterado**: `src/app/planos/page.tsx` — recurso WhatsApp dos planos agora aparece inativo (cadeado + badge "Indisponível", texto legível sem riscado) e, ao clicar, exibe toast "temporariamente indisponível". `montarRecursos()` retorna `{ texto, disponivel }`; WhatsApp = `disponivel: false`.
- **Build**: ok (69 rotas). **Testes**: 288 passando (Vitest).

## 2026-08-02

### Estado final
- **Criado**: `src/lib/planos.ts` — fonte única de regras dos planos (módulos, limites de usuário, bot IA, canais, preços).
- **Criado**: `src/lib/bot-script.ts` — bot sem IA (script determinístico) para plano START.
- **Criado**: `src/app/api/signup/route.ts` — auto-onboarding público (empresa + admin em transação).
- **Criado**: `src/app/api/empresa/plano/route.ts` — GET/PUT do plano da empresa (troca de plano).
- **Criado**: `src/app/assinar/page.tsx` — formulário de assinatura (empresa + admin + módulos).
- **Alterado**: `src/app/planos/page.tsx` — CTA para `/assinar`, recursos dinâmicos por plano, painel de troca de plano para logados.
- **Alterado**: `src/app/contact/page.tsx` — botão "Ver planos e assinar" → `/planos` (sessão anterior).
- **Alterado**: `src/app/api/users/route.ts` — limite de usuários GESTOR+ATENDENTE por plano.
- **Alterado**: `src/lib/chat-handler.ts` — `responderBot` decide IA vs script pelo plano da empresa.
- **Alterado**: `prisma/schema.prisma` — enum `plano` + campo `empresa.plano` (default START).
- **Migração aplicada**: `20260802213428_add_plano_empresa`.
- **Testes**: `src/__tests__/planos.test.ts` (8 testes). Build ok; 289 testes passando.
- **Criado**: `src/app/minha-empresa/` — painel do ADMIN/GESTOR com dados da empresa, URLs de webhook, token (copiar/regenerar), provedor BYO e bot.
- **Alterado**: `src/app/api/empresa/route.ts` — GET devolve segredos (token/api_key) para ADMIN/GESTOR da própria; PUT aceita ADMIN/GESTOR da própria (modulos segue GOD-only).
- **Alterado**: `src/app/api/empresa/prompt/route.ts` — GET/POST/PUT/DELETE liberados para ADMIN/GESTOR da própria empresa (helper `autorizarEmpresa`).
- **Alterado**: `src/app/components/sidebar.tsx` — seção fixa "Empresa → Minha Empresa" para ADMIN/GESTOR.
- **Build**: ok (67 rotas). **Testes**: 289 passando (Vitest).

### Planos dinâmicos (GOD CRUD)
- **Criado**: `prisma/migrations/20260802192500_add_planos_dinamicos` — tabela `planos` (seed Start/Profissional/Enterprise), `empresa.plano` String (slug), enum `plano` dropado. Migração aplicada e `prisma generate` ok.
- **Criado**: `src/lib/planos-server.ts` — acesso a banco + fluxo de extinção (agendar/cancelar/processar, migração automática).
- **Alterado**: `src/lib/planos.ts` — virou tipos + funções puras (removido `PLANOS`/`ORDEM_PLANOS`/`planoSlugParaId`).
- **Criado**: `src/app/api/planos/route.ts` — GET público + CRUD GOD + DELETE (extinguir/cancelar_extincao/forcar_exclusao).
- **Alterado**: `src/lib/bot-script.ts` e `chat-handler.ts` — `planoTemBotIA` async consultando banco.
- **Alterado**: consumidores — `api/signup`, `api/users`, `api/empresa/plano`, `planos/page.tsx`, `assinar/page.tsx`, `minha-empresa/page.tsx`.
- **Criado**: `src/app/god/planos/page.tsx` — CRUD de planos (criar/editar/destacar/extinguir em 30 dias/cancelar).
- **Alterado**: `src/app/components/sidebar.tsx` — item "Planos" (`/god/planos`) no bloco GOD.
- **Alterado**: `src/__tests__/planos.test.ts` — reescrito para funções puras (7 testes).
- **Build**: ok (69 rotas). **Testes**: 288 passando (Vitest).
- **Alterado**: `src/app/planos/page.tsx` — GOD vê todos os planos (inativos/em extinção) com badge de status, banner "Modo administrador" → `/god/planos`, botões Editar/Excluir (extinção 30 dias).

### Pendências / próximos passos
- **Checkout real**: acesso é liberado sem pagamento (simulado). Definir gateway (Mercado Pago, Stripe) e fluxo de cobrança.
- **Downgrade**: ao reduzir plano, não está bloqueando usuários acima do limite (apenas impede novas criações). Decidir tratamento.
- **Email automático**: confirmar domínio final (`APP_EMAIL_DOMAIN`) e se deseja `.com` ou `.com.br` como padrão.
- **WhatsApp/Telegram**: liberação por canal conforme plano precisa ser aplicada nos webhooks quando houver checkout real.
- **Migração de empresas em extinção**: validar manualmente o fluxo de 30 dias e a escolha do plano migrado.
- Documentar novos endpoints (`/api/planos`) no `/api-docs`.
