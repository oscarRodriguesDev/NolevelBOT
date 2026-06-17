'use client'

import { ThemeToggle } from '../components/theme-toggle'

const endpoints = [
  // ─── Autenticação ───
  { method: 'GET', path: '/api/auth/[...nextauth]', auth: false, description: 'Login (Credentials provider - NextAuth)' },
  { method: 'POST', path: '/api/auth/[...nextauth]', auth: false, description: 'Login (Credentials provider - NextAuth)' },

  // ─── Empresas ───
  { method: 'POST', path: '/api/empresa', auth: true, description: 'Criar empresa (GOD)' },
  { method: 'GET', path: '/api/empresa', auth: true, description: 'Listar empresas (GOD vê todas; demais vêem só a própria)' },
  { method: 'GET', path: '/api/empresa?cpf=xxx', auth: false, description: 'Buscar empresa e setores por CPF (público)' },
  { method: 'GET', path: '/api/empresa?id=xxx', auth: true, description: 'Buscar empresa específica por ID (com módulos)' },
  { method: 'PUT', path: '/api/empresa', auth: true, description: 'Atualizar dados da empresa (GOD) — nome, cnpj, cor, logoUrl, bot config, módulos' },
  { method: 'DELETE', path: '/api/empresa', auth: true, description: 'Excluir empresa (GOD)' },
  { method: 'GET', path: '/api/empresa/prompt', auth: true, description: 'Obter configuração do bot de uma empresa (GOD)' },
  { method: 'POST', path: '/api/empresa/prompt', auth: true, description: 'Gerar prompt do bot via OpenAI a partir de descrições (GOD)' },
  { method: 'PUT', path: '/api/empresa/prompt', auth: true, description: 'Atualizar prompt/descrições do bot manualmente (GOD)' },
  { method: 'DELETE', path: '/api/empresa/prompt', auth: true, description: 'Remover configuração do bot (GOD)' },

  // ─── Tickets / Chamados ───
  { method: 'POST', path: '/api/tickets', auth: false, description: 'Criar chamado (multipart/form-data com anexo opcional) — rate limit 3/h/IP, honeypot, validação CPF' },
  { method: 'GET', path: '/api/tickets', auth: true, description: 'Listar chamados da empresa com filtros (nome, ticket, setor, prioridade, status)' },
  { method: 'PUT', path: '/api/tickets?atendimento=TKT-xxx&estagio=NOVO', auth: true, description: 'Atualizar status do chamado + notificação WhatsApp proativa' },
  { method: 'DELETE', path: '/api/tickets?atendimento=TKT-xxx', auth: true, description: 'Finalizar chamado (move para tickets_fechados) + notificação WhatsApp' },
  { method: 'POST', path: '/api/tickets/search', auth: false, description: 'Buscar chamados por CPF ou ticket (público — usado nas páginas /consulta)' },
  { method: 'GET', path: '/api/tickets/search', auth: false, description: 'Buscar chamados por CPF ou ticket (público)' },
  { method: 'PUT', path: '/api/tickets/search', auth: true, description: 'Atualizar chamado via busca (com validação RBAC)' },
  { method: 'DELETE', path: '/api/tickets/search', auth: true, description: 'Finalizar chamado via busca (com validação RBAC)' },

  // ─── Oficina ───
  { method: 'GET', path: '/api/oficina/tickets?matricula=xxx', auth: false, description: 'Validar matrícula de motorista e retornar nome + setores (público)' },
  { method: 'POST', path: '/api/oficina/tickets', auth: false, description: 'Criar chamado da oficina (matrícula, nome, função, nº ônibus, data, defeito, setor)' },

  // ─── Usuários ───
  { method: 'POST', path: '/api/users', auth: true, description: 'Criar usuário (RBAC: GOD→ADMIN, ADMIN→GESTOR/ATENDENTE, GESTOR→ATENDENTE) + auto-registro CPF' },
  { method: 'GET', path: '/api/users', auth: true, description: 'Listar usuários (GOD vê todos; ADMIN vê empresa; GESTOR vê setor)' },
  { method: 'PUT', path: '/api/users', auth: true, description: 'Editar usuário (bloqueia auto-edição; valida RBAC)' },
  { method: 'DELETE', path: '/api/users', auth: true, description: 'Excluir usuário (verifica substituto para GESTOR/ADMIN; bloqueia auto-exclusão)' },
  { method: 'GET', path: '/api/users/user-active', auth: true, description: 'Dados do usuário logado' },
  { method: 'PUT', path: '/api/users/user-active', auth: true, description: 'Atualizar perfil/senha/avatar do usuário logado' },
  { method: 'GET', path: '/api/users/admins', auth: true, description: 'Listar administradores (GOD only)' },
  { method: 'PUT', path: '/api/users/admins', auth: true, description: 'Editar administrador (GOD only; bloqueia auto-edição)' },
  { method: 'DELETE', path: '/api/users/admins', auth: true, description: 'Remover administrador (GOD only; bloqueia exclusão de GOD)' },

  // ─── UserFacil (GOD mode) ───
  { method: 'GET', path: '/api/userFacil', auth: true, description: 'Listar empresas (GOD only)' },
  { method: 'POST', path: '/api/userFacil', auth: true, description: 'Criar usuário ADMIN em qualquer empresa (GOD only)' },

  // ─── CPFs ───
  { method: 'GET', path: '/api/cpfs', auth: true, description: 'Listar CPFs da empresa' },
  { method: 'POST', path: '/api/cpfs', auth: true, description: 'Adicionar CPF (manual ou batch via planilha — GOD/ADMIN/GESTOR)' },
  { method: 'DELETE', path: '/api/cpfs', auth: true, description: 'Remover CPF (não permite deletar CPF de usuário do sistema)' },
  { method: 'POST', path: '/api/cpfs/general_cpf', auth: false, description: 'Adicionar CPF geral (usado pelos bots)' },
  { method: 'GET', path: '/api/cpfs/general_cpf', auth: false, description: 'Consultar CPF geral (usado pelos bots)' },
  { method: 'DELETE', path: '/api/cpfs/general_cpf', auth: false, description: 'Remover CPF geral (usado pelos bots)' },

  // ─── Leads ───
  { method: 'GET', path: '/api/leads-network', auth: true, description: 'Listar leads (autenticado); consulta por ?cpf= é pública' },
  { method: 'POST', path: '/api/leads-network', auth: false, description: 'Criar lead (ou proxy para webhook-leads se for evento Evolution)' },

  // ─── Dashboard ───
  { method: 'GET', path: '/api/dashboards', auth: true, description: 'Dados do dashboard (chamados por setor, período, tempo médio, etc.)' },

  // ─── Chat ───
  { method: 'POST', path: '/api/chat', auth: false, description: 'Chatbot web via IA (botIA4) — fluxo de abertura/consulta de chamados' },

  // ─── Webhooks WhatsApp ───
  { method: 'POST', path: '/api/webhook22', auth: false, description: 'Webhook WhatsApp instância 22 — bot com IA (atendimento/consulta de chamados)' },
  { method: 'POST', path: '/api/webhook23', auth: false, description: 'Webhook WhatsApp instância 23 — bot com IA' },
  { method: 'POST', path: '/api/webhook24', auth: false, description: 'Webhook WhatsApp instância 24 — bot com IA + notificações proativas' },
  { method: 'POST', path: '/api/webhook26', auth: false, description: 'Webhook WhatsApp instância 26 — bot com prompt personalizado por empresa (useIA3)' },
  { method: 'POST', path: '/api/webhook27', auth: false, description: 'Webhook WhatsApp instância 27 — bot com IA (useIA4)' },
  { method: 'POST', path: '/api/webhook-leads', auth: false, description: 'Webhook captação de leads (eventos/feiras) — IA com matching inteligente de avisos' },
  { method: 'POST', path: '/api/webhook-oficina', auth: false, description: 'Webhook oficina — registro de manutenção veicular por motoristas (sem IA)' },

  // ─── Upload ───
  { method: 'POST', path: '/api/upload', auth: false, description: 'Upload de arquivo para Supabase Storage (logo da empresa, etc.)' },

  // ─── Quadro de Avisos ───
  { method: 'GET', path: '/api/quadro-avisos', auth: true, description: 'Listar avisos da empresa' },
  { method: 'POST', path: '/api/quadro-avisos', auth: true, description: 'Criar aviso' },
  { method: 'PUT', path: '/api/quadro-avisos', auth: true, description: 'Atualizar aviso' },
  { method: 'DELETE', path: '/api/quadro-avisos', auth: true, description: 'Remover aviso' },
  { method: 'GET', path: '/api/quadro-avisos/mostrar-avisos?cpf=xxx', auth: false, description: 'Avisos públicos ativos (não vencidos) para um CPF' },

  // ─── Formulário ───
  { method: 'POST', path: '/api/send-form', auth: false, description: 'Enviar formulário de contato para Google Forms' },

  // ─── Memórias ───
  { method: 'GET', path: '/api/memories?cpf=xxx', auth: false, description: 'Recuperar memórias do bot (resumoPersona) por CPF' },
  { method: 'POST', path: '/api/memories', auth: false, description: 'Salvar memória de conversa do bot' },
]

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen p-6 sm:p-10 transition-colors duration-300"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--primary)" }}>API - Skora</h1>
        <p className="mb-8 opacity-60 text-sm">
          Lista de todos os endpoints disponíveis no sistema ({endpoints.length} rotas)
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border-subtle)" }}>
                <th className="text-left p-3 font-semibold">Método</th>
                <th className="text-left p-3 font-semibold">Rota</th>
                <th className="text-left p-3 font-semibold">Auth</th>
                <th className="text-left p-3 font-semibold">Descrição</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((ep, i) => (
                <tr key={i} className="border-b" style={{ borderColor: "var(--border-subtle)" }}>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${
                      ep.method === 'GET' ? 'bg-green-600' :
                      ep.method === 'POST' ? 'bg-blue-600' :
                      ep.method === 'PUT' ? 'bg-orange-600' :
                      'bg-red-600'
                    }`}>{ep.method}</span>
                  </td>
                  <td className="p-3 font-mono text-xs">{ep.path}</td>
                  <td className="p-3">{ep.auth ? '🔒' : '🔓'}</td>
                  <td className="p-3 opacity-70">{ep.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
