"use client"

import { useState } from "react"
import { ThemeToggle } from "../../components/theme-toggle"
import {
  FaTicketAlt,
  FaUser,
  FaIdCard,
  FaBuilding,
  FaCalendarAlt,
  FaInfoCircle,
  FaFlag,
  FaUserTie,
  FaTimes,
  FaArrowLeft,
} from "react-icons/fa"

type ChamadoData = {
  ticket: string
  status: string
  setor: string
  nome: string
  cpf: string
  descricao: string
  prioridade: string
  historico: string | null
  createdAt: string
  anexoUrl: string | null
  atendente: { id: string; name: string; email: string; avatarUrl: string } | null
}

export default function ConsultaTickets() {
  const [cpf, setCpf] = useState("")
  const [tickets, setTickets] = useState<ChamadoData[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [selected, setSelected] = useState<ChamadoData | null>(null)

  function formatCPF(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 11)
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2")
  }

  const cpfDigits = cpf.replace(/\D/g, "")
  const cpfValido = cpfDigits.length === 11

  async function buscarTickets() {
    if (!cpfValido) return
    setSearched(true)
    setLoading(true)

    try {
      const res = await fetch(`/api/tickets/search?cpf=${cpfDigits}`)

      if (!res.ok) {
        setTickets([])
        return
      }

      const json = await res.json()
      const data = Array.isArray(json) ? json : json?.data

      if (!Array.isArray(data)) {
        setTickets([])
        return
      }

      const chamados: ChamadoData[] = data.map((c: Record<string, unknown>) => ({
        ticket: c.ticket as string,
        status: c.status as string,
        setor: (c.setor as string) || "",
        nome: (c.nome as string) || "",
        cpf: (c.cpf as string) || "",
        descricao: (c.descricao as string) || "",
        prioridade: (c.prioridade as string) || "normal",
        historico: (c.historico as string) || null,
        createdAt: c.createdAt as string,
        anexoUrl: (c.anexoUrl as string) || null,
        atendente: (c.atendente as Record<string, unknown> | null) as { id: string; name: string; email: string; avatarUrl: string } | null,
      }))

      setTickets(chamados)
    } catch (err) {
      console.error("Erro na busca:", err)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  function getStatusColor(status: string): string {
    const map: Record<string, string> = {
      CONCLUIDO: "var(--status-completed)",
      ABERTO: "var(--status-new)",
      EM_ANDAMENTO: "var(--status-in-progress)",
    }
    return map[status] || "var(--status-waiting)"
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
            Consultar Chamados
          </h1>
          <p className="text-sm opacity-70">Busque seus chamados pelo CPF para visualizar o status</p>
        </div>

        <div
          className="p-6 sm:p-8 rounded-2xl border shadow-lg space-y-4 transition-colors duration-300"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="space-y-2">
            <label className="block text-sm font-semibold">CPF</label>
            <input
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(formatCPF(e.target.value))}
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
            onClick={buscarTickets}
            disabled={loading || !cpfValido}
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
              "Buscar Chamados"
            )}
          </button>
        </div>

        {tickets.length > 0 && (
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
                    <th className="px-4 sm:px-6 py-3 text-left font-semibold">Ticket</th>
                    <th className="px-4 sm:px-6 py-3 text-left font-semibold">Setor</th>
                    <th className="px-4 sm:px-6 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {tickets.map((t, idx) => (
                    <tr
                      key={t.ticket}
                      className="cursor-pointer transition-colors duration-200 hover:opacity-80"
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        backgroundColor: idx % 2 === 0 ? "transparent" : "var(--surface-elevated)",
                      }}
                      onClick={() => setSelected(t)}
                    >
                      <td className="px-4 sm:px-6 py-4 font-mono font-semibold" style={{ color: "var(--primary)" }}>
                        {t.ticket}
                      </td>
                      <td className="px-4 sm:px-6 py-4">{t.setor}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <span
                          className="inline-block px-3 py-1 rounded-lg text-xs font-semibold"
                          style={{
                            backgroundColor: getStatusColor(t.status),
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

        {!loading && tickets.length === 0 && searched && (
          <div
            className="p-8 rounded-2xl border text-center transition-colors duration-300"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <p className="opacity-70">Nenhum chamado encontrado para este CPF.</p>
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl p-6 sm:p-8 space-y-5 transition-colors duration-300"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-subtle)",
              color: "var(--foreground)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 p-2 rounded-full transition-colors hover:opacity-70"
              style={{ color: "var(--foreground)" }}
            >
              <FaTimes size={18} />
            </button>

            <div
              className="flex items-center gap-3 border-b pb-4"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <FaTicketAlt style={{ color: "var(--primary)", fontSize: "1.25rem" }} />
              <h2 className="text-xl font-semibold">Detalhes do Chamado</h2>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm" style={{ opacity: 0.7 }}>
                <FaTicketAlt />
                <span>{selected.ticket}</span>
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: getStatusColor(selected.status) }}
              >
                {selected.status}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <FaUser style={{ opacity: 0.6 }} />
                <span>{selected.nome}</span>
              </div>

              <div className="flex items-center gap-2">
                <FaIdCard style={{ opacity: 0.6 }} />
                <span>{selected.cpf}</span>
              </div>

              <div className="flex items-center gap-2">
                <FaBuilding style={{ opacity: 0.6 }} />
                <span>{selected.setor}</span>
              </div>

              <div className="flex items-center gap-2">
                <FaCalendarAlt style={{ opacity: 0.6 }} />
                <span>{new Date(selected.createdAt).toLocaleString("pt-BR")}</span>
              </div>

              <div className="flex items-start gap-2">
                <FaInfoCircle style={{ opacity: 0.6, marginTop: "0.25rem" }} />
                <span>{selected.descricao}</span>
              </div>

              {selected.historico && (
                <div className="flex items-start gap-2">
                  <FaInfoCircle style={{ opacity: 0.6, marginTop: "0.25rem" }} />
                  <span>{selected.historico}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <FaFlag style={{ opacity: 0.6 }} />
                <span>Prioridade: {selected.prioridade}</span>
              </div>

              {selected.atendente && (
                <div className="flex items-center gap-2">
                  <FaUserTie style={{ opacity: 0.6 }} />
                  <span>Atendente: {selected.atendente.name}</span>
                </div>
              )}

              {selected.anexoUrl && (
                <div className="flex items-center gap-2">
                  <FaInfoCircle style={{ opacity: 0.6 }} />
                  <a
                    href={selected.anexoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--primary)" }}
                    className="underline"
                  >
                    Ver anexo
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
