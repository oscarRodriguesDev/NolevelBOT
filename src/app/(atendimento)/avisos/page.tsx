"use client"

import { useEffect, useState } from "react"

type Aviso = {
  id: string
  titulo: string
  conteudo: string
  setor?: string | null
  createdAt: string
}

export default function AvisosPage() {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [titulo, setTitulo] = useState("")
  const [conteudo, setConteudo] = useState("")
  const [setor, setSetor] = useState("")

  async function fetchAvisos() {
    const res = await fetch("/api/quadro-avisos")
    const data = await res.json()
    setAvisos(data)
  }

  useEffect(() => {
    const loadAvisos = async () => {
      await fetchAvisos()
    }
    loadAvisos()
  }, [])

  function resetForm() {
    setTitulo("")
    setConteudo("")
    setSetor("")
    setEditingId(null)
    setOpen(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo || !conteudo) return

    if (editingId) {
      await fetch("/api/quadro-avisos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          titulo,
          conteudo,
          setor
        })
      })
    } else {
      await fetch("/api/quadro-avisos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          conteudo,
          setor
        })
      })
    }

    await fetchAvisos()
    resetForm()
  }

  function handleEdit(aviso: Aviso) {
    setTitulo(aviso.titulo)
    setConteudo(aviso.conteudo)
    setSetor(aviso.setor || "")
    setEditingId(aviso.id)
    setOpen(true)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/quadro-avisos?id=${id}`, {
      method: "DELETE"
    })

    await fetchAvisos()
  }

  return (
    <div
      className="min-h-screen p-10 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-semibold" style={{ color: "var(--primary)" }}>
              Avisos
            </h1>
            <p className="text-sm opacity-70">
              Comunicados internos do sistema
            </p>
          </div>

          <button
            onClick={() => {
              setEditingId(null)
              setOpen(!open)
            }}
            className="px-5 py-2.5 text-white rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "var(--primary)",
            }}
            onMouseEnter={e => {
              if (e.target instanceof HTMLElement) {
                e.target.style.backgroundColor = "var(--primary-hover)";
              }
            }}
            onMouseLeave={e => {
              if (e.target instanceof HTMLElement) {
                e.target.style.backgroundColor = "var(--primary)";
              }
            }}
          >
            Novo Aviso
          </button>
        </div>

        {open && (
          <div
            className="mb-10 border rounded-xl p-6 shadow-lg transition-colors duration-300"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Título"
                className="w-full border rounded-lg px-4 py-2.5 outline-none transition-colors duration-300"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--foreground)",
                }}
              />

              <textarea
                value={conteudo}
                onChange={e => setConteudo(e.target.value)}
                placeholder="Conteúdo"
                rows={4}
                className="w-full border rounded-lg px-4 py-2.5 outline-none transition-colors duration-300 resize-none"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--foreground)",
                }}
              />

              <input
                value={setor}
                onChange={e => setSetor(e.target.value)}
                placeholder="Setor (opcional)"
                className="w-full border rounded-lg px-4 py-2.5 outline-none transition-colors duration-300"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--foreground)",
                }}
              />

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-5 py-2.5 text-white rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: "var(--status-completed)",
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
                  {editingId ? "Atualizar" : "Salvar"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 text-white rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: "var(--border-subtle)",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {avisos.length === 0 && (
            <div className="text-center py-10 opacity-70">
              Nenhum aviso cadastrado.
            </div>
          )}

          {avisos.map(aviso => (
            <div
              key={aviso.id}
              className="border rounded-xl p-6 shadow hover:opacity-90 transition-all duration-300"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold">
                  {aviso.titulo}
                </h3>

                {aviso.setor && (
                  <span
                    className="text-xs px-3 py-1 rounded-full border"
                    style={{
                      backgroundColor: "var(--info-light)",
                      borderColor: "var(--primary)",
                      color: "var(--primary)",
                    }}
                  >
                    {aviso.setor}
                  </span>
                )}
              </div>

              <p className="mb-4 opacity-90">
                {aviso.conteudo}
              </p>

              <div className="flex items-center justify-between">
                <p className="text-xs opacity-60">
                  {new Date(aviso.createdAt).toLocaleDateString("pt-BR")}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(aviso)}
                    className="text-sm transition-colors duration-200 hover:opacity-70"
                    style={{
                      color: "var(--primary)",
                    }}
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(aviso.id)}
                    className="text-sm transition-colors duration-200 hover:opacity-70"
                    style={{
                      color: "var(--status-cancelled)",
                    }}
                  >
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
