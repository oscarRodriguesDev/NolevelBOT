'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ROLE } from '@prisma/client'
import { Pencil, Trash2, Check, X, Users } from 'lucide-react'
import { useHeader } from '../layout'
import toast from 'react-hot-toast'
import { roleParaDisplay } from '@/lib/rbac'

interface UserItem {
  id: string
  name: string
  email: string
  cpf: string
  role: ROLE
  setor: string
  empresaId: string
  avatarUrl: string | null
  Empresa?: { nome: string }
}

export default function UsuariosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const userRole = session?.user?.role as ROLE | undefined

  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const currentUserId = session?.user?.id

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', cpf: '', setor: '' })

  const { setHeader } = useHeader()

  useEffect(() => {
    if (status === 'loading') return
    if (!userRole || userRole === 'ATENDENTE') {
      router.replace('/corporativo/all-tickets')
      return
    }
  }, [status, userRole, router])

  useEffect(() => {
    setHeader({
      titulo: 'Usuários',
      descricao: userRole === 'GOD' ? 'Todos os usuários do sistema' : 'Usuários da sua empresa'
    })
  }, [userRole, setHeader])

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch { } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

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
        body: JSON.stringify({ id, ...editForm }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erro ao atualizar')
        return
      }
      toast.success('Usuário atualizado')
      cancelEdit()
      fetchUsers()
    } catch { toast.error('Erro ao conectar') }
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
      fetchUsers()
    } catch { toast.error('Erro ao conectar') }
  }

  return (
    <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-colors duration-300"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-xl text-white shadow-lg" style={{ backgroundColor: 'var(--primary)' }}>
            <Users size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Usuários do Sistema</h1>
            {!loading && <p className="text-xs opacity-50 mt-0.5">{users.length} registro(s)</p>}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
            <p className="text-sm opacity-40 mt-3 font-medium">Carregando...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-subtle)' }}>
            <Users size={40} className="mx-auto mb-3" style={{ opacity: 0.2 }} />
            <p className="text-sm font-medium opacity-40">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border shadow-lg"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-subtle)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-elevated)', borderBottom: '2px solid var(--border-subtle)' }}>
                  <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Nome</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider">CPF</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Papel</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Setor</th>
                  {userRole === 'GOD' && <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Empresa</th>}
                  <th className="px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u.id}
                    className="transition-all duration-150 hover:brightness-95"
                    style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--surface-elevated)' }}>
                    {editingId === u.id ? (
                      <>
                        <td className="px-4 py-2">
                          <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                            className="w-full px-3 py-1.5 rounded-lg border text-xs outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }} />
                        </td>
                        <td className="px-4 py-2">
                          <input value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                            className="w-full px-3 py-1.5 rounded-lg border text-xs outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }} />
                        </td>
                        <td className="px-4 py-2">
                          <input value={editForm.cpf} onChange={e => setEditForm(p => ({ ...p, cpf: e.target.value }))}
                            className="w-full px-3 py-1.5 rounded-lg border text-xs font-mono outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }} />
                        </td>
                        <td className="px-4 py-2 text-xs font-medium">{roleParaDisplay(u.role)}</td>
                        <td className="px-4 py-2">
                          <input value={editForm.setor} onChange={e => setEditForm(p => ({ ...p, setor: e.target.value }))}
                            className="w-full px-3 py-1.5 rounded-lg border text-xs outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }} />
                        </td>
                        {userRole === 'GOD' && <td className="px-4 py-2 text-xs opacity-70">{u.Empresa?.nome || u.empresaId?.slice(0, 8) || "—"}</td>}
                        <td className="px-4 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => saveEdit(u.id)} className="p-1.5 rounded-lg hover:bg-[var(--success-light)] transition-all" style={{ color: 'var(--status-completed)' }} title="Salvar"><Check size={14} /></button>
                            <button onClick={cancelEdit} className="p-1.5 rounded-lg hover:bg-[var(--error-light)] transition-all" style={{ color: 'var(--status-cancelled)' }} title="Cancelar"><X size={14} /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3.5 font-medium">{u.name}</td>
                        <td className="px-4 py-3.5 opacity-80">{u.email}</td>
                        <td className="px-4 py-3.5 font-mono text-xs opacity-70">{u.cpf}</td>
                        <td className="px-4 py-3.5">
                          <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider" style={{ backgroundColor: 'var(--surface-elevated)', color: 'var(--primary)' }}>
                            {roleParaDisplay(u.role)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">{u.setor}</td>
                        {userRole === 'GOD' && <td className="px-4 py-3.5 text-xs opacity-70">{u.Empresa?.nome || u.empresaId?.slice(0, 8) || "—"}</td>}
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {u.role !== 'GOD' && u.id !== currentUserId && (
                              <>
                                <button onClick={() => startEdit(u)} className="p-2 rounded-xl transition-all duration-150 hover:bg-[var(--info-light)]" style={{ color: 'var(--primary)' }} title="Editar">
                                  <Pencil size={14} />
                                </button>
                                <button onClick={() => handleDelete(u.id, u.name)} className="p-2 rounded-xl transition-all duration-150 hover:bg-[var(--error-light)]" style={{ color: 'var(--status-cancelled)' }} title="Excluir">
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
