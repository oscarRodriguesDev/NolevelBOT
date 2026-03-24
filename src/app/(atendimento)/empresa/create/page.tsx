'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, CheckCircle2, Loader2 } from 'lucide-react'

export default function CreateEmpresa() {
  const router = useRouter()

  const [nome, setNome] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [setores, setSetores] = useState('')
  const [loading, setLoading] = useState(false)

  // Função simples para formatar CNPJ enquanto digita
  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '') // Remove tudo que não é dígito
      .replace(/^(\dt{2})(\dt{3})(\dt{3})(\dt{4})(\dt{2}).*/, '$1.$2.$3/$4-$5')
      .substring(0, 18)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          cnpj: cnpj.replace(/\D/g, ''), // Envia apenas números para o banco
          setores: setores.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      })

      if (!res.ok) throw new Error()
      router.push('/empresa')
      router.refresh() // Garante que a lista atualize
    } catch (error) {
      alert('Erro ao criar empresa. Verifique os dados.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Botão Voltar */}
        <Link 
          href="/empresa" 
          className="inline-flex items-center gap-2 text-sm mb-8 transition-colors duration-300 group"
          style={{ color: "var(--foreground)", opacity: 0.7 }}
          onMouseEnter={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.color = "var(--primary)";
            }
          }}
          onMouseLeave={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "0.7";
              e.currentTarget.style.color = "var(--foreground)";
            }
          }}
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para a listagem
        </Link>

        {/* Card Principal */}
        <div
          className="rounded-2xl border shadow-lg overflow-hidden transition-colors duration-300"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          {/* Header do Form */}
          <div
            className="border-b p-6 sm:p-8"
            style={{
              backgroundColor: "var(--surface-elevated)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-lg text-white"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <Building2 size={24} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--primary)" }}>
                  Cadastrar Empresa
                </h1>
                <p className="text-xs sm:text-sm opacity-70">Preencha as informações abaixo para o registro</p>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <label htmlFor="nome" className="block text-sm font-semibold">
                Nome Fantasia
              </label>
              <input
                id="nome"
                type="text"
                placeholder="Ex: Minha Empresa LTDA"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--foreground)",
                  "--tw-ring-color": "var(--primary)",
                } as never}
                required
              />
            </div>

            {/* CNPJ */}
            <div className="space-y-2">
              <label htmlFor="cnpj" className="block text-sm font-semibold">
                CNPJ
              </label>
              <input
                id="cnpj"
                type="text"
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                className="w-full px-4 py-3 border rounded-lg font-mono outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--foreground)",
                  "--tw-ring-color": "var(--primary)",
                } as never}
                required
              />
            </div>

            {/* Setores */}
            <div className="space-y-2">
              <label htmlFor="setores" className="block text-sm font-semibold">
                Setores de Atuação
              </label>
              <input
                id="setores"
                type="text"
                placeholder="Tecnologia, Varejo, Educação..."
                value={setores}
                onChange={(e) => setSetores(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--foreground)",
                  "--tw-ring-color": "var(--primary)",
                } as never}
              />
              <p className="text-xs opacity-70">Separe os setores utilizando vírgulas</p>
            </div>

            {/* Ações */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                style={{ backgroundColor: "var(--primary)" }}
                onMouseEnter={(e) => {
                  if (e.currentTarget instanceof HTMLElement && !loading) {
                    e.currentTarget.style.backgroundColor = "var(--primary-hover)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.style.backgroundColor = "var(--primary)";
                  }
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Confirmar Cadastro
                  </>
                )}
              </button>
              
              <Link
                href="/empresa"
                className="px-6 py-3 font-semibold rounded-lg transition-colors duration-300 text-center"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--foreground)",
                }}
                onMouseEnter={(e) => {
                  if (e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.style.backgroundColor = "var(--border-subtle)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.style.backgroundColor = "var(--surface-elevated)";
                  }
                }}
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
