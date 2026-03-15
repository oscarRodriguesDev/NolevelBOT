"use client"

import { useState } from "react"

export default function CadastroCPFs() {
  const [nome, setNome] = useState("")
  const [cpf, setCpf] = useState("")
  const [file, setFile] = useState<File | null>(null)

  async function cadastrarManual(e: React.FormEvent) {
    e.preventDefault()

    try {
      const res = await fetch("/api/cpfs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cpf })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Erro ao cadastrar")
        return
      }

      alert("CPF cadastrado com sucesso")
      setNome("")
      setCpf("")
    } catch {
      alert("Erro ao conectar com o servidor")
    }
  }

  async function enviarArquivo(e: React.FormEvent) {
    e.preventDefault()

    if (!file) {
      alert("Selecione um arquivo")
      return
    }

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/cpfs", {
        method: "POST",
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Erro ao importar")
        return
      }

      alert(`Arquivo importado com sucesso (${data.inseridos ?? 0} registros)`)

      setFile(null)
    } catch {
      alert("Erro ao conectar com o servidor")
    }
  }

  return (
    <div
      className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div
        className="w-full max-w-lg p-6 sm:p-8 rounded-2xl shadow-lg space-y-8 border transition-colors duration-300"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--primary)" }}>
            Cadastro de CPFs
          </h1>
          <p className="text-sm opacity-70">Gerencie e importe CPFs autorizados</p>
        </div>

        <form onSubmit={cadastrarManual} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nome</label>
            <input
              placeholder="Nome completo"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full p-3 rounded-lg border outline-none transition-colors duration-300"
              style={{
                backgroundColor: "var(--surface-elevated)",
                borderColor: "var(--border-subtle)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">CPF</label>
            <input
              placeholder="000.000.000-00"
              value={cpf}
              onChange={e => setCpf(e.target.value)}
              className="w-full p-3 rounded-lg border outline-none transition-colors duration-300"
              style={{
                backgroundColor: "var(--surface-elevated)",
                borderColor: "var(--border-subtle)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <button
            type="submit"
            className="w-full text-white py-3 rounded transition-all duration-300 hover:scale-105 active:scale-95 font-medium"
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
            Cadastrar
          </button>
        </form>

        <div className="border-t pt-6" style={{ borderColor: "var(--border-subtle)" }}>
          <h3 className="text-lg font-semibold mb-4">Ou importe em lote</h3>
          <form onSubmit={enviarArquivo} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Arquivo
              </label>

              <label className="flex items-center justify-between gap-4 w-full px-4 py-3 rounded-lg border transition-all cursor-pointer hover:opacity-80"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-elevated)",
                }}>
                <span className="text-sm truncate flex-1">
                  {file ? file.name : "Selecione um arquivo (.csv, .txt, .xlsx)"}
                </span>

                <span className="px-3 py-1 text-xs font-medium rounded text-white flex-shrink-0"
                  style={{ backgroundColor: "var(--primary)" }}>
                  Escolher
                </span>

                <input
                  type="file"
                  accept=".csv,.txt,.xlsx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>

              <p className="mt-2 text-xs opacity-60">
                Formatos aceitos: CSV, TXT ou XLSX
              </p>
            </div>

            <button
              type="submit"
              className="w-full text-white py-3 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 font-medium"
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
              Importar Arquivo
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
