"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ROLE } from "@prisma/client"
import toast from "react-hot-toast"

interface Admin {
  id: string
  name: string
  email: string
  cpf: string
  role: string
  setor: string | null
  Empresa: { id: string; nome: string } | null
}

interface Empresa {
  id: string
  nome: string
}

export default function GodAdminsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", cpf: "", setor: "", empresaId: "" })

  const [novoNome, setNovoNome] = useState("")
  const [novoEmail, setNovoEmail] = useState("")
  const [novoCpf, setNovoCpf] = useState("")
  const [novoSetor, setNovoSetor] = useState("")
  const [novaEmpresaId, setNovaEmpresaId] = useState("")
  const [criando, setCriando] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    const role = session?.user?.role as ROLE | undefined
    if (role !== "GOD") router.replace("/dashboard")
  }, [status, session, router])

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/users/admins")
      const data = await res.json()
      setAdmins(data)
    } catch {
      toast.error("Erro ao carregar administradores")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAdmins() }, [fetchAdmins])

  useEffect(() => {
    fetch("/api/empresa")
      .then(r => r.json())
      .then(data => setEmpresas(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  function startEdit(admin: Admin) {
    setEditingId(admin.id)
    setEditForm({
      name: admin.name,
      email: admin.email,
      cpf: admin.cpf,
      setor: admin.setor || "",
      empresaId: admin.Empresa?.id || "",
    })
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(id: string) {
    try {
      const res = await fetch("/api/users/admins", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editForm }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Erro ao atualizar")
        return
      }
      toast.success("Administrador atualizado")
      setEditingId(null)
      fetchAdmins()
    } catch {
      toast.error("Erro ao conectar com o servidor")
    }
  }

  async function removerAdmin(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja remover "${nome}"?`)) return
    try {
      const res = await fetch(`/api/users/admins?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Erro ao remover")
        return
      }
      toast.success("Administrador removido")
      fetchAdmins()
    } catch {
      toast.error("Erro ao conectar com o servidor")
    }
  }

  async function criarAdmin(e: React.FormEvent) {
    e.preventDefault()
    if (!novaEmpresaId) {
      toast.error("Selecione uma empresa")
      return
    }
    setCriando(true)
    try {
      const formData = new FormData()
      formData.append("name", novoNome)
      formData.append("email", novoEmail)
      formData.append("cpf", novoCpf.replace(/\D/g, ""))
      formData.append("password", "admin123")
      formData.append("role", "X1X")
      formData.append("setor", novoSetor || "admin")
      formData.append("empresaId", novaEmpresaId)

      const res = await fetch("/api/users", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Erro ao criar")
        return
      }
      toast.success("Administrador criado com sucesso")
      setNovoNome("")
      setNovoEmail("")
      setNovoCpf("")
      setNovoSetor("")
      setNovaEmpresaId("")
      fetchAdmins()
    } catch {
      toast.error("Erro ao conectar com o servidor")
    } finally {
      setCriando(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--primary)" }}>Administradores</h1>
        <p className="text-sm opacity-70 mt-1">Gerencie todos os administradores do sistema</p>
      </div>

      <div className="rounded-2xl border p-6 mb-8" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface)" }}>
        <h2 className="text-lg font-semibold mb-4">Criar Novo Administrador</h2>
        <form onSubmit={criarAdmin} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <input placeholder="Nome" value={novoNome} onChange={e => setNovoNome(e.target.value)} required
            className="px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--primary)]"
            style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }} />
          <input placeholder="Email" type="email" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} required
            className="px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--primary)]"
            style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }} />
          <input placeholder="CPF" value={novoCpf} onChange={e => setNovoCpf(e.target.value)} required
            className="px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--primary)]"
            style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }} />
          <input placeholder="Setor" value={novoSetor} onChange={e => setNovoSetor(e.target.value)}
            className="px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--primary)]"
            style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }} />
          <select value={novaEmpresaId} onChange={e => setNovaEmpresaId(e.target.value)} required
            className="px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-[var(--primary)]"
            style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}>
            <option value="">Selecione a empresa</option>
            {empresas.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.nome}</option>
            ))}
          </select>
          <button type="submit" disabled={criando}
            className="px-6 py-2.5 rounded-xl text-white font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: "var(--primary)" }}>
            {criando ? "Criando..." : "Criar Admin"}
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-sm opacity-50">Carregando...</p>
      ) : admins.length === 0 ? (
        <p className="text-sm opacity-50">Nenhum administrador encontrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--border-subtle)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left opacity-60 text-xs uppercase tracking-wider" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <th className="p-4 font-semibold">Nome</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">CPF</th>
                <th className="p-4 font-semibold">Setor</th>
                <th className="p-4 font-semibold">Empresa</th>
                <th className="p-4 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => (
                <tr key={admin.id} className="transition-colors hover:opacity-80" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  {editingId === admin.id ? (
                    <>
                      <td className="p-4">
                        <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm"
                          style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }} />
                      </td>
                      <td className="p-4">
                        <input value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm"
                          style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }} />
                      </td>
                      <td className="p-4">
                        <input value={editForm.cpf} onChange={e => setEditForm(p => ({ ...p, cpf: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm"
                          style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }} />
                      </td>
                      <td className="p-4">
                        <input value={editForm.setor} onChange={e => setEditForm(p => ({ ...p, setor: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm"
                          style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }} />
                      </td>
                      <td className="p-4">
                        <select value={editForm.empresaId} onChange={e => setEditForm(p => ({ ...p, empresaId: e.target.value }))}
                          className="w-full px-3 py-1.5 rounded-lg border outline-none text-sm"
                          style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}>
                          {empresas.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.nome}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(admin.id)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                            style={{ backgroundColor: "var(--primary)", color: "#fff" }}>
                            Salvar
                          </button>
                          <button onClick={cancelEdit}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                            style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground)" }}>
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 font-medium">{admin.name}</td>
                      <td className="p-4 opacity-70">{admin.email}</td>
                      <td className="p-4 opacity-70">{admin.cpf}</td>
                      <td className="p-4 opacity-70">{admin.role === 'ADMIN' && !admin.setor ? 'all' : admin.setor || "—"}</td>
                      <td className="p-4 opacity-70">{admin.Empresa?.nome || "—"}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(admin)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                            style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground)" }}>
                            Editar
                          </button>
                          <button onClick={() => removerAdmin(admin.id, admin.name)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                            style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                            Remover
                          </button>
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
  )
}
