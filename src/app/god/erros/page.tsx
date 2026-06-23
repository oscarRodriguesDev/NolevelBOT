"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import type { StoredError } from "@/lib/error-store"

export default function GodErrosPage() {
  const { data: session, status } = useSession()
  const [errors, setErrors] = useState<StoredError[]>([])
  const [selected, setSelected] = useState<StoredError | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchCode, setSearchCode] = useState("")

  const isGod = session?.user?.role === "GOD"

  async function fetchErrors(code?: string) {
    setLoading(true)
    try {
      const url = code ? `/api/errors?code=${code}` : "/api/errors"
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (code) {
          setSelected(data)
        } else {
          setErrors(data)
        }
      }
    } catch { } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated" && isGod) fetchErrors()
  }, [status, isGod])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <div className="animate-spin w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!isGod) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
        <p className="text-lg font-medium opacity-50">Acesso restrito a administradores</p>
      </div>
    )
  }

  function formatTime(ts: number) {
    return new Date(ts).toLocaleString("pt-BR")
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  return (
    <div
      className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-colors duration-300"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Registro de Erros</h1>
            <p className="text-sm opacity-50 mt-1">Consulte erros reportados pelo sistema</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Buscar por código (ERR-...)"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === "Enter") fetchErrors(searchCode || undefined) }}
              className="px-4 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)", color: "var(--foreground)", width: 220 }}
            />
            <button
              onClick={() => { fetchErrors(searchCode || undefined) }}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Buscar
            </button>
            <button
              onClick={() => { setSearchCode(""); fetchErrors() }}
              className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
              style={{ borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
            >
              Limpar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
            <p className="text-sm opacity-40 mt-3 font-medium">Carregando...</p>
          </div>
        ) : selected ? (
          <div
            className="rounded-2xl border shadow-lg p-6 space-y-4"
            style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-mono">{selected.code}</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-sm font-semibold px-3 py-1.5 rounded-xl border transition-all hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                Voltar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="opacity-50 font-bold uppercase tracking-wider text-xs">Data</span>
                <p className="mt-1">{formatTime(selected.timestamp)}</p>
              </div>
              {selected.context && (
                <div>
                  <span className="opacity-50 font-bold uppercase tracking-wider text-xs">Contexto</span>
                  <p className="mt-1 font-mono text-xs">{selected.context}</p>
                </div>
              )}
            </div>

            <div>
              <span className="opacity-50 font-bold uppercase tracking-wider text-xs">Mensagem</span>
              <p className="mt-1 p-3 rounded-xl font-mono text-sm" style={{ backgroundColor: "var(--surface-elevated)" }}>
                {selected.message}
              </p>
            </div>

            {selected.stack && (
              <div>
                <span className="opacity-50 font-bold uppercase tracking-wider text-xs">Stack</span>
                <pre className="mt-1 p-3 rounded-xl font-mono text-xs overflow-auto max-h-64" style={{ backgroundColor: "var(--surface-elevated)" }}>
                  {selected.stack}
                </pre>
              </div>
            )}
          </div>
        ) : errors.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-medium opacity-30">Nenhum erro registrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {errors.map((err) => (
              <button
                key={err.code}
                onClick={() => setSelected(err)}
                className="w-full text-left rounded-2xl border p-4 transition-all hover:brightness-95"
                style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono font-bold text-sm" style={{ color: "var(--status-cancelled)" }}>
                        {err.code}
                      </span>
                      {err.context && (
                        <span className="text-[11px] font-mono opacity-50 truncate">{err.context}</span>
                      )}
                    </div>
                    <p className="text-sm truncate">{err.message}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono opacity-40">{formatTime(err.timestamp)}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); copyToClipboard(err.code) }}
                      className="text-[11px] font-semibold px-2 py-1 rounded-lg border transition-all"
                      style={{ borderColor: "var(--border-subtle)" }}
                      title="Copiar código"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
