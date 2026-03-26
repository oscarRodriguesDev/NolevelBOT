"use client"

import { useEffect, useState } from "react"
import { ModalChamado } from "../components/modal_tandimento"
import { useHeader } from '../layout'
type Chamado = {
  id: string
  ticket: string
  nome: string
  cpf: string
  setor: string
  categoria: string
  prioridade: string
  descricao: string
  createdAt: string
  status: string
  atendente?:{name: string} 

}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Chamado[]>([])
  const [loading, setLoading] = useState(false)

  const [filters, setFilters] = useState({
    nome: "",
    cpf: "",
    setor: "",
    ticket: "",
    prioridade: "",
    status: "",
    startDate: "",
    endDate: ""
  })

  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

//recuperando contexto da pagina



  const { setHeader } = useHeader()

  useEffect(() => {
    setHeader({
      titulo: 'Gerenciar Chamados',
      descricao: 'Visualize e gerencie todos os seus chamados em um único lugar'
    })
  }, [])

 





  const fetchTickets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/tickets?${params.toString()}`)
      if (!response.ok) throw new Error("Erro ao buscar chamados")

      const data = await response.json()
      setTickets(data)
    } catch (error) {
      console.error(error)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const abrirModal = (ticket: string) => {
    setSelectedTicket(ticket)
    setModalOpen(true)
  }

  const fecharModal = () => {
    //atualizar pagina para refletir mudanças
    fetchTickets()
    setModalOpen(false)
    setSelectedTicket(null)
  }

  const handleConcluido = (ticket: string) => {
    setTickets(prev => prev.filter(t => t.ticket !== ticket))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NOVO":
        return "var(--status-new)";
      case "EM_ANDAMENTO":
        return "var(--status-in-progress)";
      case "AGUARDANDO":
        return "var(--status-waiting)";
      case "CONCLUIDO":
      case "FINALIZADO":
        return "var(--status-completed)";
      case "CANCELADO":
        return "var(--status-cancelled)";
      default:
        return "var(--primary)";
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case "BAIXA":
        return "var(--status-completed)";
      case "MEDIA":
        return "var(--status-in-progress)";
      case "ALTA":
        return "var(--status-waiting)";
      case "CRITICA":
        return "var(--status-cancelled)";
      default:
        return "var(--primary)";
    }
  };

  return (
    <div
      className="py-10 px-4 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div
        className="max-w-7xl mx-auto shadow-lg rounded-2xl border p-6 sm:p-8 lg:p-10 space-y-6 transition-colors duration-300"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
       

        {/* Filtros */}
        <div className="space-y-4">
          <details className="group">
            <summary className="flex items-center gap-2 cursor-pointer font-semibold hover:opacity-80 transition-opacity">
              <svg className="w-5 h-5 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Filtros avançados
            </summary>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
              <input
                placeholder="Nome"
                value={filters.nome}
                onChange={e => setFilters({ ...filters, nome: e.target.value })}
                className="border p-3 rounded-lg transition-colors duration-300"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--foreground)",
                }}
              />
              <input
                placeholder="CPF"
                value={filters.cpf}
                onChange={e => setFilters({ ...filters, cpf: e.target.value })}
                className="border p-3 rounded-lg transition-colors duration-300"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--foreground)",
                }}
              />
              <input
                placeholder="Setor"
                value={filters.setor}
                onChange={e => setFilters({ ...filters, setor: e.target.value })}
                className="border p-3 rounded-lg transition-colors duration-300"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--foreground)",
                }}
              />
              <input
                placeholder="Número do Ticket"
                value={filters.ticket}
                onChange={e => setFilters({ ...filters, ticket: e.target.value })}
                className="border p-3 rounded-lg transition-colors duration-300"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--foreground)",
                }}
              />
              <select
                value={filters.prioridade}
                onChange={e => setFilters({ ...filters, prioridade: e.target.value })}
                className="border p-3 rounded-lg transition-colors duration-300"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--foreground)",
                }}
              >
                <option value="">Prioridade</option>
                <option value="BAIXA">Baixa</option>
                <option value="MEDIA">Média</option>
                <option value="ALTA">Alta</option>
                <option value="CRITICA">Crítica</option>
              </select>
              <select
                value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
                className="border p-3 rounded-lg transition-colors duration-300"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--foreground)",
                }}
              >
                <option value="">Status</option>
                <option value="NOVO">NOVO</option>
                <option value="ABERTO">ABERTO</option>
                <option value="EM_ANDAMENTO">EM_ANDAMENTO</option>
                <option value="FINALIZADO">FINALIZADO</option>
                <option value="CONCLUIDO">CONCLUIDO</option>
              </select>
              <input
                type="date"
                value={filters.startDate}
                onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                className="border p-3 rounded-lg transition-colors duration-300"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--foreground)",
                }}
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                className="border p-3 rounded-lg transition-colors duration-300"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--foreground)",
                }}
              />
              <button
                onClick={fetchTickets}
                className="sm:col-span-2 lg:col-span-4 px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: "var(--primary)",
                }}
                onMouseEnter={e => {
                  if (e.target instanceof HTMLElement) {
                    e.target.style.backgroundColor = "var(--primary-hover)";
                  }
                }}
                onMouseLeave={e => {
                  if (e.target instanceof HTMLElement) {
                    e.target.style.backgroundColor = "var(--primary)";
                  }
                }}
              >
                Aplicar Filtros
              </button>
            </div>
          </details>
        </div>

        {/* Tabela Responsiva */}
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border-subtle)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left border-b transition-colors duration-300"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-elevated)",
                }}
              >
                <th className="py-3 px-2">Ticket</th>
                <th className="py-3 px-2">Nome</th>
                <th className="py-3 px-2">Setor</th>
                <th className="py-3 px-2">Prioridade</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Atendente</th>
                <th className="py-3 px-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="text-center py-6">
                    Carregando...
                  </td>
                </tr>
              )}

              {!loading &&
                tickets.map(ticket => (
                  <tr
                    key={ticket.id}
                    onClick={() => abrirModal(ticket.ticket)}
                    className="hover:opacity-80 transition cursor-pointer border-b"
                    style={{
                      borderColor: "var(--border-subtle)",
                    }}
                  >
                    <td className="py-3 px-2 font-medium">{ticket.ticket}</td>
                    <td className="py-3 px-2">{ticket.nome}</td>
                    <td className="py-3 px-2">{ticket.setor}</td>
                    <td className="py-3 px-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{
                          backgroundColor: getPriorityColor(ticket.prioridade),
                        }}
                      >
                        {ticket.prioridade}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{
                          backgroundColor: getStatusColor(ticket.status),
                        }}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {ticket.atendente?.name ?? "Não atribuído"}
                    </td>
                    <td className="py-3 px-2">
                      {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {!loading && tickets.length === 0 && (
            <div className="text-center py-6 opacity-75">
              Nenhum chamado encontrado
            </div>
          )}
        </div>
      </div>

      <ModalChamado
        ticket={selectedTicket}
        open={modalOpen}
        onClose={fecharModal}
        onConcluido={handleConcluido}
      />
    </div>
  )
}
