"use client"

import { useState } from "react"
import { ThemeToggle } from "../components/theme-toggle"
import { BtnVoltar } from "../components/back"

// Pagina de formulario de contato
export default function ContatoForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Envia formulario de contato para a API
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setErrorMsg(null)

    try {
      const form = e.currentTarget
      const formData = new FormData(form)
      
      const data = {
        nome: formData.get("nome")?.toString().trim(),
        email: formData.get("email")?.toString().trim(),
        empresa: formData.get("empresa")?.toString().trim(),
        telefone: formData.get("telefone")?.toString().trim(),
        mensagem: formData.get("mensagem")?.toString().trim(),
      }

      // Validação básica
      if (!data.nome || !data.email || !data.mensagem) {
        throw new Error("Por favor, preencha todos os campos obrigatórios.")
      }

      const res = await fetch("/api/send-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      // Tenta capturar a mensagem de erro do servidor
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Falha ao enviar formulário. Tente novamente.")
      }

      setSuccess(true)
      form.reset()
    } catch (error: any) {
      setErrorMsg(error.message || "Ocorreu um erro inesperado.")
    } finally {
      setLoading(false)
    }
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

          {/* Feedback de Erro */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-center text-xs font-bold animate-in fade-in zoom-in duration-300">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase opacity-40 ml-1">Nome Completo</label>
              <input name="nome" placeholder="Ex: João Silva" required className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]" style={{ color: "var(--foreground)" }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">Email</label>
                <input name="email" type="email" placeholder="seu@email.com" required className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase opacity-40 ml-1">Empresa</label>
                <input name="empresa" placeholder="Nome da empresa" className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase opacity-40 ml-1">Telefone / WhatsApp</label>
              <input name="telefone" placeholder="(00) 00000-0000" className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase opacity-40 ml-1">Mensagem</label>
              <textarea name="mensagem" placeholder="Como podemos ajudar?" required rows={4} className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[var(--primary)]/20"
            style={{ backgroundColor: "var(--primary)" }}
          >
            {loading ? "Processando..." : "Enviar Mensagem"}
          </button>

          {success && (
            <div className="p-3 rounded-lg bg-[var(--status-completed)]/10 border border-[var(--status-completed)]/20 text-[var(--status-completed)] text-center text-xs font-bold animate-in fade-in zoom-in duration-300">
              ✓ Enviado com sucesso!
            </div>
          )}
        </form>
      </div>
    </main>
  )
}