"use client"

import { useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { ModalChamado } from "../components/modal_tandimento"
import { getPriorityColor } from "@/types/chamado"

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
  { key: "CONCLUIDO", title: "Concluído", color: "var(--status-completed)" },
  { key: "CANCELADO", title: "Cancelado", color: "var(--status-cancelled)" },
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



export default function KanbanBoard({ tickets, loading, onRefresh }: KanbanBoardProps) {
  const { data: session } = useSession()
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [draggingTicket, setDraggingTicket] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const abrirModal = (ticket: string) => {
    setSelectedTicket(ticket)
    setModalOpen(true)
  }

  const fecharModal = () => {
    onRefresh()
    setModalOpen(false)
    setSelectedTicket(null)
  }

  const handleDragStart = useCallback((e: React.DragEvent, ticket: string) => {
    setDraggingTicket(ticket)
    e.dataTransfer.setData("text/plain", ticket)
    e.dataTransfer.effectAllowed = "move"
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggingTicket(null)
    setDragOverColumn(null)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, colKey: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverColumn(colKey)
  }, [])

  const handleDragLeave = useCallback((colKey: string) => {
    setDragOverColumn(prev => prev === colKey ? null : prev)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent, colKey: string) => {
    e.preventDefault()
    setDraggingTicket(null)
    setDragOverColumn(null)

    const ticketNumber = e.dataTransfer.getData("text/plain")
    if (!ticketNumber || !session?.user?.id) return

    const ticket = tickets.find(t => t.ticket === ticketNumber)
    if (!ticket) return

    const currentCol = normalizeStatus(ticket.status)
    if (currentCol === colKey) return

    try {
      const response = await fetch(`/api/tickets?atendimento=${ticketNumber}&estagio=${colKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          historico: "[]",
          userId: session.user.id,
        }),
      })

      if (!response.ok) throw new Error("Erro ao atualizar status")
      onRefresh()
    } catch (error) {
      console.error("Erro ao mover chamado:", error)
    }
  }, [tickets, session, onRefresh])

  const grouped = COLUMNS.map(col => ({
    ...col,
    tickets: tickets.filter(t => normalizeStatus(t.status) === col.key)
  }))

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {grouped.map(col => (
          <div
            key={col.key}
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDragLeave={() => handleDragLeave(col.key)}
            onDrop={(e) => handleDrop(e, col.key)}
            className="rounded-xl border p-3 transition-all duration-200"
            style={{
              backgroundColor: dragOverColumn === col.key ? "var(--surface-elevated)" : "var(--surface)",
              borderColor: dragOverColumn === col.key ? col.color : "var(--border-subtle)",
              borderWidth: dragOverColumn === col.key ? "2px" : "1px",
            }}
          >
            <div
              className="flex items-center justify-between mb-3 pb-2 border-b"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                <h3 className="font-semibold text-xs truncate">{col.title}</h3>
              </div>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shrink-0 ml-1"
                style={{ backgroundColor: col.color }}
              >
                {col.tickets.length}
              </span>
            </div>

            <div className="space-y-2 min-h-[120px]">
              {col.tickets.length === 0 && !loading && (
                <div
                  className="rounded-lg border-2 border-dashed p-4 text-center"
                  style={{
                    borderColor: "var(--border-subtle)",
                    opacity: dragOverColumn === col.key ? 1 : 0.4,
                  }}
                >
                  <p className="text-xs" style={{ opacity: 0.5 }}>
                    {dragOverColumn === col.key ? "Solte aqui" : "Nenhum chamado"}
                  </p>
                </div>
              )}
              {col.tickets.map(ticket => (
                <div
                  key={ticket.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, ticket.ticket)}
                  onDragEnd={handleDragEnd}
                  onClick={() => abrirModal(ticket.ticket)}
                  className="rounded-lg border p-3 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md"
                  style={{
                    backgroundColor: "var(--surface-elevated)",
                    borderColor: draggingTicket === ticket.ticket ? col.color : "var(--border-subtle)",
                    opacity: draggingTicket === ticket.ticket ? 0.5 : 1,
                    transform: draggingTicket === ticket.ticket ? "rotate(3deg)" : "none",
                  }}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="text-[11px] font-bold truncate" style={{ color: "var(--primary)" }}>
                      {ticket.ticket}
                    </span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white uppercase whitespace-nowrap ml-1 shrink-0"
                      style={{ backgroundColor: getPriorityColor(ticket.prioridade) }}
                    >
                      {ticket.prioridade}
                    </span>
                  </div>
                  <p className="text-xs font-medium truncate">{ticket.nome}</p>
                  <p className="text-[10px] mt-0.5 truncate" style={{ opacity: 0.6 }}>{ticket.setor}</p>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                    <span className="text-[9px]" style={{ opacity: 0.5 }}>
                      {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="text-[9px]" style={{ opacity: 0.5 }}>
                      {ticket.atendente?.name || "Pendente"}
                    </span>
                  </div>
                </div>
              ))}
              {loading && col.tickets.length === 0 && (
                <div className="text-center py-4">
                  <span className="text-xs animate-pulse" style={{ opacity: 0.5 }}>Carregando...</span>
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
