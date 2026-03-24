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
    <main
      className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: "var(--primary)" }}>
              Empresas
            </h1>
            <p className="text-sm opacity-70">Gerencie e visualize todas as empresas parceiras do sistema</p>
          </div>

          <Link
            href="/empresa/create"
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ backgroundColor: "var(--primary)" }}
            onMouseEnter={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.backgroundColor = "var(--primary-hover)";
              }
            }}
            onMouseLeave={(e) => {
              if (e.currentTarget instanceof HTMLElement) {
                e.currentTarget.style.backgroundColor = "var(--primary)";
              }
            }}
          >
            <Plus size={18} />
            Nova Empresa
          </Link>
        </div>

        {/* Barra de Busca */}
        <div className="mb-8">
          <div
            className="relative rounded-lg border shadow-md transition-colors duration-300"
            style={{
              borderColor: "var(--border-subtle)",
              backgroundColor: "var(--surface)",
            }}
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--foreground)", opacity: 0.5 }} />
            <input 
              type="text"
              placeholder="Buscar por nome ou CNPJ..."
              className="w-full pl-12 pr-4 py-3 rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--foreground)",
                "--tw-ring-color": "var(--primary)",
              } as never}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Listagem */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {loading ? (
            <SkeletonLoader />
          ) : filteredEmpresas.length > 0 ? (
            filteredEmpresas.map((empresa) => (
              <div
                key={empresa.id}
                className="group rounded-2xl border shadow-lg p-5 sm:p-6 transition-all duration-300 cursor-pointer relative"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border-subtle)",
                }}
                onMouseEnter={(e) => {
                  if (e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.05)";
                  }
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: "var(--primary)",
                      color: "#fff",
                    }}
                  >
                    <Building2 size={24} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded" style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground)", opacity: 0.6 }}>
                    ID: {empresa.id.slice(0, 8)}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold mb-1 transition-colors duration-300" style={{ color: "var(--primary)" }}>
                  {empresa.nome}
                </h2>
                <p className="text-sm font-mono opacity-70 mb-4">{empresa.cnpj}</p>

                <div className="flex flex-wrap gap-2">
                  {empresa.setores?.map((setor, index) => (
                    <span
                      key={index}
                      className="text-xs font-medium px-2.5 py-1 rounded-md"
                      style={{
                        backgroundColor: "var(--surface-elevated)",
                        color: "var(--foreground)",
                      }}
                    >
                      {setor}
                    </span>
                  ))}
                </div>
                
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight size={20} style={{ color: "var(--primary)" }} />
                </div>
              </div>
            ))
          ) : (
            <div
              className="col-span-full py-16 sm:py-20 text-center rounded-2xl border border-dashed"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <p className="opacity-70">Nenhuma empresa encontrada.</p>
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
