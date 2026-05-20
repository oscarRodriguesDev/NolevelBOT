"use client"

import { useState } from "react"
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
  atendente?: { name: string }
}

interface KanbanBoardProps {
  tickets: Chamado[]
  loading: boolean
  onRefresh: () => void
}

const COLUMNS = [
  { key: "NOVO", title: "Novo", color: "var(--status-new)" },
  { key: "EM_ATENDIMENTO", title: "Em Atendimento", color: "var(--status-in-progress)" },
  { key: "AGUARDANDO", title: "Aguardando", color: "var(--status-waiting)" },
]

function normalizeStatus(status: string): string {
  const s = status?.toUpperCase() || ""
  if (s.includes("NOVO")) return "NOVO"
  if (s.includes("ATENDIMENTO") || s.includes("ANDAMENTO")) return "EM_ATENDIMENTO"
  if (s.includes("AGUARDANDO")) return "AGUARDANDO"
  if (s.includes("CONCLUIDO") || s.includes("FINALIZADO")) return "CONCLUIDO"
  if (s.includes("CANCELADO")) return "CANCELADO"
  return "NOVO"
}

function getPriorityColor(prioridade: string): string {
  const p = prioridade?.toUpperCase() || ""
  if (p.includes("BAIXA")) return "#10b981"
  if (p.includes("NORMAL") || p.includes("MEDIA")) return "var(--status-in-progress)"
  if (p.includes("ALTA")) return "#ef4444"
  if (p.includes("CRITICA")) return "#7f1d1d"
  return "var(--primary)"
}

export default function KanbanBoard({ tickets, loading, onRefresh }: KanbanBoardProps) {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const abrirModal = (ticket: string) => {
    setSelectedTicket(ticket)
    setModalOpen(true)
  }

  const fecharModal = () => {
    onRefresh()
    setModalOpen(false)
    setSelectedTicket(null)
  }

  const grouped = COLUMNS.map(col => ({
    ...col,
    tickets: tickets.filter(t => normalizeStatus(t.status) === col.key)
  }))

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {grouped.map(col => (
          <div
            key={col.key}
            className="rounded-xl border p-4 transition-colors duration-300"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <div
              className="flex items-center justify-between mb-4 pb-3 border-b"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: col.color }} />
                <h3 className="font-semibold text-sm">{col.title}</h3>
              </div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: col.color }}
              >
                {col.tickets.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[200px]">
              {col.tickets.length === 0 && !loading && (
                <p className="text-center text-sm py-8" style={{ opacity: 0.5 }}>
                  Nenhum chamado
                </p>
              )}
              {col.tickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => abrirModal(ticket.ticket)}
                  className="rounded-lg border p-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md"
                  style={{
                    backgroundColor: "var(--surface-elevated)",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-bold" style={{ color: "var(--primary)" }}>
                      {ticket.ticket}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white uppercase whitespace-nowrap ml-2"
                      style={{ backgroundColor: getPriorityColor(ticket.prioridade) }}
                    >
                      {ticket.prioridade}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate">{ticket.nome}</p>
                  <p className="text-xs mt-1 truncate" style={{ opacity: 0.6 }}>{ticket.setor}</p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                    <span className="text-[10px]" style={{ opacity: 0.5 }}>
                      {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="text-[10px]" style={{ opacity: 0.5 }}>
                      {ticket.atendente?.name || "Pendente"}
                    </span>
                  </div>
                </div>
              ))}
              {loading && col.tickets.length === 0 && (
                <div className="text-center py-4">
                  <span className="text-sm animate-pulse" style={{ opacity: 0.5 }}>Carregando...</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <ModalChamado
        ticket={selectedTicket}
        open={modalOpen}
        onClose={fecharModal}
        onConcluido={() => {
          onRefresh()
          setModalOpen(false)
          setSelectedTicket(null)
        }}
      />
    </>
  )
}
