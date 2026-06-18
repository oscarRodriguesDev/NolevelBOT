# Ideias e Melhorias — Skora

> **Data da análise:** 17/06/2026
> **Propósito:** Mapeamento completo de oportunidades de melhoria identificadas após auditoria minuciosa do sistema.

---

## 🏆 Categorias

| Código | Categoria |
|--------|-----------|
| 🔴 **SEG** | Segurança (Crítico/Alto) |
| 🟡 **ARQ** | Arquitetura e Qualidade de Código |
| ⚡ **PERF** | Performance |
| 🎨 **UX** | Experiência do Usuário |
| 🛠️ **INFRA** | Infraestrutura e DevOps |
| 🧪 **TEST** | Testes |

---

## 🔴 SEG-001: Rota `/api/testes` permite RCE (Remote Code Execution) ✅

**Severidade:** 🔴 CRÍTICO  
**Local:** `src/app/api/testes/route.ts`  
**Problema:** A rota executa `npx vitest run` via `exec()` do Node.js sem qualquer autenticação, sanitização ou rate limit. Isso permite que qualquer pessoa execute comandos arbitrários no servidor.  
**Sugestão:** Remover esta rota em produção ou protegê-la com autenticação GOD + ENABLE_TESTES + remover `exec()` em favor de `vitest` via API programática.  
**Status:** ✅ Corrigido em `5ab2b9c` — Adicionado guard ENABLE_TESTES + verificação de sessão GOD.

---

## 🔴 SEG-002: Rota `/api/upload` permite upload arbitrário sem validação ✅

**Severidade:** 🔴 CRÍTICO  
**Local:** `src/app/api/upload/route.ts`  
**Problema:** Rota pública sem autenticação, sem validação de tipo MIME, sem limite de tamanho de arquivo. Cliente pode especificar `bucket` e `folder` arbitrários, possibilitando path traversal e upload de arquivos maliciosos.  
**Sugestão:** Validar tipo MIME (allowlist jpg/png/pdf), limitar tamanho (10MB), allowlist de buckets/folders (anexo/logo, chatbot/empresas), rate limit por IP. Manter público pois chatbots precisam.  
**Status:** ✅ Corrigido — Validação de MIME/extension/size, allowlist de bucket/folder, rate limit 10/min/IP, lib também validada.

---

## 🔴 SEG-003: Rota `/api/memories` completamente pública ✅

**Severidade:** 🔴 CRÍTICO  
**Local:** `src/app/api/memories/route.ts`  
**Problema:** GET e POST sem qualquer autenticação ou API key. Qualquer pessoa pode ler/escrever memórias de persona de qualquer CPF, expondo dados sensíveis como histórico de conversas e preferências.  
**Sugestão:** Adicionar autenticação via API key ou session, ou pelo menos limitar a escrita apenas para webhooks autenticados.  
**Status:** ✅ Corrigido — Validado via `x-api-key` + `BOT_API_KEY`. `getMemoria()`/`saveMemoria()` em `usedata.ts` também atualizadas para enviar o header.

---

## 🔴 SEG-004: `/api/quadro-avisos/mostrar-avisos` pública expõe avisos de todas as empresas ✅

**Severidade:** 🔴 CRÍTICO  
**Local:** `src/app/api/quadro-avisos/mostrar-avisos/route.ts`  
**Problema:** GET sem CPF retorna `findMany()` sem filtro — todos os avisos do banco. Avisos podem conter informações internas e sensíveis.  
**Sugestão:** Exigir pelo menos um identificador (empresaId ou CPF) e nunca retornar todos os avisos globalmente.  
**Status:** ✅ Corrigido — CPF agora é obrigatório (400 se ausente, 404 se não encontrado).

---

## 🔴 SEG-005: Validação de CPF desabilitada

**Severidade:** 🔴 CRÍTICO  
**Local:** `src/lib/validation.ts`  
**Problema:** `isValidCPF()` está commented out e sempre retorna `true`. Qualquer CPF inválido é aceito no sistema.  
**Sugestão:** Reativar a validação de dígitos verificadores do CPF. O código já existe, só está comentado.

