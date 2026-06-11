# NolevelBOT — Sistema Inteligente de Atendimento Multi-Empresa

---

## 1. O QUE É O NOLEVELBOT?

O **NolevelBOT** é uma plataforma completa de gestão de atendimento que unifica **chamados (tickets)**, **chatbot WhatsApp com IA**, **multilojas/multi-empresas** e **dashboards** em um único sistema.

Ele foi projetado para empresas que precisam organizar o atendimento ao cliente, automatizar respostas no WhatsApp e manter todo o histórico de solicitações em um lugar só — seja você uma pequena empresa com 2 atendentes ou uma organização com múltiplas filiais e departamentos.

---

## 2. PRINCIPAIS FUNCIONALIDADES

### 2.1 Gestão de Chamados (Tickets)
- Abertura de chamados via **WhatsApp**, **formulário web público** ou **portal interno**
- Cada chamado recebe um **número de ticket único** (ex: TKT-1234) para rastreamento
- **5 status padronizados**: Novo → Em Atendimento → Aguardando → Concluído → Cancelado
- **Prioridades**: Baixa, Normal, Alta, Crítica
- **Histórico completo**: toda interação fica registrada com data, hora e responsável
- **Anexos**: fotos, PDFs, comprovantes — tudo armazenado em nuvem (Supabase Storage)
- **Notificações proativas**: o cliente recebe aviso no WhatsApp quando o chamado é criado, está sendo atendido ou é concluído

### 2.2 Chatbot WhatsApp com IA
- **Múltiplas instâncias**: cada empresa ou departamento pode ter seu próprio número de WhatsApp
- **Atendimento 24/7**: o bot recebe solicitações, valida CPF, coleta informações e abre chamados automaticamente
- **IA Integrada (OpenAI)**: processa linguagem natural para entender o que o cliente precisa
- **Prompt personalizado**: cada empresa pode configurar como o bot se apresenta, atende e explica os serviços
- **Envio de mídia**: clientes podem enviar fotos e documentos diretamente pelo WhatsApp
- **Fluxo inteligente**: se o serviço exigir documentos, o bot orienta o cliente a anexar os arquivos
- **Nome dinâmico**: o assistente assume o nome configurado para a instância (ex: "Hevelyn", "Suporte", "Maria")

### 2.3 Captura de Leads
- **Webhook específico para eventos/feiras**: captura leads de forma fluida e sem travas
- **Coleta automática**: nome, telefone, CPF, empresa — extraídos diretamente da conversa
- **Integração com WhatsApp**: o lead já sai do evento com um canal de comunicação aberto

### 2.4 Dashboards e Relatórios
- **Gráficos em tempo real**: volume de chamados, tempo de resposta, distribuição por status
- **Filtros por período, setor e atendente**
- **Exportação**: PDF e Excel (xlsx) para relatórios gerenciais
- **Visão Kanban**: quadro visual com drag-and-drop para gerenciar chamados de forma intuitiva

### 2.5 Quadro de Avisos
- **Avisos internos** segmentados por setor
- **Expiração automática**: configure data de validade para cada aviso
- **Visibilidade**: aparecem no bot e no portal conforme o setor do usuário

### 2.6 Módulo Oficina (Manutenção Veicular)
- Módulo especializado para **empresas de transporte público**
- Motoristas registram **defeitos, socorros de rua e final de turno** via WhatsApp ou formulário web
- Identificação por **matrícula** (em vez de CPF)
- Campos específicos: função, número do ônibus, data do ocorrido, discriminação dos serviços
- Kanban adaptado: Aguardando → Em Andamento → Aguardando Peças → Concluído → Cancelado

---

## 3. COMO SE AJUSTA A DIFERENTES EMPRESAS

O NolevelBOT foi construído com **arquitetura multi-tenant**, o que significa que uma única instância do sistema atende **múltiplas empresas de forma isolada e segura**.

### 3.1 Isolamento por Empresa
- Cada empresa tem seus **próprios dados**: chamados, usuários, CPFs autorizados, avisos
- **Nunca há vazamento** de informações entre empresas
- O cliente acessa **apenas o que é da empresa dele**

### 3.2 Personalização por Empresa
| O que pode ser personalizado | Como funciona |
|------------------------------|---------------|
| **Nome do assistente virtual** | Configurado no cadastro da empresa — o bot se apresenta com o nome escolhido |
| **Logotipo** | Upload direto no sistema — aparece nos cards, avisos e interface |
| **Prompt do bot** | Você descreve como o bot deve se apresentar, atender e falar sobre os serviços — a IA gera o prompt automaticamente |
| **Setores/Departamentos** | Crie quantos setores precisar (ex: Suporte Técnico, Financeiro, Vendas) |
| **Cores** | Cada empresa pode ter sua identidade visual |
| **Módulos** | Ative apenas o que sua empresa usa (atendimento, oficina, leads, etc.) |

### 3.3 Controle de Acesso (RBAC)
| Papel | O que pode fazer |
|-------|------------------|
| **GOD** | Acesso total ao sistema — gerencia empresas, admins e configurações globais |
| **ADMIN** | Administra a própria empresa: cria gestores e atendentes, configura o bot |
| **GESTOR** | Gerencia chamados e atendentes do seu setor |
| **ATENDENTE** | Atende chamados do seu setor, visualiza dados |

As permissões são validadas **tanto no frontend quanto no backend** — não é possível burlar o sistema manipulando requisições.

### 3.4 Múltiplos Canais de Atendimento
| Canal | Público | Como funciona |
|-------|---------|--------------|
| **WhatsApp (bot)** | Clientes finais | O cliente envia uma mensagem → bot identifica → valida → abre chamado |
| **Portal web (público)** | Clientes finais | Formulário em `/chamado` — qualquer pessoa com CPF cadastrado pode abrir solicitação |
| **Portal web (interno)** | Equipe da empresa | Sistema completo com dashboard, Kanban, gestão de usuários |
| **Chat web** | Clientes no site | Widget de chat com o mesmo comportamento do bot WhatsApp |

