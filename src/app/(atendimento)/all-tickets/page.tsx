"use client"

import { useEffect, useState, useCallback } from "react"
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
  atendente?: { name: string }
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

  const { setHeader } = useHeader()

  useEffect(() => {
    setHeader({
      titulo: 'Gerenciar Chamados',
      descricao: 'Visualize e gerencie todos os seus chamados em um único lugar'
    })
  }, [setHeader])

  // Função de busca principal
  const fetchTickets = useCallback(async (currentFilters: typeof filters) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value && value.trim() !== "") {
          params.append(key, value.trim().toLowerCase())
        }
      })

      const response = await fetch(`/api/tickets?${params.toString()}`)
      if (!response.ok) throw new Error("Erro ao buscar chamados")

      const data = await response.json()
      setTickets(data)
    } catch (error) {
      console.error("Erro na busca:", error)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }, [])

  // EFEITO DE ATUALIZAÇÃO AUTOMÁTICA COM DEBOUNCE
  useEffect(() => {
    // Define um atraso de 500ms antes de disparar a busca
    const delayDebounceFn = setTimeout(() => {
      fetchTickets(filters)
    }, 500)

    // Limpa o timeout se o usuário digitar algo antes dos 500ms acabarem
    return () => clearTimeout(delayDebounceFn)
  }, [filters, fetchTickets])

  const clearFilters = () => {
    setFilters({
      nome: "",
      cpf: "",
      setor: "",
      ticket: "",
      prioridade: "",
      status: "",
      startDate: "",
      endDate: ""
    })
  }

  const abrirModal = (ticket: string) => {
    setSelectedTicket(ticket)
    setModalOpen(true)
  }

  const fecharModal = () => {
    fetchTickets(filters)
    setModalOpen(false)
    setSelectedTicket(null)
  }

  const handleConcluido = (ticket: string) => {
    setTickets(prev => prev.filter(t => t.ticket !== ticket))
  }

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase() || "";
    if (s.includes("NOVO")) return "var(--status-new)";
    if (s.includes("ATENDIMENTO") || s.includes("ANDAMENTO")) return "var(--status-in-progress)";
    if (s.includes("AGUARDANDO")) return "var(--status-waiting)";
    if (s.includes("CONCLUIDO") || s.includes("FINALIZADO")) return "var(--status-completed)";
    if (s.includes("CANCELADO")) return "var(--status-cancelled)";
    return "#6b7280";
  };

  const getPriorityColor = (prioridade: string) => {
    const p = prioridade?.toUpperCase() || "";
    if (p.includes("BAIXA")) return "#10b981";
    if (p.includes("NORMAL") || p.includes("MEDIA")) return "var(--status-in-progress)";
    if (p.includes("ALTA")) return "#ef4444";
    if (p.includes("CRITICA")) return "#7f1d1d";
    return "var(--primary)";
  };

  return (
    <div className="py-10 px-4 transition-colors duration-300" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <div className="max-w-7xl mx-auto shadow-lg rounded-2xl border p-6 sm:p-8 lg:p-10 space-y-6" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
               Filtros em tempo real
               {loading && <span className="text-sm font-normal opacity-50 animate-pulse">(Atualizando...)</span>}
            </h2>
            <button type="button" onClick={clearFilters} className="text-sm text-[var(--primary)] hover:underline">
              Limpar todos
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[var(--border-subtle)]">
            <input
              placeholder="Filtrar por nome..."
              value={filters.nome}
              onChange={e => setFilters({ ...filters, nome: e.target.value })}
              className="border p-3 rounded-lg bg-[var(--surface-elevated)] border-[var(--border-subtle)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
            />
            <input
              placeholder="Número do Ticket"
              value={filters.ticket}
              onChange={e => setFilters({ ...filters, ticket: e.target.value })}
              className="border p-3 rounded-lg bg-[var(--surface-elevated)] border-[var(--border-subtle)] focus:ring-2 focus:ring-[var(--primary)] outline-none"
            />
            
            <select
              value={filters.prioridade}
              onChange={e => setFilters({ ...filters, prioridade: e.target.value })}
              className="border p-3 rounded-lg bg-[var(--surface-elevated)] border-[var(--border-subtle)] outline-none"
            >
              <option value="">Prioridade (Todas)</option>
              <option value="baixa">Baixa</option>
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
            </select>

            <select
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              className="border p-3 rounded-lg bg-[var(--surface-elevated)] border-[var(--border-subtle)] outline-none"
            >
              <option value="">Status (Todos)</option>
              <option value="novo">Novo</option>
              <option value="em_atendimento">Em Atendimento</option>
              <option value="aguardando">Aguardando</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b bg-[var(--surface-elevated)] border-[var(--border-subtle)]">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">Setor</th>
                <th className="py-3 px-4">Prioridade</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Atendente</th>
                <th className="py-3 px-4">Data</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 && !loading ? (
                <tr><td colSpan={7} className="text-center py-10 opacity-50">Nenhum chamado encontrado.</td></tr>
              ) : (
                tickets.map(ticket => (
                  <tr
                    key={ticket.id || ticket.ticket}
                    onClick={() => abrirModal(ticket.ticket)}
                    className={`hover:bg-[var(--surface-elevated)] transition cursor-pointer border-b last:border-0 border-[var(--border-subtle)] ${loading ? 'opacity-50' : ''}`}
                  >
                    <td className="py-4 px-4 font-bold text-[var(--primary)]">{ticket.ticket}</td>
                    <td className="py-4 px-4">{ticket.nome}</td>
                    <td className="py-4 px-4">{ticket.setor}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase" style={{ backgroundColor: getPriorityColor(ticket.prioridade) }}>
                        {ticket.prioridade}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase" style={{ backgroundColor: getStatusColor(ticket.status) }}>
                        {ticket.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {typeof ticket.atendente === 'string' ? ticket.atendente : (ticket.atendente?.name || "Pendente")}
                    </td>
                    <td className="py-4 px-4">{new Date(ticket.createdAt).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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