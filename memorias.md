# MEMÓRIAS DO PROJETO - NolevelBOT

## 1. VISÃO GERAL

**NolevelBOT** é um sistema de gestão de chamados (tickets) multi-empresa com chatbot integrado via WhatsApp. O sistema permite que empresas cadastrem usuários, gerenciem chamados, configurem avisos internos, e ofereçam atendimento automatizado via bot com IA (OpenAI).

---

## 2. TECH STACK

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 16.1.6 | Framework full-stack |
| React | 19.2.3 | UI |
| TypeScript | 5.x | Tipagem |
| Tailwind CSS | 4.x | Estilização |
| Prisma | 7.4.1 | ORM + Migrations |
| PostgreSQL | - | Banco de dados |
| Supabase | - | Storage (uploads) + DB Host |
| NextAuth | 4.24.13 | Autenticação |
| OpenAI | 6.22.0 | IA do chatbot |
| Framer Motion | 12.38.0 | Animações |
| Recharts | 3.8.0 | Gráficos/dashboards |
| jsPDF | 4.2.0 | Exportar PDF |
| xlsx | 0.18.5 | Exportar Excel |
| Lucide React | 0.577.0 | Ícones |
| React Hot Toast | 2.6.0 | Notificações |
| bcryptjs | 3.0.3 | Hash de senhas |

---

## 3. ESTRUTURA DE DIRETÓRIOS

```
nolevel/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── migrations/            # Migrations do Prisma
├── src/
│   ├── app/
│   │   ├── globals.css        # Variáveis CSS (tema claro/escuro)
│   │   ├── layout.tsx         # Root layout (servidor)
│   │   ├── layout-client.tsx  # Wrapper cliente (ThemeProvider + SessionProvider)
│   │   ├── providers.tsx      # Contexto de tema (useTheme)
│   │   ├── page.tsx           # Landing page
│   │   ├── (atendimento)/     # Área logada (layout com sidebar)
│   │   │   ├── layout.tsx     # Layout com HeaderContext, Sidebar, Header
│   │   │   ├── all-tickets/   # Lista de chamados
│   │   │   ├── avisos/        # Quadro de avisos CRUD
│   │   │   ├── cpfs/          # Gerenciamento de CPFs
│   │   │   ├── dashboards/    # Dashboard com gráficos
│   │   │   ├── empresa/       # Gerenciamento de empresas
│   │   │   ├── gestao-de-usuarios/ # Criar usuários
│   │   │   └── components/    # Sidebar, Header, CardUser, Modais
│   │   ├── api/               # Rotas de API
│   │   │   ├── auth/          # NextAuth
│   │   │   ├── chat/          # Chatbot OpenAI
│   │   │   ├── cpfs/          # CRUD CPFs
│   │   │   ├── dashboards/    # Dados dos dashboards
│   │   │   ├── empresa/       # CRUD empresas
│   │   │   ├── leads-network/ # Captura de leads
│   │   │   ├── memories/      # Memórias do bot (resumoPersona)
│   │   │   ├── quadro-avisos/ # CRUD avisos
│   │   │   ├── send-form/     # Formulário de contato → Google Forms
│   │   │   ├── tickets/       # CRUD chamados
│   │   │   ├── userFacil/     # Criar usuário (modo GOD)
│   │   │   ├── users/         # CRUD usuários
│   │   │   ├── webhook22/     # Webhook WhatsApp (instância 22)
│   │   │   ├── webhook23/     # Webhook WhatsApp (instância 23)
│   │   │   └── webhook-leads/ # Webhook para captação de leads em eventos
│   │   ├── chamado/           # Página pública de abrir chamado
│   │   ├── chatbot-app/       # Interface mobile do bot Hevelyn
│   │   ├── components/        # Componentes globais
│   │   │   ├── back.tsx       # Botão voltar
│   │   │   ├── fileInput.tsx  # Upload de arquivo drag-and-drop
│   │   │   └── theme-toggle.tsx # Alternador de tema
│   │   ├── consulta/          # Consulta pública de chamados
│   │   ├── contact/           # Página de contato
│   │   ├── leads/             # Página de captura de leads
│   │   ├── login/             # Página de login
│   │   └── userFacil/         # Criação de usuário (modo GOD)
│   ├── lib/
│   │   ├── nextauth.ts        # Config NextAuth
│   │   ├── prisma.ts          # Singleton Prisma Client
│   │   ├── searchEmpresa.ts   # Buscar empresaId por CPF
│   │   ├── setores.ts         # Buscar setores por CPF
│   │   ├── upload.ts          # Upload para Supabase Storage
│   │   ├── useIA.ts           # Integração OpenAI (chatbot)
│   │   └── usedata.ts         # Funções utilitárias diversas
│   ├── types/
│   │   ├── leads.ts           # Interface Lead
│   │   └── next-auth.d.ts     # Tipos estendidos do NextAuth
│   ├── proxy.ts               # (proxy config)
│   └── tarefas.txt            # Lista de tarefas do projeto
├── dockerfile
├── docker-compose.yml
├── next.config.ts
├── package.json
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
├── THEME_SYSTEM.md
└── .env
```

---

## 4. BANCO DE DADOS (Prisma Schema)

### Modelos:

| Modelo | Descrição |
|--------|-----------|
| `empresa` | Empresa inquilina (multi-tenant) |
| `User` | Usuário do sistema |
| `Chamado` | Ticket/Chamado de suporte |
| `cpfs` | CPFs autorizados a usar o chatbot |
| `tickets_fechados` | Histórico de chamados concluídos |
| `avisos` | Quadro de avisos por empresa |
| `resumoPersona` | Memória do bot sobre personalidade do usuário |
| `CompanyConfig` | Configurações de IA por empresa |
| `cpfsLeads` | Leads capturados (novo) |

### Roles (enum `ROLE`):
- `GOD` - Acesso total ao sistema
- `ADMIN` - Administra empresa
- `GESTOR` - Gerencia chamados e equipe
- `ATENDENTE` - Atende chamados

### Regras de negócio no banco:
- Cada `User` pertence a uma `empresa`
- Cada `Chamado` pertence a uma `empresa` e opcionalmente a um `User` (atendente)
- `cpfs` são vinculados a uma `empresa` (para validação no bot)
- `avisos` são vinculados a uma `empresa` e podem ter `setor` e `expiresAt`
- `cpfsLeads` NÃO tem vinculo com empresa (lead externo)

---

## 5. AUTENTICAÇÃO (NextAuth)

- **Provider:** Credentials (email + senha)
- **Estratégia:** JWT (não usa sessão de banco)
- **Senhas:** Hash com bcryptjs
- **Fluxo:**
  1. Usuário faz login com email + senha
  2. NextAuth valida contra banco (prisma)
  3. JWT armazena: id, email, cpf, empresaId, name, role, avatarUrl, setor
  4. Session disponibiliza esses dados nos componentes cliente
- **Proteção:** Rotas em `(atendimento)` exigem sessão válida

---

## 6. SISTEMA DE TEMAS

- Provider: `src/app/providers.tsx`
- Hook: `useTheme()` retorna `{ theme, toggleTheme }`
- Padrão: `dark`
- Persistência: `localStorage` (chave: `"theme"`)
- Implementação: Atributo `data-theme` no `<html>`
- Variáveis CSS em `globals.css` com fallback light/dark
- Transições: `transition-colors duration-300` em todos os elementos

### Cores principais:
- Fundo escuro: `#0F172A` / Claro: `#F8FAFC`
- Primária: `#3B82F6`
- Hover: `#2563EB`

---

## 7. PADRÕES DE CÓDIGO

### Estilização:
- Usar variáveis CSS `var(--cor)` em vez de valores fixos
- Aderir ao sistema de temas (dark/light)
- Transições suaves de cor

### Componentes:
- Componentes de página em `src/app/rota/page.tsx`
- Componentes compartilhados em `src/app/components/`
- "use client" quando necessário (hooks, estado, eventos)
- Preferir Server Components quando possível

### API Routes:
- Arquivos em `src/app/api/nome-da-rota/route.ts`
- Exportar funções `GET`, `POST`, `PUT`, `DELETE`
- Retornar `NextResponse.json()`
- Tratar erros com try/catch

### Prisma:
- Singleton em `src/lib/prisma.ts`
- Usar `prisma` importado de `@/lib/prisma`

### Autenticação em APIs:
- Rotas protegidas: verificar `getServerSession(authOptions)`
- Rotas públicas: Não verificar sessão

---

## 8. WEBHOOKS / CHATBOT WHATSAPP

### Webhooks de Atendimento (webhook22 e webhook23)
- Duas instâncias: webhook22 e webhook23
- Fluxo completo do bot:
  1. Saudação → CPF
  2. Valida CPF na tabela `cpfs`
  3. Busca setores do CPF
  4. Exibe menu de opções (abrir chamado, consultar status, falar com atendente)
  5. Se "abrir chamado": pergunta motivo, setor → cria chamado
  6. Se "consultar": busca chamados pelo CPF
  7. Se "avisos": busca avisos da empresa
- IA integrada via `useIA.ts` (OpenAI) para processar linguagem natural
- Envio de mensagens via Evolution API (`sendEvolutionText`)

### Webhook de Leads (webhook-leads) — Evento/Feira
- Webhook específico para captação de leads em eventos/feiras
- **Não requer validação de CPF** — conversa fluida e sem travas
- Toda lógica contida no próprio `route.ts` (exceto `sendEvolutionText` e `buscarAvisos`)
- Usa OpenAI diretamente (não passa por `useIA.ts`)
- Estados: `apresentacao` → `coletando_nome` → `coletando_telefone` → `conversando`
- Salva leads na tabela `cpfsLeads` via Prisma direto
- Suporta extração estruturada de dados via tags `[NOME:]`, `[TELEFONE:]`, `[CPF:]`, `[EMPRESA:]`
- Temperatura da IA: 0.7 (mais criativa)
- Sessão expira após 2h de inatividade

---

## 9. LEADS (NOVO - Sessão Atual)

- Modelo `cpfsLeads` no Prisma (sem vinculo com empresa)
- Campos: id, cpf, nome, telefone, empresa (opcional)
- API: `GET /api/leads-network` (listar), `POST /api/leads-network` (criar)
- Página: `/leads` - formulário que redireciona para WhatsApp após cadastro
- Validação: CPF, nome e telefone obrigatórios; CPF único

---

## 10. DECISÕES DE ARQUITETURA

- **Multi-tenant por empresa:** Cada empresa tem seus próprios dados (chamados, usuários, CPFs, avisos)
- **Banco único:** Todas as empresas no mesmo banco PostgreSQL, separadas por `empresaId`
- **Storage:** Supabase Storage para uploads de avatar e anexos
- **Bot WhatsApp:** Evolution API gerenciando duas instâncias
- **IA:** OpenAI para processar intenções do usuário no chatbot
- **Autenticação:** NextAuth com JWT stateless
- **Tema:** CSS Variables + Context API, sem bibliotecas externas

---

## 11. VARIÁVEIS DE AMBIENTE (.env)

| Variável | Descrição |
|----------|-----------|
| `EVOLUTION_API_KEY` | Chave da API Evolution |
| `EVOLUTION_API_URL` | URL da Evolution API |
| `OPENAI_API_KEY` | Chave da OpenAI |
| `DATABASE_URL` | URL do PostgreSQL |
| `DIRECT_URL` | URL direta do PostgreSQL |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço Supabase |
| `NEXTAUTH_SECRET` | Segredo do NextAuth |
| `NEXTAUTH_URL` | URL base para NextAuth |
| `PUBLIC_NAME_EMPRESA` | Nome público da empresa |
| `NEXT_PUBLIC_CNPJ` | CNPJ público |
| `BASE_URL` | URL interna (container) |

---

## 12. CONFIGURAÇÃO DOCKER

- **Dockerfile:** Next.js standalone build
- **Docker Compose:** Serviço `nolevel-app` na porta 3000
- **Container name:** `nolevel-app`

---

## 13. RESPONSIVIDADE

- Layout adaptável para mobile/desktop
- Sidebar colapsável em mobile
- Tabelas com overflow-x em telas pequenas
- Grid responsivo nos cards

---

## 14. OBSERVAÇÕES IMPORTANTES

- O arquivo `src/tarefas.txt` contém a lista de tarefas pendentes e concluídas
- O commit `ecc69f2` quebrou o bot porque a URL base ainda não foi atualizada no servidor
- O projeto já passou por várias tentativas de deploy (homologação)
- A branch principal de trabalho é `vibecode`
- Alterações drásticas devem ser consultadas antes de implementar
- Sempre manter consistência com o sistema de temas (dark/light)

---

## 15. CORREÇÕES IMPORTANTES (17/05/2026)

### Webhook Evolution × leads-network

**Problema:** A Evolution API estava configurada para chamar `/api/leads-network`, mas esse endpoint esperava `{ cpf, nome, telefone }` no body. A Evolution envia eventos no formato `{ event: "messages.upsert", data: {...}, instance: "..." }`, resultando em erro 400 e o webhook não era reconhecido.

**Solução em `src/app/api/leads-network/route.ts`:**
- O POST agora detecta se o body contém `event === "messages.upsert"` (formato Evolution)
- Se for evento da Evolution, faz um proxy interno via fetch para `/api/webhook-leads`
- Se não for, mantém o fluxo normal de CRUD de leads

**Bug corrigido em `src/app/api/webhook-leads/route.ts`:**
- A função `consultarLeadPorCpf` usava fetch com URL relativa (`/api/leads-network?cpf=...`), que não funciona em ambiente server-side
- Corrigido para usar `NEXT_PUBLIC_BASE_URL` (ou `BASE_URL` como fallback) com URL absoluta

---

## 16. REFATORAÇÃO WEBHOOK-LEADS — BOT DO ESTANDE (17/05/2026)

### Mudança de propósito
O bot foi reposicionado: antes era um "atendente do evento ESX" que tirava dúvidas sobre a feira. Agora é um **representante da NoLevel no estande da ESX**, focado em apresentar o produto NoLevel para visitantes.

### Estratégia de IA (refinada)
- Avisos são a **fonte de verdade**, mas IA **resume e naturaliza** as respostas
- IA nunca lê o aviso literalmente — reformula de forma conversacional
- **`parseAvisos`** — transforma string raw em array estruturado `{ titulo, conteudo }`
- **`encontrarAvisoRelevante`** — matching inteligente PT-BR:
  - Normalização de acentos (NFD)
  - Remoção de stop words portuguesas
  - Score ponderado: match no título vale 2x, match no conteúdo vale 1x
  - Bônus proporcional de palavras do título vs pergunta
- **`gerarRespostaComAviso`** — quando encontra aviso relevante:
  - Usa `role: "system"` (conhecimento assimilado, não texto lido)
  - Prompt: "Você estudou e domina este assunto... Explique com SUAS PALAVRAS, como se estivesse ensinando alguém"
  - NUNCA repete frases inteiras do texto original
  - NUNCA usa formatos como "Sobre X:" ou "De acordo com..."
  - Temperature 0.3, max_tokens 100
  - Fallback: "Desculpe, pode repetir?" (nunca devolve texto bruto)
- **`gerarRespostaFallback`** — quando NENHUM aviso casa:
  - Usa `role: "system"` com múltiplos tópicos assimilados
  - Mesmas regras de paraphrase obrigatória
  - Se não souber: "Nao sei informar, mas posso anotar seu contato"
- **Greetings sem IA**: saudações simples respondem sem chamar OpenAI

### Fluxo atual do bot
1. Visitante envia CPF → valida na `leads-network`
2. Mensagem → se for saudação → responde sem IA
3. Mensagem → `parseAvisos` + `encontrarAvisoRelevante` (matching local)
4. Se matched → `gerarRespostaComAviso` (IA só com aquele aviso = contexto mínimo)
5. Se não matched → `gerarRespostaFallback` (IA com todos os avisos)
6. Ao encerrar → salva memória do resumo da conversa

### Como usar
Os avisos cadastrados no sistema (tabela `avisos`) devem conter **informações sobre a NoLevel** no formato:
- **Título:** assunto (ex: "Integração WhatsApp")
- **Conteúdo:** descrição detalhada (ex: "O NoLevel se integra com WhatsApp via Evolution API...")

Quando um visitante perguntar "Como funciona a integração com WhatsApp?", o matching encontra o aviso, and a IA resume numa resposta natural e conversacional.

---