---

## 🟡 SEG-006: Sessões em memória sem cleanup em 6 webhooks ✅

**Severidade:** 🟡 ALTO  
**Local:** `src/app/api/webhook26/route.ts`, `webhook27/route.ts`, `webhook-oficina/route.ts`, `webhook-leads/route.ts`, `chat/route.ts`, `chat-corporativo/route.ts`, `chat-operacional/route.ts`  
**Problema:** Todas usam `Map<string, Session>` em memória para manter estado da conversa. Sem expiração forçada, sem limite de tamanho — vazamento de memória garantido com o tempo.  
**Sugestão:** Implementar TTL (ex: 30min de inatividade), limite máximo de sessões, ou usar um store externo (Redis).  
**Status:** ✅ Corrigido — Criado `TTLMap` em `src/lib/ttl-map.ts` com TTL de 10 minutos e cleanup automático a cada 30s. Aplicado nos 7 arquivos.

---

## 🟡 SEG-007: Rate limit ausente em 28 de 30 rotas de API ✅

**Severidade:** 🟡 ALTO  
**Local:** Todas as rotas, exceto `tickets/route.ts` (POST) e `empresa/route.ts` (GET por CPF)  
**Problema:** Sem rate limiting, atacantes podem fazer scraping, brute force, spam de chamados, DoS, etc.  
**Sugestão:** Aplicar `checkRateLimit()` sistematicamente em TODAS as rotas, com limites diferentes por endpoint (ex: 10/min para POST, 60/min para GET).  
**Status:** ✅ Corrigido — `applyRateLimit()` adicionado a 23 rotas via helper centralizado. Limites por endpoint: webhooks 60/min, GET 60/min, POST 10-30/min, públicos 20/min, form 5/min.

---

## 🟡 SEG-008: Nenhuma rota usa validação Zod em produção ✅

**Severidade:** 🟡 ALTO  
**Local:** Todas as rotas de API  
**Problema:** Schemas Zod definidos em `validation.ts` mas NUNCA importados/usados nas rotas. Toda validação é manual (undefined checks, typeof) — frágil e inconsistente.  
**Sugestão:** Integrar Zod em todas as rotas de escrita (POST/PUT), usando `safeParse()` com mensagens de erro padronizadas.  
**Status:** ✅ Corrigido — Criado helper `validateOrError()` em `src/lib/validate.ts`. Aplicado em 7 rotas: POST /api/users, PUT /api/users, POST /api/tickets, POST /api/empresa, POST /api/leads-network, POST /api/send-form, POST/PUT /api/quadro-avisos.

---

## 🟡 SEG-009: DELETE `/api/cpfs` pode deletar CPF de outra empresa ✅

**Severidade:** 🟡 ALTO  
**Local:** `src/app/api/cpfs/route.ts` (linha 192)  
**Problema:** O DELETE primeiro verifica se `empresaId` confere, mas depois executa `prisma.cpfs.delete({ where: { cpf } })` sem garantir que o CPF pertence à empresa. Em cenários de concorrência, pode deletar CPF de outra empresa.  
**Sugestão:** Usar `deleteMany({ where: { cpf, empresaId } })` em vez de `delete({ where: { cpf } })`.  
**Status:** ✅ Corrigido — `delete()` substituído por `deleteMany()` com filtro `{ cpf, empresaId }`.

---

## 🟡 SEG-010: PUT `/api/users/user-active` altera email/senha sem confirmação ✅

**Severidade:** 🟡 ALTO  
**Local:** `src/app/api/users/user-active/route.ts`  
**Problema:** PUT aceita alterar email e senha sem verificar a senha atual do usuário.  
**Sugestão:** Exigir confirmação da senha atual para alterar email ou senha.  
**Status:** ✅ Corrigido — se email ou senha forem enviados, `currentPassword` é obrigatório. Validado via `bcrypt.compare()` com a senha armazenada no banco.

