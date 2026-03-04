"use client"

import { useEffect, useState } from "react"

type HistoricoItem = {
  data: string
  acao: string
  observacao?: string
  atendente?: string
}

type Chamado = {
  id: number
  ticket: string
  nome: string
  cpf: string
  setor: string
  descricao: string
  prioridade: string
  status: string
  createdAt: string
  anexoUrl?: string | null
  historico?: string | null
  atendente?: string | null
}

interface ModalChamadoProps {
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
}: ModalChamadoProps) {
  const [chamado, setChamado] = useState<Chamado | null>(null)
  const [novoStatus, setNovoStatus] = useState("")
  const [observacao, setObservacao] = useState("")
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!ticket || !open) return

    async function fetchChamado() {
      const res = await fetch(`/api/tickets?ticket=${ticket}`)
      const data = await res.json()
      const chamadoData = data[0]

      setChamado(chamadoData)
      setNovoStatus(chamadoData?.status || "")

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

    fetchChamado()
  }, [ticket, open])

  async function atualizarChamado() {
    if (!ticket || !novoStatus) return
    setLoading(true)

    await fetch(
      `/api/tickets?atendimento=${ticket}&estagio=${novoStatus}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          observacao,
        }),
      }
    )

    const res = await fetch(`/api/tickets?ticket=${ticket}`)
    const data = await res.json()
    const atualizado = data[0]

    setChamado(atualizado)
    setNovoStatus(atualizado.status)

    if (atualizado?.historico) {
      try {
        setHistorico(JSON.parse(atualizado.historico))
      } catch {
        setHistorico([])
      }
    }

    setObservacao("")
    setLoading(false)
  }

  async function concluirChamado() {
    if (!ticket) return

    await fetch(`/api/tickets?atendimento=${ticket}`, {
      method: "DELETE",
    })

    onConcluido(ticket)
    onClose()
  }

  if (!open || !chamado) return null

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      novo: "var(--status-new)",
      aberto: "var(--status-new)",
      em_atendimento: "var(--status-in-progress)",
      em_andamento: "var(--status-in-progress)",
      aguardando: "var(--status-waiting)",
      concluido: "var(--status-completed)",
      finalizado: "var(--status-completed)",
      cancelado: "var(--status-cancelled)",
    };
    return statusMap[status.toLowerCase()] || "var(--primary)";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-3xl rounded-lg shadow-2xl p-6 relative border transition-colors duration-300"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-lg transition-colors duration-200 hover:scale-110"
          style={{ color: "var(--foreground)" }}
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--primary)" }}>
          Chamado {chamado.ticket}
        </h2>

        <div className="space-y-2 text-sm mb-6">
          <p>
            <strong>Nome:</strong> {chamado.nome}
          </p>
          <p>
            <strong>CPF:</strong> {chamado.cpf}
          </p>
          <p>
            <strong>Setor:</strong> {chamado.setor}
          </p>
          <p>
            <strong>Prioridade:</strong> {chamado.prioridade}
          </p>
          <p>
            <strong>Status:</strong> {chamado.status}
          </p>
          <p>
            <strong>Data:</strong>{" "}
            {new Date(chamado.createdAt).toLocaleString("pt-BR")}
          </p>

          {chamado.anexoUrl && (
            <a
              href={chamado.anexoUrl}
              target="_blank"
              className="inline-block transition-colors duration-200"
              style={{ color: "var(--primary)" }}
            >
              Ver anexo
            </a>
          )}
        </div>

        {/* Descrição do chamado */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Descrição do chamado</h3>
          <div
            className="border rounded-md p-4 text-sm whitespace-pre-wrap transition-colors duration-300"
            style={{
              backgroundColor: "var(--surface-elevated)",
              borderColor: "var(--border-subtle)",
              color: "var(--foreground)",
            }}
          >
            {chamado.descricao}
          </div>
        </div>

        {/* Histórico */}
        <div
          className="border rounded-md p-4 mb-6 transition-colors duration-300"
          style={{
            backgroundColor: "var(--surface-elevated)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <h3 className="font-medium mb-3 text-sm">Evolução do chamado</h3>

          <div
            className="h-40 overflow-y-auto border rounded p-3 mb-4 text-xs transition-colors duration-300"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border-subtle)",
              color: "var(--foreground)",
            }}
          >
            {historico.length === 0 && (
              <p style={{ opacity: 0.6 }}>Nenhuma evolução registrada</p>
            )}

            {historico.map((item, index) => (
              <div
                key={index}
                className="mb-3 border-b pb-2"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <p className="font-semibold">
                  {new Date(item.data).toLocaleString("pt-BR")}
                </p>
                <p>{item.acao}</p>
                {item.observacao && (
                  <p style={{ opacity: 0.7 }}>Obs: {item.observacao}</p>
                )}
                {item.atendente && (
                  <p style={{ opacity: 0.6 }}>Atendente: {item.atendente}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <select
              value={novoStatus}
              onChange={(e) => setNovoStatus(e.target.value)}
              className="border rounded px-3 py-2 text-sm focus:outline-none transition-colors duration-300"
              style={{
                borderColor: "var(--border-subtle)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
              }}
            >
              <option value="aberto">Aberto</option>
              <option value="em_atendimento">Em atendimento</option>
              <option value="aguardando">Aguardando</option>
              <option value="concluido">Concluído</option>
            </select>

            <textarea
              placeholder="Adicionar observação"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="border rounded px-3 py-2 text-sm focus:outline-none transition-colors duration-300"
              style={{
                borderColor: "var(--border-subtle)",
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
              }}
              rows={3}
            />

            <button
              onClick={atualizarChamado}
              disabled={loading}
              className="text-white px-4 py-2 rounded text-sm transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{
                backgroundColor: "var(--primary)",
              }}
              onMouseEnter={e => {
                if (e.target instanceof HTMLElement && !loading) {
                  e.target.style.backgroundColor = "var(--primary-hover)";
                }
              }}
              onMouseLeave={e => {
                if (e.target instanceof HTMLElement) {
                  e.target.style.backgroundColor = "var(--primary)";
                }
              }}
            >
              {loading ? "Atualizando..." : "Atualizar chamado"}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={concluirChamado}
            className="text-white px-4 py-2 rounded text-sm transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "var(--status-cancelled)",
            }}
            onMouseEnter={e => {
              if (e.target instanceof HTMLElement) {
                e.target.style.opacity = "0.8";
              }
            }}
            onMouseLeave={e => {
              if (e.target instanceof HTMLElement) {
                e.target.style.opacity = "1";
              }
            }}
          >
            Concluir chamado
          </button>
        </div>
      </div>
    </div>
  )
}
