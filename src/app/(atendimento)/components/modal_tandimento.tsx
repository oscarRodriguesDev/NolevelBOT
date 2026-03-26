"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"

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
  const [descricao, setDescricao] = useState("")
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [doc, setDoc] = useState<string | null>(null)

  const session = useSession()


  useEffect(() => {
    if (!ticket || !open) return

    async function fetchChamado() {
      const res = await fetch(`/api/tickets?ticket=${ticket}`)
      const data = await res.json()
      const chamadoData = data[0]

      setChamado(chamadoData)
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

    fetchChamado()
  }, [ticket, open])

  async function atualizarChamado() {
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

    setChamado(atualizado)
    setNovoStatus(atualizado.status)
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
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

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 pr-8" style={{ color: "var(--primary)" }}>
          Chamado {chamado.ticket}
        </h2>

        {/* Informações do Chamado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2 text-xs sm:text-sm">
            <p><strong>Nome:</strong> {chamado.nome}</p>
            <p><strong>CPF:</strong> {chamado.cpf}</p>
            <p><strong>Setor:</strong> {chamado.setor}</p>
          </div>
          <div className="space-y-2 text-xs sm:text-sm">
            <p><strong>Prioridade:</strong> {chamado.prioridade}</p>
            <p><strong>Status:</strong> {chamado.status}</p>
            <p><strong>Data:</strong> {new Date(chamado.createdAt).toLocaleString("pt-BR")}</p>
          </div>
        </div>


        {chamado.anexoUrl ? (
          <a
            href={chamado.anexoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mb-6"
          >
            <Image
              src={chamado.anexoUrl}
              alt="Prévia do anexo"
              width={100}
              height={100}
              className="object-cover rounded-md border"
            />
          </a>
        ) : (
          <div className="text-xs sm:text-sm mb-6 text-gray-500">
            Nenhum documento anexado
          </div>
        )}

        {/* Descrição do Chamado */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2">Descrição</h3>
          <div
            className="border rounded-lg p-3 sm:p-4 text-xs sm:text-sm whitespace-pre-wrap transition-colors duration-300 max-h-32 overflow-y-auto"
            style={{
              backgroundColor: "var(--surface-elevated)",
              borderColor: "var(--border-subtle)",
              color: "var(--foreground)",
            }}
          >
            {descricao}
          </div>
        </div>

        {/* Histórico */}
        <div
          className="border rounded-lg p-4 sm:p-6 mb-6 transition-colors duration-300"
          style={{
            backgroundColor: "var(--surface-elevated)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <h3 className="font-semibold mb-3 text-sm">Evolução do Chamado</h3>

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

          {/* Formulário de Atualização */}
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
                <option value="aberto">Aberto</option>
                <option value="em_atendimento">Em atendimento</option>
                <option value="aguardando">Aguardando</option>
                <option value="concluido">Concluído</option>
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
              onClick={atualizarChamado}
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
              {loading ? "Atualizando..." : "Atualizar Chamado"}
            </button>
          </div>
        </div>

        {/* Botão Concluir */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ backgroundColor: "var(--border-subtle)" }}
          >
            Fechar
          </button>
          <button
            onClick={concluirChamado}
            className="text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ backgroundColor: "var(--status-cancelled)" }}
            onMouseEnter={e => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "0.8";
              }
            }}
            onMouseLeave={e => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.opacity = "1";
              }
            }}
          >
            Concluir Chamado
          </button>
        </div>
      </div>
    </div>
  )
}
