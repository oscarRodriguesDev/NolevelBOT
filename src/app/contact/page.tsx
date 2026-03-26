'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '../components/theme-toggle'
import { FiSend, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'

export default function ContatoForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const data = {
      nome: formData.get('nome'),
      email: formData.get('email'),
      empresa: formData.get('empresa'),
      telefone: formData.get('telefone'),
      mensagem: formData.get('mensagem'),
    }

    try {
      await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setSuccess(true)
      e.currentTarget.reset()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen relative overflow-hidden transition-colors duration-500 font-sans flex items-center justify-center py-12 px-6"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      {/* --- BACKGROUND IGUAL À LANDING --- */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/landing/fundo.png')" }}
      />
      <div className="absolute inset-0 bg-black/70" />

      {/* Efeito de brilho (Glow) */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] opacity-20 blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }}
      />

      <div className="absolute top-1 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Voltar */}
        <Link 
          href="/" 
          className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors group"
        >
          <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Voltar para o início
        </Link>

        <div 
          className="p-8 sm:p-12 rounded-[2.5rem] border shadow-2xl backdrop-blur-sm"
          style={{ 
            backgroundColor: "var(--surface)", 
            borderColor: "var(--border-subtle)" 
          }}
        >
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Solicitar <span style={{ color: "var(--primary)" }}>informações</span>
            </h2>
            <p className="opacity-70">
              Preencha o formulário abaixo e nossa equipe entrará em contato em breve.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <input
                name="nome"
                placeholder="Seu nome completo"
                required
                className="w-full rounded-2xl p-4 outline-none border transition-all focus:ring-2 focus:ring-[var(--primary)]"
                style={{ backgroundColor: "var(--background)", borderColor: "var(--border-subtle)" }}
              />
              <input
                name="email"
                type="email"
                placeholder="E-mail corporativo"
                required
                className="w-full rounded-2xl p-4 outline-none border transition-all focus:ring-2 focus:ring-[var(--primary)]"
                style={{ backgroundColor: "var(--background)", borderColor: "var(--border-subtle)" }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <input
                name="empresa"
                placeholder="Nome da empresa"
                className="w-full rounded-2xl p-4 outline-none border transition-all focus:ring-2 focus:ring-[var(--primary)]"
                style={{ backgroundColor: "var(--background)", borderColor: "var(--border-subtle)" }}
              />
              <input
                name="telefone"
                placeholder="Telefone / WhatsApp"
                className="w-full rounded-2xl p-4 outline-none border transition-all focus:ring-2 focus:ring-[var(--primary)]"
                style={{ backgroundColor: "var(--background)", borderColor: "var(--border-subtle)" }}
              />
            </div>

            <textarea
              name="mensagem"
              placeholder="Como podemos ajudar?"
              required
              className="w-full rounded-2xl p-4 outline-none border transition-all focus:ring-2 focus:ring-[var(--primary)] h-32 resize-none"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border-subtle)" }}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold shadow-lg transition-all duration-300 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
              style={{ backgroundColor: "var(--primary)", color: "white" }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enviando...
                </span>
              ) : (
                <>
                  <FiSend /> Enviar Mensagem
                </>
              )}
            </button>

            {success && (
              <div 
                className="flex items-center gap-3 p-4 rounded-2xl animate-in fade-in slide-in-from-bottom-2"
                style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}
              >
                <FiCheckCircle className="text-xl" />
                <p className="text-sm font-medium">Sua mensagem foi enviada com sucesso! Responderemos em breve.</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  )
}