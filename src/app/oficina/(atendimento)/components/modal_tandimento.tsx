"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import type { HistoricoItem, Chamado } from "@/types/chamado"

interface ModalSolicitacaoProps {
  ticket: string | null
  open: boolean
  onClose: () => void
  onConcluido: (ticket: string) => void
}

export function ModalChamado({
  ticket,
  open,
  onClose,
  onConcluido,
}: ModalSolicitacaoProps) {
  const [solicitacao, setSolicitacao] = useState<Chamado | null>(null)
  const [novoStatus, setNovoStatus] = useState("")
  const [observacao, setObservacao] = useState("")
  const [descricao, setDescricao] = useState("")
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [loading, setLoading] = useState(false)

  const session = useSession()

  useEffect(() => {
    if (!ticket || !open) return

    async function fetchSolicitacao() {
      const res = await fetch(`/api/tickets?ticket=${ticket}`)
      const data = await res.json()
      const chamadoData = data[0]

      setSolicitacao(chamadoData)
      setNovoStatus(chamadoData?.status || "")
      setDescricao(chamadoData?.descricao || "")

      if (chamadoData?.historico) {
        try {
          setHistorico(JSON.parse(chamadoData.historico))
        } catch {
          setHistorico([])
        }
      } else {
        setHistorico([])
      }
    }

    fetchSolicitacao()
  }, [ticket, open])

  async function atualizarSolicitacao() {
    if (!ticket || !novoStatus) return
    setLoading(true)

    const novoHistoricoItem: HistoricoItem = {
      data: new Date().toISOString(),
      acao: novoStatus,
      observacao,
    }

    const historicoAtualizado = [...historico, novoHistoricoItem]
    setHistorico(historicoAtualizado)

    const descricaoAtualizada = descricao ? `${descricao}\n${observacao}` : observacao
    setDescricao(descricaoAtualizada)

    await fetch(`/api/tickets?atendimento=${ticket}&estagio=${novoStatus}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        descricao: descricaoAtualizada,
        historico: JSON.stringify(historicoAtualizado),
        userId: session.data?.user?.id,
      }),
    })

    const res = await fetch(`/api/tickets?ticket=${ticket}`)
    const data = await res.json()
    const atualizado = data[0]

    setSolicitacao(atualizado)
    setNovoStatus(atualizado.status)
    setObservacao("")
    setLoading(false)
  }

  async function concluirSolicitacao() {
    if (!ticket) return

    await fetch(`/api/tickets?atendimento=${ticket}`, {
      method: "DELETE",
    })

    onConcluido(ticket)
    onClose()
  }

  const tipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      defeito: "Defeito",
      socorro: "Socorro de Rua",
      sem_defeito: "Sem Defeito",
    }
    return labels[tipo?.toLowerCase()] || tipo || "—"
  }

  if (!open || !solicitacao) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-solicitacao-title"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className="w-full max-w-4xl rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 relative border transition-colors duration-300 my-4"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 text-lg transition-colors duration-200 hover:scale-110"
          style={{ color: "var(--foreground)" }}
          aria-label="Fechar modal"
        >
          ✕
        </button>

        <h2 id="modal-solicitacao-title" className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 pr-8" style={{ color: "var(--primary)" }}>
          Solicitação {solicitacao.ticket}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2 text-xs sm:text-sm">
            <p><strong>Motorista:</strong> {solicitacao.nome}</p>
            <p><strong>Matrícula:</strong> {solicitacao.cpf}</p>
            <p><strong>Veículo:</strong> {solicitacao.setor || "—"}</p>
          </div>
          <div className="space-y-2 text-xs sm:text-sm">
            <p><strong>Tipo:</strong> {tipoLabel(solicitacao.categoria || '')}</p>
            <p><strong>Status:</strong> {solicitacao.status?.replace(/_/g, ' ')}</p>
            <p><strong>Data:</strong> {new Date(solicitacao.createdAt).toLocaleString("pt-BR")}</p>
          </div>
        </div>

        {solicitacao.anexoUrl ? (
          <a
            href={solicitacao.anexoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mb-6"
          >
            <Image
              src={solicitacao.anexoUrl}
              alt="Prévia do anexo"
              width={100}
              height={100}
              className="object-cover rounded-md border"
            />
          </a>
        ) : (
          <div className="text-xs sm:text-sm mb-6 opacity-50">
            Nenhum documento anexado
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2">Discriminação dos Serviços</h3>
          <div
            className="border rounded-lg p-3 sm:p-4 text-xs sm:text-sm whitespace-pre-wrap transition-colors duration-300 max-h-32 overflow-y-auto"
            style={{
              backgroundColor: "var(--surface-elevated)",
              borderColor: "var(--border-subtle)",
              color: "var(--foreground)",
            }}
          >
            {descricao || "Nenhuma descrição informada"}
          </div>
        </div>

        <div
          className="border rounded-lg p-4 sm:p-6 mb-6 transition-colors duration-300"
          style={{
            backgroundColor: "var(--surface-elevated)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <h3 className="font-semibold mb-3 text-sm">Evolução da Solicitação</h3>

          <div
            className="h-32 sm:h-40 overflow-y-auto border rounded-lg p-3 mb-4 text-xs transition-colors duration-300"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border-subtle)",
              color: "var(--foreground)",
            }}
          >
            {historico.length === 0 && <p style={{ opacity: 0.6 }}>Nenhuma evolução registrada</p>}

            {historico.map((item, index) => (
              <div key={index} className="mb-3 border-b pb-2 last:border-b-0" style={{ borderColor: "var(--border-subtle)" }}>
                <p className="font-semibold text-xs">{new Date(item.data).toLocaleString("pt-BR")}</p>
                <p className="text-xs">{item.acao}</p>
                {item.observacao && <p style={{ opacity: 0.7 }} className="text-xs">Obs: {item.observacao}</p>}
                {item.atendente && <p style={{ opacity: 0.6 }} className="text-xs">Atendente: {item.atendente}</p>}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Novo Status</label>
              <select
                value={novoStatus}
                onChange={(e) => setNovoStatus(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none transition-colors duration-300"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--background)",
                  color: "var(--foreground)",
                }}
              >
                <option value="NOVO">Aguardando</option>
                <option value="EM_ATENDIMENTO">Em Andamento</option>
                <option value="AGUARDANDO">Aguardando Peças</option>
                <option value="CONCLUIDO">Concluído</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Observação</label>
              <textarea
                placeholder="Adicionar observação..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none transition-colors duration-300 resize-none"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--background)",
                  color: "var(--foreground)",
                }}
                rows={2}
              />
            </div>

            <button
              onClick={atualizarSolicitacao}
              disabled={loading}
              className="w-full text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              style={{ backgroundColor: "var(--primary)" }}
              onMouseEnter={e => {
                if (e.currentTarget instanceof HTMLElement && !loading) {
                  e.currentTarget.style.backgroundColor = "var(--primary-hover)";
                }
              }}
              onMouseLeave={e => {
                if (e.currentTarget instanceof HTMLElement) {
                  e.currentTarget.style.backgroundColor = "var(--primary)";
                }
              }}
            >
              {loading ? "Atualizando..." : "Atualizar Solicitação"}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ backgroundColor: "var(--border-subtle)" }}
          >
            Fechar
          </button>
          <button
            onClick={concluirSolicitacao}
            className="text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ backgroundColor: "var(--status-cancelled)" }}
          >
            Concluir Solicitação
          </button>
        </div>
      </div>
    </div>
  )
}
