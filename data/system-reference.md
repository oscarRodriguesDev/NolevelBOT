# Skora — Referência Completa do Sistema para Landing Page

## 1. Identidade

| Campo | Valor |
|-------|-------|
| **Nome** | Skora |
| **Subtítulo** | Plataforma de Gestão |
| **Slogan** | Gestão inteligente — Elimine gargalos, automatize processos e aumente a eficiência do seu suporte. |
| **Descrição curta** | Sistema inteligente de gestão de chamados e atendimento |
| **Cor primária** | Roxo/violeta (`#B800FF` dark, `#A000F2` light) |
| **Cor de destaque** | Cyan (`#22D3EE`) / Magenta (`#FF00FF`) |
| **Tipo** | SaaS multi-empresa (multi-tenant) |
| **Nome do bot** | Hevelyn (configurável por empresa) |
| **Versão atual** | 1.1.0 |
| **Stack** | Next.js 16, React 19, TypeScript, Tailwind CSS 4, PostgreSQL (Prisma ORM) |

---

## 2. Problema Que Resolve

Empresas de todos os portes enfrentam:
- Atendimento ao cliente/usuário desorganizado (tickets perdidos em WhatsApp, e-mail, planilhas)
- Dificuldade em medir e acompanhar indicadores de suporte
- Processos manuais que consomem tempo da equipe
- Usuários sem canal padronizado para abrir chamados
- Falta de visibilidade sobre gargalos e tempo de resolução
- Múltiplas ferramentas desconectadas (chat, ticket, dashboard)

**Skora centraliza tudo em uma plataforma:** chatbot + tickets + dashboards + avisos, com IA integrada.

---

## 3. Público-Alvo

### Empresas que precisam de:
- **Suporte administrativo/TI** (módulo Corporativo)
  - RH, finanças, infraestrutura, facilities
  - Qualquer setor que receba solicitações internas
- **Gestão de frota/manutenção veicular** (módulo Oficina/Operacional)
  - Transportadoras, frotistas, empresas de ônibus/caminhão
  - Motoristas reportam defeitos diretamente via WhatsApp
- **Captura de leads em eventos** (módulo Eventos)
  - Feiras, exposições, eventos corporativos

### Perfis de usuário dentro da plataforma:
| Perfil | Descrição |
|--------|-----------|
| **GOD** | Superadministrador — gerencia todas as empresas na instância |
| **ADMIN** | Administra a própria empresa (usuários, setores, configurações) |
| **GESTOR** | Gerencia chamados do seu setor, cria usuários |
| **ATENDENTE** | Atende chamados do seu setor |
| **Usuário final** | Abre chamados via WhatsApp ou web (não acessa o sistema) |

---

## 4. Módulos do Sistema

### 4.1 Corporativo
**Gestão de chamados administrativos, TI, infraestrutura e serviços internos.**

- Abertura de chamados via **WhatsApp chatbot** (identificação por CPF)
- Abertura de chamados via **formulário web**
- **Chat web** em tempo real
- **Kanban** visual de tickets com 5 estágios (Novo → Em Atendimento → Aguardando → Concluído → Cancelado)
- **Dashboard** com KPIs, gráficos por setor, exportação CSV/PDF
- **Quadro de avisos** (avisos/notícias para usuários, com expiração automática)
- **Gestão de CPFs autorizados** (quem pode usar o chatbot)
- **4 níveis de prioridade:** Baixa, Normal, Alta, Crítica
- Setores customizáveis por empresa

### 4.2 Oficina / Operacional
**Manutenção veicular para frotas (ônibus, caminhões, veículos operacionais).**

- Abertura de chamados via **WhatsApp** (identificação por matrícula do motorista)
- Abertura via **formulário web**
- Coleta de dados do veículo (número do ônibus/caminhão, função, descrição do defeito)
- Suporte a fotos/anexos
- **Dashboard especializado** com indicadores de frota
- Kanban, avisos e gestão de colaboradores

### 4.3 Eventos
**Captura de leads em feiras e eventos.**

- Cadastro rápido via WhatsApp
- Gestão de leads com histórico
- Dashboard com métricas de captação

---

## 5. Funcionalidades Completas

