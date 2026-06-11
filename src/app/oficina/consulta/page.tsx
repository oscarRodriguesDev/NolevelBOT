"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "../../components/theme-toggle"

type Solicitacao = {
  createdAt: string | number | Date
  descricao: string
  ticket: string
  status: string
  setor: string
  categoria: string
  motivo: string
  abertura: string
}

export default function ConsultaSolicitacoes() {
  const [matricula, setMatricula] = useState("")
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [loading, setLoading] = useState(false)
  const route = useRouter()

  async function buscarSolicitacoes() {
    if (!matricula) return

    setLoading(true)

    try {
      const res = await fetch(`/api/tickets/search?cpf=${matricula}`)
      const data = await res.json()

      const items: Solicitacao[] = data.map((c: Solicitacao) => ({
        ticket: c.ticket,
        status: c.status,
        setor: c.setor,
        categoria: c.categoria,
        motivo: c.descricao,
        abertura: new Date(c.createdAt).toLocaleDateString()
      }))

      setSolicitacoes(items)
    } catch (err) {
      console.error(err)
      setSolicitacoes([])
    } finally {
      setLoading(false)
    }
  }

  const tipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      defeito: "Defeito",
      socorro: "Socorro de Rua",
      sem_defeito: "Sem Defeito",
    }
    return labels[tipo?.toLowerCase()] || tipo || "—"
  }

  return (
    <div
      className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: "var(--primary)" }}>
            Consultar Solicitações
          </h1>
          <p className="text-sm opacity-70">Busque suas solicitações de manutenção pela matrícula</p>
        </div>

        <div
          className="p-6 sm:p-8 rounded-2xl border shadow-lg space-y-4 transition-colors duration-300"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="space-y-2">
            <label className="block text-sm font-semibold">Matrícula</label>
            <input
              type="text"
              placeholder="000000"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="w-full px-4 py-3 border rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
              style={{
                borderColor: "var(--border-subtle)",
                backgroundColor: "var(--surface-elevated)",
                color: "var(--foreground)",
                "--tw-ring-color": "var(--primary)",
              } as never}
            />
          </div>

          <button
            onClick={buscarSolicitacoes}
            disabled={loading || !matricula}
            className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            style={{ backgroundColor: "var(--primary)" }}
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Buscando...
              </>
            ) : (
              "Buscar Solicitações"
            )}
          </button>
        </div>

        {solicitacoes.length > 0 && (
          <div
            className="rounded-2xl border shadow-lg overflow-hidden transition-colors duration-300"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead
                  style={{
                    backgroundColor: "var(--surface-elevated)",
                    borderBottom: "2px solid var(--border-subtle)",
                  }}
                >
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left font-semibold">Solicitação</th>
                    <th className="px-4 sm:px-6 py-3 text-left font-semibold">Tipo</th>
                    <th className="px-4 sm:px-6 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {solicitacoes.map((t, idx) => (
                    <tr
                      key={t.ticket}
                      className="cursor-pointer transition-colors duration-200 hover:opacity-80"
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        backgroundColor: idx % 2 === 0 ? "transparent" : "var(--surface-elevated)",
                      }}
                      onClick={() => route.push(`consulta/${t.ticket}`)}
                    >
                      <td className="px-4 sm:px-6 py-4 font-mono font-semibold" style={{ color: "var(--primary)" }}>
                        {t.ticket}
                      </td>
                      <td className="px-4 sm:px-6 py-4">{tipoLabel(t.categoria)}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <span
                          className="inline-block px-3 py-1 rounded-lg text-xs font-semibold"
                          style={{
                            backgroundColor:
                              t.status === "CONCLUIDO" ? "var(--status-completed)"
                                : t.status === "ABERTO" ? "var(--status-new)"
                                  : t.status === "EM_ANDAMENTO" ? "var(--status-in-progress)"
                                    : "var(--status-waiting)",
                            color: "#fff",
                          }}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && solicitacoes.length === 0 && matricula && (
          <div
            className="p-8 rounded-2xl border text-center transition-colors duration-300"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <p className="opacity-70">Nenhuma solicitação encontrada para esta matrícula.</p>
          </div>
        )}
      </div>
    </div>
  )
}