### 3.5 Infraestrutura Flexível
- **Cloud ou on-premise**: roda em container Docker — deploy em VPS, servidor próprio ou nuvem
- **Banco PostgreSQL**: cada empresa no mesmo banco, separada por `empresaId`
- **Storage em nuvem**: anexos e avatares no Supabase (ou qualquer S3-compatible)
- **WhatsApp via Evolution API**: suporta múltiplas instâncias simultâneas

---

## 4. CASOS DE USO REAIS

### 4.1 Empresa de Suporte Técnico (Multi-Clientes)
**Problema:** A empresa atende 5 clientes diferentes, cada um com seus próprios usuários e necessidades.
**Solução com NolevelBOT:**
- Cada cliente vira uma "empresa" no sistema
- Cada cliente tem seu próprio número de WhatsApp com bot personalizado
- O atendente loga e vê apenas chamados dos clientes que atende
- GOD gerencia tudo de forma centralizada

### 4.2 Empresa de Transporte Público
**Problema:** Motoristas precisam reportar defeitos nos veículos ao final do turno, mas o processo é manual e sem registro.
**Solução com NolevelBOT:**
- Módulo Oficina ativado
- Motorista envia matrícula + defeito pelo WhatsApp
- Chamado criado automaticamente no setor correto (Mecânica, Elétrica, Funilaria)
- Gestor da oficina acompanha em Kanban: Aguardando → Em Andamento → Aguardando Peças → Concluído
- Histórico completo de cada manutenção

### 4.3 Empresa de Serviços com Captura de Leads em Eventos
**Problema:** Em feiras e eventos, a equipe precisa captar leads de forma rápida e sem papel.
**Solução com NolevelBOT:**
- Webhook de leads ativado para o evento
- Visitante escaneia QR code → conversa com o bot no WhatsApp
- Bot coleta nome, telefone e interesse de forma natural e fluida
- Lead salvo automaticamente no sistema
- Após o evento, equipe comercial tem uma base quente de contatos

### 4.4 Empresa com Múltiplos Departamentos
**Problema:** Vendas, Suporte e Financeiro usam sistemas diferentes — sem integração.
**Solução com NolevelBOT:**
- Único sistema para todos os departamentos
- Cada departamento é um "setor" com seus próprios atendentes
- Cliente é direcionado ao setor correto pelo bot
- Gestor de cada setor vê apenas os chamados da sua área
- Diretoria tem visão consolidada em dashboards

---

## 5. TECNOLOGIA

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Next.js 16 + React 19 + Tailwind CSS 4 |
| **Backend** | Next.js API Routes (Node.js) |
| **Banco de Dados** | PostgreSQL (via Supabase) |
| **ORM** | Prisma 7 |
| **Autenticação** | NextAuth 4 (JWT) |
| **IA** | OpenAI (GPT) |
| **WhatsApp** | Evolution API |
| **Storage** | Supabase Storage (S3-compatible) |
| **Infraestrutura** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |

---

## 6. SEGURANÇA

- ✅ **Dados isolados por empresa** — nunca há vazamento entre clientes
- ✅ **RBAC completo** — permissões validadas no servidor
- ✅ **Rate limiting** — proteção contra abuso em endpoints públicos
- ✅ **CAPTCHA** — Cloudflare Turnstile no login após tentativas suspeitas
- ✅ **Honeypot** — campos ocultos anti-bot em formulários públicos
- ✅ **Validação de CPF** — algoritmo oficial de dígitos verificadores
- ✅ **Sanitização** — remoção de HTML e limites de tamanho em todos os inputs
- ✅ **Senhas com bcrypt** — hash seguro, sem logs de senha
- ✅ **JWT stateless** — sem sessão em banco, sem vazamento de tokens

---

## 7. COMO IMPLANTAR

1. **Infraestrutura**: servidor com Docker e Docker Compose
2. **Configuração**: variáveis de ambiente (banco, Evolution API, OpenAI, Supabase)
3. **Cadastro inicial**: criar primeira empresa e usuário GOD
4. **Configuração do bot**: nome, prompt personalizado, instância WhatsApp
5. **Cadastro de usuários**: admins, gestores e atendentes da empresa
6. **CPFs autorizados**: clientes que podem abrir chamados via WhatsApp
7. **Pronto!** O sistema já está operacional

---

## 8. EXEMPLOS DE TELA

### Portal de Chamados (Visão Lista)
- Tabela com filtros por nome, ticket, setor, prioridade e status
- Ações: editar, reatribuir, concluir

### Kanban (Visão Quadro)
- 5 colunas: Novo → Em Atendimento → Aguardando → Concluído → Cancelado
- Arrastar e soltar para mudar de status
- Clique no card para ver detalhes e histórico

### Dashboard
- Gráficos de pizza por status e prioridade
- Barras por período
- Cards com totais e médias

### Configuração da Empresa
- Logo, nome, CNPJ
- Setores (departamentos)
- Configuração do assistente virtual (nome + prompt com IA)

---

## 9. SUPORTE E EVOLUÇÃO

O sistema é **constantemente evoluído** com base nas necessidades reais dos clientes. As principais frentes de desenvolvimento incluem:

- Novos módulos verticais (saúde, educação, logística)
- Integração com sistemas terceiros via API REST
- Relatórios avançados com inteligência de dados
- App mobile nativo (Android/iOS)
- Multi-idioma

---

> **NolevelBOT** — Atendimento inteligente que se adapta ao seu negócio.