### 5.1 Canais de Atendimento
| Canal | Descrição |
|-------|-----------|
| **WhatsApp (Chatbot com IA)** | Bot inteligente (GPT-4o-mini) que identifica problemas, busca soluções na base de conhecimento e abre chamados automaticamente. Fluxo guiado com menus. |
| **Formulário Web** | Páginas públicas de abertura de chamado (`/corporativo/chamado`, `/oficina/chamado`) |
| **Chat Web** | Widget de chat em tempo real no navegador (`/corporativo/chatbot-app`, `/oficina/chatbot-app`) |

### 5.2 Inteligência Artificial (OpenAI GPT-4o-mini)
- **Atendimento personalizado:** Bot saúda o usuário pelo nome com base no CPF
- **Base de conhecimento:** Busca automática em avisos/notícias para responder dúvidas
- **Resolução automática:** Se a resposta está em um aviso, o bot responde e evita abertura de chamado (tickets evitados)
- **Detecção de duplicidade:** Identifica se o usuário já tem chamado aberto similar
- **Memória do usuário (`resumoPersona`):** Resume personalidade/histórico após 3 interações
- **Classificação de intent:** Decide se resolve com aviso, prossegue com fluxo, ou coleta mais contexto

### 5.3 Gestão de Tickets (Chamados)
- **5 status:** NOVO, EM_ATENDIMENTO, AGUARDANDO, CONCLUIDO, CANCELADO
- **4 prioridades:** Baixa, Normal, Alta, Crítica
- **Visualização em Kanban** (drag não implementado, mas visual em colunas)
- **Visualização em lista** com filtros por setor, status, prioridade, período
- **Anexos:** Upload de imagens (JPG, PNG, GIF, WebP) e PDF (máx. 10MB)
- **Histórico completo:** Todas as interações registradas em JSON
- **Atendente responsável:** Atribuição automática ou manual
- **Busca pública:** Qualquer pessoa consulta chamado pelo CPF, matrícula ou número do ticket

### 5.4 Dashboard e Métricas
- **Gráficos por setor** (volume de chamados por setor)
- **Tickets evitados** (quantidade de chamados que o chatbot resolveu sem precisar abrir ticket)
- **Tempo médio de resolução**
- **Taxa de automação**
- **Chamados por status e prioridade**
- **Exportação CSV e PDF**
- **Dashboard global (GOD):** Métricas consolidadas de todas as empresas

### 5.5 Quadro de Avisos
- Comunicação direta com usuários finais
- Conteúdo rico (título, descrição)
- Vinculado a setor específico (segmentação)
- Expiração automática (duração em dias)
- Exibido no chatbot e nas consultas públicas
- Bot usa avisos como base de conhecimento para responder dúvidas

### 5.6 Gestão de Usuários
- Cadastro com nome, email, CPF, setor, função (role)
- Controle de acesso hierárquico (RBAC)
- Avatar/foto de perfil
- Resumo/personalidade do usuário (para IA)
- Importação em lote de CPFs

### 5.7 API
- API própria documentada em `/api-docs`
- Endpoints para tickets, usuários, CPFs, empresas, avisos, dashboard
- Autenticação via API Key para bots
- Rate limiting por IP
- Webhooks para Evolution API (WhatsApp)

### 5.8 Segurança
- **Autenticação:** NextAuth com JWT, bcryptjs para senhas
- **Rate limit:** 60 req/min leitura, 3 req/h para criação de ticket
- **Proteção brute-force:** Turnstile (Cloudflare) após 3 tentativas falhas de login
- **RBAC:** 4 níveis hierárquicos com escopo de dados por empresa e setor
- **Auditoria:** Logs de acesso registrados em banco
- **Upload seguro:** Apenas JPG, PNG, PDF; máximo 10MB
- **Headers de segurança:** X-Frame-Options, X-Content-Type-Options, Permissions-Policy
- **Honeypot:** Campo oculto em formulários para capturar bots
- **API Key:** Autenticação para integrações bot

---

## 6. Como Funciona — Fluxo Completo

### Usuário final abre chamado via WhatsApp:
```
1. Usuário envia "oi" no WhatsApp da empresa
2. Bot (Hevelyn) responde com saudação personalizada e pede CPF
3. Usuário informa CPF → bot valida na base de CPFs autorizados
4. Bot exibe avisos relevantes (se houver)
5. Bot pergunta se usuário quer: [1] Abrir chamado [2] Consultar status [3] Sair
6. Se [1]: bot coleta motivo → verifica duplicidade → pede anexo → seleciona setor → confirma → cria chamado
7. Se [2]: bot busca chamados do CPF e informa status de cada um
8. Ticket criado aparece no kanban da equipe
9. Atendente atualiza status até concluir
```

