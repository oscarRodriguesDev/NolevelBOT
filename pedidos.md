# Pedidos — Fila de Pendências

> Formato: `- [ ] descrição — status — commit`

## 2026-08-15

- [x] **BUG (fazer amanhã)**: após o cadastro, o sistema não redireciona para a tela onde o usuário coloca os dados de pagamento (`/pagamento?t=<token>`). Fluxo esperado: `/assinar` cria a conta → redireciona para a página de pagamento. — **RESOLVIDO** — (commit desta sessão)
  - **Causa raiz**: a migração `20260814120000_add_asaas_pagamento` NÃO estava registrada na tabela `_prisma_migrations` (as colunas `statusPagamento`/`trialAtivo`/`asaas*` existiam no banco por aplicação manual, mas o Prisma considerava a migração pendente). O `prisma migrate deploy` falhava com `type "statusPagamento" already exists` e o fluxo ficava num estado inconsistente — qualquer intervenção (redeploy/dev) podia quebrar o signup sem `pagamentoUrl`.
  - **Correção**: `prisma migrate resolve --applied 20260814120000_add_asaas_pagamento` → banco 100% consistente (`migrate status`: up to date).
  - **Validação real (servidor dev)**: `POST /api/signup` → 201 + `pagamentoUrl`; `GET /api/empresa/pagamento?t=` → dados da cobrança; `POST /api/empresa/pagamento` → assinatura criada (mock). Página `/pagamento` → HTTP 200.
  - **Melhoria no front** (`src/app/assinar/page.tsx`): se `pagamentoUrl` não vier, agora mostra toast de erro explícito em vez de redirecionar silenciosamente para `/` (`router.push` removido).
  - **Observação**: se o bug ocorreu num ambiente com deploy antigo, basta redeployar o branch `vibecode` no Vercel.