## 17. NOTIFICAÇÕES PROATIVAS WEBHOOK24 (19/05/2026)

### Objetivo
O webhook24 agora envia mensagens proativas no WhatsApp do usuário em 3 momentos do ciclo de vida do chamado:
1. **Chamado criado** (status `NOVO`) — aviso de criação com número do ticket
2. **Chamado em atendimento** (status `EM_ANDAMENTO`) — aviso que começou a ser tratado
3. **Chamado finalizado** (movido para `tickets_fechados`) — aviso de conclusão

### Arquitetura

```
Usuário → Webhook24 (valida CPF)
  → phoneMap.ts salva: CPF → { telefone, instance }
  → Usuário abre chamado via webhook24
  → Atendente atualiza/finaliza via sistema web
    → api/tickets/route.ts busca telefone pelo CPF no phoneMap
    → sendEvolutionText envia notificação proativa
```

### Componentes criados/modificados

#### `src/lib/phoneMap.ts` (novo)
- Persistência em arquivo JSON (`data/phoneMap.json`)
- Mapa: `CPF → { telefone, instance, updatedAt }`
- Funções: `registerPhone()`, `getPhoneByCpf()`, `removePhone()`

#### `src/app/api/webhook24/route.ts` (modificado)
- Importa `registerPhone` do phoneMap
- Na etapa `IDENTIFICACAO_CPF`, após validar CPF, chama `registerPhone(cleanCPF, number, instance)`
- Vincula o número de WhatsApp ao CPF para notificações futuras

#### `src/app/api/tickets/route.ts` (modificado)
- Importa `getPhoneByCpf` e `sendEvolutionText`
- Função auxiliar `notificarCliente(cpf, ticket, etapa, nomeAtendente?)`
- **POST** (criação): notifica "Seu chamado *TKT-xxx* foi criado com sucesso!"
- **PUT** (status → `EM_ANDAMENTO`): notifica "Seu chamado *TKT-xxx* começou a ser tratado!"
- **DELETE** (finalização): notifica "Seu chamado *TKT-xxx* foi finalizado."

### Regras de negócio
- Apenas usuários que interagiram com o webhook24 recebem notificações (precisam ter CPF mapeado)
- Chamados abertos pelo portal web NÃO geram notificação (sem telefone registrado)
- Falha na notificação não quebra o fluxo principal (try/catch isolado)
- O número de WhatsApp é registrado automaticamente na primeira interação com o bot

---

## 18. CORREÇÃO: MATCHING BIDIRECIONAL DE SETORES (19/05/2026)

### Problema
O matching de setores nos webhooks (22, 23, 24) e chat usava apenas:
```typescript
setores.find(s => lowerInput.includes(s.toLowerCase()))
```
Isso falhava quando o nome do setor no banco era mais específico que a resposta do usuário. Ex:
- Setor no banco: `"Suporte Técnico"` → usuário digita `"suporte"` → `"suporte".includes("suporte técnico")` → **false** ❌

### Solução aplicada em `webhook22`, `webhook23`, `webhook24` e `chat/route.ts`
```typescript
const setor = setores.find(s => {
  const nomeSetor = s.toLowerCase();
  return nomeSetor.includes(input) || input.includes(nomeSetor);
});
```
Matching bidirecional: checa se o **nome do setor contém o input** OU se o **input contém o nome do setor**.

---

## 19. VISUALIZAÇÃO KANBAN (19/05/2026)

### Objetivo
Adicionar visualização em quadro Kanban para os chamados abertos, permitindo que o atendente alterne entre visualização em lista (tabela) e visualização em colunas (Kanban) para gerenciar chamados de forma mais visual e intuitiva.

### Status padronizados
Os status foram padronizados para valores consistentes e profissionais:
| Valor | Display | Cor |
|-------|---------|-----|
| `NOVO` | Novo | Roxo (`--status-new`) |
| `EM_ATENDIMENTO` | Em Atendimento | Laranja (`--status-in-progress`) |
| `AGUARDANDO` | Aguardando | Magenta (`--status-waiting`) |
| `CONCLUIDO` | Concluído | Verde (`--status-completed`) |
| `CANCELADO` | Cancelado | Vermelho (`--status-cancelled`) |

### Arquivos criados/modificados

#### `src/app/(atendimento)/all-tickets/kanban-board.tsx` (novo)
- Componente KanbanBoard que renderiza **5 colunas**: **Novo**, **Em Atendimento**, **Aguardando**, **Concluído**, **Cancelado**
- Cada coluna exibe cards com: número do ticket, nome, setor, prioridade, data e atendente
- Cores dos cards de prioridade: Baixa (verde), Normal (laranja), Alta (vermelho), Crítica (vermelho escuro)
- Função `normalizeStatus()` que normaliza variações de status do banco para os 5 grupos
- **Drag and drop nativo (HTML5):** cards podem ser arrastados entre colunas
  - `draggable` nos cards, `onDragStart`/`onDragEnd` no card, `onDragOver`/`onDragLeave`/`onDrop` na coluna
  - Feedback visual: card arrastado fica semi-transparente e rotacionado; coluna alvo destaca borda
  - Drop zone vazia exibe "Solte aqui" quando hover
- Ao soltar card em coluna diferente, faz `PUT /api/tickets?atendimento=X&estagio=NOVO_STATUS` com `userId` da sessão
- Se o drop for na mesma coluna, não faz nada (evita chamada desnecessária)
- Clique em qualquer card abre o `ModalChamado` existente (reúso completo)
- Ao concluir/fechar o modal, o Kanban faz refresh automático da lista
- Grid responsivo: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5`

#### `src/app/(atendimento)/all-tickets/page.tsx` (modificado)
- Adicionado estado `viewMode: 'list' | 'kanban'` para alternar entre visualizações
- Botões de toggle no header dos filtros com ícones (`LayoutList` e `Columns3` da Lucide)
- Botão ativo recebe cor primária com texto branco; inativo fica transparente
- Filtro de status agora preserva case (não aplica `.toLowerCase()`) para corresponder exatamente aos valores padronizados
- Função `refreshTickets()` criada para permitir refresh manual do Kanban
- Exibição de status na tabela agora usa `replace(/_/g, ' ')` (todas as ocorrências)

#### `src/app/(atendimento)/components/modal_tandimento.tsx` (modificado)
- Dropdown de status atualizado com valores padronizados:
  - ~~`aberto`~~ → `NOVO`
  - ~~`em_atendimento`~~ → `EM_ATENDIMENTO`
  - ~~`aguardando`~~ → `AGUARDANDO`
  - ~~`concluido`~~ → `CONCLUIDO`
  - **Novo:** `CANCELADO`

### Arquitetura do Kanban
```
all-tickets/page.tsx
  ├── [viewMode=list]  → Tabela (existente)
  └── [viewMode=kanban] → KanbanBoard (drag-and-drop)
                            ├── Coluna "Novo" (status NOVO)
                            ├── Coluna "Em Atendimento" (status ATENDIMENTO/ANDAMENTO)
                            ├── Coluna "Aguardando" (status AGUARDANDO)
                            ├── Coluna "Concluído" (status CONCLUIDO)
                            ├── Coluna "Cancelado" (status CANCELADO)
                            └── Card → clique → ModalChamado (mesmo componente da lista)
                                  → arrastar → soltar em coluna → PUT /api/tickets
```

### Regras de negócio
- Kanban mostra **todas as 5 colunas** de status disponíveis
- Drag and drop move o chamado entre colunas, atualizando o status via API
- Se o card for solto na mesma coluna, a operação é ignorada (sem chamada à API)
- Filtros de nome, ticket, setor, prioridade funcionam em ambos os modos
- Filtro de status funciona nos dois modos (em Kanban, filtra quais tickets aparecem nas colunas)
- Refresh automático ao fechar modal garante consistência dos dados

---

## 20. MELHORIAS DE SEGURANÇA E QUALIDADE (19/05/2026)

### Implementação dos itens 1-11 do `ideias.md`

| Item | Mudança | Arquivos |
|------|---------|----------|
| 1 | Removido log de senha em plaintext | `api/auth/[...nextauth]/route.ts` |
| 2 | Auth real em PUT/DELETE de tickets (usando session.user.id) | `api/tickets/route.ts`, `api/tickets/search/route.ts` |
| 3 | GET empresas protegido (exceto consulta por CPF pública) | `api/empresa/route.ts` |
| 4 | GET leads-network protegido | `api/leads-network/route.ts` |
| 5-6 | Dependências fantasmas removidas | `package.json` |
| 7 | Vitest configurado (scripts + vitest.config.ts) | `vitest.config.ts`, `package.json` |
| 8 | Error boundaries (global + atendimento) | `src/app/error.tsx`, `src/app/(atendimento)/error.tsx` |
| 9 | 26 `alert()` substituídos por `react-hot-toast` | 8 arquivos de UI |
| 10 | Zod + React Hook Form instalados, schemas criados | `src/lib/validation.ts` |
| 11 | Normalização de status nas rotas PUT de tickets | `api/tickets/route.ts`, `api/tickets/search/route.ts` |

### Detalhes técnicos

#### Autenticação em PUT/DELETE de tickets
Antes: `getSessionOrFail()` era chamado sem `await` e o retorno era descartado — qualquer requisição com `userId` no body conseguia alterar qualquer chamado.
Depois: `const session = await getSessionOrFail()` com verificação de `!session`, e `userId` passa a vir de `session.user.id` (ignorando o body).

#### Toast notifications
`react-hot-toast` já estava no `package.json` mas nunca era importado. Agora está configurado no `layout-client.tsx` com `<Toaster />` e todos os 26 `alert()` foram substituídos por `toast.success()` / `toast.error()`.

#### Normalização de status
Função `normalizarStatus()` adicionada nas rotas PUT que normaliza qualquer variação de status (maiúscula/minúscula, `em_andamento`, `aberto`, `concluido`) para os 5 valores padronizados: `NOVO`, `EM_ATENDIMENTO`, `AGUARDANDO`, `CONCLUIDO`, `CANCELADO`.

#### Validação com Zod
Schemas de validação centralizados em `src/lib/validation.ts` para: CPF, email, senha, criação de usuário, chamado, empresa e lead.

---

## 21. ITENS 13-28 DO IDEIAS.MD — IMPLEMENTAÇÃO (19/05/2026)

### Resumo

Implementação dos itens 13 a 28 do `ideias.md` (excluindo item 12 e 18, que eram testes propositais de webhooks, e item 26 já implementado no item 1).

### Item 13 — Índices no Banco de Dados

Adicionados `@@index` nos modelos do Prisma para performance:

| Modelo | Índices |
|--------|---------|
| `empresa` | `nome`, `cnpj` |
| `User` | `empresaId`, `cpf`, `email` |
| `Chamado` | `empresaId`, `cpf`, `status`, `[empresaId, status]`, `ticket` |
| `cpfs` | `empresaId`, `cpf` |
| `tickets_fechados` | `empresaId`, `cpf`, `ticket` |
| `avisos` | `empresaId`, `setor` |
| `resumoPersona` | `cpf` |
| `cpfsLeads` | `cpf`, `telefone` |

### Item 14 — Tema Consistente

- **`src/app/(atendimento)/components/modal-edit-user.tsx`**: Substituídas classes `dark:bg-zinc-900`, `dark:text-zinc-100`, etc. por variáveis CSS (`var(--surface)`, `var(--foreground)`, etc.)
- **`src/app/userFacil/page.tsx`**: Adicionado suporte completo ao tema com variáveis CSS (antes usava apenas `border p-2 rounded` sem tema)

### Item 15 — Skeleton Loaders

- **`src/app/components/skeleton.tsx`** (novo): Componentes `Skeleton`, `SkeletonTable`, `SkeletonCard`
- **`src/app/(atendimento)/all-tickets/loading.tsx`** (novo): Loading state com SkeletonTable

### Item 16 — Componentes UI Reutilizáveis

| Componente | Arquivo |
|------------|---------|
| `StatusBadge` | `src/app/components/status-badge.tsx` |
| `PriorityBadge` | `src/app/components/priority-badge.tsx` |
| `Spinner` | `src/app/components/spinner.tsx` |

### Item 17 — Acessibilidade (ARIA)

- **`modal_tandimento.tsx`**: Adicionado `role="dialog"`, `aria-modal="true"`, `aria-labelledby` no container; fechamento com tecla Escape
- **`modal-edit-user.tsx`**: Mesmas melhorias de ARIA + Escape key

### Item 19 — Docker USER node

- **`dockerfile`**: Adicionado `USER node` antes do `EXPOSE` para segurança (container não roda mais como root)
- **`dockerfile`**: Adicionado `RUN mkdir -p /app/data && chown -R node:node /app/data` para que o `phoneMap.json` possa ser escrito pelo usuário `node`

### Item 20 — CI/CD com Validação

- **`.github/workflows/deploy.yml`** e **`deploy-homologa.yml`**: Adicionados steps de `checkout`, `setup-node`, `npm ci`, `npm run lint`, `npm run build` antes do deploy

### Item 21 — Typo no layout

- **`src/app/layout.tsx`**: Corrigido `ransition-colors` → `transition-colors`

### Item 22 — .env.example

- **`.env.example`** (novo): Template com todas as variáveis de ambiente documentadas (valores placeholder)

### Item 23 — Typo no Schema

- **`prisma/schema.prisma`**: Corrigido `chammados` → `chamados` no model `empresa`

### Item 24 — Prettier

- **`.prettierrc`** e **`.prettierignore`** (novos): Configuração de formatação automática

### Item 25 — Documentação da API

- **`src/app/api-docs/page.tsx`** (novo): Página com tabela de todos os endpoints, métodos, autenticação e descrição

### Item 27 — Tipos Centralizados

- **`src/types/chamado.ts`** (novo): Tipos `Chamado`, `HistoricoItem` + funções `getStatusColor()`, `getPriorityColor()`, `normalizarStatus()` centralizadas
- Removidos tipos duplicados de `modal_tandimento.tsx`, `tickets/route.ts`, `tickets/search/route.ts`, `consulta/[ticket]/page.tsx`, `all-tickets/page.tsx`, `kanban-board.tsx`
- Funções de cor e normalização agora importadas do arquivo central

### Item 28 — Telefone Opcional no Portal

- **`src/app/chamado/page.tsx`**: Adicionado campo "Telefone (opcional)" no formulário de abertura de chamado
- **`src/app/api/tickets/route.ts`**: POST agora aceita `telefone` e registra no `phoneMap` via `registerPhone()` para permitir notificações WhatsApp mesmo para chamados abertos pelo portal web

---

## 22. CORREÇÃO DE MULTI-TENANCY — DADOS ENTRE EMPRESAS (20/05/2026)

### Problemas identificados

Diversos bugs críticos de **vazamento de dados entre empresas (multi-tenancy)** foram encontrados e corrigidos:

| # | Severidade | Arquivo | Problema |
|---|-----------|---------|----------|
| 1 | 🔴 Crítico | `api/cpfs/route.ts` — DELETE | Deletava CPF de QUALQUER empresa sem verificar empresaId |
| 2 | 🔴 Crítico | `api/tickets/route.ts` — PUT | Atualizava chamado de QUALQUER empresa sem verificar empresaId |
| 3 | 🔴 Crítico | `api/tickets/route.ts` — DELETE | Movia chamado para fechados de QUALQUER empresa sem verificar empresaId |
| 4 | 🔴 Crítico | `api/tickets/search/route.ts` — GET | Retornava chamados de TODAS as empresas sem autenticação |
| 5 | 🔴 Crítico | `gestao-de-usuarios/page.tsx` | Exibia setores da primeira empresa do banco, não da empresa do usuário |
| 6 | 🔴 Crítico | `api/empresa/route.ts` — GET | Retornava TODAS as empresas para qualquer usuário logado |

### Correções aplicadas

#### Fix 1 — CPF DELETE escopado por empresaId (`api/cpfs/route.ts`)
```typescript
// Antes: deletava qualquer CPF sem verificar empresa
await prisma.cpfs.delete({ where: { cpf } })

