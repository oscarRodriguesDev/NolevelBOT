# Pedidos e Solicitações do Usuário

## SEG-009: DELETE /api/cpfs pode deletar CPF de outra empresa
**Data:** 17/06/2026
**Status:** ✅ Concluído
**Commit:** `0ac5cbe`
**Descrição:** `prisma.cpfs.delete({ where: { cpf } })` sem filtro de `empresaId` — em concorrência podia deletar CPF de outra empresa. Substituído por `prisma.cpfs.deleteMany({ where: { cpf, empresaId } })`.

## SEG-008: Nenhuma rota usa validação Zod em produção
**Data:** 17/06/2026
**Status:** ✅ Concluído
**Commit:** `762bae9`
**Descrição:** Schemas Zod já definidos em `validation.ts` mas nunca usados. Criado helper `validateOrError()` e aplicado em 7 rotas de API.
**Schemas criados:** `sendFormSchema`, `createAvisoSchema`, `updateAvisoSchema`, `updateUserSchema`
**Rotas com Zod:**
- `POST /api/users` — `createUserSchema` (formData → objeto)
- `PUT /api/users` — `updateUserSchema`
- `POST /api/tickets` — `createTicketSchema` (formData → objeto)
- `POST /api/empresa` — `createEmpresaSchema`
- `POST /api/leads-network` — `createLeadSchema`
- `POST /api/send-form` — `sendFormSchema`
- `POST /api/quadro-avisos` — `createAvisoSchema`
- `PUT /api/quadro-avisos` — `updateAvisoSchema`

## SEG-006: Sessões em memória sem cleanup em 6 webhooks
**Data:** 17/06/2026
**Status:** ✅ Concluído
**Commit:** `cb2a69a`
**Descrição:** Criado `TTLMap` em `src/lib/ttl-map.ts` — wrapper de Map com TTL configurável (10 min) e cleanup automático a cada 30s. Substituídos os `new Map()` em 7 arquivos:
- `webhook26`, `webhook27`, `webhook-oficina`, `webhook-leads` (webhooks)
- `chat`, `chat-corporativo`, `chat-operacional` (chats web)
- Removida a verificação manual de expiração de 2h (agora automática pelo TTLMap)

## SEG-004: `/api/quadro-avisos/mostrar-avisos` pública expõe avisos de todas as empresas
**Data:** 17/06/2026
**Status:** ✅ Concluído
**Descrição:** Rota pública retornava todos os avisos do banco quando chamada sem CPF. Corrigido:
- CPF agora é obrigatório (retorna 400 se ausente)
- Se CPF não encontrar empresa, retorna 404
- Remove risco de exposição de dados internos de todas as empresas
**Commit:** `92ca73d`

## SEG-001: Rota `/api/testes` permitia RCE público
**Data:** 17/06/2026
**Status:** ✅ Concluído
**Descrição:** A rota `/api/testes` executava `npx vitest run` via `exec()` sem qualquer autenticação. Corrigido com:
- Guard `ENABLE_TESTES !== 'true'` retorna 404 (defense in depth, já existia no proxy.ts)
- Verificação de sessão GOD (`getServerSession` + role check) retorna 403
- Mesma proteção aplicada em `/api/testes/login`
**Commit:** `5ab2b9c`

# # atenção sempre que adcionar os pedido preciso que aponte o docido do commit que foi realizado

## PED-021: Análise completa do sistema + página pública de ideias
**Data:** 17/06/2026
**Status:** ✅ Concluído
**Descrição:** Realizar análise minuciosa e detalhada de todo o sistema, registrar todas as oportunidades de melhoria no arquivo `ideias.md`, e criar uma página pública em `/ideias` para visualização estilizada.
**Commit:** `684f4e6` (1ª versão) · `714fa5b` (filtros + tema claro)
**Entregues:**
- `ideias.md` reescrito com 32 itens em 6 categorias (Segurança, Arquitetura, Performance, UX, Infraestrutura, Testes)
- `src/lib/ideias-data.ts` — parser do markdown para dados estruturados
- `src/app/ideias/page.tsx` — server component que lê e parseia o arquivo
- `src/app/ideias/ideias-client.tsx` — componente cliente com:
  - Filtros por severidade (Crítico/Alto/Médio/Baixo)
  - Filtros por esforço (Pequeno/Médio/Grande)
  - Busca textual por ID, título, local ou descrição
  - Ordenação por severidade ou esforço
  - Cards expansíveis com detalhes completos
  - Tema claro/escuro via CSS variables
- `proxy.ts` — `/ideias` adicionado às rotas públicas