---

## 🟡 SEG-011: CPF enumeration via múltiplos endpoints públicos

**Severidade:** 🟡 ALTO  
**Local:** `/api/leads-network` (GET por CPF), `/api/oficina/tickets` (GET por matrícula), `/api/cpfs/general_cpf` (GET por X-API-Key)  
**Problema:** É possível verificar se um CPF/matrícula existe no sistema, permitindo enumeração.  
**Sugestão:** Adicionar rate limit mais restritivo para consultas por CPF, ou exigir autenticação.

---

## 🟡 SEG-012: Turnstile opcional — bypass de segurança

**Severidade:** 🟡 ALTO  
**Local:** `src/lib/nextauth.ts`, `src/lib/rate-limit.ts`  
**Problema:** `verifyTurnstileToken()` retorna `true` se `TURNSTILE_SECRET_KEY` não estiver definida. Se o captcha não for configurado, a proteção contra brute force fica comprometida.  
**Sugestão:** Tornar Turnstile obrigatório em produção, ou pelo menos logar um aviso no startup.

---

## 🟡 SEG-013: `validarBotApiKey` retorna `true` se `BOT_API_KEY` não definida

**Severidade:** 🟡 ALTO  
**Local:** `src/app/api/cpfs/general_cpf/route.ts`  
**Problema:** Se a env var `BOT_API_KEY` não estiver configurada, qualquer requisição é aceita sem chave.  
**Sugestão:** Em produção, exigir que a chave esteja configurada ou negar acesso.

---

## 🟡 SEG-014: Dashboard processa todos chamados na memória

**Severidade:** 🟡 ALTO  
**Local:** `src/app/api/dashboards/route.ts`  
**Problema:** Carrega todos os chamados da empresa no servidor e processa manualmente (filtros, agrupamentos, estatísticas). Sem paginação — pode travar com milhões de chamados.  
**Sugestão:** Usar agregações do Prisma/PostgreSQL (`groupBy`, `aggregate`, `count` com where) em vez de processar na memória.

---

## 🟡 SEG-015: GitHub Actions em arquivos `.txt` não executam

**Severidade:** 🟡 ALTO  
**Local:** `.github/workflows/deploy.yml.txt`, `.github/workflows/deploy-homologa.txt`, `.github/workflows/deploy-homologa2.txt`  
**Problema:** Workflows estão nomeados com `.txt` em vez de `.yml`, então o GitHub Actions ignora. CI/CD não funciona.  
**Sugestão:** Renomear para `.yml` ou `.yaml`.

---

## 🟡 SEG-016: Número excessivo de `console.log` em produção

**Severidade:** 🟡 ALTO  
**Local:** `src/lib/nextauth.ts` (6 logs), `src/lib/usedata.ts` (múltiplos console.error)  
**Problema:** Logs expõem dados de autenticação no console (senhas, resultados de comparação) e informações internas. `console.error` usado como logging padrão.  
**Sugestão:** Remover `console.log` que expõem senhas. Usar sistema de logging estruturado (winston/pino).

---

## 🟡 ARQ-001: Duplicação massiva entre módulos Corporativo, Oficina e Eventos

**Severidade:** 🟡 ALTO  
**Local:** Múltiplos arquivos nos 3 módulos  
**Problema:** Headers, layouts, páginas de avisos, CPFs, usuários, gestão de usuários são praticamente idênticos entre os 3 módulos. Qualquer correção ou melhoria precisa ser replicada 3x.  
**Sugestão:** Criar componentes compartilhados parametrizáveis por módulo (ex: `<ModuleLayout module="corporativo" />`, `<AvisosPage module="corporativo" />`).

---

## 🟡 ARQ-002: 3 arquivos de chat web quase idênticos

**Severidade:** 🟡 ALTO  
**Local:** `src/app/api/chat/route.ts`, `src/app/api/chat-corporativo/route.ts`, `src/app/api/chat-operacional/route.ts`  
**Problema:** Código copiado 3x com mudanças mínimas. Manutenção cara e propensa a erros.  
**Sugestão:** Unificar em um único endpoint `/api/chat` com parâmetro de módulo.

