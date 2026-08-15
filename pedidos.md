# Pedidos — Fila de Pendências

> Formato: `- [ ] descrição — status — commit`

## 2026-08-15

- [x] **BUG**: webhook Asaas respondendo `{"error": "Token inválido"}` mesmo com token correto na Vercel. — **RESOLVIDO** — (commit desta sessão)
  - **Causa raiz**: o endpoint só lia o token de `Authorization: Bearer` / `x-asaas-token`. **O Asaas envia o token de autenticação do webhook no header `asaas-access-token`** (docs.asaas.com). O token nunca era encontrado → 401.
  - **Correção** (`src/app/api/webhooks/asaas/route.ts`): aceita `Authorization: Bearer` → `x-asaas-token` → `asaas-access-token` → `asaas_access_token`.
  - **Testes**: `asaas-webhook.test.ts` +1 caso com o header real (`asaas-access-token`, evento `PAYMENT_RECEIVED` → PAGO). **360 passando**, build ok.

- [x] **Feature**: escolha entre **trial grátis de 7 dias** (default, pula pagamento) e **pagamento imediato** no cadastro. Quem já consumiu a degustação não pode usar trial de novo (pagamento obrigatório). — **FEITO** — (commit desta sessão)
  - **Banco**: `empresa.trialUsado` + migração `20260815150000_add_trial_usado` (aplicada via `migrate deploy`; `migrate dev` quebra na shadow por ordem alfabética das migrações históricas).
  - **Signup**: `usarTrial` (default true) — trial não gera `pagamentoUrl`; pagamento gera.
  - **Pagamento**: assinatura Asaas `trial: 0` (cobrança imediata, sem `paymentDelay`).
  - **Front**: checkbox no `/assinar`; banner "trial já utilizado" no `/pagamento`; card "Degustação utilizada" no `minha-empresa`.
  - **Testes**: +6 (`signup-trial.test.ts`), 359 passando, build ok.

- [x] **BUG (fazer amanhã)**: após o cadastro, o sistema não redireciona para a tela onde o usuário coloca os dados de pagamento (`/pagamento?t=<token>`). Fluxo esperado: `/assinar` cria a conta → redireciona para a página de pagamento. — **RESOLVIDO** — (commit desta sessão)
  - **Causa raiz**: a migração `20260814120000_add_asaas_pagamento` NÃO estava registrada na tabela `_prisma_migrations` (as colunas `statusPagamento`/`trialAtivo`/`asaas*` existiam no banco por aplicação manual, mas o Prisma considerava a migração pendente). O `prisma migrate deploy` falhava com `type "statusPagamento" already exists` e o fluxo ficava num estado inconsistente — qualquer intervenção (redeploy/dev) podia quebrar o signup sem `pagamentoUrl`.
  - **Correção**: `prisma migrate resolve --applied 20260814120000_add_asaas_pagamento` → banco 100% consistente (`migrate status`: up to date).
  - **Validação real (servidor dev)**: `POST /api/signup` → 201 + `pagamentoUrl`; `GET /api/empresa/pagamento?t=` → dados da cobrança; `POST /api/empresa/pagamento` → assinatura criada (mock). Página `/pagamento` → HTTP 200.
  - **Melhoria no front** (`src/app/assinar/page.tsx`): se `pagamentoUrl` não vier, agora mostra toast de erro explícito em vez de redirecionar silenciosamente para `/` (`router.push` removido).
  - **Observação**: se o bug ocorreu num ambiente com deploy antigo, basta redeployar o branch `vibecode` no Vercel.
