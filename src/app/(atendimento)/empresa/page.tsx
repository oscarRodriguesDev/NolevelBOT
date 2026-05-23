'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Building2, Search, Pencil, Trash2, X, Check } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { ROLE } from '@prisma/client'
import { useHeader } from '../layout'
import toast from 'react-hot-toast'

interface Empresa {
  id: string
  nome: string
  cnpj: string
  setores: string[]
}

export default function EmpresaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ nome: '', cnpj: '', setores: '' })

  const { setHeader } = useHeader()

  useEffect(() => {
    if (status === 'loading') return
    const role = session?.user?.role as ROLE | undefined
    if (role !== 'GOD') {
      router.replace('/dashboards')
      return
    }
  }, [status, session, router])

  useEffect(() => {
    setHeader({
      titulo: 'Empresas',
      descricao: 'Gerencie e visualize todas as empresas parceiras do sistema'
    })
  }, [setHeader])

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

  useEffect(() => {
    fetchEmpresas()
  }, [])

  function startEdit(emp: Empresa) {
    setEditingId(emp.id)
    setEditForm({
      nome: emp.nome,
      cnpj: emp.cnpj,
      setores: emp.setores.join(', '),
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({ nome: '', cnpj: '', setores: '' })
  }

  async function saveEdit(id: string) {
    try {
      const res = await fetch(`/api/empresa?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: editForm.nome,
          cnpj: editForm.cnpj.replace(/\D/g, ''),
          setores: editForm.setores.split(',').map(s => s.trim()).filter(Boolean),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erro ao atualizar')
        return
      }

      toast.success('Empresa atualizada com sucesso')
      cancelEdit()
      fetchEmpresas()
    } catch {
      toast.error('Erro ao conectar com o servidor')
    }
  }

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja excluir a empresa "${nome}"?\n\nEsta ação não pode ser desfeita.`)) return

    try {
      const res = await fetch(`/api/empresa?id=${id}`, { method: 'DELETE' })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erro ao excluir')
        return
      }

      toast.success('Empresa excluída com sucesso')
      fetchEmpresas()
    } catch {
      toast.error('Erro ao conectar com o servidor')
    }
  }

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-8">
          <Link
            href="/empresa/create"
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Plus size={18} />
            Nova Empresa
          </Link>
        </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {loading ? (
            <SkeletonLoader />
          ) : filteredEmpresas.length > 0 ? (
            filteredEmpresas.map((empresa) => (
              <div
                key={empresa.id}
                onClick={() => router.push(`/empresa/${empresa.id}/usuarios`)}
                className="rounded-2xl border shadow-lg p-5 sm:p-6 transition-all duration-300 relative cursor-pointer hover:scale-[1.02]"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                {editingId === empresa.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Nome</label>
                      <input
                        value={editForm.nome}
                        onChange={e => setEditForm(p => ({ ...p, nome: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{
                          backgroundColor: "var(--surface-elevated)",
                          borderColor: "var(--border-subtle)",
                          color: "var(--foreground)",
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">CNPJ</label>
                      <input
                        value={editForm.cnpj}
                        onChange={e => setEditForm(p => ({ ...p, cnpj: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border outline-none text-sm font-mono"
                        style={{
                          backgroundColor: "var(--surface-elevated)",
                          borderColor: "var(--border-subtle)",
                          color: "var(--foreground)",
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Setores (separados por vírgula)</label>
                      <input
                        value={editForm.setores}
                        onChange={e => setEditForm(p => ({ ...p, setores: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border outline-none text-sm"
                        style={{
                          backgroundColor: "var(--surface-elevated)",
                          borderColor: "var(--border-subtle)",
                          color: "var(--foreground)",
                        }}
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => saveEdit(empresa.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-medium"
                        style={{ backgroundColor: "var(--status-completed)" }}
                      >
                        <Check size={14} /> Salvar
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground)" }}
                      >
                        <X size={14} /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--primary)", color: "#fff" }}>
                        <Building2 size={24} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded"
                        style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground)", opacity: 0.6 }}>
                        ID: {empresa.id.slice(0, 8)}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold mb-1 transition-colors duration-300" style={{ color: "var(--primary)" }}>
                      {empresa.nome}
                    </h2>
                    <p className="text-sm font-mono opacity-70 mb-4">{empresa.cnpj}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {empresa.setores?.map((setor, index) => (
                        <span key={index}
                          className="text-xs font-medium px-2.5 py-1 rounded-md"
                          style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground)" }}>
                          {setor}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                      <button
                        onClick={() => startEdit(empresa)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                        style={{ color: "var(--primary)", backgroundColor: "var(--surface-elevated)" }}
                      >
                        <Pencil size={14} /> Editar
                      </button>
                      <button
                        onClick={() => handleDelete(empresa.id, empresa.nome)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                        style={{ color: "var(--status-cancelled)", backgroundColor: "var(--surface-elevated)" }}
                      >
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  </>
                )}
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
