"use client"

import { useEffect, useState } from "react"
import { useHeader } from "../layout"

type Aviso = {
  id: string
  titulo: string
  conteudo: string
  setor?: string | null
  createdAt: string
  duracao?: string | null
}

export default function AvisosPage() {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [titulo, setTitulo] = useState("")
  const [conteudo, setConteudo] = useState("")
  const [setor, setSetor] = useState("")
  const [duracao, setDuracao] = useState("")

  const { setHeader } = useHeader()

  useEffect(() => {
    setHeader({
      titulo: "Quadro de Avisos",
      descricao: "Comunicados importantes da sua empresa",
    })
  }, [setHeader])

  async function fetchAvisos() {
    try {
      const res = await fetch("/api/quadro-avisos")
      const data = await res.json()
      setAvisos(data)
    } catch (error) {
      console.error("Erro ao carregar avisos:", error)
    }
  }

  useEffect(() => {
    async function fetchAvisos() {
    try {
      const res = await fetch("/api/quadro-avisos")
      const data = await res.json()
      setAvisos(data)
    } catch (error) {
      console.error("Erro ao carregar avisos:", error)
    }
  }
  fetchAvisos()
  }, [])

  function resetForm() {
    setTitulo("")
    setConteudo("")
    setSetor("")
    setDuracao("")
    setEditingId(null)
    setOpen(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo || !conteudo) return

    const payload = {
      titulo,
      conteudo,
      setor,
      duracao: duracao ? String(duracao) : null
    }

    const url = "/api/quadro-avisos"
    const method = editingId ? "PUT" : "POST"

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
    })

    await fetchAvisos()
    resetForm()
  }

  function handleEdit(aviso: Aviso) {
    setTitulo(aviso.titulo)
    setConteudo(aviso.conteudo)
    setSetor(aviso.setor || "")
    setDuracao(aviso.duracao || "")
    setEditingId(aviso.id)
    setOpen(true)
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja realmente excluir este aviso?")) return
    await fetch(`/api/quadro-avisos?id=${id}`, { method: "DELETE" })
    await fetchAvisos()
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
            className="px-5 py-2.5 text-white rounded-lg font-bold transition-all duration-300 hover:brightness-110 active:scale-95 shadow-md"
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

              <input
                value={setor}
                onChange={e => setSetor(e.target.value)}
                placeholder="Setor Alvo (Ex: TI, RH)"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
              />

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
                  className="px-6 py-2.5 text-white rounded-xl font-bold shadow-lg hover:brightness-110 transition-all"
                  style={{ backgroundColor: "var(--status-completed)" }}
                >
                  {editingId ? "Atualizar Aviso" : "Publicar Aviso"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 rounded-xl font-bold border transition-all"
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