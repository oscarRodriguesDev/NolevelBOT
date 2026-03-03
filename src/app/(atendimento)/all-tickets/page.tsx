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

  return (
    <div className="min-h-screen bg-gray-900 py-10 px-4 text-gray-200">
      <div className="max-w-6xl mx-auto bg-gray-800 shadow-lg rounded-lg p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-white">Chamados</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            placeholder="Nome"
            value={filters.nome}
            onChange={e => setFilters({ ...filters, nome: e.target.value })}
            className="border border-gray-600 p-2 rounded bg-gray-700 text-gray-200"
          />
          <input
            placeholder="CPF"
            value={filters.cpf}
            onChange={e => setFilters({ ...filters, cpf: e.target.value })}
            className="border border-gray-600 p-2 rounded bg-gray-700 text-gray-200"
          />
          <input
            placeholder="Setor"
            value={filters.setor}
            onChange={e => setFilters({ ...filters, setor: e.target.value })}
            className="border border-gray-600 p-2 rounded bg-gray-700 text-gray-200"
          />
          <input
            placeholder="Número do Ticket"
            value={filters.ticket}
            onChange={e => setFilters({ ...filters, ticket: e.target.value })}
            className="border border-gray-600 p-2 rounded bg-gray-700 text-gray-200"
          />
          <select
            value={filters.prioridade}
            onChange={e => setFilters({ ...filters, prioridade: e.target.value })}
            className="border border-gray-600 p-2 rounded bg-gray-700 text-gray-200"
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
            className="border border-gray-600 p-2 rounded bg-gray-700 text-gray-200"
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
            className="border border-gray-600 p-2 rounded bg-gray-700 text-gray-200"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={e => setFilters({ ...filters, endDate: e.target.value })}
            className="border border-gray-600 p-2 rounded bg-gray-700 text-gray-200"
          />
        </div>

        <div>
          <button
            onClick={fetchTickets}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Buscar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm mt-4">
            <thead>
              <tr className="border-b border-gray-600 text-gray-300 text-left">
                <th className="py-2">Ticket</th>
                <th>Nome</th>
                <th>Setor</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Atendente</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-400">
                    Carregando...
                  </td>
                </tr>
              )}

              {!loading &&
                tickets.map(ticket => (
                  <tr
                    key={ticket.id}
                    onClick={() => abrirModal(ticket.ticket)}
                    className="hover:bg-gray-700 transition cursor-pointer"
                  >
                    <td className="py-2">{ticket.ticket}</td>
                    <td>{ticket.nome}</td>
                    <td>{ticket.setor}</td>
                    <td>{ticket.prioridade}</td>
                    <td>{ticket.status}</td>
                    <td>{ticket.atendente ?? "Não atribuído"}</td>
                    <td>
                      {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {!loading && tickets.length === 0 && (
            <div className="text-center py-6 text-gray-400">
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