// Depois: verifica se o CPF pertence à empresa do usuário
const registro = await prisma.cpfs.findFirst({ where: { cpf, empresaId } })
if (!registro) return error 404
await prisma.cpfs.delete({ where: { cpf } })
```

#### Fix 2 — Empresa GET filtrando por role (`api/empresa/route.ts`)
- Se o usuário é **GOD**: retorna todas as empresas (admin)
- Se o usuário é **ADMIN/GESTOR**: retorna apenas a própria empresa
- A página `gestao-de-usuarios/page.tsx` passa a receber os setores corretos

#### Fix 3 — Tickets PUT escopado por empresaId (`api/tickets/route.ts`)
```typescript
// Adicionado empresaId no where do findFirst
const chamadoExistente = await prisma.chamado.findFirst({
  where: { ticket: ticketNumber.trim(), empresaId }
})
```

#### Fix 4 — Tickets DELETE escopado por empresaId (`api/tickets/route.ts`)
```typescript
// Adicionado empresaId no where do findFirst
const chamado = await prisma.chamado.findFirst({
  where: { ticket: ticketNumber.trim(), empresaId }
})
```

#### Fix 5 — Tickets search com empresaId quando autenticado (`api/tickets/search/route.ts`)
- Quando chamado com sessão (web UI): filtra por empresaId
- Quando chamado sem sessão (bot via `StatusChamado`): mantém busca por CPF/ticket (escopo natural)

### Impacto
- ✅ GOD continua vendo todas as empresas (admin)
- ✅ ADMIN/GESTOR vêem apenas dados da própria empresa
- ✅ Bot WhatsApp continua funcionando via CPF (escopo natural)
- ✅ Webhooks mantidos (CPF → empresaId via registro)
- Build validado com `npm run build` — sem erros

### Correções adicionais (20/05/2026)

#### Fix 7 — Tickets GET role-aware para filtro de setor
**Problema:** O GET de tickets SEMPRE filtrava por `setor: userSetor`, fazendo com que ADMIN e GESTOR só vissem chamados do próprio setor, não da empresa inteira.
**Correção:** Apenas ATENDENTE tem filtro de setor automático. ADMIN, GESTOR e GOD veem todos os setores da empresa.
```typescript
if (userRole === "ATENDENTE") {
  where.setor = userSetor
}
```

#### Fix 8 — Páginas públicas de consulta usando API errada
**Problema:** As páginas `/consulta` e `/consulta/[ticket]` chamavam `/api/tickets?cpf=X` e `/api/tickets?ticket=X`, que exigem autenticação. Por serem páginas públicas, retornavam 401.
**Correção:** Agora chamam `/api/tickets/search?cpf=X` e `/api/tickets/search?ticket=X`, que funcionam sem autenticação (escopo natural por CPF/ticket).
- `src/app/consulta/page.tsx` — URL alterada
- `src/app/consulta/[ticket]/page.tsx` — URL alterada

---

## 23. GOD CRIA USUÁRIOS NO FORM PADRÃO + LISTA DE ADMINS (20/05/2026)

### Mudanças

#### 1. GOD liberado no form de criação de usuários (`api/users/route.ts`)
Antes: GOD era bloqueado com "GOD deve usar a rota específica de criação".
Agora: GOD pode criar qualquer papel e selecionar a empresa destino via campo `empresaId` no form.

#### 2. Nova API `/api/users/admins` (restrita a GOD)
| Método | Função |
|--------|--------|
| `GET` | Lista todos usuários com role ADMIN (nome, CPF, email, empresa, setor) |
| `PUT` | Edita dados de um admin (nome, email, CPF, setor) |
| `DELETE` | Remove um admin por ID |

#### 3. Formulário `gestao-de-usuarios/page.tsx`
- GOD vê campo extra "Empresa" (dropdown com todas empresas)
- GOD também vê opção "Master" no seletor de Papel
- Demais usuários: comportamento inalterado

#### 4. Página `cpfs/page.tsx` — Lista de Administradores
- Apenas GOD vê a seção "Administradores Cadastrados"
- Tabela com: Nome, CPF, Empresa, Setor, Ações (Editar/Apagar)
- Edição inline com formulário dentro da própria página
- Exclusão com confirmação (`confirm()`)

### Arquivos criados
- `src/app/api/users/admins/route.ts` — CRUD de administradores

### Arquivos modificados
- `src/app/api/users/route.ts` — GOD liberado + empresaId opcional
- `src/app/(atendimento)/gestao-de-usuarios/page.tsx` — GOD mode + empresa selector
- `src/app/(atendimento)/cpfs/page.tsx` — Lista de admins (só GOD)

### Build
- `npm run build` — compilado com sucesso ✅

---

## 24. RBAC COMPLETO — CONTROLE DE ACESSO POR PAPEL (21/05/2026)

### Objetivo
Implementar sistema completo de RBAC (Role Based Access Control) com validações obrigatórias no backend. Nenhuma regra depende apenas da interface visual. Todas as permissões são protegidas nas rotas, APIs e queries.

### Arquivo central: `src/lib/rbac.ts` (novo)
Sistema centralizado de permissões com tipagem forte e regras desacopladas:

| Constante/Função | Descrição |
|-----------------|-----------|
| `CREATE_ROLE_MAP` | Quem pode criar qual papel: GOD→ADMIN, ADMIN→GESTOR/ATENDENTE, GESTOR→ATENDENTE |
| `DELETE_ROLE_MAP` | Quem pode deletar qual papel: GOD→ADMIN/GESTOR/ATENDENTE, ADMIN→GESTOR/ATENDENTE, GESTOR→ATENDENTE |
| `VIEW_USERS_ROLES` | Quem pode ver quais usuários, com escopo por empresa/setor |
| `CAN_VIEW_EMPRESAS` | Apenas GOD vê lista de empresas |
| `CAN_BATCH_CPF` | GOD, ADMIN e GESTOR podem importar CPF em lote |
| `podeCriarRole()` | Verifica se um papel pode criar outro |
| `podeDeletarRole()` | Verifica se um papel pode deletar outro (GOD nunca pode ser deletado) |
| `getSetorFilter()` | Retorna filtro de setor baseado na role |
| `getTicketWhereClause()` | Retorna cláusula where para tickets baseada na role |
| `getServerSessionRBAC()` | Valida sessão + role + retorna erro padronizado |

### Hierarquia de permissões de criação:
| Quem cria | Pode criar |
|-----------|-----------|
| GOD | ADMIN |
| ADMIN | GESTOR, ATENDENTE |
| GESTOR | ATENDENTE (mesmo setor) |
| ATENDENTE | Ninguém |

### Hierarquia de exclusão:
| Quem exclui | Pode excluir |
|------------|-------------|
| GOD | ADMIN, GESTOR, ATENDENTE (NUNCA GOD) |
| ADMIN | GESTOR, ATENDENTE (mesma empresa) |
| GESTOR | ATENDENTE (mesmo setor) |
| ATENDENTE | Ninguém |

### Proteções implementadas no backend:

#### `src/app/api/users/route.ts`
- **POST**: Valida:
  - Se usuário logado pode criar o papel alvo (`podeCriarRole`)
  - Se GESTOR: só cria no próprio setor
  - Se ADMIN: setor deve pertencer à empresa
  - Se GOD: empresa selecionada deve existir
  - Unicidade de CPF (por empresa) e email (global)
  - **Auto-registro de CPF** na tabela `cpfs` via `upsert`
- **GET**: Filtra por:
  - GOD: todos os usuários (todas empresas)
  - ADMIN: usuários da própria empresa
  - GESTOR: apenas ATENDENTES do próprio setor
- **DELETE**: Valida:
  - GOD nunca pode ser deletado (retorna 403)
  - GOD deleta ADMIN/GESTOR/ATENDENTE
  - ADMIN deleta GESTOR/ATENDENTE (mesma empresa)
  - GESTOR deleta ATENDENTE (mesmo setor)

#### `src/app/api/users/admins/route.ts`
- GET/PUT/DELETE: Apenas GOD
- DELETE: Bloqueia exclusão de GOD (retorna 403)
- PUT: Só permite alterar ADMIN

#### `src/app/api/userFacil/route.ts`
- GET/POST: Apenas GOD
- POST: Valida `podeCriarRole("GOD", finalRole)` — GOD só cria ADMIN
- Auto-registro de CPF na tabela `cpfs`

#### `src/app/api/cpfs/route.ts`
- **POST multipart** (lote): Apenas GOD, ADMIN, GESTOR (valida via `CAN_BATCH_CPF`)
- **POST json** (manual): GOD, ADMIN, GESTOR e ATENDENTE
- **DELETE**: GOD, ADMIN, GESTOR — com validação extra: não permite deletar CPF de usuário do sistema
- **GET**: Filtra por empresaId da sessão

#### `src/app/api/tickets/route.ts`
- **GET**: ATENDENTE e GESTOR filtram por setor (`getTicketWhereClause`)
- **PUT**: ATENDENTE e GESTOR só podem atualizar chamados do próprio setor
- **DELETE**: ATENDENTE e GESTOR só podem finalizar chamados do próprio setor

#### `src/app/api/tickets/search/route.ts`
- **PUT/DELETE**: Mesmas validações de setor para ATENDENTE e GESTOR

### Proteções na interface:

#### `src/app/(atendimento)/components/sidebar.tsx`
- Menu "Empresas": visível apenas para GOD
- Menu "Gestão de Usuarios": visível para GOD, ADMIN e GESTOR
- Demais menus: visíveis para todos (Dashboard, Chamados, Avisos, CPFs)

#### `src/app/(atendimento)/gestao-de-usuarios/page.tsx`
- Filtro "Papel" mostra apenas roles que o usuário pode criar
- GOD vê seletor de empresa, ADMIN e GESTOR não
- GESTOR só vê setores disponíveis
- ATENDENTE não vê o formulário (rolesPermitidas vazio)
- Tabela de usuários cadastrados com RBAC (GOD vê todos, ADMIN vê empresa, GESTOR vê setor)
- Botão "Excluir" nunca aparece para usuários GOD

#### `src/app/(atendimento)/empresa/page.tsx`
- Redireciona para `/dashboards` se usuário não é GOD
- Só GOD pode acessar página de empresas

#### `src/app/(atendimento)/empresa/create/page.tsx`
- Redireciona para `/dashboards` se usuário não é GOD

#### `src/app/(atendimento)/cpfs/page.tsx`
- Seção de importação em lote: escondida para ATENDENTE
- Seção de admins: apenas GOD vê

### Arquivos criados:
- `src/lib/rbac.ts` — Sistema centralizado de permissões RBAC

### Arquivos modificados:
- `src/util/permission.ts` — Tipagem ROLE no array
- `src/app/api/users/route.ts` — RBAC completo + auto-registro CPF
- `src/app/api/users/admins/route.ts` — Bloqueio exclusão GOD
- `src/app/api/userFacil/route.ts` — Validação podeCriarRole + auto CPF
- `src/app/api/cpfs/route.ts` — ATENDENTE só manual, lote restrito
- `src/app/api/tickets/route.ts` — Setor filter por role
- `src/app/api/tickets/search/route.ts` — Setor filter por role
- `src/app/(atendimento)/components/sidebar.tsx` — Menu dinâmico por role
- `src/app/(atendimento)/gestao-de-usuarios/page.tsx` — Roles permitidas, lista RBAC
- `src/app/(atendimento)/cpfs/page.tsx` — Lote escondido para ATENDENTE
- `src/app/(atendimento)/empresa/page.tsx` — Redireciona não-GOD
- `src/app/(atendimento)/empresa/create/page.tsx` — Redireciona não-GOD

### Regras de segurança reforçadas:
- ✅ GOD nunca pode ser deletado via API (retorna 403)
- ✅ GESTOR só cria ATENDENTE no próprio setor
- ✅ ADMIN só cria nos setores da própria empresa
- ✅ ATENDENTE só vê/atende chamados do próprio setor
- ✅ Auto-registro de CPF ao criar qualquer usuário (via `upsert`)
- ✅ Impedido bypass de permissão via manipulação de payload
- ✅ Todas as validações no backend + interface consistente
- ✅ Separação clara entre autenticação (NextAuth) e autorização (RBAC)

---

## 25. TELAS DE USUÁRIOS — VISÃO POR EMPRESA (GOD) E GERAL (21/05/2026)

### Objetivo
Criar páginas dedicadas para visualização, edição inline e exclusão de usuários, respeitando o RBAC:
- **GOD**: vê usuários de qualquer empresa, clicando nos cards de empresa
- **ADMIN / GESTOR**: vê usuários da própria empresa em página geral `/usuarios`

### Arquivos criados

#### `src/app/(atendimento)/empresa/[id]/usuarios/page.tsx` (novo - GOD only)
- **Acesso exclusivo GOD**: servido por `getServerSessionRBAC("GOD")` via RBAC
- Lista todos os usuários da empresa em tabela com colunas: Nome, Email, CPF, Papel, Setor
- **Edição inline**: inputs aparecem ao clicar no botão de editar (lápis)
- **Exclusão**: botão vermelho com confirmação (toast)
- Campos editáveis: nome, email, cpf, role (dropdown), setor
- Role dropdown respeita `DELETE_ROLE_MAP` — GOD pode mudar para ADMIN/GESTOR/ATENDENTE
- CPF editável com validação de unicidade por empresa

#### `src/app/(atendimento)/usuarios/page.tsx` (novo - ADMIN/GESTOR/GOD)
- **Acesso**: ADMIN, GESTOR e GOD via `getServerSessionRBAC("GOD", "ADMIN", "GESTOR")`
- ADMIN/GESTOR veem apenas usuários da própria empresa
- GOD vê coluna extra `empresaId` (truncado para 8 chars)
- Mesma estrutura de edição inline e exclusão com validação RBAC
- Role dropdown respeita o mapa de permissões (ADMIN pode definir GESTOR/ATENDENTE, etc.)

### Arquivos modificados

#### `src/app/api/empresa/route.ts`
- Adicionados **PUT** e **DELETE**:
  - PUT: GOD edita nome, cnpj, cor, logoUrl da empresa
  - DELETE: GOD remove empresa (com verificação de existência)
  - Valida unicidade de CNPJ na edição

#### `src/app/api/users/route.ts`
- **PUT** existente com RBAC: GOD edita qualquer usuário não-GOD, ADMIN edita GESTOR/ATENDENTE mesma empresa, GESTOR edita ATENDENTE mesmo setor
- **GET** agora aceita `?empresaId=` para GOD filtrar usuários por empresa
- Inclui `empresaId` no select do PUT para verificação de empresa

#### `src/app/(atendimento)/empresa/page.tsx`
- Cards de empresa agora são **clicáveis** (`onClick → router.push(/empresa/${id}/usuarios)`)
- cursor-pointer + hover scale effect

#### `src/app/(atendimento)/components/sidebar.tsx`
- Novo menu **"Usuários"** (ícone LuUsers) — ADMIN/GESTOR/GOD
- "Gestão de Usuarios" renomeado para **"Criar Usuário"** — ADMIN/GESTOR/GOD
- "Empresas" — GOD apenas (mantido)

### Fluxo de navegação
```
GOD:
  Sidebar → Empresas → cards → clica empresa → /empresa/[id]/usuarios
  Sidebar → Usuários → /usuarios (vê coluna empresaId extra)
  Sidebar → Criar Usuário → /gestao-de-usuarios

ADMIN/GESTOR:
  Sidebar → Usuários → /usuarios (apenas própria empresa)
  Sidebar → Criar Usuário → /gestao-de-usuarios
