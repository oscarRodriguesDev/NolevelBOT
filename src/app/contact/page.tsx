"use client"

import { useState } from "react"
import { ThemeToggle } from "../components/theme-toggle"
import { BtnVoltar } from "../components/back"


export default function ContatoForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)



  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      const form = e.currentTarget
      if (!form) throw new Error("Formulário não encontrado")

      const formData = new FormData(form)
      const data = {
        nome: formData.get("nome")?.toString() || "",
        email: formData.get("email")?.toString() || "",
        empresa: formData.get("empresa")?.toString() || "",
        telefone: formData.get("telefone")?.toString() || "",
        mensagem: formData.get("mensagem")?.toString() || "",
      }

      const res = await fetch("/api/send-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error("Falha ao enviar formulário")

      setSuccess(true)
        form.reset() // aqui funciona, porque 'form' é e.currentTarget
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    const form = document.querySelector("form")
    if (form) form.reset()
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300"
      style={{ backgroundColor: "var(--background)" }}
    >

      <BtnVoltar />

      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Card do Formulário */}
        <form
          onSubmit={handleSubmit}
          className="bg-[var(--surface)] p-8 rounded-2xl border border-[var(--border-subtle)] shadow-xl space-y-6"
        >
          <div className="space-y-2 mb-4">
            <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
              Fale Conosco
            </h1>
            <p className="text-xs font-medium opacity-50 uppercase tracking-widest">
              Preencha os dados abaixo para continuar
            </p>
          </div>

          <div className="space-y-4">
            {/* Campo Nome */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase opacity-40 ml-1">Nome Completo</label>
              <input
                name="nome"
                placeholder="Ex: João Silva"
                required
                className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] text-sm transition-all focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none"
                style={{ color: "var(--foreground)" }}
              />
            </div>

            {/* Grid de Email e Empresa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] text-sm transition-all focus:ring-2 focus:ring-[var(--primary)] outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">Empresa</label>
                <input
                  name="empresa"
                  placeholder="Nome da empresa"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] text-sm transition-all focus:ring-2 focus:ring-[var(--primary)] outline-none"
                />
              </div>
            </div>

            {/* Telefone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase opacity-40 ml-1">Telefone / WhatsApp</label>
              <input
                name="telefone"
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] text-sm transition-all focus:ring-2 focus:ring-[var(--primary)] outline-none"
              />
            </div>

            {/* Mensagem */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase opacity-40 ml-1">Mensagem</label>
              <textarea
                name="mensagem"
                placeholder="Como podemos ajudar?"
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] text-sm transition-all focus:ring-2 focus:ring-[var(--primary)] outline-none resize-none"
              />
            </div>
          </div>

          {/* Botão de Enviar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--primary)]/20"
            style={{ backgroundColor: "var(--primary)" }}
          >
            {loading ? "Processando..." : "Enviar Mensagem"}
          </button>

          {/* Mensagens de Feedback */}
          {success && (
            <div className="p-3 rounded-lg bg-[var(--status-completed)]/10 border border-[var(--status-completed)]/20 text-[var(--status-completed)] text-center text-xs font-bold animate-in fade-in zoom-in duration-300">
              ✓ Enviado com sucesso!
            </div>
          )}
        </form>

        <p className="text-center mt-6 text-[10px] font-bold opacity-30 uppercase tracking-widest">
          Sua privacidade é nossa prioridade
        </p>
      </div>
    </main>
  )
}