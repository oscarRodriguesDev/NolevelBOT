"use client"

import { useEffect, useState } from "react"

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
  const [actionLoadingTicket, setActionLoadingTicket] = useState<string | null>(null)
  const [customStatus, setCustomStatus] = useState<{ [key: string]: string }>({})

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

  const statusSequence = ["NOVO", "ABERTO", "EM_ANDAMENTO", "FINALIZADO", "CONCLUIDO"]

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

  const atualizarStatus = async (ticket: Chamado, nextStatus?: string) => {
    const statusToSend = nextStatus || customStatus[ticket.ticket]
    if (!statusToSend) return

    setActionLoadingTicket(ticket.ticket)
    try {
      if (statusToSend === "CONCLUIDO") {
        // DELETE para mover para tickets_fechados
        const response = await fetch(`/api/tickets?atendimento=${ticket.ticket}`, {
          method: "DELETE"
        })
        if (!response.ok) throw new Error("Erro ao mover chamado para concluídos")
      } else {
        // PUT normal
        const response = await fetch(
          `/api/tickets?atendimento=${ticket.ticket}&estagio=${encodeURIComponent(statusToSend)}`,
          { method: "PUT" }
        )
        if (!response.ok) throw new Error("Erro ao atualizar status")
      }
      await fetchTickets()
      setCustomStatus({ ...customStatus, [ticket.ticket]: "" })
    } catch (error) {
      console.error(error)
    } finally {
      setActionLoadingTicket(null)
    }
  }

  useEffect(() => { fetchTickets() }, [])

  return (
    <div className="min-h-screen bg-gray-900 py-10 px-4 text-gray-200">
      <div className="max-w-6xl mx-auto bg-gray-800 shadow-lg rounded-lg p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-white">Chamados</h1>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Nome" value={filters.nome} onChange={e => setFilters({ ...filters, nome: e.target.value })} className="border border-gray-600 p-2 rounded bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input placeholder="CPF" value={filters.cpf} onChange={e => setFilters({ ...filters, cpf: e.target.value })} className="border border-gray-600 p-2 rounded bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input placeholder="Setor" value={filters.setor} onChange={e => setFilters({ ...filters, setor: e.target.value })} className="border border-gray-600 p-2 rounded bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input placeholder="Número do Ticket" value={filters.ticket} onChange={e => setFilters({ ...filters, ticket: e.target.value })} className="border border-gray-600 p-2 rounded bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select value={filters.prioridade} onChange={e => setFilters({ ...filters, prioridade: e.target.value })} className="border border-gray-600 p-2 rounded bg-gray-700 text-gray-200">
            <option value="">Prioridade</option>
            <option value="BAIXA">Baixa</option>
            <option value="MEDIA">Média</option>
            <option value="ALTA">Alta</option>
            <option value="CRITICA">Crítica</option>
          </select>
          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="border border-gray-600 p-2 rounded bg-gray-700 text-gray-200">
            <option value="">Status</option>
            {statusSequence.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="date" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} className="border border-gray-600 p-2 rounded bg-gray-700 text-gray-200" />
          <input type="date" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} className="border border-gray-600 p-2 rounded bg-gray-700 text-gray-200" />
        </div>

        <div className="flex gap-4">
          <button onClick={fetchTickets} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Buscar</button>
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
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="text-center py-6 text-gray-400">Carregando...</td></tr>}
              {!loading && tickets.map(ticket => {
                const currentIndex = statusSequence.indexOf(ticket.status)
                const nextStatus = currentIndex < statusSequence.length - 1 ? statusSequence[currentIndex + 1] : null
                return (
                  <tr key={ticket.id} className="hover:bg-gray-700 transition">
                    <td className="py-2">{ticket.ticket}</td>
                    <td>{ticket.nome}</td>
                    <td>{ticket.setor}</td>
                    <td>{ticket.prioridade}</td>
                    <td>{ticket.status}</td>
                    <td>{ticket.atendente ?? "Não atribuído"}</td>
                    <td>{new Date(ticket.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="text-center space-y-1">
                      {nextStatus && <button onClick={() => atualizarStatus(ticket, nextStatus)} disabled={actionLoadingTicket === ticket.ticket} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs">
                        {actionLoadingTicket === ticket.ticket ? "Atualizando..." : `Mover para ${nextStatus}`}
                      </button>}
                      <div className="flex gap-1 mt-1">
                        <input
                          placeholder="Status personalizado"
                          value={customStatus[ticket.ticket] || ""}
                          onChange={e => setCustomStatus({ ...customStatus, [ticket.ticket]: e.target.value })}
                          className="border p-2 rounded text-black text-sm flex-1 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                        <button
                          onClick={() => atualizarStatus(ticket)}
                          disabled={actionLoadingTicket === ticket.ticket || !customStatus[ticket.ticket]}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Aplicar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {!loading && tickets.length === 0 && <div className="text-center py-6 text-gray-400">Nenhum chamado encontrado</div>}
        </div>
      </div>
    </div>
  )
}