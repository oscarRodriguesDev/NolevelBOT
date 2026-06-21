# Manual da Plataforma — Skora

## 1. Visão Geral

**Skora** (anteriormente NolevelBOT) é uma plataforma multi-empresa de gestão de atendimento que unifica chamados (tickets), chatbot WhatsApp, dashboards e módulos verticais em um único sistema.

### O que a plataforma faz

- **Abertura de chamados** — Usuários finais (funcionários, motoristas, clientes) abrem chamados via WhatsApp chatbot ou formulário web.
- **Gestão de tickets** — Equipes de atendimento acompanham, priorizam e resolvem chamados em um kanban visual.
- **Chatbot WhatsApp com IA** — Bots inteligentes que identificam o problema, buscam soluções na base de conhecimento e criam chamados automaticamente.
- **Dashboards** — Métricas e indicadores em tempo real sobre atendimentos, desempenho e tendências.
- **Quadro de avisos** — Comunicação direta com os usuários sobre problemas conhecidos, manutenções programadas etc.
- **Multi-empresa** — Uma única instância atende várias empresas, cada uma com seus próprios usuários, setores e módulos.

### Módulos disponíveis

| Módulo | Descrição |
|--------|-----------|
| **Corporativo** | Gestão de chamados administrativos, TI, infraestrutura |
| **Oficina** | Manutenção veicular para transportadoras (motoristas abrem chamados de defeitos em ônibus/caminhões) |
| **Eventos** | Captura e gestão de leads em feiras e eventos |

---

## 2. Regras de Cadastro (Validações)

Todas as validações abaixo são aplicadas tanto no formulário web quanto nas APIs.

### 2.1 Nome

- Mínimo de **2 caracteres**
- Qualquer caractere é aceito (letras, números, espaços)

### 2.2 Email

- Deve ser um **email válido** (formato `usuario@dominio.com`)
- Utiliza validação RFC 5322 (padrão de emails)
- Não há limite mínimo/máximo de caracteres além do formato
- **Não pode repetir** — cada email deve ser único no sistema

### 2.3 Senha

- Mínimo de **6 caracteres**
- **Não há exigência** de letra maiúscula, minúscula, número ou caractere especial
- Não há limite máximo de caracteres
- Exemplos aceitos: `123456`, `senha`, `MinhaSenha@2026`
- Exemplos rejeitados: `abc` (menos de 6 caracteres)

### 2.4 CPF

- Exatamente **11 dígitos numéricos**
- Apenas números — sem pontos, traços ou letras
- Formato aceito: `12345678901`
- Formato rejeitado: `123.456.789-01`, `abc45678901`, `1234567890` (10 dígitos)
- **Não pode repetir** dentro da mesma empresa

### 2.5 CNPJ (empresas)

- Exatamente **14 dígitos numéricos**
- Apenas números — sem formatação

### 2.6 Telefone

- Mínimo de **8 caracteres**
- Aceita qualquer formato (com ou sem DDD, com ou sem código de país)

### 2.7 Setor

- Mínimo de **1 caractere**
- Deve existir na lista de setores da empresa
- Para ADMIN, o valor `"all"` indica que gerencia todos os setores

---

## 3. Regras de Acesso (RBAC)

### 3.1 Papéis (Roles)

O sistema possui 4 níveis hierárquicos de acesso:

| Papel | Hierarquia | Descrição |
|-------|:----------:|-----------|
| **GOD** | 4 (maior) | Superadministrador — acesso total a todas as empresas, bypass de módulos |
| **ADMIN** | 3 | Administra sua empresa — gerencia usuários, setores, CPFs |
| **GESTOR** | 2 | Gerencia chamados do seu setor — pode criar/editar chamados e usuários |
| **ATENDENTE** | 1 | Atende chamados do seu setor — apenas visualiza e atualiza chamados |

### 3.2 Quem pode criar quem

| Criador | Pode criar |
|---------|------------|
| GOD | ADMIN |
| ADMIN | GESTOR, ATENDENTE |
| GESTOR | ATENDENTE (apenas do seu setor) |
| ATENDENTE | Ninguém |

### 3.3 Quem pode deletar quem

| Deleter | Pode deletar |
|---------|-------------|
| GOD | ADMIN, GESTOR, ATENDENTE |
| ADMIN | GESTOR, ATENDENTE |
| GESTOR | ATENDENTE (apenas do seu setor) |
| ATENDENTE | Ninguém |

**Regras importantes:**
- Ninguém pode deletar um usuário GOD
- Ninguém pode deletar a si mesmo
- ADMIN/GESTOR só podem deletar usuários da sua própria empresa
- Ao deletar um ADMIN, deve restar pelo menos 1 ADMIN na empresa
- Ao deletar um GESTOR, deve restar pelo menos 1 GESTOR na empresa
- A exclusão é feita em transação: deleta o CPF associado e depois o usuário

### 3.4 Quem pode ver o quê

| Papel | Vê usuários | Vê chamados |
|-------|------------|-------------|
| GOD | Todos (qualquer empresa) | Todos (qualquer empresa) |
| ADMIN | ADMIN, GESTOR, ATENDENTE (sua empresa) | Todos os setores da sua empresa |
| GESTOR | ATENDENTE (seu setor) | Apenas seu setor |
| ATENDENTE | Ninguém | Apenas seu setor |

