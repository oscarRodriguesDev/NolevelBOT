'use client'
import { useState } from 'react'
import {  LuCheck, LuLoader, LuArrowRight } from 'react-icons/lu'

import { Header } from '@/app/(atendimento)/components/header'

export default function TicketPage() {
 

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    setor: '',
    descricao: '',
  })

  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const form = new FormData()
      form.append('nome', formData.nome)
      form.append('cpf', formData.cpf)
      form.append('setor', formData.setor)
      form.append('descricao', formData.descricao)
      form.append('prioridade', 'normal')

      if (file) {
        form.append('anexo', file)
      }

      const response = await fetch('/api/tickets', {
        method: 'POST',
        body: form,
      })

      if (!response.ok) {
        throw new Error('Erro na requisição')
      }

      setSubmitted(true)
    } catch {
      alert('Erro ao processar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-colors duration-300"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div
          className="rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm w-full text-center border transition-colors duration-300"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <LuCheck className="h-16 w-16 mx-auto mb-4" style={{ color: "var(--primary)" }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--primary)" }}>
            Solicitação Enviada
          </h2>
          <p className="mb-6 text-sm opacity-70">
            O chamado foi enviado com sucesso.
          </p>
          <button
            onClick={() => window.close()}
            className="w-full py-4 rounded-xl font-bold transition-all duration-300 text-white hover:scale-105 active:scale-95"
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
            Concluído
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

      <Header />

      <div className="max-w-md mx-auto px-4">
        <div
          className="rounded-3xl p-8 border shadow-2xl transition-colors duration-300"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-75">
                Nome
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 border rounded-2xl outline-none transition-colors duration-300"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--foreground)",
                }}
                placeholder="Digite seu nome completo"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-75">
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                required
                pattern="\d{11}"
                maxLength={11}
                className="w-full px-5 py-4 border rounded-2xl outline-none transition-colors duration-300"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--foreground)",
                }}
                placeholder="Digite os 11 números do CPF"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-75">
                Setor
              </label>
              <select
                name="setor"
                value={formData.setor}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 rounded-2xl outline-none transition-colors duration-300"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--foreground)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <option value="">Selecione seu local</option>
                <option value="vitoria">Vitória - Matriz</option>
                <option value="serra">Serra - Logística</option>
                <option value="vale">Vale Tubarão</option>
                <option value="arcelor">ArcelorMittal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-75">
                Descrição
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-5 py-4 border rounded-2xl outline-none transition-colors duration-300 resize-none"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--foreground)",
                }}
                placeholder="Descreva o problema"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-75">
                Anexo
              </label>

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                className="w-full px-5 py-4 border rounded-2xl transition-colors duration-300"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--foreground)",
                }}
              />

              {file && (
                <p className="text-xs mt-2 font-mono" style={{ color: "var(--primary)" }}>
                  Arquivo selecionado: {file.name}
                </p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full font-black py-5 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-3 uppercase text-sm text-white transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: "var(--primary)",
                }}
                onMouseEnter={e => {
                  if (e.target instanceof HTMLElement && !loading) {
                    e.target.style.backgroundColor = "var(--primary-hover)";
                  }
                }}
                onMouseLeave={e => {
                  if (e.target instanceof HTMLElement) {
                    e.target.style.backgroundColor = "var(--primary)";
                  }
                }}
              >
                {loading ? (
                  <>
                    <LuLoader className="animate-spin h-5 w-5" />
                    Processando
                  </>
                ) : (
                  <>
                    Enviar Chamado
                    <LuArrowRight className="h-5 w-5" />
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
