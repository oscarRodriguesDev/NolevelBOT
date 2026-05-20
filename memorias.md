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