```

### Separação server/client (RBAC)
- `src/lib/rbac.ts`: constantes e funções **puras** (CREATE_ROLE_MAP, DELETE_ROLE_MAP, etc.) — pode ser importado por client components
- `src/lib/rbac-server.ts`: `getServerSessionRBAC()` — função **server-only** que valida sessão + role; importa `getServerSession` do next-auth

### Build
- `npm run build` — compilado com sucesso ✅
- Commits: `54ecb1b`, `f044ee0`, `aeaf54d`

---

## 26. SEGURANÇA — BLOQUEIO DE AUTO-EDIÇÃO E AUTO-EXCLUSÃO (21/05/2026)

### Regra
Nenhum usuário pode editar ou excluir o próprio perfil. A proteção é aplicada tanto no backend quanto no frontend.

### Backend — `src/app/api/users/route.ts`
- **PUT**: Adicionada verificação `session!.id === id` → retorna 403 "Você não pode editar seu próprio usuário"
- **DELETE**: Adicionada verificação `session!.id === id` → retorna 403 "Você não pode excluir seu próprio usuário"

### Backend — `src/app/api/users/admins/route.ts`
- **PUT**: Adicionada verificação `session.user.id === id` → retorna 403
- **DELETE**: Adicionada verificação `session.user.id === id` → retorna 403

### Frontend
- **`src/app/(atendimento)/usuarios/page.tsx`**: Botões de editar/excluir ocultos quando `u.id === currentUserId`
- **`src/app/(atendimento)/empresa/[id]/usuarios/page.tsx`**: Mesma proteção
- **`src/app/(atendimento)/cpfs/page.tsx`**: Seção de admins oculta ações para o próprio usuário GOD, exibe "Você"

---

## 27. REFATORAÇÃO — REMOÇÃO DE LISTAGEM DA TELA DE CRIAÇÃO (21/05/2026)

### Mudança
A tela de criação de usuários (`gestao-de-usuarios/page.tsx`) agora exibe **apenas o formulário de criação**, sem a tabela de usuários cadastrados.

### Arquivos modificados
- `src/app/(atendimento)/gestao-de-usuarios/page.tsx`:
  - Removida interface `UserListItem`
  - Removida função `fetchUsers()`
  - Removido estado `userList` e `loadingUsers`
  - Removida chamada a `/api/users` no `useEffect`
  - Removida função `handleDeleteUser()`
  - Removida variável `podeVerLista`
  - Removida seção de listagem de usuários do JSX
  - Import `roleParaDisplay` mantido (usado nos options do select)

---

## 28. ADMIN PERTENCE A TODOS OS SETORES (21/05/2026)

### Comportamento verificado
O papel ADMIN já possuía acesso a todos os setores da empresa nas seguintes camadas:

| Camada | Comportamento | Arquivo |
|--------|--------------|---------|
| RBAC | `getSetorFilter()` retorna apenas `{ empresaId }` sem filtro de setor | `src/lib/rbac.ts:46-56` |
| Tickets GET | Filtro de setor aplicado apenas para ATENDENTE e GESTOR | `src/app/api/tickets/route.ts:119-121` |
| Tickets PUT | Validação de setor aplicada apenas para ATENDENTE e GESTOR | `src/app/api/tickets/route.ts:201-205` |
| Tickets DELETE | Validação de setor aplicada apenas para ATENDENTE e GESTOR | `src/app/api/tickets/route.ts:287-291` |
| Criação de usuário | ADMIN pode criar em qualquer setor da empresa | `src/app/api/users/route.ts:83-93` |
| Listagem de usuários | ADMIN vê todos os usuários da empresa | `src/app/api/users/route.ts:166-168` |

Nenhuma alteração de código foi necessária — o comportamento já estava correto.

---

## 29. PROFISSIONALIZAÇÃO DO FRONTEND (21/05/2026)

### Objetivo
Melhorar a aparência visual de todas as páginas internas (exceto landing page), mantendo consistência com o sistema de temas dark/light.

### Mudanças globais
- `src/app/globals.css`: Adicionadas variáveis `--shadow-sm`, `--shadow-md`, `--shadow-lg` para sombras consistentes entre temas

### Páginas modificadas

#### Login (`src/app/login/page.tsx`)
- Substituída imagem de fundo por gradiente com efeito glass (iniciais "N" em destaque)
- Inputs com `rounded-xl`, labels em uppercase tracking-wider
- Botão com hover brightness/shadow e active scale
- Spinner animado no estado de loading
- Transições suaves em todos os elementos

#### Chamados (`src/app/(atendimento)/all-tickets/page.tsx`)
- Filtros com `rounded-xl` e `focus:ring-2` consistente
- Tabela com headers uppercase tracking-wider
- Hover suave nas linhas (`hover:brightness-95`)
- Badges de status/prioridade com padding e fontes ajustados
- Botões de toggle modo visual com padding consistente

#### Avisos (`src/app/(atendimento)/avisos/page.tsx`)
- Botão "Novo Aviso" com `rounded-xl` e hover shadow

#### CPFs (`src/app/(atendimento)/cpfs/page.tsx`)
- Cards com `rounded-xl`, inputs com foco ring primary
- Seção de cadastro manual com descrição e labels modernos
- Upload de arquivo com estilo dashed border e hover effect
- Lista de CPFs com hover brightness, truncate para nomes longos
- Seção de admins com header informativo (contagem), tabela com hover

#### Gestão de Usuários (`src/app/(atendimento)/gestao-de-usuarios/page.tsx`)
- Formulário com labels uppercase tracking-wider
- Inputs com `rounded-xl` e foco ring primary
- Upload de avatar com estilo file input customizado
- Botão submit com hover shadow

#### Usuários (`src/app/(atendimento)/usuarios/page.tsx`)
- Header com ícone + contagem de registros
- Loading state com spinner animado
- Empty state com ícone e texto
- Tabela com headers uppercase tracking-wider
- Role exibida como badge estilizado
- Botões de ação com hover bg colors (success/error/info light)

#### Empresa → Usuários (`src/app/(atendimento)/empresa/[id]/usuarios/page.tsx`)
- Mesmas melhorias da página de usuários geral
- Link de voltar com efeito hover (`hover:gap-3`)

#### Criar Empresa (`src/app/(atendimento)/empresa/create/page.tsx`)
- Header com ícone + descrição
- Inputs com `rounded-xl` e foco ring primary
- Botões com hover shadow

### Consistência visual
Todos os inputs agora seguem o padrão:
- `rounded-xl` (bordas arredondadas)
- `focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent`
- Labels em `text-xs font-bold uppercase tracking-wider opacity-70`

Todos os botões primários seguem:
- `rounded-xl font-bold`
- `hover:brightness-110 hover:shadow-lg active:scale-[0.98]`

### Build
- `npm run build` — compilado com sucesso ✅

---

## 30. MELHORIAS NA CRIAÇÃO DE USUÁRIOS — GESTOR + CPF (21/05/2026)

### Objetivo
Três melhorias na tela de criação de usuários (`gestao-de-usuarios/page.tsx`):
1. GESTOR cria ATENDENTE com setor auto-preenchido e bloqueado
2. CPF aceita apenas números (rejeita letras)
3. CPF exibe formatação `XXX.XXX.XXX-XX` durante digitação

### Mudanças em `src/app/(atendimento)/gestao-de-usuarios/page.tsx`

#### 1. Setor auto-preenchido para GESTOR
- Adicionada const `userSetor` extraída de `session?.user?.setor`
- No `useEffect(fetchDados)`, quando `userRole === "GESTOR" && userSetor`, seta `form.setor = userSetor`
- No JSX, quando `userRole === "GESTOR"` renderiza um `<input disabled>` (em vez do `<select>`) com o valor do setor e legenda "Setor definido automaticamente"

#### 2. Função `formatCPF(value: string): string`
```typescript
function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2")
}
```
- Remove qualquer caractere não-dígito (rejeita letras automaticamente)
- Limita a 11 dígitos
- Formata progressivamente: `XXX.XXX.XXX-XX`

#### 3. CPF tratado no `handleChange` e `handleSubmit`
- `handleChange`: quando `name === "cpf"`, aplica `formatCPF(value)` e salva formatado no estado
- `handleSubmit`: envia `form.cpf.replace(/\D/g, "")` no FormData — apenas números para a API
- Backend já usa `limparCPF()` que também strip non-digits (redundância segura)

### Build
- `npm run build` — compilado com sucesso ✅

---

## 31. TASKS DO ARQUIVO tasks.txt (23/05/2026)

### Tasks implementadas

| # | Task | Status |
|---|------|--------|
| 1 | Notificações WhatsApp — associar número ao chamado mesmo sem sessão ativa | ✅ |
| 2 | Bot reconhecer empresa para qual está respondendo | ✅ |
| 3 | Botão voltar em `consulta/[ticket]` | ✅ |
| 4 | `api/chat` com mesmo comportamento do `webhook24` (adaptado para chat) | ✅ |
| 5 | Corrigir erro no formulário `/leads` | ✅ |
| 6 | Gestores poderem apagar atendentes do seu setor (já implementado) | ✅ |
| 7 | Admin deleta gestor com regra de substituto | ✅ |
| 8 | Admin deleta admin com regra de substituto | ✅ |
| 9 | Card de usuário mostrar cargo/função (Role) | ✅ |

---

### Task 1 — Persistência de telefone para notificações WhatsApp

**Problema original:** O `phoneMap.ts` mapeia CPF → telefone em arquivo JSON (`data/phoneMap.json`), que é perdido ao reconstruir o container Docker. Além disso, apenas o webhook24 registrava o telefone — webhook22 e webhook23 não chamavam `registerPhone`.

**Solução em `src/app/api/tickets/route.ts`:**
- Criada função `buscarContato(cpf, chamadoId)` que:
  1. Primeiro consulta `phoneMap` (mais rápido, tem a instância correta)
  2. Se não encontrar ou instância for `'web'`, busca no `historico` do chamado por entrada `{ acao: "TELEFONE" }`
- `notificarCliente()` agora aceita `chamadoId` e usa `buscarContato()` em vez de `getPhoneByCpf()` direto
- Se a instância for `'web'` (portal web), a notificação é ignorada (impossível enviar WhatsApp sem Evolution API)
- Ao criar chamado com telefone via portal web, o telefone é salvo no `historico` como `[{ data, acao: "TELEFONE", observacao: telefone }]`
- Chamadas a `notificarCliente` em PUT e DELETE agora passam `chamado.id`

**Solução em webhooks:**
- `webhook22/route.ts`: Adicionado `import { registerPhone } + registerPhone(cleanCPF, number, instance)` no fluxo de validação de CPF
- `webhook23/route.ts`: Mesma correção
- webhook24 já possuía a chamada

**Arquivos modificados:**
| Arquivo | Mudança |
|---------|---------|
| `src/app/api/tickets/route.ts` | `notificarCliente` usa fallback historico; POST salva telefone no historico; PUT/DELETE passam chamadoId |
| `src/app/api/webhook22/route.ts` | Import + chamada `registerPhone` |
| `src/app/api/webhook23/route.ts` | Import + chamada `registerPhone` |

---

### Task 2 — Bot reconhece empresa

**Problema:** A constante `empresa = 'Nolevel'` em `useIA.ts` era hardcoded — o bot sempre se apresentava como "atendente virtual da Nolevel" independente da empresa do usuário.

**Solução em `src/lib/useIA.ts`:**
- Constante `empresa` hardcoded removida
- Criada função `getEmpresaName(cpf)` que:
  1. Busca empresaId pelo CPF do usuário (`getEmpresaIdByCpf`)
  2. Busca o nome da empresa na tabela `empresa`
  3. Retorna o nome real ou fallback `'Nolevel'`
- `botIA()` agora chama `getEmpresaName(session.cpf)` dinamicamente a cada interação
- O prompt da IA sempre contém o nome correto da empresa

**Arquivos modificados:**
| Arquivo | Mudança |
|---------|---------|
| `src/lib/useIA.ts` | `empresa` dinâmico via `getEmpresaName()` |

---

### Task 3 — Botão voltar em consulta/[ticket]

**Problema:** A página de detalhe do chamado não tinha como voltar para a página de consulta anterior.

**Solução em `src/app/consulta/[ticket]/page.tsx`:**
- Adicionado botão "Voltar" no canto superior esquerdo
- Usa `window.history.back()` para retornar à página anterior (que manteve o resultado da pesquisa)
- Ícone `FaArrowLeft` importado do `react-icons/fa`
- Estilo consistente: `rounded-xl`, borda sutil, hover scale, transições

**Arquivos modificados:**
| Arquivo | Mudança |
|---------|---------|
| `src/app/consulta/[ticket]/page.tsx` | Botão voltar com `window.history.back()` |

---

### Task 4 — api/chat alinhado com webhook24

**Problema:** O `api/chat/route.ts` tinha comportamento diferente do `webhook24` — exibição simplificada de chamados, sessão expira em 1h, sem fallback em erro de criação, sem labels de status.

**Solução em `src/app/api/chat/route.ts`:**
- `statusLabels` com emojis e labels padronizados (mesmo do webhook24)
- Sessão expira em 2h (antes 1h)
- Comando de saída padronizado: apenas `sair`, `encerrar`, `cancelar`
- Exibição de chamados agora mostra: ticket, status com label, data, setor, atendente, último historico, descrição resumida
- `generateRandomTicket` como fallback quando criação de chamado falha
- Mensagens de confirmação e fluxo alinhados com webhook24

**Arquivos modificados:**
| Arquivo | Mudança |
|---------|---------|
| `src/app/api/chat/route.ts` | Reescrita completa para espelhar webhook24 |

---

### Task 5 — Correção formulário /leads

**Problema:** O formulário de leads em `/leads` enviava CPF com formatação (pontos e traços) para a API, que não limpava o CPF antes de salvar. Erros da API não eram exibidos.

**Solução em `src/app/leads/page.tsx`:**
- Função `cleanCpf()` que remove tudo que não é dígito
- CPF é limpo antes de enviar no JSON
- Tratamento de erro agora exibe a mensagem específica retornada pela API (via `errData?.error`)

**Arquivos modificados:**
| Arquivo | Mudança |
|---------|---------|
| `src/app/leads/page.tsx` | CPF limpo + erro detalhado |

---

### Tasks 7-8 — Regras de substituto na exclusão

**Problema:** Admins podiam excluir gestores sem criar substitutos, deixando a empresa sem gestores. Admins podiam ser excluídos sem reposição.

**Solução em `src/app/api/users/route.ts`:**
- **DELETE GESTOR (por ADMIN):** verifica se existe outro GESTOR na mesma empresa (`id: { not: id }`). Se não, retorna 400 com mensagem "É necessário criar outro GESTOR antes de excluir este."
- **DELETE ADMIN (por GOD ou ADMIN):** verifica se existe outro ADMIN na mesma empresa. Se não, retorna 400 com mensagem "É necessário ter outro ADMIN antes de excluir este."
- A regra se aplica a TODOS os que podem deletar ADMIN (GOD e ADMIN)

**Arquivos modificados:**
| Arquivo | Mudança |
|---------|---------|
| `src/app/api/users/route.ts` | Validação de substituto em DELETE de GESTOR e ADMIN |

---

### Task 9 — Card de usuário mostra Role

**Problema:** O card do usuário na sidebar exibia nome e email, mas não mostrava o papel/cargo.

**Solução em `src/app/(atendimento)/components/cardUser.tsx`:**
- Adicionado badge abaixo do email exibindo `user.role`
- Badge com fundo primary, texto branco, `text-[10px]`, padding horizontal
- Exibido apenas se `user.role` existe

**Arquivos modificados:**
| Arquivo | Mudança |
|---------|---------|
| `src/app/(atendimento)/components/cardUser.tsx` | Badge de role no card |

---

### Build
- `npm run build` — compilado com sucesso ✅

---

## 32. CORREÇÃO: WEBHOOK-LEADS NÃO ENCONTRAVA LEADS (23/05/2026)

### Problema
O webhook-leads consulta leads via `consultarLeadPorCpf()` fazendo um fetch server-side para `GET /api/leads-network?cpf=xxx`. O bot sempre respondia "Não encontrei seu cadastro" mesmo com lead existente.

### Causas (3 problemas empilhados)

| # | Problema | Arquivo | Impacto |
|---|----------|---------|---------|
| 1 | `process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL` — ordem invertida | `webhook-leads/route.ts:64` | Usava `NEXT_PUBLIC_BASE_URL=http://localhost:3001` (porta **host**) dentro do container — **conexão recusada** |
| 2 | `BASE_URL` com porta `:300` em vez de `:3000` | `.env` local | Mesmo se a ordem estivesse correta, a porta estava errada |
| 3 | `GET /api/leads-network?cpf=` exigia autenticação | `leads-network/route.ts:6` | Fetch server-side não tem cookie de sessão → 401 |

### Soluções

#### Fix 1 — Ordem de fallback `consultarLeadPorCpf` (`webhook-leads/route.ts:64`)
```typescript
// Antes (ERRADO):
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL

// Depois (CORRETO — igual usedata.ts):
const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL
```
`BASE_URL=http://nolevel-app:3000` (Docker internal) agora é usado primeiro.

#### Fix 2 — Porta do `.env` local
`BASE_URL` ajustada de `:300` para `:3000`. `.env.example` já estava correto.

#### Fix 3 — Auth no GET leads-network (`leads-network/route.ts`)
Consulta por CPF (`?cpf=`) agora é **pública** — não exige sessão (escopo natural pelo CPF). Listagem geral mantém autenticação.

### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `src/app/api/webhook-leads/route.ts` | `BASE_URL` usado primeiro (ordem de fallback corrigida) |
| `src/app/api/leads-network/route.ts` | GET com `?cpf=` não requer mais autenticação |

### Build
- `npm run build` — compilado com sucesso ✅

---

## 33. REDIRECIONAMENTO PARA /CHAMADO QUANDO PRECISAR DE DOCUMENTOS (23/05/2026)

### Objetivo
Quando um usuário solicitar um serviço que precise de envio de documentos (fotos, comprovantes, PDFs, etc.) pelo **chatbot-app** (via `/api/chat`) ou **webhook24**, o bot deve redirecioná-lo para abrir um chamado pelo portal web (`/chamado`), onde é possível anexar arquivos.

### Mudanças

#### 1. `src/lib/useIA.ts` — Prompt da IA
- Seção `UPLOAD` substituída por `UPLOAD DE DOCUMENTOS` com instruções mais explícitas
- IA agora tem regra clara: se usuário pedir serviço que precise de documentos, NÃO prosseguir com fluxo normal — redirecionar para `/chamado`
- Lista de palavras-chave para detectar necessidade de documentos
- Instrução para nunca tentar coletar documentos pelo chat

#### 2. `src/app/api/webhook24/route.ts` — Detecção programática
- No estado `COLETAR_MOTIVO`, após receber o motivo do usuário, verifica se contém palavras-chave de documentos
- Se detectado: envia mensagem com link para `/chamado` e volta ao menu principal
- Se não: prossegue com fluxo normal

#### 3. `src/app/api/chat/route.ts` — Mesma detecção
- Mesma lógica do webhook24 aplicada ao chat

### Fluxo
```
Usuário → "Preciso enviar um comprovante"
  → Bot detecta palavra "comprovante"
  → "Para este tipo de serviço, você precisa abrir um chamado pelo nosso portal... Acesse: [URL]/chamado"
  → Volta ao menu principal
```

### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `src/lib/useIA.ts` | Prompt da IA atualizado com regras de redirecionamento |
| `src/app/api/webhook24/route.ts` | Detecção de documentos no COLETAR_MOTIVO |
| `src/app/api/chat/route.ts` | Detecção de documentos no coletar_motivo |

### Build
- `npm run build` — compilado com sucesso ✅

---

## 35. WEBHOOK25 — RECEPÇÃO DE FOTOS/DOCUMENTOS VIA WHATSAPP (29/05/2026)

### Objetivo
Criar uma nova instância do bot WhatsApp (webhook25) capaz de receber fotos e documentos enviados pelo usuário (atestados, comprovantes, laudos, etc.) e anexá-los automaticamente ao chamado aberto.

### Arquitetura

```
Usuário → WhatsApp → Evolution API → webhook25
  → Detecta mensagem com imagem/documento
  → downloadEvolutionMedia() → Evolution API download
   → uploadBuffer() → Supabase Storage (bucket "anexo")
   → Anexa URL ao chamado (anexoUrl)
```

### Fluxo do bot

```
INICIO → IDENTIFICACAO_CPF → [nome?] → MENU_PRINCIPAL
  → COLETAR_MOTIVO (descreve problema)
    → PERGUNTAR_ANEXO (bot pergunta se quer enviar arquivo)
      → "sim" → COLETAR_MIDIA (aguarda o arquivo)
        → Usuário envia foto/documento
        → downloadEvolutionMedia() baixa da Evolution API
        → uploadBuffer() envia ao Supabase Storage
        → URL salva em session.anexoUrl
        → COLETAR_SETOR
      → "não" → COLETAR_SETOR (pula anexo)
    → COLETAR_SETOR → enviarChamado() com anexoUrl
```

### Novos componentes

#### `src/lib/usedata.ts` — `downloadEvolutionMedia()`
- Faz POST para `{EVOLUTION_API_URL}/message/downloadMedia/{instance}` com a key da mensagem
- Retorna Buffer com o conteúdo binário do arquivo
- Usa mesma autenticação (apikey) do `sendEvolutionText`

#### `src/lib/upload.ts` — `uploadBuffer()`
- Aceita Buffer, fileName, mimeType
- Envia para Supabase Storage no bucket "documents"
- Retorna URL pública do arquivo
- Similar ao `uploadFile()` existente, mas para upload server-side (sem File API)

#### `src/lib/useIA.ts` — Novos estados
- `PERGUNTAR_ANEXO` e `COLETAR_MIDIA` adicionados ao `FlowState`

#### `src/app/api/webhook25/route.ts` (novo)
- Baseado no webhook24 (importa FlowState de useIA.ts)
- **PERGUNTAR_ANEXO**: Bot pergunta se quer enviar arquivo anexo
- **COLETAR_MIDIA**: Aceita imageMessage ou documentMessage da Evolution API
  - Extrai mimeType, extensão, nome do arquivo
  - Baixa o binário via `downloadEvolutionMedia()`
  - Envia ao Supabase via `uploadBuffer()`
  - Salva `session.anexoUrl`
  - Se usuário enviar texto "não"/"sem arquivo", pula para setor
  - Se texto não reconhecido, instrui a enviar arquivo ou responder "não"
- **COLETAR_SETOR**: Chamada `enviarChamado(nome, cpf, setor, descricao, anexoUrl)`
  - Mensagem de confirmação inclui "📎 O arquivo enviado foi anexado automaticamente" se houver anexo

#### `enviarChamado()` modificado
- Parâmetro `anexoUrl?: string` adicionado (opcional, retrocompatível)
- Se fornecido, salva no campo `anexoUrl` do Chamado

### Supabase Storage
- Bucket: `anexo` (mesmo usado pelo portal web)
- Path: `{cpf}/{nome_do_arquivo}`
- Público: URL pública gerada pelo Supabase

### Arquivos criados
| Arquivo | Descrição |
|---------|-----------|
| `src/app/api/webhook25/route.ts` | Webhook com suporte a mídia |

### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `src/lib/useIA.ts` | Adicionados estados PERGUNTAR_ANEXO e COLETAR_MIDIA ao FlowState |
| `src/lib/upload.ts` | Adicionada função `uploadBuffer()` |
| `src/lib/usedata.ts` | Adicionada `downloadEvolutionMedia()`, `enviarChamado()` aceita anexoUrl |

### Build
- `npm run build` — compilado com sucesso ✅

---

## 36. CORREÇÃO WEBHOOK25 — REDIRECT REMOVIDO, useIA2 CRIADA (29/05/2026)

### Problema
O webhook25 estava **redirecionando** usuários para o portal web (`/chamado`) quando mencionavam palavras como "atestado", "foto", "comprovante" herdando a função `temPalavraDocumento()` do webhook24. O objetivo do webhook25 é justamente aceitar esses arquivos **diretamente pelo WhatsApp**, sem redirecionar.

### Solução

#### `src/lib/useIA2.ts` (novo)
Módulo especializado para detecção de intenção de envio de arquivos:
- **`detectFileIntent(input)`**: Classifica input em `"send_file"`, `"no_file"` ou `"continue"`
- Usa matching inteligente com palavras-chave de envio + negação + confirmação
- Sem chamada à OpenAI (zero custo de token)
- Diferencia "quero enviar" de "não preciso enviar" com análise de contexto

#### webhook25 corrigido
| Antes | Depois |
|-------|--------|
| `temPalavraDocumento()` detectava e **redirecionava** pro portal | `detectFileIntent()` detecta e vai para **COLETAR_MIDIA** |
| Fluxo quebrado: menção de arquivo → redirect para fora do WhatsApp | Fluxo: menção de arquivo → "Pode enviar aqui mesmo 📎" → recebe mídia → anexa ao chamado |
| Dependência de `palavrasDocumento` fixas | Lógica mais inteligente que entende contexto |

### Fluxo corrigido
```
COLETAR_MOTIVO: usuário descreve problema
  → detectFileIntent("preciso enviar um atestado") === "send_file"
  → "Entendi! Pode enviar a foto ou documento por aqui mesmo que eu anexo ao chamado."
  → COLETAR_MIDIA (aguarda o arquivo)
  → Usuário envia imagem/documento
  → downloadEvolutionMedia() + uploadBuffer()
  → "Recebi! ✅" → COLETAR_SETOR
  → Chamado criado com anexoUrl
```

### Arquivos criados
| Arquivo | Descrição |
|---------|-----------|
| `src/lib/useIA2.ts` | Detecção de intenção de envio de arquivos |

### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `src/app/api/webhook25/route.ts` | Remove `temPalavraDocumento` + redirect. Usa `detectFileIntent()` para ir direto para COLETAR_MIDIA |

### Build
- `npm run build` — compilado com sucesso ✅

---

## 37. EVOLUTION API CONFIGURADA — WEBHOOK HEVELYN → WEBHOOK25 (30/05/2026)

### Problema
A instância **Hevelyn** na Evolution API estava configurada para enviar webhooks para `http://nolevel-app-dev:3000/api/webhook24`. Por isso, mesmo com todo o código do webhook25 corrigido, as mensagens nunca chegavam ao webhook25 — iam para o webhook24, que redirecionava ao portal.

### Solução
Descoberto o endpoint correto da Evolution API v2.3.0 via `docker exec`:
- `GET /webhook/find/Hevelyn` → retornou URL antiga (`webhook24`)
- `POST /webhook/set/Hevelyn` com body `{ webhook: { url, enabled, events } }` → alterou para `webhook25`

### Comando executado (via docker exec)
```bash
docker exec nolevel-app-dev node -e "
fetch('http://evolution-api:8080/webhook/set/Hevelyn', {
  method: 'POST',
  headers: { 'apikey': '...', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    webhook: {
      url: 'http://nolevel-app-dev:3000/api/webhook25',
      enabled: true,
      events: ['MESSAGES_UPSERT'],
      webhookByEvents: false,
      webhookBase64: false
    }
  })
}).then(r => r.json()).then(console.log)
"
```

### Resultado
- Status: `201 Created`
- URL: `http://nolevel-app-dev:3000/api/webhook25` ✅
- Webhook anterior (`webhook24`) não foi modificado — apenas a rota da instância Hevelyn foi alterada

### Instâncias na Evolution API
| Instância | Número | Status | Webhook |
|-----------|--------|--------|---------|
| `testes` | 5527992221643 | connecting | — |
| `Hevelyn` | 5527998982410 | **open** | `http://nolevel-app-dev:3000/api/webhook25` ✅ |

---

## 38. CORREÇÃO BUCKET — "documents" → "anexo" (30/05/2026)

### Problema
O bucket correto no Supabase para anexos de chamados é **`anexo`** (público), mas o código utilizava `"documents"` em 3 lugares:

| Arquivo | Linha | Antes | Depois |
|---------|-------|-------|--------|
| `src/lib/upload.ts` | 52 | `bucket = "documents"` (default) | `bucket = "anexo"` |
| `src/app/api/tickets/route.ts` | 83 | `bucket: "documents"` | `bucket: "anexo"` |
| `src/app/api/tickets/search/route.ts` | 34 | `bucket: "documents"` | `bucket: "anexo"` |

Buckets de avatar (`profile`) permanecem corretos.

### Build
- ✅ Compilado com sucesso

---

## 39. FIX UPLOAD — CRIAÇÃO AUTOMÁTICA DO BUCKET E MELHORIAS (30/05/2026)

### Problema
Uploads para o bucket `anexo` falhavam silenciosamente. O bucket `profile` funcionava porque já existia no Supabase, mas o bucket `anexo` nunca foi criado na instância — o Supabase não cria buckets automaticamente.

### Causa raiz
O bucket `anexo` não existia no Supabase Storage (`http://177.153.33.179:8000`). Tentativas de upload para bucket inexistente retornavam erro, mas:
- `uploadFile()` lançava exceção → quebrava o fluxo com 500
- `uploadBuffer()` retornava `null` → webhook25 exibia "Ops, tive um problema" sem informar o motivo real

### Mudanças em `src/lib/upload.ts`

#### 1. Criação automática do bucket (`ensureBucket`)
- Função `ensureBucket(bucket)` chamada antes de todo upload
- Tenta criar o bucket como público via `supabase.storage.createBucket()`
- Ignora erro "already exists" (bucket já criado em chamada anterior)
- Usa `Set` para evitar múltiplas tentativas de criação no mesmo processo

#### 2. `contentType` explícito no `uploadFile`
- Adicionado `contentType: file.type || undefined` no upload
- Garante compatibilidade com Supabase auto-hospedado que pode falhar na detecção automática de MIME

#### 3. Log de erro melhorado no `uploadBuffer`
- Agora exibe o erro real do Supabase no console (bucket não existe, permissão negada, etc.)

### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `src/lib/upload.ts` | Adicionado `ensureBucket()`, `contentType` no uploadFile, error logging |

### Build
- `npm run build` — compilado com sucesso ✅

---

## 40. MELHORIAS NO UPLOAD — ERRO 400 E TRATAMENTO DE FALHAS (30/05/2026)

### Problemas corrigidos

#### 1. `uploadFile()` lançava exceção em vez de retornar null
Antes: `throw error` no `uploadFile()` quebrava o fluxo da API, retornando 500 mesmo quando o erro era recuperável (bucket não existia, etc.)
Depois: retorna `defaultUrl` (fallback) em caso de erro, consistente com `uploadBuffer()`

#### 2. Validação de campos retornava 400 sem detalhes
Antes: `"Campos obrigatórios não preenchidos"` sem informar quais
Depois: Lista os campos faltantes: `"Campos obrigatórios: nome, cpf, setor, descricao"`

#### 3. Upload de anexo não quebrava mais o chamado inteiro
Antes: Se o upload falhasse, o chamado nem era criado (try/catch genérico retornava 500)
Depois: Se o upload falhar, o chamado é criado mesmo sem anexo (try/catch isolado no upload)

### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `src/lib/upload.ts` | `uploadFile()` retorna `defaultUrl` em vez de `throw` |
| `src/app/api/tickets/route.ts` | Validação detalhada + try/catch isolado no upload |
| `src/app/api/tickets/search/route.ts` | try/catch isolado no upload |

### Build
- `npm run build` — compilado com sucesso ✅

---

## 41. CORREÇÃO WEBHOOK25 — DOWNLOAD DE MÍDIA VIA WEBHOOKBASE64 (30/05/2026)

### Problema
Fotos enviadas via WhatsApp bot (webhook25) não chegavam ao Supabase Storage. O bot respondia "obrigado" mas o anexo nunca era salvo.

### Causa raiz
A Evolution API v2.3.0 não possui o endpoint REST `/message/downloadMedia/{instance}`. A função `downloadEvolutionMedia()` (que fazia POST para este endpoint) sempre recebia 404, retornava `null`, e o upload nunca acontecia.

### Soluções aplicadas

#### 1. `webhookBase64: true` habilitado na instância Hevelyn
A Evolution API v2.3.0 permite incluir a mídia como base64 diretamente no payload do webhook quando `webhookBase64: true` está configurado. Descoberto que:
- O campo na API REST chama-se `base64` (não `webhookBase64`)
- Está aninhado em `webhook.base64` no body da requisição
- A API mapeia `webhook.base64` → `webhookBase64` no banco

Endpoint usado: `POST /webhook/set/Hevelyn`
```json
{
  "webhook": {
    "url": "http://nolevel-app-dev:3000/api/webhook25",
    "enabled": true,
    "events": ["MESSAGES_UPSERT"],
    "byEvents": false,
    "base64": true
  }
}
```

#### 2. `downloadEvolutionMedia()` atualizada em `src/lib/usedata.ts`
- Adicionado parâmetro opcional `base64Override?: string`
- Se fornecido, decodifica o base64 diretamente (sem chamar Evolution API)
- Mantém fallback para a chamada REST (retrocompatibilidade)

#### 3. Webhook25 passa `data.message.base64` em `src/app/api/webhook25/route.ts`
- Ao chamar `downloadEvolutionMedia()`, passa `data.message?.base64` como terceiro argumento
- Se o webhook incluir base64 (habilitado), o buffer é obtido sem chamada REST

### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `src/lib/usedata.ts` | `downloadEvolutionMedia()` aceita `base64Override` |
| `src/app/api/webhook25/route.ts` | Passa `data.message?.base64` para `downloadEvolutionMedia()` |

### Build
- `npm run build` — compilado com sucesso ✅

---

## 42. BOT NAME DINÂMICO POR INSTÂNCIA + EMPRESA DO BANCO (30/05/2026)

