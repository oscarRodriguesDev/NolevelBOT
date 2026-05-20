'use client'

import { ThemeToggle } from '../components/theme-toggle'

const endpoints = [
  {
    method: 'POST', path: '/api/tickets', auth: false,
    description: 'Criar um novo chamado (multipart/form-data com anexo opcional)',
  },
  {
    method: 'GET', path: '/api/tickets', auth: true,
    description: 'Listar chamados da empresa do usuário logado (com filtros)',
  },
  {
    method: 'PUT', path: '/api/tickets?atendimento=TKT-xxx&estagio=NOVO', auth: true,
    description: 'Atualizar status do chamado',
  },
  {
    method: 'DELETE', path: '/api/tickets?atendimento=TKT-xxx', auth: true,
    description: 'Finalizar chamado (move para tickets_fechados)',
  },
  {
    method: 'POST', path: '/api/tickets/search', auth: false,
    description: 'Buscar chamados por CPF (público)',
  },
  { method: 'GET', path: '/api/empresa?cpf=xxx', auth: false, description: 'Buscar empresa e setores por CPF' },
  { method: 'GET', path: '/api/empresa', auth: true, description: 'Listar empresas (autenticado)' },
  { method: 'POST', path: '/api/auth/[...nextauth]', auth: false, description: 'Login (Credentials provider)' },
  { method: 'GET', path: '/api/users/user-active', auth: true, description: 'Dados do usuário logado' },
  { method: 'PUT', path: '/api/users/user-active', auth: true, description: 'Atualizar perfil/senha/avatar' },
  { method: 'GET', path: '/api/users', auth: true, description: 'Listar usuários da empresa' },
  { method: 'POST', path: '/api/userFacil', auth: false, description: 'Criar usuário (modo GOD)' },
  { method: 'GET', path: '/api/userFacil', auth: false, description: 'Listar empresas (modo GOD)' },
  { method: 'GET', path: '/api/leads-network', auth: true, description: 'Listar leads' },
  { method: 'POST', path: '/api/leads-network', auth: false, description: 'Criar lead (ou proxy p/ webhook-leads)' },
  { method: 'GET', path: '/api/cpfs', auth: true, description: 'Listar CPFs da empresa' },
  { method: 'POST', path: '/api/cpfs', auth: true, description: 'Adicionar CPF' },
  { method: 'POST', path: '/api/cpfs/general_cpf', auth: false, description: 'Adicionar CPF geral' },
  { method: 'GET', path: '/api/dashboards', auth: true, description: 'Dados dos dashboards' },
  { method: 'POST', path: '/api/chat', auth: false, description: 'Chatbot WhatsApp (OpenAI)' },
  { method: 'POST', path: '/api/webhook22', auth: false, description: 'Webhook WhatsApp instância 22' },
  { method: 'POST', path: '/api/webhook23', auth: false, description: 'Webhook WhatsApp instância 23' },
  { method: 'POST', path: '/api/webhook24', auth: false, description: 'Webhook WhatsApp instância 24 (notificações proativas)' },
  { method: 'POST', path: '/api/webhook-leads', auth: false, description: 'Webhook captação de leads (eventos)' },
  { method: 'GET', path: '/api/quadro-avisos', auth: true, description: 'Listar avisos' },
  { method: 'POST', path: '/api/quadro-avisos', auth: true, description: 'Criar aviso' },
  { method: 'GET', path: '/api/quadro-avisos/mostrar-avisos', auth: false, description: 'Avisos públicos da empresa' },
  { method: 'POST', path: '/api/send-form', auth: false, description: 'Enviar formulário de contato' },
  { method: 'POST', path: '/api/memories', auth: false, description: 'Salvar/recuperar memórias do bot' },
]

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen p-6 sm:p-10 transition-colors duration-300"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--primary)" }}>API - NolevelBOT</h1>
        <p className="mb-8 opacity-60 text-sm">Lista de endpoints disponíveis no sistema</p>
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