### 3.5 Escopo de dados por papel

- **GOD e ADMIN** — enxergam dados de **todos os setores** da empresa
- **GESTOR e ATENDENTE** — enxergam apenas **seu próprio setor**

### 3.6 Permissões especiais

| Ação | Quem pode |
|------|-----------|
| Criar empresa (GOD) | Apenas GOD |
| Ver lista de empresas | Apenas GOD |
| Gerenciar prompt de IA da empresa | Apenas GOD |
| Importar CPFs em lote | GOD, ADMIN, GESTOR |
| Escolher setor ao criar aviso | Apenas ADMIN |
| Criar avisos | ADMIN, GESTOR, GOD (ATENDENTE não) |
| Ver dashboard | ADMIN, GESTOR, GOD |
| Ver dashboard global | Apenas GOD |

### 3.7 Proteção de rotas

- Rotas de API verificam o papel do usuário antes de processar a requisição
- Rotas de página (layout) verificam se a empresa possui o módulo ativo
- GOD tem bypass automático de verificação de módulos
- Usuários sem acesso são redirecionados para o seletor de módulos

---

## 4. Sistema de Módulos

Cada empresa pode ter um ou mais módulos ativos:

### 4.1 Módulo Corporativo
- Chamados administrativos, TI, infraestrutura
- Identificação por **CPF** (11 dígitos)
- Quadro de avisos, dashboard, kanban de tickets
- Gestão de CPFs autorizados

### 4.2 Módulo Oficina
- Manutenção veicular para frotas (ônibus, caminhões)
- Identificação por **matrícula** do motorista
- Fluxo com dados do veículo (número do ônibus, defeito via JSON)
- Dashboard especializado com indicadores de frota

### 4.3 Módulo Eventos
- Captura de leads em feiras e eventos
- Gestão de leads com histórico
- Dashboard com métricas de captação

---

## 5. Status de Chamados

| Status | Descrição |
|--------|-----------|
| **NOVO** | Chamado recém-criado, aguardando atendimento |
| **EM_ATENDIMENTO** | Em análise pela equipe |
| **AGUARDANDO** | Aguardando resposta do solicitante |
| **CONCLUIDO** | Resolvido e finalizado |
| **CANCELADO** | Cancelado pelo solicitante ou equipe |

---

## 6. Prioridades

| Prioridade | Descrição |
|------------|-----------|
| **Baixa** | Sem urgência, pode agendar |
| **Normal** | Padrão, resolver no prazo |
| **Alta** | Requer atenção rápida |
| **Crítica** | Impacto grave, ação imediata |

---

## 7. Canais de Atendimento

A plataforma oferece 3 canais para abertura de chamados:

### 7.1 WhatsApp (Chatbot)
- Chatbot automático com fluxo guiado
- Suporta envio de fotos/anexos
- Identificação por CPF (Corporativo) ou matrícula (Oficina)
- Bots com IA para responder automaticamente quando possível
- Canais:
  - **Webhook 24** — Chatbot corporativo com IA
  - **Webhook 25** — Chatbot corporativo com IA (versão aprimorada)
  - **Webhook 27** — Chatbot corporativo com IA (versão mais recente)
  - **Webhook-oficina** — Chatbot para módulo oficina
  - **Webhook-corporativo** — Chatbot corporativo sem IA
  - **Webhook-leads** — Captura de leads via WhatsApp

### 7.2 Web (Formulário)
- Abertura direta pelo navegador
- Endereços: `/corporativo/chamado`, `/oficina/chamado`

### 7.3 Chat Web
- Chat em tempo real pelo navegador
- Endereços: `/corporativo/chatbot-app`, `/oficina/chatbot-app`

---

## 8. Consulta de Chamados

Qualquer pessoa pode consultar chamados públicos informando:
- **CPF** (para chamados corporativos)
- **Matrícula** (para chamados de oficina)
- **Ticket** (número do chamado)

Endereços: `/corporativo/consulta`, `/oficina/consulta`

---

## 9. Segurança e Boas Práticas

- **Senhas** — Mínimo de 6 caracteres, sem exigência de complexidade (mas recomenda-se usar letras, números e caracteres especiais)
- **Rate limit** — A plataforma limita requisições por IP para evitar abusos (60 req/min para leitura, 10-30/min para escrita)
- **Bloqueio por tentativas** — Após 3 tentativas de login inválidas, é necessário resolver um captcha (Turnstile)
- **API Key** — Integrações com bots exigem chave de API (`BOT_API_KEY`) para autenticação
- **Upload seguro** — Apenas arquivos de imagem (jpg, png, gif, webp) e PDF são aceitos, com limite de 10MB
- **Logs de acesso** — Todo login bem-sucedido é registrado em logs de auditoria

---

## 10. Temas

A plataforma suporta dois temas:
- **Claro** — Fundo branco, texto escuro
- **Escuro** (padrão) — Fundo escuro, texto claro

A preferência é salva no navegador e persiste entre sessões.

---

> **Skora — Plataforma de Gestão de Atendimento Multi-Empresa**
> Versão: Junho 2026