### Objetivo
O nome do assistente virtual agora vem do nome da instância configurada na Evolution API (via `body.instance`), permitindo personalização por empresa/cliente. A empresa mencionada pelo bot também passa a ser dinâmica (buscada do banco via `getEmpresaName()`).

### Arquivos alterados

#### `src/lib/useIA.ts` — `botIA()` aceita `botName`
- Adicionado parâmetro opcional `botName?: string` à assinatura
- System prompt alterado:
  ```typescript
  // Antes:
  `Você é a Hevelyn, atendente da ${empresa}...`
  // Depois:
  `Você é ${botName || "Hevelyn"}, atendente da ${empresa}...`
  ```

#### `src/lib/useIA2.ts` — `botIA2()` aceita `botName`
- Mesma alteração da `useIA.ts`

#### Webhooks 22, 23, 24, 25
- Todos passam `instance` (extraído de `body.instance`) como `botName` em todas as chamadas a `botIA()`/`botIA2()`
- **webhook24** (linha 72) e **webhook25** (linha 119): Saudações hardcoded substituídas por template string:
  ```typescript
  // Antes:
  "Olá! Eu sou a Hevelyn, sua assistente virtual..."
  // Depois:
  `Olá! Eu sou a ${instance}, sua assistente virtual...`
  ```

#### `src/app/api/chat/route.ts`
- Adicionada constante:
  ```typescript
  const BOT_NAME = process.env.BOT_NAME || "Hevelyn"
  ```
- Todas as chamadas a `botIA()` passam `BOT_NAME` como último argumento

#### `src/app/api/webhook-leads/route.ts`
- `gerarRespostaInteligente()` aceita `botName?: string`
- System prompt: `"Você é a Hevelyn..."` → `` `Você é ${botName || "Hevelyn"}...` ``
- Saudações: `"Sou a Hevelyn"` → `` `Sou a ${instance}` ``
- Referências a "NoLevel" mantidas (contexto: estande da própria NoLevel na ESX)

#### `src/app/chatbot-app/page.tsx`
- Componente renomeado: `MobileHevelynChat` → `MobileChat`
- `BOT_NAME` lido de `process.env.NEXT_PUBLIC_BOT_NAME` com fallback `"Hevelyn"`
- Mensagens de erro e indicador "digitando..." agora usam `BOT_NAME`

### Fluxo de como funciona
```
Evolution API envia webhook com { instance: "Hevelyn", ... }
  → Webhook extrai body.instance
  → Passa como botName para botIA()/botIA2()
  → System prompt da OpenAI: "Você é {instance}, atendente da {empresa}..."
  → getEmpresaName(cpf) busca nome real da empresa no banco
  → Se CPF não encontrado, fallback: 'Nolevel'
  → Se instance não fornecida (chat web), fallback: env BOT_NAME ou "Hevelyn"
```

### Variáveis de ambiente novas
| Variável | Obrigatório | Padrão | Uso |
|----------|-------------|--------|-----|
| `BOT_NAME` | Não | `"Hevelyn"` | Nome do bot no chat web |
| `NEXT_PUBLIC_BOT_NAME` | Não | `"Hevelyn"` | Nome do bot no chat mobile |

### Benefícios
- ✅ Cada instância Evolution pode ter seu próprio nome (ex: "Hevelyn", "Maria", "Suporte")
- ✅ Cada empresa cliente pode ter o bot com o nome que escolheu
- ✅ O bot sempre se apresenta como atendente da empresa correta (via banco)
- ✅ Chat web tem nome configurável via env var
- ✅ Compatibilidade retroativa: se BOT_NAME não for configurado, padrão é "Hevelyn"

### Build
- `npm run build` — compilado com sucesso ✅

---

## 43. MITIGAÇÃO DE SEGURANÇA — CRIAÇÃO DE CHAMADOS ANÔNIMOS (30/05/2026)

### Contexto
Teste de penetração identificou que o endpoint `POST /api/tickets` não exigia autenticação, permitindo que qualquer requisição criasse chamados no sistema. Como a rota precisa permanecer pública (qualquer CPF cadastrado pode abrir chamado), foram aplicadas **3 camadas de mitigação** que não bloqueiam usuários legítimos.

### Camadas implementadas

#### 1. Rate Limiting por IP (`src/lib/rate-limit.ts` — novo)
- Limite: **3 chamados por IP a cada 60 minutos**
- Implementação: mapa em memória com chave `tickets:{ip}`
- Reseta automaticamente após a janela expirar
- Funções: `checkRateLimit(key, maxRequests, windowMs)` e `getClientIp(req)`
- Retorna 429 com mensagem explicativa quando excedido

#### 2. Honeypot Anti-Bot
- **Frontend** (`chamado/page.tsx`): campo `<input name="website">` oculto com classe `absolute opacity-0 pointer-events-none`
- **Backend** (`tickets/route.ts`): se o campo `website` estiver preenchido, a API retorna 200 `{ success: true }` sem processar nada
- Bots preenchem campos ocultos automaticamente; humanos não veem o campo

#### 3. Validação de Dígitos Verificadores do CPF (`src/lib/validation.ts`)
- Função `isValidCPF(cpf)` implementa o algoritmo oficial de validação dos 2 dígitos verificadores
- Rejeita CPFs com todos dígitos iguais (ex: `111.111.111-11`)
- `cpfSchema` do Zod atualizado com `.refine(isValidCPF, "CPF inválido")`
- API retorna 400 com "CPF inválido" se os dígitos não conferirem

#### 4. Sanitização de Campos (`tickets/route.ts`)
- Função `sanitizar(valor, maxLength)`: remove tags HTML, remove `<` e `>`, trunca ao tamanho máximo
- Limites por campo: nome 100 chars, setor 100 chars, descrição 1000 chars, telefone 15 chars
- CPF e telefone são limpos para apenas dígitos

### Arquivos criados
| Arquivo | Descrição |
|---------|-----------|
| `src/lib/rate-limit.ts` | Sistema de rate limiting por IP |

### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `src/app/api/tickets/route.ts` | Rate limit, honeypot, validação CPF, sanitização |
| `src/app/chamado/page.tsx` | Campo honeypot oculto no formulário |
| `src/lib/validation.ts` | Função `isValidCPF()` + validação no schema |

### Fluxo de segurança
```
Requisição POST /api/tickets
  → Rate limit check (3/hora/IP) → 429 se excedido
  → Honeypot check → 200 falso se campo preenchido (bot)
  → Sanitização dos campos (strip HTML, trim, slice)
  → Validação CPF (algoritmo oficial) → 400 se inválido
  → CPF existe no banco? → 404 se não
  → Cria chamado (apenas CPFs reais e válidos passam)
```

### Build
- `npm run build` — compilado com sucesso ✅

---

## 44. PROTEÇÃO DE LOGIN — CAPTCHA APÓS 3 TENTATIVAS FALHAS (30/05/2026)

### Objetivo
Mitigar ataques de força bruta no login sem bloquear permanentemente contas legítimas. Após 3 tentativas falhas de senha para o mesmo email, um CAPTCHA (Cloudflare Turnstile) é exigido antes de permitir nova tentativa.

### Arquitetura

```
Usuário → /login → signIn("credentials")
  → authorize() no nextauth.ts
    → needsCaptcha(email)? → contagem >= 3?
      → Sim: exige turnstileToken → verifyTurnstileToken()
        → Inválido/faltando → retorna null (falha silenciosa)
        → Válido → prossegue com validação de senha
      → Não: prossegue direto
    → Senha correta? → resetFailedLogin(email) → login OK
    → Senha errada? → trackFailedLogin(email) → incrementa contador
```

### Mudanças

#### `src/lib/rate-limit.ts`
- `trackFailedLogin(email)` — incrementa contagem para o email, reseta após 1h de inatividade
- `resetFailedLogin(email)` — zera contagem (login bem-sucedido)
- `needsCaptcha(email)` — retorna true se >= 3 tentativas na janela
- `verifyTurnstileToken(token)` — valida token Turnstile via API Cloudflare

#### `src/lib/nextauth.ts`
- Credential `turnstileToken` adicionada (opcional)
- `authorize()` modificado: verifica `needsCaptcha()` antes de checar senha
- Chamadas a `trackFailedLogin()` nas falhas, `resetFailedLogin()` no sucesso

#### `src/app/api/auth/[...nextauth]/route.ts`
- **Refatorado:** removida duplicação massiva — agora importa `authOptions` de `@/lib/nextauth`
- Antes: ~95 linhas com `authOptions` duplicado (idêntico ao `lib/nextauth.ts`)
- Depois: 4 linhas, apenas `NextAuth(authOptions)`

#### `src/app/login/page.tsx`
- Estado `failedAttempts` — incrementa a cada erro de login
- Após 3 falhas, injeta script Cloudflare Turnstile e renderiza widget
- Botão submit desabilitado até Turnstile ser resolvido
- Turnstile token enviado como `turnstileToken` no `signIn()`

#### `src/types/next-auth.d.ts`
- Interface `TurnstileObject` + declaração global `window.turnstile`

#### `.env.example`
- Adicionadas: `TURNSTILE_SECRET_KEY` e `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (valores always-pass)

### Benefícios
- ✅ 3 tentativas livres sem captcha (UX zero atrito no dia a dia)
- ✅ A partir da 4ª, CAPTCHA invisível (Cloudflare Turnstile) aparece
- ✅ Não bloqueia conta permanentemente — o contador expira após 1h sem tentativas
- ✅ Sem dependência externa de rastreamento (Turnstile é privacy-first)
- ✅ Chave always-pass nas variáveis de ambiente permite testar sem configurar nada
- ✅ Duplicação de `authOptions` eliminada (antes em 2 arquivos, agora centralizado)

### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `src/lib/rate-limit.ts` | Funções de rastreio de login + verificação Turnstile |
| `src/lib/nextauth.ts` | Captcha validation no authorize |
| `src/app/api/auth/[...nextauth]/route.ts` | Refatorado para importar authOptions (elimina duplicação) |
| `src/app/login/page.tsx` | Widget Turnstile condicional + estado failedAttempts |
| `src/types/next-auth.d.ts` | Declaração global window.turnstile |
| `.env.example` | Variáveis Turnstile adicionadas |

### Build
- `npm run build` — compilado com sucesso ✅

---

## 45. WEBHOOK26 + useIA3.ts + PROMPT PERSONALIZADO POR EMPRESA (02/06/2026)

### Objetivo
Criar uma nova instância do bot (webhook26) que utiliza um prompt de IA **personalizado por empresa**, configurado via formulário no cadastro da empresa. O nome do bot também vem da tabela `empresa`.

### Arquitetura

```
Empresa (cadastro)
  ├── logoUrl — logo da empresa
  ├── botName — nome do assistente virtual
  ├── botPresentation — "como se apresentar?" (input do usuário)
  ├── botServiceDesc — "como atender?" (input do usuário)
  ├── botAvisosDesc — "como apresentar avisos?" (input do usuário)
  └── botPrompt — prompt consolidado gerado pela OpenAI

Geração do prompt:
  Usuário preenche 3 descrições → "Gerar Prompt com IA"
    → POST /api/empresa/prompt → OpenAI gera prompt → salva em botPrompt
    → Apenas GOD pode editar (front + backend)

Webhook26:
  Usuário envia CPF → lookup empresaId → botIA3() carrega empresa.botPrompt
    → System prompt da IA usa o prompt personalizado (se existir)
    → Fallback para descrições individuais ou prompt genérico
