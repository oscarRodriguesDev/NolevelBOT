"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import toast from "react-hot-toast"
import type { HistoricoItem, Chamado } from "@/types/chamado"
import {
  LuX,
  LuUser,
  LuFileText,
  LuClock,
  LuTag,
  LuPaperclip,
  LuMessageSquare,
  LuSend,
  LuCheck as LuCheckCircle,
} from "react-icons/lu"

interface ModalChamadoProps {
  ticket: string | null
  open: boolean
  onClose: () => void
  onConcluido: (ticket: string) => void
}

// modal de detalhes e atualizacao de um chamado especifico
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
  const session = useSession()

  useEffect(() => {
    if (!open) return
    const prevFocus = document.activeElement as HTMLElement | null
    const modal = document.getElementById("modal-chamado")
    if (modal) {
      const first = modal.querySelector<HTMLElement>("button, input, select, textarea, [tabindex]:not([tabindex='-1'])")
      first?.focus()
    }
    return () => prevFocus?.focus()
  }, [open])

  useEffect(() => {
    if (!ticket || !open) return

    // busca os dados do chamado atual na API
      async function fetchChamado() {
      const res = await fetch(`/api/tickets?ticket=${ticket}`)
      const json = await res.json()
      const chamadoData = json.data?.[0]

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

  // atualiza o status e adiciona historico ao chamado
  async function atualizarChamado() {
    if (!ticket || !novoStatus) return
    try {
      setLoading(true)

      const novoHistoricoItem: HistoricoItem = {
        data: new Date().toISOString(),
        acao: novoStatus,
        observacao,
      }

      const historicoAtualizado = [...historico, novoHistoricoItem]
      const descricaoAtualizada = descricao ? `${descricao}\n${observacao}` : observacao

      const res = await fetch(`/api/tickets?atendimento=${ticket}&estagio=${novoStatus}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descricao: descricaoAtualizada,
          historico: JSON.stringify(historicoAtualizado),
          userId: session.data?.user?.id,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error || "Falha ao atualizar")
      }

      const chamadoAtualizado = await res.json()

      setChamado(chamadoAtualizado)
      setHistorico(historicoAtualizado)
      setDescricao(descricaoAtualizada)
      setNovoStatus(chamadoAtualizado.status)
      setObservacao("")
      toast.success("Chamado atualizado com sucesso!")
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao atualizar chamado"
      console.error("Erro na atualização:", mensagem)
      toast.error(mensagem)
    } finally {
      setLoading(false)
    }
  }

  // fecha definitivamente o chamado (exclui da lista de atendimento)
  async function concluirChamado() {
    const confirmacao = window.confirm("Tem certeza que deseja fechar este chamado? Ele será removido da lista de atendimento.")
    if (!confirmacao) return
    if (!ticket) return

    try {
      const res = await fetch(`/api/tickets?atendimento=${ticket}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error || "Erro ao fechar chamado")
      }

      toast.success("Chamado fechado com sucesso!")
      onConcluido(ticket)
      onClose()
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro ao fechar chamado"
      console.error("Erro ao fechar chamado:", mensagem)
      toast.error(mensagem)
    }
  }

  // Função auxiliar para cores de status (fallback seguro com tailwind)
  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      NOVO: "bg-blue-100 text-blue-700 border-blue-200",
      EM_ATENDIMENTO: "bg-amber-100 text-amber-700 border-amber-200",
      AGUARDANDO: "bg-purple-100 text-purple-700 border-purple-200",
      CONCLUIDO: "bg-emerald-100 text-emerald-700 border-emerald-200",
      CANCELADO: "bg-red-100 text-red-700 border-red-200",
    }
    return badges[status] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  if (!open || !chamado) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-chamado-title"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className="w-full max-w-5xl max-h-[95vh] flex flex-col rounded-3xl shadow-2xl border overflow-hidden transition-all animate-in fade-in zoom-in duration-300"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* HEADER FIXO */}
        <header 
          className="flex items-center justify-between px-6 py-5 border-b shrink-0"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 id="modal-chamado-title" className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              Ticket <span style={{ color: "var(--primary)" }}>#{chamado.ticket}</span>
            </h2>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(chamado.status)}`}>
              {chamado.status.replace("_", " ")}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            style={{ color: "var(--foreground)" }}
            aria-label="Fechar modal"
          >
            <LuX size={24} />
          </button>
        </header>

        {/* CORPO ROLÁVEL */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLUNA ESQUERDA: DETALHES */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Cards de Informação */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border" style={{ backgroundColor: "var(--background)", borderColor: "var(--border-subtle)" }}>
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold opacity-70">
                    <LuUser size={16} /> Solicitante
                  </div>
                  <p className="font-medium text-base mb-1">{chamado.nome}</p>
                  <p className="text-sm opacity-60">CPF: {chamado.cpf}</p>
                  <p className="text-sm opacity-60">Setor: {chamado.setor}</p>
                </div>

                <div className="p-4 rounded-2xl border" style={{ backgroundColor: "var(--background)", borderColor: "var(--border-subtle)" }}>
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold opacity-70">
                    <LuTag size={16} /> Classificação
                  </div>
                  <p className="font-medium text-base mb-1 text-red-500">{chamado.prioridade}</p>
                  <div className="flex items-center gap-2 text-sm opacity-60 mt-2">
                    <LuClock size={14} />
                    {new Date(chamado.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <h3 className="flex items-center gap-2 text-base font-semibold mb-3">
                  <LuFileText size={18} style={{ color: "var(--primary)" }}/> Descrição do Problema
                </h3>
                <div
                  className="p-5 rounded-2xl border text-sm leading-relaxed whitespace-pre-wrap shadow-sm"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--foreground)",
                  }}
                >
                  {descricao || <span className="opacity-50 italic">Nenhuma descrição fornecida.</span>}
                </div>
              </div>

              {/* Anexos */}
              {chamado.anexoUrl && (
                <div>
                  <h3 className="flex items-center gap-2 text-base font-semibold mb-3">
                    <LuPaperclip size={18} style={{ color: "var(--primary)" }}/> Anexo
                  </h3>
                  <a
                    href={chamado.anexoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-block rounded-xl overflow-hidden border shadow-sm transition-all hover:shadow-md"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <Image
                      src={chamado.anexoUrl}
                      alt="Prévia do anexo"
                      width={160}
                      height={160}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-medium">
                      Ver Anexo
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* COLUNA DIREITA: AÇÕES E HISTÓRICO */}
            <div className="space-y-6">
              
              {/* Form Atualização */}
              <div 
                className="p-5 rounded-2xl border shadow-sm"
                style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)" }}
              >
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-4">
                  <LuMessageSquare size={16} /> Atualizar Status
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <select
                      value={novoStatus}
                      onChange={(e) => setNovoStatus(e.target.value)}
                      className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-opacity-50 appearance-none cursor-pointer"
                      style={{
                        borderColor: "var(--border-subtle)",
                        backgroundColor: "var(--background)",
                        color: "var(--foreground)",
                      }}
                    >
                      <option value="NOVO">Novo</option>
                      <option value="EM_ATENDIMENTO">Em Atendimento</option>
                      <option value="AGUARDANDO">Aguardando</option>
                      <option value="CONCLUIDO">Concluído</option>
                      <option value="CANCELADO">Cancelado</option>
                    </select>
                  </div>

                  <div>
                    <textarea
                      placeholder="Adicionar nota técnica ou observação..."
                      value={observacao}
                      onChange={(e) => setObservacao(e.target.value)}
                      className="w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none focus:ring-2 focus:ring-opacity-50"
                      style={{
                        borderColor: "var(--border-subtle)",
                        backgroundColor: "var(--background)",
                        color: "var(--foreground)",
                      }}
                      rows={3}
                    />
                  </div>

                  <button
                    onClick={atualizarChamado}
                    disabled={loading || (!observacao && novoStatus === chamado.status)}
                    className="w-full flex items-center justify-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    {loading ? "Salvando..." : (
                      <>
                        <LuSend size={16} /> Registrar Evolução
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Histórico Timeline */}
              <div>
                <h3 className="text-sm font-semibold mb-4 opacity-80">Timeline de Evolução</h3>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {historico.length === 0 ? (
                    <p className="text-sm opacity-50 italic text-center py-4">Nenhuma evolução registrada.</p>
                  ) : (
                    historico.map((item, index) => (
                      <div key={index} className="relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-[-24px] before:w-px before:bg-border last:before:hidden">
                        <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 flex items-center justify-center bg-white" style={{ borderColor: "var(--background)" }}>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
                        </div>
                        <div className="bg-background border rounded-xl p-3 text-sm" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--background)" }}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-xs">{item.acao}</span>
                            <span className="text-[10px] opacity-60">{new Date(item.data).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                          </div>
                          {item.observacao && <p className="opacity-80 mt-1 text-xs">{item.observacao}</p>}
                          {item.atendente && <p className="text-[10px] opacity-50 mt-2 font-medium">Por: {item.atendente}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* FOOTER FIXO */}
        <footer 
          className="flex flex-col-reverse sm:flex-row justify-end gap-3 px-6 py-4 border-t shrink-0 bg-black/5 dark:bg-white/5"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-black/5 dark:hover:bg-white/10"
            style={{ color: "var(--foreground)" }}
          >
            Voltar para Lista
          </button>
          <button
            onClick={concluirChamado}
            className="flex items-center justify-center gap-2 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80 active:scale-95"
            style={{ backgroundColor: "var(--status-cancelled, #ef4444)" }} // Fallback red se a var não existir
          >
            <LuCheckCircle size={18} /> Fechar Pedido de Manutenção Definitivamente
          </button>
        </footer>
      </div>
    </div>
  )
}