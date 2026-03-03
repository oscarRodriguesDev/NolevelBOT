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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-gray-800 text-gray-200 rounded-lg shadow-2xl p-6 relative border border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-lg"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-6 text-white">
          Chamado {chamado.ticket}
        </h2>

        <div className="space-y-2 text-sm mb-6">
          <p><strong>Nome:</strong> {chamado.nome}</p>
          <p><strong>CPF:</strong> {chamado.cpf}</p>
          <p><strong>Setor:</strong> {chamado.setor}</p>
          <p><strong>Prioridade:</strong> {chamado.prioridade}</p>
          <p><strong>Status:</strong> {chamado.status}</p>
          <p>
            <strong>Data:</strong>{" "}
            {new Date(chamado.createdAt).toLocaleString("pt-BR")}
          </p>

          {chamado.anexoUrl && (
            <a
              href={chamado.anexoUrl}
              target="_blank"
              className="text-blue-400 underline hover:text-blue-300"
            >
              Ver anexo
            </a>
          )}
        </div>

        {/* Descrição do chamado */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Descrição do chamado
          </h3>
          <div className="bg-gray-900 border border-gray-700 rounded-md p-4 text-sm text-gray-200 whitespace-pre-wrap">
            {chamado.descricao}
          </div>
        </div>

        {/* Histórico */}
        <div className="border border-gray-700 rounded-md p-4 mb-6 bg-gray-900">
          <h3 className="font-medium mb-3 text-sm text-gray-300">
            Evolução do chamado
          </h3>

          <div className="h-40 overflow-y-auto border border-gray-700 rounded p-3 mb-4 text-xs bg-gray-800">
            {historico.length === 0 && (
              <p className="text-gray-500">
                Nenhuma evolução registrada
              </p>
            )}

            {historico.map((item, index) => (
              <div key={index} className="mb-3 border-b border-gray-700 pb-2">
                <p className="font-semibold text-gray-300">
                  {new Date(item.data).toLocaleString("pt-BR")}
                </p>
                <p>{item.acao}</p>
                {item.observacao && (
                  <p className="text-gray-400">Obs: {item.observacao}</p>
                )}
                {item.atendente && (
                  <p className="text-gray-500">
                    Atendente: {item.atendente}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <select
              value={novoStatus}
              onChange={(e) => setNovoStatus(e.target.value)}
              className="border border-gray-600 bg-gray-800 text-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="border border-gray-600 bg-gray-800 text-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />

            <button
              onClick={atualizarChamado}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? "Atualizando..." : "Atualizar chamado"}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={concluirChamado}
            className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition"
          >
            Concluir chamado
          </button>
        </div>
      </div>
    </div>
  )
}