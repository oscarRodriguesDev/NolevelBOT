# Pedidos — Fila de Pendências

> Formato: `- [ ] descrição — status — commit`

## 2026-08-15

- [ ] **BUG**: webhook respondeu `{"error": "Token inválido"}` mesmo com o token atualizado na Vercel (pagamento `pay_72hi1vjm57sda6ok` CONFIRMED). — **DIAGNÓSTICO ADICIONADO, aguardando redeploy** — (commit desta sessão)
  - **Descoberta**: o webhook só existe no branch `vibecode`; o fix do header `asaas-access-token` (`479a670`) **não está na `main`** (que não deve ser alterada). Deploy é via `vibecode`.
  - **Causa provável**: deploy atual na Vercel anterior ao `479a670` → código não lê o header `asaas-access-token` → token vazio → 401.
  - **Diagnóstico adicionado**: 401 diferenciado ("Token do webhook não configurado no servidor" / "Token não enviado (header asaas-access-token ausente)" / "Token inválido"), log com hashes, `trim()` no token, e `GET /api/webhooks/asaas` com `codigoVersao: "v2-header-asaas-access-token"` + `tokenAmostra`/`tokenHash`.
  - **Ação do usuário**: **Redeploy do `vibecode` na Vercel** → abrir `https://<domínio>/api/webhooks/asaas` → confirmar `codigoVersao: "v2-header-asaas-access-token"` → re-testar o webhook.

- [x] **BUG**: `POST /api/empresa/pagamento` retornando 502 no Vercel (pagamento real não destrava). — **RESOLVIDO** — (commit desta sessão)
  - **Causa raiz**: tokenização Asaas usava endpoint errado (`POST /creditCards` → 404). O correto é `POST /creditCard/tokenizeCreditCard` (v3), que exige `remoteIp` (IP do cliente) e `creditCardHolderInfo` completo (postalCode válido, addressNumber, phone). Resposta retorna `creditCardToken` (não `id`).
  - **Correção**: `src/lib/asaas.ts` (rota + remoteIp + titularAddressNumber + `creditCardToken || id`), `src/app/api/empresa/pagamento/route.ts` (valida titular + captura remoteIp do cliente), `src/app/pagamento/page.tsx` (cartão de teste `4444 4444 4444 4444` · 12/27 · 123 + seção "Dados do Titular").
  - **Validação E2E real**: tokenização 200 → assinatura `sub_hlvi5poh2zryl6zf` ACTIVE (trial 0) → cobrança `pay_s9upz0k475cu4gw5` **CONFIRMED** → empresa **PAGO**. Dados de teste limpos.
  - **Testes**: `asaas.test.ts` + `pagamento-api.test.ts` atualizados. **361 passando**, build ok.
  - **Pendência externa**: redeploy `vibecode` na Vercel + `ASAAS_WEBHOOK_TOKEN` novo + URL do webhook real (não trycloudflare).

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
