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
      className="min-h-screen flex items-center justify-center transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div
        className="w-full max-w-md p-6 rounded-lg shadow-lg space-y-8 border transition-colors duration-300"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <h1 className="text-lg font-semibold text-center" style={{ color: "var(--primary)" }}>
          Cadastro de CPFs Autorizados
        </h1>

        <form onSubmit={cadastrarManual} className="space-y-4">
          <input
            placeholder="Nome"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="w-full p-3 rounded border outline-none transition-colors duration-300"
            style={{
              backgroundColor: "var(--surface-elevated)",
              borderColor: "var(--border-subtle)",
              color: "var(--foreground)",
            }}
          />
          <input
            placeholder="CPF"
            value={cpf}
            onChange={e => setCpf(e.target.value)}
            className="w-full p-3 rounded border outline-none transition-colors duration-300"
            style={{
              backgroundColor: "var(--surface-elevated)",
              borderColor: "var(--border-subtle)",
              color: "var(--foreground)",
            }}
          />
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

        <form onSubmit={enviarArquivo} className="space-y-4">
          <input
            type="file"
            accept=".csv,.txt,.xlsx"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
            style={{
              color: "var(--foreground)",
            }}
          />
          <button
            type="submit"
            className="w-full text-white py-3 rounded transition-all duration-300 hover:scale-105 active:scale-95 font-medium"
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
  )
}
