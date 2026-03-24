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
    <main className="min-h-screen bg-gray-50/50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Botão Voltar */}
        <Link 
          href="/empresa" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para a listagem
        </Link>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header do Form */}
          <div className="bg-gray-50 border-b border-gray-100 p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 text-white rounded-xl">
                <Building2 size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cadastrar Empresa</h1>
                <p className="text-gray-500 text-sm">Preencha as informações abaixo para o registro.</p>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              
              {/* Nome */}
              <div className="space-y-1.5">
                <label htmlFor="nome" className="text-sm font-semibold text-gray-700">
                  Nome Fantasia
                </label>
                <input
                  id="nome"
                  type="text"
                  placeholder="Ex: Minha Empresa LTDA"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>

              {/* CNPJ */}
              <div className="space-y-1.5">
                <label htmlFor="cnpj" className="text-sm font-semibold text-gray-700">
                  CNPJ
                </label>
                <input
                  id="cnpj"
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono"
                  required
                />
              </div>

              {/* Setores */}
              <div className="space-y-1.5">
                <label htmlFor="setores" className="text-sm font-semibold text-gray-700">
                  Setores de Atuação
                </label>
                <input
                  id="setores"
                  type="text"
                  placeholder="Tecnologia, Varejo, Educação..."
                  value={setores}
                  onChange={(e) => setSetores(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
                <p className="text-[11px] text-gray-400 italic">Separe os setores utilizando vírgulas.</p>
              </div>

            </div>

            {/* Ações */}
            <div className="pt-4 flex items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    Confirmar Cadastro
                  </>
                )}
              </button>
              
              <Link
                href="/empresa"
                className="px-6 py-3 text-gray-500 font-medium hover:bg-gray-100 rounded-xl transition-colors"
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