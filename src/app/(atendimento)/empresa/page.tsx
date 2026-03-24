'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Plus, Building2, MapPin, Search, ArrowRight } from 'lucide-react' // Opcional: instale lucide-react

interface Empresa {
  id: string
  nome: string
  cnpj: string
  setores: string[]
  cidade?: string
}

export default function EmpresaPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function fetchEmpresas() {
      try {
        const res = await fetch('/api/empresa')
        if (!res.ok) throw new Error()
        const data = await res.json()
        setEmpresas(data)
      } catch (error) {
        console.error('Erro ao buscar empresas')
      } finally {
        setLoading(false)
      }
    }
    fetchEmpresas()
  }, [])

  const filteredEmpresas = empresas.filter(emp => 
    emp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.cnpj.includes(searchTerm)
  )

  return (
    <main className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        
        {/* Header Profissional */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Empresas</h1>
            <p className="text-gray-500 mt-1">Gerencie e visualize todas as empresas parceiras.</p>
          </div>

          <Link
            href="/empresa/create"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
          >
            <Plus size={18} />
            Nova Empresa
          </Link>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nome ou CNPJ..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Listagem */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <SkeletonLoader />
          ) : filteredEmpresas.length > 0 ? (
            filteredEmpresas.map((empresa) => (
              <div
                key={empresa.id}
                className="group bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                    <Building2 size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded">
                    ID: {empresa.id.slice(0, 8)}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {empresa.nome}
                </h2>
                <p className="text-sm text-gray-500 font-mono mb-4">{empresa.cnpj}</p>

                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {empresa.setores?.map((setor, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-md"
                    >
                      {setor}
                    </span>
                  ))}
                </div>
                
                <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                   <ArrowRight size={20} className="text-blue-500" />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white border border-dashed border-gray-300 rounded-2xl">
              <p className="text-gray-400">Nenhuma empresa encontrada.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function SkeletonLoader() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-gray-200 animate-pulse h-48 rounded-2xl" />
      ))}
    </>
  )
}