---

## 🟡 ARQ-003: webhook26 e webhook27 duplicados (400+ linhas cada)

**Severidade:** 🟡 ALTO  
**Local:** `src/app/api/webhook26/route.ts`, `src/app/api/webhook27/route.ts`  
**Problema:** webhook27 é uma evolução de webhook26, mas ambos existem e são mantidos. Mais de 80% de código duplicado.  
**Sugestão:** Manter apenas a versão mais recente (webhook27) e remover webhook26, ou refatorar com funções compartilhadas.

---

## 🟡 ARQ-004: webhook-oficina com 498 linhas e código duplicado dos webhooks corporativos

**Severidade:** 🟡 ALTO  
**Local:** `src/app/api/webhook-oficina/route.ts`  
**Problema:** Grande parte da lógica de state machine, IA e envio de mensagens é idêntica aos webhooks corporativos.  
**Sugestão:** Extrair lógica compartilhada para libs (ex: `src/lib/webhook-core.ts`) com funções reutilizáveis.

---

## 🟡 ARQ-005: Zod schemas definidos mas não utilizados

**Severidade:** 🟡 ALTO  
**Local:** `src/lib/validation.ts`  
**Problema:** Schemas completos para criação de usuário, ticket, empresa, lead existem mas nunca são importados por nenhuma rota.  
**Sugestão:** Começar a usar os schemas nas rotas — é o caminho mais rápido para validar inputs consistentemente.

---

## ⚡ PERF-001: Dashboard carrega dados sem paginação

**Severidade:** ⚠️ MÉDIO  
**Local:** `src/app/api/dashboards/route.ts`  
**Problema:** Todas as queries de dashboard fazem `findMany()` sem limit/pagination. Com crescimento, vai degradar performance.  
**Sugestão:** Usar `take` + `skip` ou `cursor-based pagination`, e agregar no banco.

---

## ⚡ PERF-002: Sidebar faz fetch toda vez que monta

**Severidade:** ⚠️ MÉDIO  
**Local:** `src/app/components/sidebar.tsx` (linha 36-42)  
**Problema:** Toda vez que a sidebar monta (navegação), faz fetch dos módulos da empresa. Sem cache.  
**Sugestão:** Cachear resultado em sessionStorage ou estado global (React Context/Zustand).

---

## ⚡ PERF-003: Grandes bibliotecas sem dynamic import

**Severidade:** ⚠️ MÉDIO  
**Local:** Vários dashboards  
**Problema:** `recharts`, `framer-motion`, `jspdf`, `xlsx` são importados estaticamente em páginas, aumentando o bundle inicial.  
**Sugestão:** Usar `next/dynamic` com `ssr: false` para recharts, jspdf, xlsx nas páginas de dashboard.

---

## ⚡ PERF-004: Sessões de webhook sem cleanup

**Severidade:** ⚠️ MÉDIO  
**Local:** Webhooks e rotas de chat  
**Problema:** `Map<string, Session>` nunca é limpo. Sessões inativas acumulam para sempre.  
**Sugestão:** Implementar `setInterval` para limpar sessões com mais de 2h de inatividade, ou usar LRU cache com limite de tamanho.

---

## 🎨 UX-001: Módulo Eventos não tem kanban/all-tickets

**Severidade:** ⚠️ MÉDIO  
**Local:** `src/app/eventos/(atendimento)/`  
**Problema:** Eventos não possui página de listagem/kanban de chamados como Corporativo e Oficina têm.  
**Sugestão:** Criar `/eventos/(atendimento)/all-tickets` seguindo o mesmo padrão, ou redirecionar para o kanban existente.

---

## 🎨 UX-002: Label "Motoristas" no módulo Eventos

