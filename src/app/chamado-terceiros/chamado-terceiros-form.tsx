"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import {
  LuCheck,
  LuLoader,
  LuInfo,
  LuCircleAlert,
  LuTriangle,
  LuSearch,
  LuUserPlus,
  LuUserCheck,
  LuX,
} from "react-icons/lu"
import { ThemeToggle } from "../components/theme-toggle"
import { FileUpload } from "../components/fileInput"

type Prioridade = "baixa" | "normal" | "alta" | null

type ColaboradorSugestao = {
  id: string
  nome: string
  matricula: string | null
  cpf: string | null
  telefone: string | null
}

type Props = {
  setores: string[]
  empresaNome: string
}

// Formulário de abertura de chamado para terceiros (sem CPF obrigatório)
export default function ChamadoTerceirosForm({ setores, empresaNome }: Props) {
  const [nome, setNome] = useState("")
  const [colaborador, setColaborador] = useState<ColaboradorSugestao | null>(null)
  const [sugestoes, setSugestoes] = useState<ColaboradorSugestao[]>([])
  const [buscando, setBuscando] = useState(false)
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  const [focados, setFocados] = useState(false)
  const [matricula, setMatricula] = useState("")
  const [cpfNovo, setCpfNovo] = useState("")
  const [telefone, setTelefone] = useState("")
  const [setor, setSetor] = useState("")
  const [prioridade, setPrioridade] = useState<Prioridade>(null)
  const [descricao, setDescricao] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [ticketCriado, setTicketCriado] = useState("")

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const buscaCounter = useRef(0)

  // Busca colaboradores por nome (autocomplete com debounce e anti race condition)
  const buscarColaboradores = useCallback(async (termo: string) => {
    const clean = termo.trim()
    if (clean.length < 2) {
      setSugestoes([])
      return
    }
    const contador = ++buscaCounter.current
    setBuscando(true)
    try {
      const res = await fetch(`/api/colaboradores?search=${encodeURIComponent(clean)}&limit=8`)
      if (!res.ok) {
        setSugestoes([])
        return
      }
      const data = await res.json()
      // Descarta resposta obsoleta (digitação mais recente)
      if (contador === buscaCounter.current) {
        setSugestoes(Array.isArray(data) ? data : [])
      }
    } catch {
      if (contador === buscaCounter.current) setSugestoes([])
    } finally {
      if (contador === buscaCounter.current) setBuscando(false)
    }
  }, [])

  // Debounce na digitação do nome
  useEffect(() => {
    if (colaborador) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => buscarColaboradores(nome), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [nome, colaborador, buscarColaboradores])

  const selecionarColaborador = (c: ColaboradorSugestao) => {
    setColaborador(c)
    setNome(c.nome)
    setSugestoes([])
    setMostrarSugestoes(false)
    setFocados(false)
  }

  const limparColaborador = () => {
    setColaborador(null)
    setNome("")
    setSugestoes([])
    setMatricula("")
    setCpfNovo("")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome.trim()) {
      toast.error("Informe o nome do colaborador")
      return
    }
    if (!setor) {
      toast.error("Selecione o setor de destino")
      return
    }
    if (!prioridade) {
      toast.error("Selecione a prioridade do chamado")
      return
    }
    if (!descricao.trim()) {
      toast.error("Descreva o problema")
      return
    }

    setLoading(true)

    try {
      const form = new FormData()
      form.append("nome", nome.trim())
      form.append("setor", setor)
      form.append("descricao", descricao)
      form.append("prioridade", prioridade)

      if (colaborador?.id) {
        form.append("colaboradorId", colaborador.id)
      } else {
        const matriculaDigits = matricula.replace(/\D/g, "")
        const cpfDigits = cpfNovo.replace(/\D/g, "")
        if (matriculaDigits) form.append("matricula", matriculaDigits)
        if (cpfDigits) form.append("cpf", cpfDigits)
      }

      if (telefone) {
        form.append("telefone", telefone.replace(/\D/g, ""))
      }

      if (file) {
        form.append("anexo", file)
      }

      const response = await fetch("/api/tickets/terceiros", {
        method: "POST",
        body: form,
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || `Erro HTTP ${response.status}`)
      }

      setLoading(false)
      setSubmitted(true)
      setTicketCriado(data?.ticket || "")
      toast.success(data?.ticket ? `Chamado ${data.ticket} aberto com sucesso` : "Chamado registrado com sucesso")
    } catch (error: any) {
      console.error("Erro ao registrar:", error)
      toast.error(error?.message || "Erro ao processar. Tente novamente.")
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-colors duration-300"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="absolute right-4 top-4 z-50">
          <ThemeToggle />
        </div>
        <div
          className="rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm w-full text-center border transition-colors duration-300"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <LuCheck className="h-16 w-16 mx-auto mb-4" style={{ color: "var(--primary)" }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--primary)" }}>
            Chamado Registrado
          </h2>
          <p className="mb-6 text-sm opacity-70">
            O chamado para o terceiro foi registrado com sucesso e direcionado ao setor responsável.
          </p>
          {ticketCriado && (
            <div
              className="mb-6 p-3 rounded-xl border text-sm font-semibold"
              style={{
                backgroundColor: "var(--surface-elevated)",
                borderColor: "var(--border-subtle)",
                color: "var(--foreground)",
              }}
            >
              Número do chamado: <span style={{ color: "var(--primary)" }}>{ticketCriado}</span>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 rounded-xl font-bold transition-all duration-300 text-white hover:scale-105 active:scale-95"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Novo chamado
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-8 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: "var(--primary)" }}>
            Abrir Chamado para Terceiro
          </h2>
          <p className="text-sm opacity-70">
            {empresaNome ? `${empresaNome} · ` : ""}Sem necessidade de CPF — identifique o colaborador pelo nome.
          </p>
        </div>

        <div
          className="rounded-2xl p-6 sm:p-8 border shadow-lg transition-colors duration-300"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome do colaborador com autocomplete */}
            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
                Colaborador (Terceiro)
              </label>

              {colaborador ? (
                <div
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all duration-300"
                  style={{
                    backgroundColor: "var(--surface-elevated)",
                    borderColor: "var(--primary)",
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <LuUserCheck className="h-5 w-5 flex-shrink-0" style={{ color: "var(--primary)" }} />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{colaborador.nome}</p>
                      {(colaborador.matricula || colaborador.cpf) && (
                        <p className="text-xs opacity-60 font-mono">
                          {colaborador.matricula ? `Matrícula: ${colaborador.matricula}` : ""}
                          {colaborador.matricula && colaborador.cpf ? " · " : ""}
                          {colaborador.cpf ? `CPF: ${colaborador.cpf}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={limparColaborador}
                    className="p-2 rounded-lg hover:bg-[var(--surface)] transition-colors flex-shrink-0"
                    title="Alterar colaborador"
                  >
                    <LuX className="h-4 w-4 opacity-60" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <LuSearch
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      onFocus={() => {
                        setFocados(true)
                        setMostrarSugestoes(true)
                      }}
                      onBlur={() => setTimeout(() => setMostrarSugestoes(false), 150)}
                      autoComplete="off"
                      className="w-full pl-11 pr-4 py-3 rounded-xl outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                      style={{
                        backgroundColor: "var(--surface-elevated)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--foreground)",
                        "--tw-ring-color": "var(--primary)",
                      } as never}
                      placeholder="Digite o nome do colaborador..."
                    />
                  </div>

                  {mostrarSugestoes && (nome.trim().length >= 2 || focados) && (
                    <div
                      className="absolute z-20 mt-2 w-full rounded-xl border shadow-xl overflow-hidden"
                      style={{
                        backgroundColor: "var(--surface-elevated)",
                        borderColor: "var(--border-subtle)",
                      }}
                    >
                      {buscando && (
                        <div className="px-4 py-3 text-sm opacity-60 flex items-center gap-2">
                          <LuLoader className="animate-spin h-4 w-4" /> Buscando...
                        </div>
                      )}

                      {!buscando && sugestoes.length === 0 && nome.trim().length >= 2 && (
                        <div className="px-4 py-3 text-sm opacity-70 flex items-center gap-2">
                          <LuUserPlus className="h-4 w-4" style={{ color: "var(--primary)" }} />
                          Nenhum colaborador encontrado — o novo nome será cadastrado ao abrir o chamado.
                        </div>
                      )}

                      {sugestoes.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            selecionarColaborador(s)
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-[var(--surface)] transition-colors border-b last:border-0"
                          style={{ borderColor: "var(--border-subtle)" }}
                        >
                          <p className="text-sm font-semibold">{s.nome}</p>
                          {(s.matricula || s.cpf) && (
                            <p className="text-xs opacity-50 font-mono">
                              {s.matricula ? `Matrícula: ${s.matricula}` : ""}
                              {s.matricula && s.cpf ? " · " : ""}
                              {s.cpf ? `CPF: ${s.cpf}` : ""}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Campos opcionais apenas para colaborador novo */}
            {!colaborador && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
                    Matrícula <span className="font-normal opacity-50">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value.replace(/\D/g, "").slice(0, 30))}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                    style={{
                      backgroundColor: "var(--surface-elevated)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--foreground)",
                      "--tw-ring-color": "var(--primary)",
                    } as never}
                    placeholder="Matrícula do colaborador"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
                    CPF <span className="font-normal opacity-50">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cpfNovo}
                    onChange={(e) => setCpfNovo(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                    style={{
                      backgroundColor: "var(--surface-elevated)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--foreground)",
                      "--tw-ring-color": "var(--primary)",
                    } as never}
                    placeholder="Somente números"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
                Telefone <span className="font-normal opacity-50">(opcional)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value.replace(/\D/g, "").slice(0, 15))}
                className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--foreground)",
                  "--tw-ring-color": "var(--primary)",
                } as never}
                placeholder="5511999999999"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
                Setor de Destino
              </label>
              <select
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 border focus:ring-2 focus:ring-opacity-50"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--foreground)",
                  borderColor: "var(--border-subtle)",
                  "--tw-ring-color": "var(--primary)",
                } as never}
              >
                <option value="" disabled>Selecione o setor</option>
                {setores.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-3">
                Nível de Prioridade
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPrioridade("baixa")}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                    prioridade === "baixa"
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--border-subtle)] hover:border-[var(--primary)]/50"
                  }`}
                  style={{
                    backgroundColor: prioridade === "baixa" ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "var(--surface-elevated)",
                  }}
                >
                  <LuInfo className={`h-6 w-6 ${prioridade === "baixa" ? "text-[var(--primary)]" : "opacity-60"}`} />
                  <div className="text-left">
                    <span className={`block text-sm font-semibold ${prioridade === "baixa" ? "text-[var(--primary)]" : ""}`}>
                      Baixa
                    </span>
                    <span className="text-xs opacity-60">Dúvida ou solicitação simples</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPrioridade("normal")}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                    prioridade === "normal"
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--border-subtle)] hover:border-[var(--primary)]/50"
                  }`}
                  style={{
                    backgroundColor: prioridade === "normal" ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "var(--surface-elevated)",
                  }}
                >
                  <LuCircleAlert className={`h-6 w-6 ${prioridade === "normal" ? "text-[var(--primary)]" : "opacity-60"}`} />
                  <div className="text-left">
                    <span className={`block text-sm font-semibold ${prioridade === "normal" ? "text-[var(--primary)]" : ""}`}>
                      Normal
                    </span>
                    <span className="text-xs opacity-60">Problema técnico rotineiro</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPrioridade("alta")}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                    prioridade === "alta"
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--border-subtle)] hover:border-[var(--primary)]/50"
                  }`}
                  style={{
                    backgroundColor: prioridade === "alta" ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "var(--surface-elevated)",
                  }}
                >
                  <LuTriangle className={`h-6 w-6 ${prioridade === "alta" ? "text-[var(--primary)]" : "opacity-60"}`} />
                  <div className="text-left">
                    <span className={`block text-sm font-semibold ${prioridade === "alta" ? "text-[var(--primary)]" : ""}`}>
                      Alta
                    </span>
                    <span className="text-xs opacity-60">Urgência ou sistema parado</span>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
                Descrição do Problema
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 resize-none focus:ring-2 focus:ring-opacity-50"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--foreground)",
                  "--tw-ring-color": "var(--primary)",
                } as never}
                placeholder="Descreva detalhadamente o problema ou solicitação..."
              />
            </div>

            <FileUpload file={file} setFile={setFile} handleFileChange={handleFileChange} />

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full font-semibold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base text-white transition-all duration-300 hover:brightness-110 hover:shadow-lg active:scale-[0.98] disabled:hover:scale-100"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {loading ? (
                  <>
                    <LuLoader className="animate-spin h-5 w-5" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <LuCheck className="h-5 w-5" />
                    Registrar Chamado
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}