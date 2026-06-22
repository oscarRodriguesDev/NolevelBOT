# Pedidos e Solicitações do Usuário

## FIX: Criação de ADMIN quebrada — setor vazio rejeitado pelo Zod
**Data:** 18/06/2026
**Status:** ✅ Concluído
**Commit:** `8830ab9`
**Descrição:** Ao criar um usuário ADMIN via GOD, o frontend enviava `setor = ""` (ADMIN não tem setor específico). A validação Zod `z.string().min(1)` rejeitava o valor vazio, resultando em erro `400 "Dados inválidos"`. Corrigido na API: se `finalRole === "ADMIN"` e `setor` for vazio, define `setor = "all"` antes da validação, seguindo a convenção do sistema onde ADMIN sem setor exibe "all".

## UX: Mensagens de erro do validateOrError agora mostram qual campo falhou
**Data:** 18/06/2026
**Status:** ✅ Concluído
**Commit:** `d8ce065`
**Descrição:** `validateOrError()` retornava `"Dados inválidos"` genérico sem indicar qual campo. Agora inclui o nome do campo e o motivo no toast (ex: `"Dados inválidos — setor: Setor é obrigatório"`), facilitando o debug.

## SEG-010: PUT /api/users/user-active altera email/senha sem confirmação
**Data:** 17/06/2026
**Status:** ✅ Concluído
**Commit:** `a9074bf`
**Descrição:** PUT aceitava alterar email e senha sem verificar senha atual. Agora exige `currentPassword` no formData, validado via `bcrypt.compare()` contra a senha armazenada.

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

## ARQ-001: Eliminar duplicação entre módulos Corporativo, Oficina e Eventos
**Data:** 17/06/2026
**Status:** ✅ Concluído
**Descrição:** Layout, header e páginas duplicados nos 3 módulos. Unificados em componentes compartilhados parametrizáveis.
- `module-layout.tsx`: layout único com autorização por módulo
- `module-header.tsx`: header compartilhado (antes 3 cópias idênticas)
- `shared-avisos.tsx`, `shared-gestao-usuarios.tsx`, `shared-usuarios.tsx`, `shared-cpfs.tsx`: páginas compartilhadas
- Cada página nos módulos virou wrapper de ~3 linhas
- ~2.400 linhas de código duplicado eliminadas
**Commit:** `fa0882e`

## SEG-016: console.log expõe senhas + sistema de erros estruturado
**Data:** 17/06/2026
**Status:** ✅ Concluído
**Descrição:**
- Removidos 6 `console.log` em `nextauth.ts` que expunham senhas e resultados de comparação
- `console.error` em `usedata.ts` substituídos por `captureError()` com código identificador
- Criado `error-store.ts`: armazenamento em memória com TTL de 24h e códigos ERR-XXXXX
- Criado `app-error.ts`: classe `AppError` e função `captureError`
- Criada rota `/api/errors` (protegida para GOD)
- Criada página `/god/erros` para consultar erros por código
- Link "Erros" adicionado na sidebar do GOD
**Commit:** `2662b04`

## PED-026: Criar manual da plataforma (data/regras.md)
**Data:** 20/06/2026
**Status:** ✅ Concluído
**Commit:** `259d1fe`
**Descrição:** Criado arquivo `data/regras.md` com todas as regras da plataforma: visão geral, regras de cadastro baseadas nas validações Zod (email, senha, CPF, CNPJ), regras de acesso RBAC (papéis, hierarquia, permissões, escopo de dados), sistema de módulos (Corporativo, Oficina, Eventos), status de chamados, prioridades, canais de atendimento, segurança e temas. Funciona como manual de uso completo da plataforma.

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

## ARQ-002: Unificar 3 chats mantendo particularidades
**Data:** 17/06/2026
**Status:** ✅ Concluído
**Commit:** `579227c`
**Descrição:** Os 3 arquivos de chat (~413 linhas cada) com código quase idêntico. Criado `src/lib/chat-handler.ts` com `handleChatRequest(req, config)` e 3 thin wrappers. Particularidades preservadas:
- **chat** (web): rate limit `"chat"`, sem `FlowState.INICIO`, instrução de motivo simples
- **chat-corporativo**: rate limit `"chat-corporativo"`, com `FlowState.INICIO`, instrução de motivo detalhada (códigos AVISO_RESOLVE/PROSSEGUIR_FLUXO)
- **chat-operacional**: rate limit `"chat-operacional"`, com `FlowState.INICIO`, instrução de motivo detalhada (idêntica ao corporativo)
~1.235 linhas eliminadas.

## ARQ-003: Remover webhook26 duplicado
**Data:** 17/06/2026
**Status:** ✅ Concluído
**Commit:** `f6c6ac1`
**Descrição:**
- `src/app/api/webhook26/route.ts` deletado (webhook27 é a versão atual)
- `src/lib/useIA3.ts` deletado (orphan, único consumer era webhook26)
- `src/app/api-docs/page.tsx`: entrada do webhook26 removida
- 620 linhas eliminadas.

