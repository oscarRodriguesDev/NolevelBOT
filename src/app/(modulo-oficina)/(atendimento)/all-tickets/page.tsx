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

export default function SolicitacoesPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')

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
      titulo: 'Gerenciar Solicitações',
      descricao: 'Visualize e gerencie as solicitações de manutenção'
    })
  }, [setHeader])

  function refreshSolicitacoes() {
    fetchSolicitacoes(filters)
  }

  const fetchSolicitacoes = useCallback(async (currentFilters: typeof filters) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()

      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value && value.trim() !== "") {
          params.append(key, key === 'status' ? value.trim() : value.trim().toLowerCase())
        }
      })

      const response = await fetch(`/api/tickets?${params.toString()}`)
      if (!response.ok) throw new Error("Erro ao buscar solicitações")

      const data = await response.json()
      setSolicitacoes(data)
    } catch (error) {
      console.error("Erro na busca:", error)
      setSolicitacoes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSolicitacoes(filters)
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [filters, fetchSolicitacoes])

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
              onChange={e => setFilters({ ...filters, nome: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
            />
            <input
              placeholder="Matrícula"
              value={filters.matricula}
              onChange={e => setFilters({ ...filters, matricula: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
            />

            <select
              value={filters.tipo}
              onChange={e => setFilters({ ...filters, tipo: e.target.value })}
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
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)]"
              style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
            >
              <option value="">Status (Todos)</option>
              <option value="NOVO">Aguardando</option>
              <option value="EM_ATENDIMENTO">Em Andamento</option>
              <option value="AGUARDANDO">Aguardando Peças</option>
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
                        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase" style={{ backgroundColor: tipoColor(item.tipo || item.categoria) }}>
                          {tipoLabel(item.tipo || item.categoria)}
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