```

### Schema — Campos adicionados no model `empresa`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `logoUrl` | `String?` | URL da logo da empresa no Supabase |
| `botName` | `String?` | Nome do assistente virtual |
| `botPresentation` | `String?` | Input: como o bot deve se apresentar |
| `botServiceDesc` | `String?` | Input: como o bot deve atender |
| `botAvisosDesc` | `String?` | Input: como apresentar os avisos |
| `botPrompt` | `String?` | Prompt consolidado gerado pela OpenAI |

### Arquivos criados

#### `src/lib/useIA3.ts` (novo)
- Módulo de IA especializado para webhook26
- `botIA3()` aceita `empresaId` como parâmetro adicional
- `getEmpresaConfig(empresaId)` — busca configuração do bot da empresa no banco
- `montarSystemPrompt()` — monta o system prompt combinando:
  - Se `botPrompt` existe: usa como instrução personalizada
  - Se não: usa descrições individuais ou prompt genérico
- `detectFileIntent()` — mesmo matching inteligente do useIA2.ts
- Lazy initialization da OpenAI (`getOpenAI()`) para evitar erro de build sem API key

#### `src/app/api/webhook26/route.ts` (novo)
- Baseado no webhook25, usando `useIA3.ts` em vez de `useIA2.ts`
- Ao identificar CPF, faz lookup do `empresaId` via tabela `cpfs`
- Passa `session.empresaId` para `botIA3()`, que carrega a configuração personalizada
- Fluxo idêntico ao webhook25: INICIO → IDENTIFICAÇÃO_CPF → MENU → COLETAR_MOTIVO → MÍDIA → SETOR

#### `src/app/api/empresa/prompt/route.ts` (novo)
API exclusiva para GOD gerenciar o prompt do bot por empresa:

| Método | Função |
|--------|--------|
| `GET` | Retorna configuração do bot de uma empresa (GOD) |
| `POST` | Gera prompt via OpenAI a partir das 3 descrições (GOD) |
| `PUT` | Atualiza prompt/descrições manualmente (GOD) |
| `DELETE` | Remove configuração do bot (GOD) |

- `empresaId='preview'` no POST ativa modo preview (não salva no banco) — usado na tela de criação
- Todas as rotas protegidas com `getServerSessionRBAC(["GOD"])`

#### `src/app/api/upload/route.ts` (novo)
- Endpoint genérico de upload (FormData → Supabase Storage)
- Aceita `file`, `bucket`, `folder`
- Usado para upload de logo da empresa

### Arquivos modificados

#### `src/app/api/empresa/route.ts`
- **POST**: Aceita `logoUrl`, `botName`, `botPresentation`, `botServiceDesc`, `botAvisosDesc`, `botPrompt`
- **GET (GOD)**: Retorna novos campos no select
- **GET (CPF)**: Retorna novos campos no select aninhado
- **PUT**: Aceita os 6 novos campos para atualização

#### `src/app/(atendimento)/empresa/create/page.tsx`
- Adicionado **upload de logo** (preview + Supabase)
- Adicionada seção **"Configuração do Assistente Virtual"** com:
  - Nome do assistente (input)
  - "Como se apresentar?" (textarea)
  - "Como atender?" (textarea)
  - "Como apresentar avisos?" (textarea)
  - Botão **"Gerar Prompt com IA"** → chama OpenAI → exibe prompt gerado
  - Prompt gerado é enviado junto com a criação da empresa

#### `src/app/(atendimento)/empresa/page.tsx`
- Cards de empresa mostram **logo** e badge **"Bot configurado"**
- Novo botão **"Bot"** que abre modal de configuração do assistente
- Modal contém: nome, 3 descrições, gerar prompt, editar prompt, salvar/limpar
- Botão "Usuários" para navegar para `/empresa/[id]/usuarios`

#### `src/lib/useIA.ts` e `src/lib/useIA2.ts`
- OpenAI Client alterado para **lazy initialization** (`getOpenAI()`) para evitar crash no build sem `OPENAI_API_KEY` no `.env`

#### `src/app/api/webhook-leads/route.ts` e `src/app/api/empresa/prompt/route.ts`
- Idem: lazy initialization da OpenAI

### Regras de negócio

- ✅ Apenas GOD pode gerenciar prompts do bot (frontend + backend)
- ✅ O prompt gerado pela OpenAI é salvo como `botPrompt` no model `empresa`
- ✅ Se `botPrompt` existe, webhook26 usa como system prompt completo
- ✅ Se não existe, usa as descrições individuais ou prompt genérico
- ✅ O nome do bot (`botName`) vem da tabela empresa
- ✅ Compatibilidade retroativa: webhooks 22-25 continuam funcionando
- ✅ Upload de logo via Supabase Storage (bucket `profile`)

### Build
- `npm run build` — compilado com sucesso ✅

---

## 46. MÓDULO OFICINA — FRONTEND PARA MANUTENÇÃO DE VEÍCULOS (10/06/2026)

### Objetivo
Criação do módulo `(modulo-oficina)` para uma empresa de transporte público, onde motoristas registram pedidos de manutenção de veículos ao final do turno. O módulo foi replicado a partir do `(atendimento)` original e adaptado para o novo contexto.

### Mudanças de Identidade
| Item | Antes (Atendimento) | Depois (Oficina) |
|------|---------------------|------------------|
| Título do layout | "Atendimento / Suporte Técnico" | "Oficina / Manutenção de Veículos" |
| Menu lateral "Chamados" | Chamados | **Solicitações** |
| Menu lateral "CPFs Autorizados" | CPFs Autorizados | **Motoristas** |
| Menu lateral "Empresas" | Removido | Removido (empresa única) |

### Formulário Principal (`chamado/page.tsx`)
Substituído o formulário de abertura de chamado por um **Formulário de Registro de Manutenção**:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| Nome do Motorista | text | Obrigatório |
| Matrícula | text, max 6 dígitos | **Substitui CPF** — apenas números |
| Data | date | Auto-preenchido com a data atual |
| Veículo / Placa | text | Opcional — identificação do veículo |
| Tipo de Registro | radio buttons | **Defeito** / **Socorro de Rua** / **Sem Defeito** |
| Discriminação dos Serviços | textarea | Aparece apenas se "Defeito" ou "Socorro" selecionado |

### Lógica condicional do formulário
- Se **"Sem Defeito"**: exibe caixa de informação "Final de Turno" e oculta o campo de discriminação
- Se **"Defeito"** ou **"Socorro de Rua"**: exibe textarea "Discriminação dos Serviços" como obrigatório
- Selecão visual com cards estilizados (ícone + título + descrição)
- Submit: simulado (sem API por enquanto) — mostra tela de sucesso com toast

### Listagem (`all-tickets/page.tsx`)
Colunas da tabela adaptadas para manutenção:

| Antes | Depois |
|-------|--------|
| Ticket | Solicitação |
| Nome | Motorista |
| Setor | Veículo (via setor) |
| Prioridade | **Tipo** (Defeito/Socorro/Sem Defeito) |
| Status | Status (Aguardando/Em Andamento/Aguardando Peças/Concluído/Cancelado) |
| Data | Data |

### Kanban (`kanban-board.tsx`)
Colunas renomeadas para o fluxo de manutenção:
- **NOVO → Aguardando**
- **EM_ATENDIMENTO → Em Andamento**
- **AGUARDANDO → Aguardando Peças**
- **CONCLUIDO → Concluído**
- **CANCELADO → Cancelado**

Cards do Kanban exibem tipo (Defeito/Socorro/OK) em badge colorido em vez de prioridade.

### Consulta Pública (`consulta/page.tsx`)
- Substituída busca por **CPF** por busca por **Matrícula** (até 6 dígitos)
- Máscara de entrada: apenas números, limitado a 6 caracteres
- Tabela de resultados: Solicitação | Tipo | Status

### Detalhe da Solicitação (`consulta/[ticket]/page.tsx`)
- Exibe campos específicos: nome, matrícula, veículo, tipo, discriminação dos serviços
- Ícones adaptados (FaWrench para tipo, FaTruck para veículo)
- Removeu campos irrelevantes

### Modal de Gerenciamento (`modal_tandimento.tsx`)
- "Chamado" → "Solicitação" em todos os labels
- Campos: Motorista, Matrícula, Veículo, Tipo, Status
- "Descrição" → "Discriminação dos Serviços"
- Status: Aguardando, Em Andamento, Aguardando Peças, Concluído, Cancelado

### Demais páginas adaptadas
- **Dashboard**: descrição alterada para "manutenção de veículos"
- **CPFs → Motoristas**: header renomeado
- **Error boundary**: "Erro na área da oficina"

### O que NÃO foi alterado
- Prisma schema (mantido — usa modelo `Chamado` existente)
- Rotas de API (frontend apenas)
- Sistema de login/autenticação
- Módulo corporativo
- github/ (deploys configurados mantidos)

---

## 47. WEBHOOK-OFICINA + FORMULÁRIO WEB PARA MOTORISTAS (10/06/2026)

### Objetivo
Criar um canal de comunicação para motoristas de empresa de transporte público registrarem defeitos de veículos. O motorista interage com o bot WhatsApp (webhook-oficina) informando matrícula, função, número do ônibus, data e defeito. Também há um formulário web público em `/oficina` para quem preferir o navegador.

### Restrições
- ❌ **Nenhuma alteração no schema do Prisma**
- ❌ **Nenhuma migration**
- ❌ **Nenhuma rota de API existente foi modificada**
- ✅ Apenas arquivos novos criados

### Mapeamento de dados (Chamado reutilizado)

| Campo Chamado | Armazena |
|---|---|
| `nome` | Nome do motorista (auto-preenchido via `cpfs`) |
| `cpf` | **Matrícula** do motorista (identificador único) |
| `setor` | Setor selecionado da empresa (ex: Mecânica, Elétrica) |
| `descricao` | JSON string: `{ funcao, numeroOnibus, data, defeito }` |
| `telefone` | WhatsApp do motorista (preenchido automaticamente no bot) |

### Validação do motorista
- Matrícula armazenada na tabela `cpfs` (campo `cpf`, que é String — aceita qualquer identificador)
- Admin cadastra motoristas na tela de CPFs existente com: **matrícula** (no campo CPF) + **nome**
- Vinculado à empresa de transporte público via `empresaId`

### Arquivos criados

#### `src/app/api/oficina/tickets/route.ts`
API dedicada (sem modificar `/api/tickets`):

| Método | Função |
|--------|--------|
| **GET** `?matricula=X` | Valida matrícula, retorna nome do motorista + setores da empresa |
| **POST** | Cria chamado com dados estruturados (valida campos obrigatórios) |

- POST aceita: `{ matricula, nome, funcao, numeroOnibus, data, defeito, setor }`
- `descricao` é gerada como `JSON.stringify({ funcao, numeroOnibus, data, defeito })`
- CPF não é validado como CPF (é tratado como string livre = matrícula)

#### `src/app/api/webhook-oficina/route.ts`
Bot WhatsApp para motoristas, fluxo linear sem IA:

```
INICIO
  → "🚌 Oficina - Registro de Defeito\n\nDigite sua matrícula:"
  → IDENTIFICACAO_MATRICULA
    → valida na cpfs (matrícula → nome + empresaId)
    → "Olá, {nome}! 😊 Qual sua função?"
  → COLETAR_FUNCAO
    → "Qual o número do ônibus?"
  → COLETAR_ONIBUS
    → "Qual a data do ocorrido?"
  → COLETAR_DATA
    → "Descreva o defeito:"
  → COLETAR_DEFEITO
    → Exibe resumo completo: "Confirma? (sim/não)"
  → CONFIRMAR
    → "sim" → COLETAR_SETOR
    → "não" → volta para IDENTIFICACAO_MATRICULA
  → COLETAR_SETOR
    → Lista setores da empresa (getSetores via matrícula)
    → Matching bidirecional (mesmo padrão dos webhooks 22-24)
    → Cria Chamado via Prisma direto
    → "✅ Registro concluído! Seu chamado {ticket}..."
    → Sessão encerrada
```

- **Sessão**: expira após 2h de inatividade
- **Comandos de saída**: "sair", "encerrar", "cancelar"
- **Sem IA**: fluxo puramente estrutural (zero custo de tokens)
- **Sem mídia**: apenas texto (sem fotos, sem assinatura)

#### `src/app/oficina/page.tsx`
Formulário web público (sem login) em 3 etapas:

1. **Etapa 1 — Validação**: Campo de matrícula → valida via GET `/api/oficina/tickets?matricula=X`
2. **Etapa 2 — Formulário**: Campos:
   - Matrícula (readonly)
   - Nome (readonly, auto-preenchido)
   - Função (input)
   - Nº do Ônibus (input)
   - Data (input)
   - Defeito (textarea)
   - Setor (select com setores da empresa)
3. **Etapa 3 — Sucesso**: Check verde + mensagem de confirmação

### Fluxo de uso

```
Admin cadastra motoristas:
  Tela de CPFs → matrícula no campo CPF + nome do motorista

Motorista via WhatsApp:
  Envia "oi" para o número da instância Evolution
    → Webhook-oficina guia passo a passo
    → Ao final, chamado criado em /all-tickets

Motorista via Web:
  Acessa /oficina → digita matrícula → preenche formulário → envia
    → Chamado criado em /all-tickets

Atendente:
  Acessa /all-tickets → filtra por setor da oficina → atende o chamado
```

### Build
- `npm run build` — compilado com sucesso ✅

---

## 48. DOCUMENTO DE APRESENTAÇÃO COMERCIAL (11/06/2026)

### Objetivo
Criar `apresentação.md` — documento de apresentação do sistema NolevelBOT para prospecção de clientes.

### Conteúdo
O documento cobre 9 seções principais:

| Seção | Conteúdo |
|-------|----------|
| 1. O que é o NolevelBOT | Visão geral da plataforma |
| 2. Principais Funcionalidades | Chamados, chatbot WhatsApp, leads, dashboards, avisos, módulo oficina |
| 3. Como se ajusta a diferentes empresas | Multi-tenant, personalização, RBAC, múltiplos canais, infraestrutura flexível |
| 4. Casos de Uso Reais | Suporte multi-cliente, transporte público, captura de leads em eventos, multi-departamentos |
| 5. Tecnologia | Stack completo (Next.js, React, PostgreSQL, OpenAI, Evolution API, Docker) |
| 6. Segurança | RBAC, rate limiting, CAPTCHA, honeypot, validação CPF, sanitização, bcrypt, JWT |
| 7. Como Implantar | Passo a passo da implantação |
| 8. Exemplos de Tela | Lista, Kanban, Dashboard, Configuração |
| 9. Suporte e Evolução | Frentes de desenvolvimento futuro |

### Público-alvo
- Clientes potenciais (prospecção ativa)
- Escrito em português claro, sem jargões técnicos excessivos
- Foco em mostrar o valor do sistema e como se adapta a diferentes realidades

### Arquivo criado
- `apresentação.md` — 220 linhas

### Regras seguidas
- ✅ Nenhuma alteração em código existente
- ✅ Nenhuma alteração em API routes
- ✅ Nenhuma alteração no Prisma schema
- ✅ Nenhuma alteração em arquivos .github/
- ✅ Build não necessário (apenas documento markdown)

---

## 49. SISTEMA DE MÓDULOS POR EMPRESA (11/06/2026)

### Contexto
O Prisma schema já havia sido alterado pelo usuário (migration executada manualmente) com:
- `enum modulo { OFICINA, CORPORATIVO, EVENTOS }`
- Campo `modulos modulo[]` no model `empresa`

Foi necessário rodar `prisma generate` para sincronizar o client com o schema.

### Mudanças implementadas

#### API `empresa/route.ts`
- POST: aceita `modulos` (array de strings do enum)
- GET: retorna `modulos` em todos os selects (GOD list, empresa única, lookup por CPF)
- GET: novo suporte a `?id=X` para buscar empresa específica por ID
- PUT: aceita `modulos` para atualização

#### Frontend `empresa/create/page.tsx`
- Nova seção "Módulos da Empresa" com 3 cards clicáveis:
  - **Corporativo** (Headphones): Gestão de chamados, dashboard, avisos e CPFs
  - **Oficina** (Wrench): Manutenção veicular para transportadoras
  - **Eventos** (CalendarCheck): Captura de leads em feiras e eventos
- Toggle visual: selecionado = primary + borda destacada, não-selecionado = transparência

#### Frontend `empresa/page.tsx`
- Badges coloridos por módulo nos cards de empresa
- Edição inline: toggle buttons para módulos no formulário de edição

#### Sidebar `(atendimento)/components/sidebar.tsx`
- Fetch dos módulos da empresa via `GET /api/empresa?id=X`
- Helper `temModulo()`: GOD sempre true, demais filtram pelo array
- Menus CORPOARTIVO (Dashboard, Chamados, Avisos, CPFs): condicionais a `CORPORATIVO`
- Menu Oficina: condicional a `OFICINA` + role mínima GESTOR
- Menus de sistema (Usuários, Criar Usuário, Empresas): independentes de módulo

#### Sidebar `oficina/(atendimento)/components/sidebar.tsx`
- Mesma lógica: fetch módulos + `temModulo('OFICINA')`
- Menus da oficina filtrados por OFICINA
- Menus de sistema independentes

#### Layout `oficina/(atendimento)/layout.tsx`
- Verificação de autorização no mount:
  - GOD: passa direto
  - Não-GOD: fetch módulos → se não tem `OFICINA` → redirect `/dashboards`
- Spinner de loading enquanto verifica
- Renderização condicional (null se não autorizado)

### Regras de negócio
- GOD sempre acessa todos os módulos (bypass total)
- Empresa sem módulo não vê menus nem acessa rotas do módulo
- Controle em 2 camadas: sidebar (frontend) + layout (quase-backend via redirect)
- Menus de administração do sistema (Usuários, Criar Usuário, Empresas) são independentes de módulo
- Nenhuma migration executada pelo código (usuário já havia rodado manualmente)
- Build validado com `npm run build` ✅

### Arquivos modificados (6)
| Arquivo | Mudança |
|---------|---------|
| `src/app/api/empresa/route.ts` | POST/GET/PUT com modulos; GET por ID |
| `src/app/(atendimento)/empresa/create/page.tsx` | Seletor de módulos |
| `src/app/(atendimento)/empresa/page.tsx` | Badges e edição de módulos |
| `src/app/(atendimento)/components/sidebar.tsx` | Filtro por módulos |
| `src/app/oficina/(atendimento)/components/sidebar.tsx` | Filtro por módulos |
| `src/app/oficina/(atendimento)/layout.tsx` | Bloqueio de acesso OFICINA |

---

## 50. SIDEBAR ÚNICO COM ACCORDION DE MÓDULOS (11/06/2026)

### Problema
Após a separação das pastas `corporativo/` e `oficina/`, cada módulo tinha seu próprio sidebar (`corporativo/(atendimento)/components/sidebar.tsx` e `oficina/(atendimento)/components/sidebar.tsx`). Isso impedia a navegação entre módulos sem sair da página.

### Solução
Substituir as duas sidebars por **uma sidebar única** em `src/app/components/sidebar.tsx` que exibe botões accordion para cada módulo disponível na empresa do usuário.

### Arquitetura

```
Sidebar única (src/app/components/sidebar.tsx)
├── [fetch] GET /api/empresa?id=X → empresaModulos
├── Módulo Corporativo ▼ (se temModulo('CORPORATIVO'))
│   ├── Dashboard → /corporativo/dashboards
│   ├── Chamados → /corporativo/all-tickets
│   ├── Avisos → /corporativo/avisos
│   ├── CPFs Autorizados → /corporativo/cpfs
│   ├── Usuários → /corporativo/usuarios (role-based)
│   ├── Criar Usuário → /corporativo/gestao-de-usuarios (role-based)
│   └── Empresas → /corporativo/empresa (GOD only)
├── Módulo Oficina ▼ (se temModulo('OFICINA'))
│   ├── Dashboard → /oficina/dashboards
│   ├── Solicitações → /oficina/all-tickets
│   ├── Avisos → /oficina/avisos
│   ├── Motoristas → /oficina/cpfs
│   ├── Usuários → /oficina/usuarios (role-based)
│   ├── Criar Usuário → /oficina/gestao-de-usuarios (role-based)
│   └── Empresas → /oficina/empresa (GOD only)
└── UserCard (foto, nome, email, role, config/logout)
    └── Versão: package.json
