'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ROLE } from '@prisma/client'
import Link from 'next/link'
import { ArrowLeft, Pencil, Trash2, Check, X, Building2 } from 'lucide-react'
import { useHeader } from '../../../layout'
import toast from 'react-hot-toast'
import { roleParaDisplay } from '@/lib/rbac'

interface UserItem {
  id: string
  name: string
  email: string
  cpf: string
  role: ROLE
  setor: string
  avatarUrl: string | null
}

export default function EmpresaUsuariosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const empresaId = params.id as string

  const [empresaNome, setEmpresaNome] = useState('')
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', cpf: '', setor: '' })

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
      titulo: 'Usuários da Empresa',
      descricao: 'Visualize e gerencie os usuários vinculados'
    })
  }, [setHeader])

  async function fetchData() {
    setLoading(true)
    try {
      const [empresaRes, usersRes] = await Promise.all([
        fetch(`/api/empresa?cpf=placeholder`),
        fetch(`/api/users?empresaId=${empresaId}`),
      ])

      const empresasRes = await fetch('/api/empresa')
      if (empresasRes.ok) {
        const todas = await empresasRes.json()
        const emp = Array.isArray(todas) ? todas.find((e: any) => e.id === empresaId) : null
        if (emp) setEmpresaNome(emp.nome)
      }

      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (empresaId) fetchData()
  }, [empresaId])

  function startEdit(user: UserItem) {
    setEditingId(user.id)
    setEditForm({ name: user.name, email: user.email, cpf: user.cpf, setor: user.setor })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({ name: '', email: '', cpf: '', setor: '' })
  }

  async function saveEdit(id: string) {
    try {
      const res = await fetch(`/api/users?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editForm, empresaId }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erro ao atualizar')
        return
      }

      toast.success('Usuário atualizado')
      cancelEdit()
      fetchData()
    } catch {
      toast.error('Erro ao conectar')
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover "${name}"?`)) return
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erro ao remover')
        return
      }
      toast.success('Usuário removido')
      fetchData()
    } catch {
      toast.error('Erro ao conectar')
    }
  }

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-colors duration-300"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="max-w-5xl mx-auto">
        <Link href="/empresa"
          className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
          style={{ color: 'var(--primary)' }}>
          <ArrowLeft size={16} /> Voltar para empresas
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-lg text-white" style={{ backgroundColor: 'var(--primary)' }}>
            <Building2 size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">{empresaNome || 'Carregando...'}</h1>
            <p className="text-xs opacity-60">ID: {empresaId?.slice(0, 8)}</p>
          </div>
        </div>

        {loading ? (
          <p className="opacity-60">Carregando usuários...</p>
        ) : users.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-subtle)' }}>
            <p className="opacity-60">Nenhum usuário nesta empresa.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border shadow-lg"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-subtle)' }}>
            <table className="w-full text-sm">
              <thead style={{ borderBottom: '2px solid var(--border-subtle)' }}>
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Nome</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">CPF</th>
                  <th className="px-4 py-3 text-left font-semibold">Papel</th>
                  <th className="px-4 py-3 text-left font-semibold">Setor</th>
                  <th className="px-4 py-3 text-center font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u.id}
                    style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--surface-elevated)' }}>
                    {editingId === u.id ? (
                      <>
                        <td className="px-4 py-2">
                          <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                            className="w-full px-2 py-1 rounded border text-xs"
                            style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }} />
                        </td>
                        <td className="px-4 py-2">
                          <input value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                            className="w-full px-2 py-1 rounded border text-xs"
                            style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }} />
                        </td>
                        <td className="px-4 py-2">
                          <input value={editForm.cpf} onChange={e => setEditForm(p => ({ ...p, cpf: e.target.value }))}
                            className="w-full px-2 py-1 rounded border text-xs font-mono"
                            style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }} />
                        </td>
                        <td className="px-4 py-2 text-xs">{roleParaDisplay(u.role)}</td>
                        <td className="px-4 py-2">
                          <input value={editForm.setor} onChange={e => setEditForm(p => ({ ...p, setor: e.target.value }))}
                            className="w-full px-2 py-1 rounded border text-xs"
                            style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }} />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => saveEdit(u.id)} className="p-1.5 rounded" style={{ color: 'var(--status-completed)' }} title="Salvar"><Check size={14} /></button>
                            <button onClick={cancelEdit} className="p-1.5 rounded" style={{ color: 'var(--status-cancelled)' }} title="Cancelar"><X size={14} /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium">{u.name}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3 font-mono text-xs">{u.cpf}</td>
                        <td className="px-4 py-3">{roleParaDisplay(u.role)}</td>
                        <td className="px-4 py-3">{u.setor}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {u.role !== 'GOD' && (
                              <>
                                <button onClick={() => startEdit(u)} className="p-1.5 rounded transition-colors hover:opacity-70" style={{ color: 'var(--primary)' }} title="Editar">
                                  <Pencil size={14} />
                                </button>
                                <button onClick={() => handleDelete(u.id, u.name)} className="p-1.5 rounded transition-colors hover:opacity-70" style={{ color: 'var(--status-cancelled)' }} title="Excluir">
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