## ARQ-004: Extrair lógica compartilhada dos webhooks para core
**Data:** 17/06/2026
**Status:** ✅ Concluído
**Commit:** `e6d4f30`
**Descrição:**
- Criado `src/lib/webhook-core.ts` com 7 funções compartilhadas:
  - `parseWebhookMessage()` — parsing unificado de mensagens Evolution API
  - `rateLimited()` — rate limit padronizado
  - `getOrCreateSession()` — sessão TTLMap com fallback
  - `handleExit()` — handler "sair/en cerrar/cancelar"
  - `processWebhookMedia()` — download + upload de mídia
  - `saveSession()` — persistência de sessão
  - `webhookError()` — error handler padronizado
- `webhook27/route.ts`: ~60 linhas de boilerplate substituídas pelo core
- `webhook-oficina/route.ts`: ~50 linhas de boilerplate substituídas; extraída `montarResumo()` para eliminar string de resumo duplicada 5x
- Fluxo específico de transporte público (matrícula, ônibus, defeito por JSON, confirmação) mantido intacto

## PERF-001: Dashboard sem paginação
**Data:** 17/06/2026
**Status:** ✅ Concluído
**Commit:** `de3c7dc`
**Descrição:**
- `getPeriodDateRange()` converte período (dia/semana/mes/ano) em `Date` inicial
- Filtro `createdAt: { gte: dateFrom }` adicionado ao `where` do chamado e tickets_evitados
- `take: 10000` como safety net em ambas queries
- `inPeriodo()` removido (filtragem agora no banco)

## PERF-002: Sidebar faz fetch toda vez que monta
**Data:** 17/06/2026
**Status:** ✅ Concluído
**Commit:** `de3c7dc`
**Descrição:**
- Cache via `sessionStorage` com chave `empresa_modulos_{empresaId}`
- Fetch só ocorre se cache não existir

## SEG-013: validarBotApiKey retorna true se BOT_API_KEY não definida
**Data:** 17/06/2026
**Status:** ✅ Concluído
**Commit:** `a162595`
**Descrição:**
- Criado `src/lib/bot-auth.ts` com `validarBotApiKey()` — `if (!botApiKey) return false` (fail closed)
- Removida função duplicada de `general_cpf/route.ts` e `memories/route.ts` (agora importam de bot-auth)
- Se `BOT_API_KEY` não estiver configurada, requisições sem chave são rejeitadas (antes aceitas)

## PED-022: Fix atualização de chamados no Corporativo + feedback toast
**Data:** 19/06/2026
**Status:** ✅ Concluído
**Commit:** `c364f6f`
**Descrição:**
- **PUT `/api/tickets`:** `prisma.chamado.update` agora usa `id` do chamado (`chamadoExistente.id`) em vez de `ticket` no where, eliminando risco de case-sensitivity. Mensagens de erro detalhadas no catch.
- **modal_tandimento.tsx:** Adicionado `toast.success()` no sucesso e `toast.error()` com a mensagem real do servidor no erro, tanto no `atualizarChamado` quanto no `concluirChamado`.
- **kanban-board.tsx:** Adicionado `toast.success()`/`toast.error()` no `handleDrop` (drag-and-drop via Kanban).
- Build: ✅ sucesso.

## PED-023: Fix JSON.parse quebrando quando historico não é JSON válido
**Data:** 19/06/2026
**Status:** ✅ Concluído
**Commit:** `236bbb7`
**Descrição:**
- **PUT `/api/tickets`:** `JSON.parse(chamadoExistente.historico)` estourava 500 quando o campo `historico` no banco continha texto puro (ex: "Chamado criado em...") em vez de JSON array. Envolvido em try/catch com fallback para array vazio. Mesmo tratamento para `JSON.parse(historico)` do body da requisição.
- Causa raiz: chamados criados por fluxos que armazenavam historico como texto livre em vez de JSON.stringify.
- Build: ✅ sucesso.

## PED-024: webhook-oficina encerra sessao apos criar chamado
**Data:** 19/06/2026
**Status:** ✅ Concluído
**Commit:** `28774a2`
**Descrição:**
- Após criar chamado com sucesso: `sessions.delete(number)` + `return` imediato, impedindo `saveSession` de recriar a sessão.
- Mesmo comportamento no `catch` (falha no registro).
- Build: ✅ sucesso.

## PED-025: Criar webhook-corporativo (sem IA)
**Data:** 19/06/2026
**Status:** ✅ Concluído
**Commit:** `29911a3`
**Descrição:**
- Criado `/api/webhook-corporativo` — fluxo similar ao webhook-oficina, adaptado para o módulo Corporativo:
  - Identificação por CPF (11 dígitos)
  - Validação do módulo CORPORATIVO na empresa
  - Coleta de descrição do motivo
  - Anexo opcional (foto/documento)
  - Confirmação e seleção de setor
  - Criação do chamado na tabela `chamado`
  - Encerramento da sessão após conclusão
- **Sem IA** — apenas fluxo estruturado.
- Build: ✅ sucesso.
