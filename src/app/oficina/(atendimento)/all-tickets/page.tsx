"use client"

import { useEffect, useState, useCallback } from "react"
import { LayoutList, Columns3 } from "lucide-react"
import { ModalChamado } from "../components/modal_tandimento"
import KanbanBoard from "./kanban-board"
import { useHeader } from '../layout'
import { getStatusColor, getPriorityColor } from "@/types/chamado"

type Solicitacao = {
  id: string
  ticket: string
  nome: string
  matricula: string
  veiculo: string
  tipo: string
  discriminacao: string
  createdAt: string
  status: string
  atendente?: { name: string }
}

const LIMIT = 20

export default function SolicitacoesPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [filters, setFilters] = useState({
    nome: "",
    matricula: "",
    tipo: "",
    ticket: "",
    status: "",
    startDate: "",
    endDate: ""
  })

  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { setHeader } = useHeader()

  useEffect(() => {
    setHeader({
      titulo: 'Gerenciar Solicitacoes',
      descricao: 'Visualize e gerencie as solicitacoes de manutencao'
    })
  }, [setHeader])

  function refreshSolicitacoes() {
    fetchSolicitacoes(filters, page)
  }

  const fetchSolicitacoes = useCallback(async (currentFilters: typeof filters, currentPage: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()

      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value && value.trim() !== "") {
          params.append(key, key === 'status' ? value.trim() : value.trim().toLowerCase())
        }
      })

      params.set("page", String(currentPage))
      params.set("limit", String(LIMIT))

      const response = await fetch(`/api/tickets?${params.toString()}`)
      if (!response.ok) throw new Error("Erro ao buscar solicitacoes")

      const result = await response.json()
      const raw = result.data || []
      const mapped: Solicitacao[] = raw.map((item: Record<string, unknown>) => ({
        id: item.id as string,
        ticket: item.ticket as string,
        nome: item.nome as string,
        matricula: item.matricula as string || item.cpf as string || '',
        veiculo: item.veiculo as string || item.setor as string || '',
        tipo: item.tipo as string || item.categoria as string || '',
        discriminacao: item.discriminacao as string || item.descricao as string || '',
        createdAt: item.createdAt as string,
        status: item.status as string,
        atendente: item.atendente ? { name: (item.atendente as { name: string }).name } : undefined,
      }))
      setSolicitacoes(mapped)
      setTotal(result.total || 0)
      setTotalPages(result.totalPages || 0)
    } catch (error) {
      console.error("Erro na busca:", error)
      setSolicitacoes([])
      setTotal(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (page === 1) {
        fetchSolicitacoes(filters, page)
      } else {
        setPage(1)
      }
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [filters, fetchSolicitacoes])

  useEffect(() => {
    fetchSolicitacoes(filters, page)
  }, [page])

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({
      nome: "",
      matricula: "",
      tipo: "",
      ticket: "",
      status: "",
      startDate: "",
      endDate: ""
    })
    setPage(1)
  }

  function goToPage(p: number) {
    if (p >= 1 && p <= totalPages) setPage(p)
  }

  const abrirModal = (ticket: string) => {
    setSelectedTicket(ticket)
    setModalOpen(true)
  }

  const fecharModal = () => {
    refreshSolicitacoes()
    setModalOpen(false)
    setSelectedTicket(null)
  }

  const handleConcluido = (ticket: string) => {
    setSolicitacoes(prev => prev.filter(t => t.ticket !== ticket))
  }

  const tipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      defeito: "Defeito",
      socorro: "Socorro de Rua",
      sem_defeito: "Sem Defeito",
    }
    return labels[tipo?.toLowerCase()] || tipo || "—"
  }

  const tipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      defeito: "var(--status-in-progress)",
      socorro: "var(--status-cancelled)",
      sem_defeito: "var(--status-completed)",
    }
    return colors[tipo?.toLowerCase()] || "var(--status-new)"
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
              placeholder="Filtrar por motorista..."
              value={filters.nome}
              onChange={e => updateFilter("nome", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
            />
            <input
              placeholder="Matricula"
              value={filters.matricula}
              onChange={e => updateFilter("matricula", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
            />

            <select
              value={filters.tipo}
              onChange={e => updateFilter("tipo", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)]"
              style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
            >
              <option value="">Tipo (Todos)</option>
              <option value="defeito">Defeito</option>
              <option value="socorro">Socorro de Rua</option>
              <option value="sem_defeito">Sem Defeito</option>
            </select>

            <select
              value={filters.status}
              onChange={e => updateFilter("status", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)]"
              style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
            >
              <option value="">Status (Todos)</option>
              <option value="NOVO">Aguardando</option>
              <option value="EM_ATENDIMENTO">Em Andamento</option>
              <option value="AGUARDANDO">Aguardando Pecas</option>
              <option value="CONCLUIDO">Concluido</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border-subtle)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ backgroundColor: "var(--surface-elevated)", borderBottom: "2px solid var(--border-subtle)" }}>
                  <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider">Solicitação</th>
                  <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider">Motorista</th>
                  <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider">Matrícula</th>
                  <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider">Veículo</th>
                  <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider">Tipo</th>
                  <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider">Status</th>
                  <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider">Data</th>
                </tr>
              </thead>
              <tbody>
                {solicitacoes.length === 0 && !loading ? (
                  <tr><td colSpan={7} className="text-center py-16 opacity-40 text-sm font-medium">Nenhuma solicitação encontrada.</td></tr>
                ) : (
                  solicitacoes.map((item, idx) => (
                    <tr
                      key={item.id || item.ticket}
                      onClick={() => abrirModal(item.ticket)}
                      className="transition-all duration-150 cursor-pointer hover:brightness-95"
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        backgroundColor: idx % 2 === 0 ? "transparent" : "var(--surface-elevated)",
                      }}
                    >
                      <td className="py-3.5 px-4 font-bold" style={{ color: "var(--primary)" }}>{item.ticket}</td>
                      <td className="py-3.5 px-4">{item.nome}</td>
                      <td className="py-3.5 px-4">{item.matricula || "—"}</td>
                      <td className="py-3.5 px-4">{item.veiculo || "—"}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase" style={{ backgroundColor: tipoColor(item.tipo) }}>
                          {tipoLabel(item.tipo)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase" style={{ backgroundColor: getStatusColor(item.status) }}>
                          {item.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{new Date(item.createdAt).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                <span className="text-xs font-bold opacity-40">
                  {total} solicitacao{(total !== 1 ? "s" : "")}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-20 hover:bg-[var(--background)]"
                    style={{ color: "var(--foreground)" }}
                  >
                    Anterior
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 3, totalPages - 6))
                    const p = start + i
                    if (p > totalPages) return null
                    return (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                        style={{
                          backgroundColor: p === page ? "var(--primary)" : "transparent",
                          color: p === page ? "white" : "var(--foreground)",
                        }}
                      >
                        {p}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-20 hover:bg-[var(--background)]"
                    style={{ color: "var(--foreground)" }}
                  >
                    Proximo
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <KanbanBoard
            tickets={solicitacoes as any}
            loading={loading}
            onRefresh={refreshSolicitacoes}
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
