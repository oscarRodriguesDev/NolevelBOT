"use client"

import { useEffect, useState } from "react"
import { useHeader } from "../layout"
import { useSession } from "next-auth/react"
import { ROLE } from "@prisma/client"

type Aviso = {
  id: string
  titulo: string
  conteudo: string
  setor?: string | null
  createdAt: string
  duracao?: string | null
}

export default function AvisosPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role as ROLE | undefined
  const userSetor = session?.user?.setor || ""
  const podeEscolherSetor = userRole === "ADMIN" || userRole === "GOD"

  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [titulo, setTitulo] = useState("")
  const [conteudo, setConteudo] = useState("")
  const [setor, setSetor] = useState(podeEscolherSetor ? "" : userSetor)
  const [duracao, setDuracao] = useState("")
  const [setoresDisponiveis, setSetoresDisponiveis] = useState<string[]>([])
  
  // Novos estados para controle de erro e loading
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { setHeader } = useHeader()

  useEffect(() => {
    setHeader({
      titulo: "Quadro de Avisos",
      descricao: "Comunicados importantes da sua empresa",
    })
  }, [setHeader])

  useEffect(() => {
    if (podeEscolherSetor && session?.user?.empresaId) {
      fetch(`/api/empresa?id=${session.user.empresaId}`)
        .then(r => r.json())
        .then(data => {
          if (data.setores) setSetoresDisponiveis(data.setores)
        })
        .catch(console.error)
    }
  }, [podeEscolherSetor, session?.user?.empresaId])

  // Função única de busca (corrigida a duplicidade)
  async function fetchAvisos() {
    try {
      const res = await fetch("/api/quadro-avisos")
      const data = await res.json()
      setAvisos(data)
    } catch (error) {
      console.error("Erro ao carregar avisos:", error)
    }
  }

  // Chamada inicial
  useEffect(() => {
    fetchAvisos()
  }, [])

  function resetForm() {
    setTitulo("")
    setConteudo("")
    setSetor(podeEscolherSetor ? "" : userSetor)
    setDuracao("")
    setEditingId(null)
    setErrorMessage(null)
    setIsSubmitting(false)
    setOpen(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo || !conteudo) return

    setErrorMessage(null)
    setIsSubmitting(true)

    const payload = {
      titulo,
      conteudo,
      setor: podeEscolherSetor ? setor : userSetor,
      duracao: duracao ? String(duracao) : null
    }

    const url = "/api/quadro-avisos"
    const method = editingId ? "PUT" : "POST"

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      })

      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          throw new Error("Você não tem permissão para criar ou editar avisos.")
        }
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || "Ocorreu um erro ao salvar o aviso.")
      }

      await fetchAvisos()
      resetForm()
    } catch (error: any) {
      console.error("Erro ao salvar aviso:", error)
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleEdit(aviso: Aviso) {
    setTitulo(aviso.titulo)
    setConteudo(aviso.conteudo)
    setSetor(aviso.setor || "")
    setDuracao(aviso.duracao || "")
    setEditingId(aviso.id)
    setErrorMessage(null)
    setOpen(true)
  }

  // Tratamento de erros adicionado aqui também
  async function handleDelete(id: string) {
    if (!confirm("Deseja realmente excluir este aviso?")) return
    
    try {
      const response = await fetch(`/api/quadro-avisos?id=${id}`, { method: "DELETE" })
      
      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          alert("Você não tem permissão para excluir avisos.")
          return
        }
        throw new Error("Erro ao excluir o aviso.")
      }
      
      await fetchAvisos()
    } catch (error) {
      console.error(error)
      alert("Ocorreu um erro ao tentar excluir.")
    }
  }

  return (
    <div
      className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-colors duration-300"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8 sm:mb-10">
          <button
            onClick={() => {
              if (open) resetForm()
              else setOpen(true)
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-bold transition-all duration-300 hover:brightness-110 hover:shadow-lg active:scale-95"
            style={{ backgroundColor: "var(--primary)" }}
          >
            {open ? "Fechar Formulário" : "Novo Aviso"}
          </button>
        </div>

        {open && (
          <div
            className="mb-10 border rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
          >
            {/* Mensagem de Erro de Permissão */}
            {errorMessage && (
              <div className="p-4 mb-6 text-sm font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Título do comunicado"
                className="md:col-span-2 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
              />

              <textarea
                value={conteudo}
                onChange={e => setConteudo(e.target.value)}
                placeholder="Escreva o conteúdo do aviso aqui..."
                rows={4}
                className="md:col-span-2 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all resize-none"
                style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
              />

              {podeEscolherSetor ? (
                <select
                  value={setor}
                  onChange={e => setSetor(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
                >
                  <option value="">Todos os setores</option>
                  {setoresDisponiveis.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={setor}
                  readOnly
                  disabled
                  className="w-full border rounded-xl px-4 py-3 outline-none opacity-60 cursor-not-allowed"
                  style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
                />
              )}

              <input
                type="number"
                value={duracao}
                onChange={e => setDuracao(e.target.value)}
                placeholder="Duração (em dias)"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
              />

              <div className="md:col-span-2 flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2.5 text-white rounded-xl font-bold shadow-lg transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-110'}`}
                  style={{ backgroundColor: "var(--status-completed)" }}
                >
                  {isSubmitting ? "Salvando..." : (editingId ? "Atualizar Aviso" : "Publicar Aviso")}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl font-bold border transition-all hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {avisos.length === 0 ? (
            <div className="col-span-full text-center py-20 opacity-40">
              <p className="text-xl font-medium tracking-tight">O quadro está vazio no momento.</p>
            </div>
          ) : (
            avisos.map(aviso => {
              let dataVencimento: Date | null = null
              if (aviso.duracao) {
                const dias = Number(aviso.duracao)
                if (!isNaN(dias)) {
                  dataVencimento = new Date(aviso.createdAt)
                  dataVencimento.setDate(dataVencimento.getDate() + dias)
                }
              }

              return (
                <div
                  key={aviso.id}
                  className="group border rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-4">
                      <h3 className="text-lg font-black leading-tight">{aviso.titulo}</h3>
                      {aviso.setor && (
                        <span
                          className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border"
                          style={{ backgroundColor: "var(--primary)", color: "white", borderColor: "transparent" }}
                        >
                          {aviso.setor}
                        </span>
                      )}
                    </div>

                    <p className="text-sm opacity-80 leading-relaxed mb-6 line-clamp-4">
                      {aviso.conteudo}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">
                        Postado em: {new Date(aviso.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                      {dataVencimento && (
                        <p className="text-[10px] font-black uppercase tracking-tighter text-amber-500">
                          Expira em: {dataVencimento.toLocaleDateString("pt-BR")} às {dataVencimento.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-4">
                      <button
                        onClick={() => handleEdit(aviso)}
                        className="text-xs font-bold hover:underline"
                        style={{ color: "var(--primary)" }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(aviso.id)}
                        className="text-xs font-bold hover:underline"
                        style={{ color: "var(--status-cancelled)" }}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}