# Checkpoints — Estado da Sessão

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
