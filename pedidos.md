# Pedidos e Solicitações do Usuário

## PED-001: Reforçar segurança RBAC nas rotas administrativas
**Data:** 12/06/2026
**Descrição:** Proteger rotas administrativas dos módulos por role. GOD deve ter visão global de usuários mas sem acesso a cadastros (CPFs), chamados e dashboards de outras empresas. ADMIN vê tudo da própria empresa. GESTOR vê apenas seu setor. ATENDENTE vê apenas chamados do seu setor. Manter regras existentes e melhorar para não falharem.

## PED-002: Dashboard Global para GOD
**Data:** 12/06/2026
**Descrição:** Criar dashboard global do GOD com métricas da plataforma (empresas, usuários, chamados, CPFs, leads) e da própria empresa do GOD. Incluir gráficos (status, roles, setores, empresas, evolução temporal), tabela de empresas com atividade, logs recentes e seção "Minha Empresa".

## PED-003: Seção "Plataforma" na sidebar para GOD
**Data:** 12/06/2026
**Descrição:** Adicionar seção "Plataforma" na sidebar, visível apenas para GOD, com links para Dashboard Global (/god/dashboard) e Empresas (/corporativo/empresa).

## PED-004: Log de acesso no login
**Data:** 12/06/2026
**Descrição:** Salvar log na tabela `logs_de_acesso` toda vez que um usuário fizer login no sistema. Incluir CPF, nome, empresa, módulo (CORPORATIVO como padrão) e ação "login".

## PED-005: Corrigir setor na criação de avisos
**Data:** 12/06/2026
**Descrição:** O campo setor do formulário de avisos deve ser fixo (bloqueado) para GESTOR/ATENDENTE (usa o próprio setor do usuário) e um select com os setores da empresa para ADMIN/GOD. A mesma regra deve ser aplicada no backend (POST e PUT).

## PED-006: Tratamento de rotas inexistentes (404 inteligente)
**Data:** 12/06/2026
**Descrição:** Qualquer rota que não exista deve: se logado → redirecionar para /dashboard (seleção de módulo); se não logado → redirecionar para / (login); como fallback, página de erro 404 customizada com botões para login ou seleção de módulo. Também corrigir proxy.ts que redirecionava para /login (inexistente) e /all-tricks (inexistente).

## PED-007: Exibir "all" para ADMIN sem setor na listagem de usuários
**Data:** 12/06/2026
**Descrição:** Na coluna "Setor" das páginas de listagem de usuários, quando o usuário for ADMIN e não tiver um setor definido (pois herda todos os setores), exibir "all" em vez de campo vazio ou "—".

## PED-008: Upload de fotos e avisos no formulário de oficina e chatbots
**Data:** 12/06/2026
**Descrição:** Adicionar capacidade de enviar foto do problema/documentação no formulário de chamado da oficina e nos chatbots (corporativo e oficina). Também exibir avisos relacionados ou específicos para o usuário quando houver.
**Data:** 12/06/2026
**Descrição:** Na coluna "Setor" das páginas de listagem de usuários, quando o usuário for ADMIN e não tiver um setor definido (pois herda todos os setores), exibir "all" em vez de campo vazio ou "—".