### Usuário final abre chamado via web:
```
1. Acessa /corporativo/chamado (ou /oficina/chamado)
2. Preenche formulário: nome, CPF/matrícula, setor, descrição, anexo
3. Submete → ticket criado com status NOVO
4. Acompanha em /consulta informando CPF ou número do ticket
```

### Equipe de atendimento:
```
1. Acessa o sistema → login → dashboard → escolhe módulo
2. Visualiza chamados no kanban ou lista
3. Filtra por setor/status/prioridade
4. Abre chamado → vê histórico + anexos → atualiza status/prioridade
5. Acompanha métricas no dashboard
```

---

## 7. Estrutura de Telas (Rotas)

### Páginas Públicas (sem login)
| Rota | Conteúdo |
|------|----------|
| `/` | Login |
| `/contact` | Formulário de contato (envia para Google Forms) |
| `/corporativo/chamado` | Abertura de chamado corporativo |
| `/corporativo/chamado/[ticket]` | Detalhe do chamado corporativo |
| `/corporativo/consulta` | Consulta de chamados (por CPF ou ticket) |
| `/corporativo/consulta/[ticket]` | Detalhe da consulta |
| `/corporativo/chatbot-app` | Chat web corporativo |
| `/oficina/chamado` | Abertura de chamado oficina |
| `/oficina/chamado/[ticket]` | Detalhe do chamado oficina |
| `/oficina/consulta` | Consulta de chamados oficina |
| `/oficina/consulta/[ticket]` | Detalhe da consulta oficina |
| `/oficina/chatbot-app` | Chat web oficina |

### Páginas Internas (requer login)
| Rota | Conteúdo |
|------|----------|
| `/dashboard` | Seletor de módulos |
| `/api-docs` | Documentação da API |
| `/corporativo/dashboards` | Dashboard corporativo (KPIs, gráficos) |
| `/corporativo/all-tickets` | Kanban + lista de chamados corporativos |
| `/corporativo/avisos` | Gerenciar quadro de avisos |
| `/corporativo/cpfs` | Gerenciar CPFs autorizados |
| `/corporativo/usuarios` | Listar usuários da empresa |
| `/corporativo/gestao-de-usuarios` | Criar/editar usuários |
| `/corporativo/empresa` | Configurações da empresa (GOD) |
| `/corporativo/empresa/create` | Criar nova empresa (GOD) |
| `/corporativo/empresa/[id]/usuarios` | Usuários de empresa específica (GOD) |
| `/oficina/dashboards` | Dashboard oficina |
| `/oficina/all-tickets` | Kanban + lista oficina |
| `/oficina/avisos` | Avisos oficina |
| `/oficina/cpfs` | Colaboradores oficina |
| `/oficina/usuarios` | Usuários oficina |
| `/oficina/gestao-de-usuarios` | Criar usuários oficina |
| `/god/dashboard` | Dashboard global (GOD) |
| `/god/usuarios` | Todos os usuários (GOD) |
| `/god/admins` | Gerenciar admins (GOD) |
| `/god/erros` | Visualizador de erros (GOD) |
| `/ideias` | Enviar sugestões |

---

## 8. Fluxo de Dados

```
Usuário Final (WhatsApp/Web)
       │
       ▼
┌─────────────────────┐
│  Evolution API      │ (WhatsApp gateway)
│  Webhooks           │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  OpenAI GPT-4o-mini │ (IA do chatbot)
│  • Intent detection │
│  • Aviso matching   │
│  • Memória          │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Skora (Backend)    │
│  • Tickets          │
│  • CPFs             │
│  • Avisos           │
│  • Dashboards       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  PostgreSQL (Prisma)│
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│  Equipe (Web App)   │
│  • Kanban           │
│  • Dashboard        │
│  • Gestão           │
└─────────────────────┘
```

---

## 9. Diferenciais Competitivos