**Severidade:** 🔵 BAIXO  
**Local:** `src/app/components/sidebar.tsx` (linha 87)  
**Problema:** No módulo Eventos, a sidebar mostra "Colaboradores/Motoristas", mas eventos trata de leads, não motoristas.  
**Sugestão:** Alterar para "Leads" ou "Contatos" no módulo Eventos.

---

## 🎨 UX-003: Ícone "Eventos" na sidebar é uma chave inglesa

**Severidade:** 🔵 BAIXO  
**Local:** `src/app/components/sidebar.tsx` (linha 81)  
**Problema:** O módulo Eventos usa `LuWrench` (chave inglesa) como ícone — é o mesmo ícone do módulo Oficina.  
**Sugestão:** Usar `LuCalendar` ou `LuCalendarCheck` para Eventos.

---

## 🎨 UX-004: Estado vazio não tratado nos dashboards

**Severidade:** 🔵 BAIXO  
**Local:** `src/app/*/(atendimento)/dashboards/page.tsx`  
**Problema:** Quando não há dados, os gráficos podem mostrar componentes vazios ou quebrados.  
**Sugestão:** Adicionar estado de "Nenhum dado disponível" com ilustração/emoji e mensagem amigável.

---

## 🎨 UX-005: Modais sem gerenciamento de foco

**Severidade:** 🔵 BAIXO  
**Local:** `src/app/components/modal-edit-user.tsx` e similares  
**Problema:** Modais não gerenciam foco (focus trap), não fecham com Escape, não têm aria-labels. Acessibilidade comprometida.  
**Sugestão:** Adicionar focus trap, fechamento com Escape, aria-modal, aria-labelledby.

---

## 🎨 UX-006: Not-found trata carregamento com spinner separado

**Severidade:** 🔵 BAIXO  
**Local:** `src/app/not-found.tsx`  
**Problema:** A página 404 usa `useSession()` que pode estar carregando, mostrando um spinner. Uma página 404 deveria ser instantânea.  
**Sugestão:** Usar `getSession` do lado do servidor (server component) ou cookies para determinar se usuário está logado, sem estado de loading.

---

## 🛠️ INFRA-001: PhoneMap em arquivo JSON no disco

**Severidade:** ⚠️ MÉDIO  
**Local:** `src/lib/phoneMap.ts`  
**Problema:** Mapeamento CPF → telefone é armazenado em arquivo JSON em `/app/data/phoneMap.json`. Não escala, não é replicável, não tem backup.  
**Sugestão:** Migrar para uma tabela no banco PostgreSQL (ex: `phone_map` ou adicionar campo `telefone` no model `cpfs`).

---

## 🛠️ INFRA-002: Rate limiter em memória não funciona com múltiplas instâncias

**Severidade:** ⚠️ MÉDIO  
**Local:** `src/lib/rate-limit.ts`, `proxy.ts`  
**Problema:** `Map` em memória é por instância do servidor. Com múltiplas réplicas (Docker swarm, k8s), o rate limit é facilmente burlado.  
**Sugestão:** Usar Redis ou banco de dados para rate limit compartilhado (ex: `node-rate-limiter-flexible` com Redis).

---

## 🛠️ INFRA-003: Nenhum sistema de cache

**Severidade:** ⚠️ MÉDIO  
**Local:** Sistema inteiro  
**Problema:** Nenhum cache implementado. Consultas repetitivas ao banco (avisos, empresas, chamados) são feitas toda vez.  
**Sugestão:** Implementar Redis para cache de queries frequentes (avisos, configurações de empresa, prompts de IA).

---

## 🛠️ INFRA-004: Variáveis de ambiente misturadas entre dev/prod

**Severidade:** 🔵 BAIXO  
**Local:** `.env`, `.env.example`, proxy.ts  
**Problema:** `.env` contém URLs de produção (177.153.33.179) mas `ENABLE_TESTES=false`. Pode causar confusão entre ambientes.  
**Sugestão:** Separar claramente `.env.dev`, `.env.prod`, e documentar quais variáveis são obrigatórias.

---