```

### Mudanças

#### Componentes compartilhados movidos para `src/app/components/`
| Arquivo | Origem | Destino |
|---------|--------|---------|
| `cardUser.tsx` | `corporativo/(atendimento)/components/` e `oficina/(atendimento)/components/` | `src/app/components/cardUser.tsx` |
| `modal-edit-user.tsx` | `corporativo/(atendimento)/components/` e `oficina/(atendimento)/components/` | `src/app/components/modal-edit-user.tsx` |

#### Sidebar único (`src/app/components/sidebar.tsx`)
- **Accordion**: cada módulo tem um botão que expande/recolhe os sub-menus
- **Módulos disponíveis**: filtrados por `temModulo()` (GOD sempre vê todos)
- **Abertura automática**: o módulo da rota atual abre sozinho; se nenhum, primeiro disponível abre
- **Multi-open**: usuário pode ter vários módulos abertos ao mesmo tempo
- **Ícones**: LuHeadphones (Corporativo), LuWrench (Oficina)
- **Estado visual**: ChevronDown (aberto) / ChevronRight (fechado)
- **Sub-menus**: indentados com borda lateral (`border-l-2 ml-2 pl-3`)
- **System menus**: Usuários, Criar Usuário, Empresas aparecem DENTRO de cada módulo com rotas específicas (`/corporativo/...` e `/oficina/...`)
- **Responsivo**: hamburger menu em mobile com overlay escuro

#### Layouts atualizados
| Layout | Antes | Depois |
|--------|-------|--------|
| `corporativo/(atendimento)/layout.tsx` | `import { Sidebar } from './components/sidebar'` | `import { Sidebar } from '@/app/components/sidebar'` |
| `oficina/(atendimento)/layout.tsx` | `import { Sidebar } from './components/sidebar'` | `import { Sidebar } from '@/app/components/sidebar'` |

#### Arquivos deletados (6)
- `src/app/corporativo/(atendimento)/components/sidebar.tsx`
- `src/app/corporativo/(atendimento)/components/cardUser.tsx`
- `src/app/corporativo/(atendimento)/components/modal-edit-user.tsx`
- `src/app/oficina/(atendimento)/components/sidebar.tsx`
- `src/app/oficina/(atendimento)/components/cardUser.tsx`
- `src/app/oficina/(atendimento)/components/modal-edit-user.tsx`

### Detalhes de implementação

#### Accordion state
```typescript
const [modulosAbertos, setModulosAbertos] = useState<string[]>(() => {
  const inicial: string[] = []
  modulosDisponiveis.forEach(m => {
    if (pathname.startsWith('/' + m.key + '/')) inicial.push(m.key)
  })
  if (inicial.length === 0 && modulosDisponiveis.length > 0)
    inicial.push(modulosDisponiveis[0].key)
  return inicial
})
```

#### Abertura automática ao navegar
Um `useEffect` observa `pathname` e abre o módulo correspondente se ainda não estiver aberto.

#### Tipagem dos ícones
Os ícones Lucide foram tipados como `React.ComponentType<{ size?: number; className?: string }>` para aceitar `className` nos elementos JSX.

### Regras de negócio
- ✅ Accordion: empresa com apenas 1 módulo → só 1 botão visível (expande direto)
- ✅ Empresa com 2 módulos → 2 botões, ambos expansíveis
- ✅ Usuário com ambos módulos → pode navegar entre Corporativo e Oficina sem recarregar
- ✅ GOD vê todos os módulos mesmo sem empresa vinculada
- ✅ System menus dentro de cada módulo têm rotas específicas (`/corporativo/usuarios`, `/oficina/usuarios`)
- ✅ Role-based filtering: Usuários/Criar Usuário (GOD/ADMIN/GESTOR), Empresas (GOD)
- ✅ Versão e UserCard no footer do sidebar mantidos

### Build
- `npm run build` — compilado com sucesso ✅

---

## 51. LOGIN UNIFICADO + SELETOR DE MÓDULOS (11/06/2026)

### Objetivo
Unificar o login fora dos módulos — o usuário faz login em `/login` (independente do módulo) e é redirecionado para `/dashboard` que exibe cards dos módulos disponíveis para sua empresa. Clique no card → entra no módulo.

### Mudanças

#### 1. Página `/login` unificada (`src/app/login/page.tsx`)
- Criada em `src/app/login/page.tsx` (antes existia só `corporativo/login` e `oficina/login`)
- Baseada na versão corporativo: estrutura, imports (`@/app/components/back.tsx`), CAPTCHA Turnstile
- Redirect após sucesso: `signIn` callback URL → `/dashboard` (em vez de `/corporativo/dashboards`)

#### 2. Página `/dashboard` — Seletor de módulos (`src/app/dashboard/page.tsx`)
- `"use client"` (usa `useSession` + `useRouter`)
- **Autenticação**: se `status !== "loading"` e sem sessão, redirect para `/login`
- **Carregamento de módulos**: useEffect faz fetch `/api/empresa?id=X` quando `userRole !== "GOD"`
- **GOD bypass**: se GOD, `empresaModulos` = todos (CORPORATIVO, OFICINA, EVENTOS) sem fetch
- **Filtragem**: `MODULOS_DISPONIVEIS.filter(m => empresaModulos.includes(m.key))`
- **Loading**: spinner centralizado enquanto verifica sessão ou carrega módulos
- **Empty state**: "Nenhum módulo disponível para sua empresa. Entre em contato com o administrador."
- **Cards**: cada módulo vira um botão clicável com:
  - Ícone em fundo primary (LuHeadphones, LuWrench, LuCalendarCheck)
  - Nome do módulo em bold + descrição abaixo
  - Hover: scale 1.03 + sombra; Active: scale 0.98
  - Clique → `router.push(modulo.href)` (ex: `/corporativo/dashboards`)
- **Header**: logo + ThemeToggle
- **Footer**: "Nolevel v{version}" do package.json

#### 3. Páginas de login antigas deletadas
- `src/app/corporativo/login/page.tsx` — removido
- `src/app/oficina/login/page.tsx` — removido

#### 4. Config NextAuth (`src/lib/nextauth.ts`)
- `pages.signIn: '/login'` — já estava configurado (apontando para `/login`)

### Fluxo de autenticação
```
Usuário acessa /corporativo/dashboards (rota protegida)
  → não logado → redirect para /login
  → login com email + senha
  → signIn callback URL → /dashboard
  → dashboard carrega módulos da empresa
  → clique em "Corporativo" → /corporativo/dashboards (sidebar aparece)
```

### Arquivos criados
| Arquivo | Descrição |
|---------|-----------|
| `src/app/login/page.tsx` | Página de login unificada |
| `src/app/dashboard/page.tsx` | Seletor de módulos pós-login |

### Arquivos deletados
| Arquivo |
|---------|
| `src/app/corporativo/login/page.tsx` |
| `src/app/oficina/login/page.tsx` |

### Build
- `npm run build` — compilado com sucesso ✅ (55 páginas, zero erros)

---

## 52. FIX — ATENDENTE NÃO HERDAVA EMPRESA DO ADMIN (11/06/2026)

### Problema
Usuários do tipo ATENDENTE criados por ADMIN não herdavam a empresa do admin. O campo `empresaId` ficava vazio, fazendo o atendente parecer "sem empresa".

### Causa raiz
Em `src/app/api/users/route.ts:41`, o `empresaID` era obtido exclusivamente de `session!.empresaId`. Se o token JWT do admin estivesse desatualizado (criado antes da implementação do campo `empresaId` nos callbacks do NextAuth), o valor vinha como `undefined`. O Prisma ignora campos `undefined` no `create`, então o usuário era criado sem `empresaId`.

### Solução aplicada
Adicionada validação + fallback ao banco de dados em `api/users/route.ts`:

1. Se `session!.empresaId` estiver vazio, busca o `empresaId` diretamente do registro do usuário no banco (`prisma.user.findUnique`)
2. Se mesmo assim não encontrar, retorna erro 400 com mensagem clara ("Sua sessão não possui empresa vinculada. Faça login novamente.")
3. A validação ocorre ANTES do bloco que verifica a existência da empresa, evitando falsos positivos

### Arquivo modificado
| Arquivo | Mudança |
|---------|---------|
| `src/app/api/users/route.ts` | Fallback ao banco se `session!.empresaId` estiver vazio |

### Build
- `npm run build` — compilado com sucesso ✅

---

## 53. FIX — ADMIN NÃO CONSEGUIA CORRIGIR ATENDENTE SEM EMPRESAID (11/06/2026)

### Problema
Usuários ATENDENTE criados antes do fix da seção 52 (sem `empresaId`) não podiam ser corrigidos. O PUT de `api/users` bloqueava a edição com `403 - Usuário não pertence à sua empresa` quando `targetUser.empresaId` era `null`.

### Causa raiz
`src/app/api/users/route.ts:353`:
```typescript
// Antes: null !== "empresa-id" → 403
if (targetUser.empresaId !== userEmpresaId) { return 403 }
```
A comparação `null !== "algum-id"` sempre é `true`, bloqueando ADMIN de editar ATENDENTE sem empresa.

### Solução em `api/users/route.ts` (PUT)
1. Validação de empresa: `targetUser.empresaId && targetUser.empresaId !== userEmpresaId` — permite editar usuários com `empresaId` nulo
2. Auto-fill: quando `targetUser.empresaId` estiver vazio e o editor não for GOD, `data.empresaId = userEmpresaId` é adicionado automaticamente

### Como corrigir o ATENDENTE existente
O ADMIN deve:
1. Ir em **Usuários** → clicar **Editar** no ATENDENTE
2. Clicar em **Salvar** (sem alterar nada) — o PUT auto-preenche o `empresaId`
3. O ATENDENTE faz **logout e login** novamente para renovar o JWT
4. Agora a sidebar carregará os módulos da empresa

### Arquivo modificado
| Arquivo | Mudança |
|---------|---------|
| `src/app/api/users/route.ts` | PUT: validação tolera `null`, auto-fill empresaId |

### Build
- `npm run build` — compilado com sucesso ✅

---

## 54. FIX — REDIRECTS DE `/dashboards` PARA `/dashboard` (11/06/2026)

### Problema
ATENDENTE com `empresaId` vazio era redirecionado para `/dashboards` (rota inexistente — página 404).

### Causa raiz
Rotas foram renomeadas de `/dashboards` para `/dashboard` (seletor de módulos), mas vários `router.replace('/dashboards')` no código não foram atualizados.

### Solução aplicada
Substituir todos os `router.replace('/dashboards')` por `router.replace('/dashboard')`.

### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `src/app/oficina/(atendimento)/layout.tsx` | Redirect: `/dashboards` → `/dashboard` |
| `src/app/corporativo/(atendimento)/empresa/page.tsx` | Redirect: `/dashboards` → `/dashboard` |
| `src/app/corporativo/(atendimento)/empresa/create/page.tsx` | Redirect: `/dashboards` → `/dashboard` |
| `src/app/corporativo/(atendimento)/empresa/[id]/usuarios/page.tsx` | Redirect: `/dashboards` → `/dashboard` |
| `src/app/corporativo/(atendimento)/usuarios/page.tsx` | Redirect: `/dashboards` → `/dashboard` |

### Build
- `npm run build` — compilado com sucesso ✅

### Problema
Usuários do tipo ATENDENTE criados por ADMIN não herdavam a empresa do admin. O campo `empresaId` ficava vazio, fazendo o atendente parecer "sem empresa".

### Causa raiz
Em `src/app/api/users/route.ts:41`, o `empresaID` era obtido exclusivamente de `session!.empresaId`. Se o token JWT do admin estivesse desatualizado (criado antes da implementação do campo `empresaId` nos callbacks do NextAuth), o valor vinha como `undefined`. O Prisma ignora campos `undefined` no `create`, então o usuário era criado sem `empresaId`.

### Solução aplicada
Adicionada validação + fallback ao banco de dados em `api/users/route.ts`:

1. Se `session!.empresaId` estiver vazio, busca o `empresaId` diretamente do registro do usuário no banco (`prisma.user.findUnique`)
2. Se mesmo assim não encontrar, retorna erro 400 com mensagem clara ("Sua sessão não possui empresa vinculada. Faça login novamente.")
3. A validação ocorre ANTES do bloco que verifica a existência da empresa, evitando falsos positivos

### Arquivo modificado
| Arquivo | Mudança |
|---------|---------|
| `src/app/api/users/route.ts` | Fallback ao banco se `session!.empresaId` estiver vazio |

### Build
- `npm run build` — compilado com sucesso ✅

---

## Se��o 55: Coleta opcional de foto no webhook-oficina + avisos espec�ficos + ATENDENTE redirecionado + nome da empresa na lista de usu�rios

### Contexto
Quatro mudan�as solicitadas ap�s a implementa��o do webhook-oficina:
1. Coleta de m�dia (foto do problema) deve ser **opcional**, n�o obrigat�ria
2. Avisos espec�ficos (relacionados � matr�cula do motorista) devem ser entregues **imediatamente** ap�s a identifica��o, separados dos avisos gerais do ve�culo
3. ATENDENTE logado na oficina deve ser redirecionado para /all-tickets e n�o deve ver a op��o Dashboard no menu lateral
4. Na lista de usu�rios (corporativo e oficina), exibir o **nome da empresa** em vez do ID truncado (8 primeiros caracteres)

---

### Implementa��o 1: Coleta opcional de foto no webhook-oficina

**Arquivo:** src/app/api/webhook-oficina/route.ts

- Adicionados estados PERGUNTAR_ANEXO e COLETAR_MIDIA ao enum FlowState
- Quando o motorista descreve o defeito:
  - Se j� enviou m�dia na descri��o ? vai direto para CONFIRMAR
  - Se **n�o** enviou m�dia ? vai para PERGUNTAR_ANEXO (pergunta "Deseja enviar uma foto do problema?")
    - Se responder "sim" ? vai para COLETAR_MIDIA (aguarda o upload da foto)
    - Se responder "n�o" ? vai para CONFIRMAR (segue sem foto)
    - Se responder algo inv�lido ? IA tenta interpretar; se n�o entender, retorna � pergunta

**Fluxo completo:**
`
COLETAR_DEFEITO (texto do motorista)
  +-- m�dia presente ? vai para CONFIRMAR
  +-- sem m�dia ? PERGUNTAR_ANEXO
                    +-- "sim" ? COLETAR_MIDIA ? CONFIRMAR
                    +-- "n�o" ? CONFIRMAR
`

---

### Implementa��o 2: Avisos espec�ficos por matr�cula

**Arquivo:** src/app/api/webhook-oficina/route.ts

A fun��o uscarAvisosParaMotorista foi dividida em duas:

- **uscarAvisosEspecificos(matricula)** ? busca avisos onde paraMatricula === matricula
  - Chamada **imediatamente** ap�s a identifica��o (IDENTIFICACAO_MATRICULA)
  - Os avisos s�o enviados em sua **pr�pria mensagem** no WhatsApp (separada da mensagem de sauda��o com as perguntas de fun��o/ve�culo)
  - Se n�o houver avisos espec�ficos, o fluxo continua normalmente

- **uscarAvisosDoVeiculo(prefixo)** ? busca avisos onde paraOnibus === prefixo
  - Chamada ap�s a coleta do n�mero do �nibus (COLETAR_ONIBUS), mantendo o comportamento original
  - Os avisos gerais continuam sendo entregues ap�s o ve�culo ser identificado

---

### Implementa��o 3: ATENDENTE redirecionado e sem Dashboard

**Arquivos modificados:**
- src/app/components/sidebar.tsx
- src/app/oficina/(atendimento)/usuarios/page.tsx
- src/app/corporativo/(atendimento)/usuarios/page.tsx

**Sidebar:**
- Dashboard agora � show: userRole !== "ATENDENTE" tanto em corporativo quanto em oficina

**Layout de usu�rios (oficina):**
- ATENDENTE redirecionado de /oficina/dashboards ? /oficina/all-tickets

**Layout de usu�rios (corporativo):**
- ATENDENTE redirecionado de /dashboard ? /corporativo/all-tickets

---

### Implementa��o 4: Nome da empresa na lista de usu�rios

**Arquivos modificados:**
- src/app/api/users/route.ts � GET inclui Empresa: { select: { nome: true } }
- src/app/corporativo/(atendimento)/usuarios/page.tsx � exibe u.Empresa?.nome em vez de u.empresaId?.slice(0, 8)
- src/app/oficina/(atendimento)/usuarios/page.tsx � exibe u.Empresa?.nome em vez de u.empresaId?.slice(0, 8)

**Detalhes:**
- Campo Empresa?: { nome: string } adicionado � interface UserItem
- Fallback para u.empresaId?.slice(0, 8) ou "�" caso Empresa venha vazio

---

### Arquivos modificados

| Arquivo | Mudan�a |
|---------|---------|
| src/app/api/webhook-oficina/route.ts | Coleta opcional de foto + separa��o avisos espec�ficos/gerais |
| src/app/components/sidebar.tsx | Dashboard invis�vel para ATENDENTE |
| src/app/oficina/(atendimento)/usuarios/page.tsx | Redirect para /all-tickets + nome empresa |
| src/app/corporativo/(atendimento)/usuarios/page.tsx | Redirect para /corporativo/all-tickets + nome empresa |
| src/app/api/users/route.ts | GET inclui Empresa.nome no select |

### Build
- 
pm run build � compilado com sucesso ?
