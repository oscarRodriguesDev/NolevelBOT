"use client"

import { useEffect, useState } from "react"
import { ModalChamado } from "../components/modal_tandimento"

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
  atendente?: string | null
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
      className="min-h-screen py-10 px-4 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div
        className="max-w-6xl mx-auto shadow-lg rounded-lg p-8 space-y-6 transition-colors duration-300"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <h1 className="text-3xl font-semibold" style={{ color: "var(--primary)" }}>
          Chamados
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            placeholder="Nome"
            value={filters.nome}
            onChange={e => setFilters({ ...filters, nome: e.target.value })}
            className="border p-3 rounded transition-colors duration-300"
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
            className="border p-3 rounded transition-colors duration-300"
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
            className="border p-3 rounded transition-colors duration-300"
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
            className="border p-3 rounded transition-colors duration-300"
            style={{
              borderColor: "var(--border-subtle)",
              backgroundColor: "var(--surface-elevated)",
              color: "var(--foreground)",
            }}
          />
          <select
            value={filters.prioridade}
            onChange={e => setFilters({ ...filters, prioridade: e.target.value })}
            className="border p-3 rounded transition-colors duration-300"
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
            className="border p-3 rounded transition-colors duration-300"
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
            className="border p-3 rounded transition-colors duration-300"
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
            className="border p-3 rounded transition-colors duration-300"
            style={{
              borderColor: "var(--border-subtle)",
              backgroundColor: "var(--surface-elevated)",
              color: "var(--foreground)",
            }}
          />
        </div>

        <div>
          <button
            onClick={fetchTickets}
            className="px-6 py-3 rounded font-medium text-white transition-all duration-300 hover:scale-105 active:scale-95"
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
            Buscar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm mt-4">
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
                    <td className="py-3 px-2">{ticket.atendente ?? "Não atribuído"}</td>
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