## 🧪 TEST-001: Cobertura de testes insuficiente para funcionalidades críticas

**Severidade:** ⚠️ MÉDIO  
**Local:** `src/__tests__/`  
**Problema:** Testes existem para rate-limit, audit-log, smartSearch, usedata, rbac, security, validation e phoneMap. Mas não há testes para: webhooks (os maiores arquivos), rotas de API (integração), componentes de UI, fluxos de autenticação.  
**Sugestão:** Adicionar testes de integração para webhooks (com mocks da Evolution API e OpenAI), e testes de componente para as páginas principais.

---

## 🧪 TEST-002: Testes de segurança precisam de expansão

**Severidade:** ⚠️ MÉDIO  
**Local:** `src/__tests__/security.test.ts`  
**Problema:** Testes de segurança existem mas podem não cobrir cenários de boundary, injeção, e bypass.  
**Sugestão:** Expandir testes de segurança para incluir SQL injection attempts, XSS via campos de texto, path traversal em upload.

---

## 📋 Resumo por Prioridade

### 🔴 IMEDIATO (risco de segurança grave)
| ID | Título | Esforço | Status |
|----|--------|---------|--------|
| SEG-001 | RCE via /api/testes | 🟢 Pequeno | ✅ |
| SEG-002 | Upload sem validação | 🟡 Médio | ✅ |
| SEG-003 | Memories público | 🟢 Pequeno | ✅ |
| SEG-004 | Avisos público global | 🟢 Pequeno | ✅ |
| SEG-005 | CPF validation desligada | 🟢 Pequeno | ❌ |
| SEG-015 | Workflows .txt não executam | 🟢 Pequeno | ❌ |

### 🟡 CURTO PRAZO (melhoria significativa)
| ID | Título | Esforço | Status |
|----|--------|---------|--------|
| SEG-006 | Sessões em memória sem cleanup | 🟡 Médio | ✅ |
| SEG-007 | Rate limit ausente em 28 rotas | 🔴 Grande | ✅ |
| SEG-008 | Zod não usado nas rotas | 🟡 Médio | ✅ |
| SEG-009 | DELETE CPF vulnerável | 🟢 Pequeno | ✅ |
| SEG-010 | PUT user-active sem confirmação | 🟢 Pequeno | ✅ |
| ARQ-001 | Duplicação entre módulos | 🔴 Grande | ❌ |
| ARQ-002 | Chat duplicado 3x | 🟡 Médio | ❌ |
| ARQ-003 | Webhook26/27 duplicados | 🟡 Médio | ❌ |

### ⚠️ MÉDIO PRAZO (qualidade e performance)
| ID | Título | Esforço |
|----|--------|---------|
| SEG-014 | Dashboard sem paginação | 🟡 Médio |
| PERF-001 | Dashboard processa na memória | 🟡 Médio |
| PERF-002 | Sidebar recarrega módulos | 🟢 Pequeno |
| PERF-003 | Dynamic imports para libs pesadas | 🟢 Pequeno |
| INFRA-001 | PhoneMap em JSON | 🟡 Médio |
| INFRA-002 | Rate limit em memória | 🔴 Grande |
| TEST-001 | Cobertura de testes webhooks | 🔴 Grande |

### 🔵 FUTURO (UX e refinamentos)
| ID | Título | Esforço |
|----|--------|---------|
| UX-001 | Kanban para Eventos | 🟡 Médio |
| UX-002 | Label "Motoristas" em Eventos | 🟢 Pequeno |
| UX-003 | Ícone Eventos = chave inglesa | 🟢 Pequeno |
| UX-004 | Estado vazio nos dashboards | 🟢 Pequeno |
| UX-005 | Acessibilidade em modais | 🟡 Médio |
| INFRA-003 | Sistema de cache (Redis) | 🔴 Grande |
| INFRA-004 | Variáveis de ambiente | 🟢 Pequeno |

---

> **Legenda de Esforço:** 🟢 Pequeno (horas) | 🟡 Médio (dias) | 🔴 Grande (semanas)
