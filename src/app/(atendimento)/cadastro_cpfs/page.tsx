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
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="w-full max-w-md bg-zinc-900 p-6 rounded-lg shadow-lg space-y-8 border border-zinc-800">
        <h1 className="text-lg font-semibold text-center text-white">
          Cadastro de CPFs Autorizados
        </h1>

        <form onSubmit={cadastrarManual} className="space-y-4">
          <input
            placeholder="Nome"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
          />
          <input
            placeholder="CPF"
            value={cpf}
            onChange={e => setCpf(e.target.value)}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
          >
            Cadastrar
          </button>
        </form>

        <form onSubmit={enviarArquivo} className="space-y-4">
          <input
            type="file"
            accept=".csv,.txt,.xlsx"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-zinc-700 file:text-white hover:file:bg-zinc-600"
          />
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition"
          >
            Importar Arquivo
          </button>
        </form>
      </div>
    </div>
  )
}