1. **Tudo-em-um:** Chatbot + Tickets + Dashboards + Avisos + Múltiplos canais
2. **IA integrada:** OpenAI GPT-4o-mini para atendimento inteligente e automação real
3. **Multi-módulo:** Uma plataforma atende áreas administrativas, operacionais e eventos
4. **Multi-empresa:** Uma instância atende múltiplas empresas com isolamento total
5. **WhatsApp nativo:** Chatbot integrado com Evolution API, sem depender de provedores externos
6. **Autoatendimento:** Chatbot resolve problemas automaticamente (tickets evitados)
7. **RBAC granular:** 4 níveis com escopo por setor e empresa
8. **Código aberto:** Stack moderna e auditável (Next.js, React, TypeScript, PostgreSQL)
9. **Cloudflare Turnstile:** Captcha invisível, sem atrito para usuário legítimo
10. **Exportação de dados:** CSV e PDF para análises externas

---

## 10. Infraestrutura

| Componente | Tecnologia |
|------------|-----------|
| Frontend + API | Next.js 16 (App Router) |
| Banco de dados | PostgreSQL (Supabase ou self-hosted) |
| ORM | Prisma 7 |
| IA | OpenAI GPT-4o-mini |
| WhatsApp | Evolution API (self-hosted) |
| Storage | Supabase Storage (imagens, anexos, logos) |
| Captcha | Cloudflare Turnstile |
| Autenticação | NextAuth v4 + JWT + bcryptjs |
| Containerização | Docker / docker-compose |
| Deploy | Vercel ou servidor próprio |

---

## 11. Frases e Textos para Landing Page

### Headlines possíveis:
- "Gestão inteligente de atendimento para sua empresa"
- "WhatsApp + Chatbot IA + Tickets em um só lugar"
- "Transforme o atendimento da sua empresa com Skora"
- "O suporte que seus usuários merecem, a automação que sua equipe precisa"
- "Skora — Atendimento inteligente, resultados reais"

### Value Propositions (dores x soluções):
| Dor | Solução Skora |
|-----|--------------|
| "Perdemos chamados no WhatsApp" | Chatbot com fluxo guiado que abre ticket automaticamente |
| "Não sabemos quantos chamados abrimos por mês" | Dashboard com KPIs, gráficos, exportação CSV/PDF |
| "Usuários reabrem chamados porque não veem atualização" | Consulta pública de status + avisos no chatbot |
| "Equipe afogada em demandas simples repetitivas" | IA responde automaticamente quando há aviso na base |
| "Motoristas não reportam defeitos corretamente" | Fluxo guiado no WhatsApp: matrícula → veículo → defeito → foto |
| "Cada setor usa um canal diferente" | Plataforma unificada com multi-setores e multi-módulos |

### Seções sugeridas para landing page:
1. **Hero:** Nome, slogan, CTA ("Solicitar demonstração" → `/contact`)
2. **Problema x Solução:** Dores e como Skora resolve
3. **Funcionalidades:** Cards com ícones e descrições curtas
4. **Como funciona:** 3 passos simples (ex: Configure → Atenda → Analise)
5. **Módulos:** Corporativo, Oficina, Eventos
6. **Canais:** WhatsApp, Web, Chat Web
7. **IA e Automação:** Como o bot inteligente reduz tickets
8. **Dashboard e Métricas:** Gestão baseada em dados
9. **Segurança:** RBAC, criptografia, auditoria
10. **CTA final:** Contato para demonstração

### Screenshots disponíveis (na pasta /public/landing/):
- `fundo.png` — Fundo/banner
- `footer.png` — Rodapé/imagem decorativa
- `dash.png` — Dashboard/preview do sistema

---

## 12. Observações Técnicas para Landing Page

- **A landing page deve ser pública** (não requer login), servida separadamente ou como uma página inicial institucional antes do login.
- Atualmente o sistema **não tem landing page institucional** — a rota `/` é o login. A landing page precisaria ser implementada (ex: na raiz, com o login movido para `/login`).
- O sistema já tem assets visuais em `/public/landing/`.
- A identidade visual usa roxo como cor primária, com suporte a tema claro/escuro.
- Ícones usados no sistema: Lucide React + React Icons.
- O nome "Skora" é o nome comercial; "nolevel" é o nome interno do pacote.
- O bot se chama "Hevelyn" (configurável).

---

> Documento gerado em Junho 2026 com base na análise completa do código-fonte.
> Use este documento como referência para criar uma landing page fiel à realidade do sistema Skora.
