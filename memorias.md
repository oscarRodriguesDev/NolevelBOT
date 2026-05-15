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
