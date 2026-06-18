"use client"

import { useEffect, useState, useCallback } from "react"
import { LayoutList, Columns3 } from "lucide-react"
import { ModalChamado } from "../components/modal_tandimento"
import KanbanBoard from "./kanban-board"
import { useHeader } from '../layout'
import { getStatusColor, getPriorityColor } from "@/types/chamado"

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

const LIMIT = 20

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Chamado[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

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

  function refreshTickets() {
    fetchTickets(filters)
  }

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    if (page !== 1) setPage(1)
  }

  const fetchTickets = useCallback(async (currentFilters: typeof filters) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()

      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value && value.trim() !== "") {
          params.append(key, key === 'status' ? value.trim() : value.trim().toLowerCase())
        }
      })
      params.append("page", String(page))
      params.append("limit", String(LIMIT))

      const response = await fetch(`/api/tickets?${params.toString()}`)
      if (!response.ok) throw new Error("Erro ao buscar chamados")

      const data = await response.json()
      setTickets(data.result?.data || data.data || [])
      setTotal(data.total || data.result?.total || 0)
      setTotalPages(data.totalPages || data.result?.totalPages || 0)
    } catch (error) {
      console.error("Erro na busca:", error)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTickets(filters)
    }, 500)

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
    if (page !== 1) setPage(1)
  }

  const abrirModal = (ticket: string) => {
    setSelectedTicket(ticket)
    setModalOpen(true)
  }

  const fecharModal = () => {
    refreshTickets()
    setModalOpen(false)
    setSelectedTicket(null)
  }

  const handleConcluido = (ticket: string) => {
    setTickets(prev => prev.filter(t => t.ticket !== ticket))
  }

  return (
    <div className="py-10 px-4 transition-colors duration-300" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <div className="max-w-7xl mx-auto shadow-lg rounded-2xl border p-5 sm:p-8 lg:p-10 space-y-6" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              Filtros
              {loading && <span className="text-xs font-normal opacity-50 animate-pulse">(Atualizando...)</span>}
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all duration-200"
                  style={{
                    backgroundColor: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                    color: viewMode === 'list' ? '#fff' : 'var(--foreground)',
                  }}
                >
                  <LayoutList size={14} />
                  Lista
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('kanban')}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all duration-200"
                  style={{
                    backgroundColor: viewMode === 'kanban' ? 'var(--primary)' : 'transparent',
                    color: viewMode === 'kanban' ? '#fff' : 'var(--foreground)',
                  }}
                >
                  <Columns3 size={14} />
                  Kanban
                </button>
              </div>
              <button type="button" onClick={clearFilters} className="text-xs font-semibold px-3 py-2 rounded-xl transition-all hover:bg-[var(--surface-elevated)]" style={{ color: 'var(--primary)' }}>
                Limpar
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
            <input
              placeholder="Filtrar por nome..."
              value={filters.nome}
              onChange={e => updateFilter("nome", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
            />
            <input
              placeholder="Número do Ticket"
              value={filters.ticket}
              onChange={e => updateFilter("ticket", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
            />
            
            <select
              value={filters.prioridade}
              onChange={e => updateFilter("prioridade", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)]"
              style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
            >
              <option value="">Prioridade (Todas)</option>
              <option value="baixa">Baixa</option>
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
            </select>

            <select
              value={filters.status}
              onChange={e => updateFilter("status", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)]"
              style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
            >
              <option value="">Status (Todos)</option>
              <option value="NOVO">Novo</option>
              <option value="EM_ATENDIMENTO">Em Atendimento</option>
              <option value="AGUARDANDO">Aguardando</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border-subtle)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ backgroundColor: "var(--surface-elevated)", borderBottom: "2px solid var(--border-subtle)" }}>
                  <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider">Ticket</th>
                  <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider">Nome</th>
                  <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider">Setor</th>
                  <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider">Prioridade</th>
                  <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider">Status</th>
                  <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider">Atendente</th>
                  <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider">Data</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 && !loading ? (
                  <tr><td colSpan={7} className="text-center py-16 opacity-40 text-sm font-medium">Nenhum chamado encontrado.</td></tr>
                ) : (
                  tickets.map((ticket, idx) => (
                    <tr
                      key={ticket.id || ticket.ticket}
                      onClick={() => abrirModal(ticket.ticket)}
                      className="transition-all duration-150 cursor-pointer hover:brightness-95"
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        backgroundColor: idx % 2 === 0 ? "transparent" : "var(--surface-elevated)",
                      }}
                    >
                      <td className="py-3.5 px-4 font-bold" style={{ color: "var(--primary)" }}>{ticket.ticket}</td>
                      <td className="py-3.5 px-4">{ticket.nome}</td>
                      <td className="py-3.5 px-4">{ticket.setor}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase" style={{ backgroundColor: getPriorityColor(ticket.prioridade) }}>
                          {ticket.prioridade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase" style={{ backgroundColor: getStatusColor(ticket.status) }}>
                          {ticket.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {typeof ticket.atendente === 'string' ? ticket.atendente : (ticket.atendente?.name || "Pendente")}
                      </td>
                      <td className="py-3.5 px-4">{new Date(ticket.createdAt).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                <span className="text-xs opacity-50">
                  {total} registro(s) — Página {page} de {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-30 hover:bg-[var(--surface-elevated)]"
                    style={{ color: "var(--foreground)" }}
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all disabled:opacity-30 hover:bg-[var(--surface-elevated)]"
                    style={{ color: "var(--foreground)" }}
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <KanbanBoard
            tickets={tickets}
            loading={loading}
            onRefresh={refreshTickets}
          />
        )}
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
