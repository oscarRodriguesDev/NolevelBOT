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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-semibold text-white">
              Avisos
            </h1>
            <p className="text-zinc-400 text-sm">
              Comunicados internos do sistema
            </p>
          </div>

          <button
            onClick={() => {
              setEditingId(null)
              setOpen(!open)
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
          >
            New
          </button>
        </div>

        {open && (
          <div className="mb-10 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Título"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-4 py-2.5 rounded-lg transition"
              />

              <textarea
                value={conteudo}
                onChange={e => setConteudo(e.target.value)}
                placeholder="Conteúdo"
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-4 py-2.5 rounded-lg transition"
              />

              <input
                value={setor}
                onChange={e => setSetor(e.target.value)}
                placeholder="Setor (opcional)"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-4 py-2.5 rounded-lg transition"
              />

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                >
                  {editingId ? "Atualizar" : "Salvar"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {avisos.length === 0 && (
            <div className="text-center text-zinc-500 py-10">
              Nenhum aviso cadastrado.
            </div>
          )}

          {avisos.map(aviso => (
            <div
              key={aviso.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow hover:border-zinc-700 transition"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-white">
                  {aviso.titulo}
                </h3>

                {aviso.setor && (
                  <span className="text-xs bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full border border-indigo-600/30">
                    {aviso.setor}
                  </span>
                )}
              </div>

              <p className="text-zinc-300 mb-4">
                {aviso.conteudo}
              </p>

              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-500">
                  {new Date(aviso.createdAt).toLocaleDateString("pt-BR")}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(aviso)}
                    className="text-indigo-400 hover:text-indigo-300 text-sm transition"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(aviso.id)}
                    className="text-red-500 hover:text-red-400 text-sm transition"
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