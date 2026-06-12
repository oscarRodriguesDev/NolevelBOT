"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ROLE } from "@prisma/client"
import toast from "react-hot-toast"

interface Empresa {
  id: string
  nome: string
}

interface Usuario {
  id: string
  name: string
  email: string
  cpf: string
  role: string
  setor: string | null
  avatarUrl: string | null
  empresaId: string | null
  createdAt: string
  Empresa: { nome: string } | null
}

const ROLE_LABEL: Record<string, string> = {
  GOD: "GOD",
  ADMIN: "Admin",
  GESTOR: "Gestor",
  ATENDENTE: "Atendente",
}

export default function GodUsuariosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEmpresa, setFiltroEmpresa] = useState("")
  const [filtroRole, setFiltroRole] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (status === "loading") return
    const role = session?.user?.role as ROLE | undefined
    if (role !== "GOD") {
      router.replace("/dashboard")
    }
  }, [status, session, router])

  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filtroEmpresa) params.set("empresaId", filtroEmpresa)
      if (filtroRole) params.set("role", filtroRole)
      const res = await fetch(`/api/users?${params.toString()}`)
      const data = await res.json()
      setUsuarios(data)
    } catch {
      toast.error("Erro ao carregar usuários")
    } finally {
      setLoading(false)
    }
  }, [filtroEmpresa, filtroRole])

  useEffect(() => {
    fetchUsuarios()
  }, [fetchUsuarios])

  useEffect(() => {
    fetch("/api/empresa")
      .then(r => r.json())
      .then(data => setEmpresas(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  async function deletarUsuario(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja remover "${nome}"?`)) return
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Erro ao remover")
        return
      }
      toast.success("Usuário removido")
      fetchUsuarios()
    } catch {
      toast.error("Erro ao conectar com o servidor")
    }
  }

  const filtrados = usuarios.filter(u => {
    if (!search) return true
    const termo = search.toLowerCase()
    return (
      u.name.toLowerCase().includes(termo) ||
      u.email.toLowerCase().includes(termo) ||
      (u.cpf && u.cpf.includes(termo))
    )
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--primary)" }}>Usuários</h1>
        <p className="text-sm opacity-70 mt-1">Todos os usuários de todas as empresas</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          placeholder="Buscar por nome, email ou CPF..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
        />
        <select
          value={filtroEmpresa}
          onChange={e => setFiltroEmpresa(e.target.value)}
          className="px-4 py-2.5 rounded-xl border outline-none"
          style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
        >
          <option value="">Todas as empresas</option>
          {empresas.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.nome}</option>
          ))}
        </select>
        <select
          value={filtroRole}
          onChange={e => setFiltroRole(e.target.value)}
          className="px-4 py-2.5 rounded-xl border outline-none"
          style={{ backgroundColor: "var(--surface-elevated)", borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
        >
          <option value="">Todos os cargos</option>
          {Object.entries(ROLE_LABEL).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm opacity-50">Carregando...</p>
      ) : filtrados.length === 0 ? (
        <p className="text-sm opacity-50">Nenhum usuário encontrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--border-subtle)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left opacity-60 text-xs uppercase tracking-wider" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <th className="p-4 font-semibold">Nome</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">CPF</th>
                <th className="p-4 font-semibold">Cargo</th>
                <th className="p-4 font-semibold">Setor</th>
                <th className="p-4 font-semibold">Empresa</th>
                <th className="p-4 font-semibold">Criado em</th>
                <th className="p-4 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(u => (
                <tr key={u.id} className="transition-colors hover:opacity-80" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4 opacity-70">{u.email}</td>
                  <td className="p-4 opacity-70">{u.cpf}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{
                      backgroundColor: u.role === "GOD" ? "var(--primary)" : "var(--surface-elevated)",
                      color: u.role === "GOD" ? "#fff" : "var(--foreground)",
                    }}>
                      {ROLE_LABEL[u.role] || u.role}
                    </span>
                  </td>
                  <td className="p-4 opacity-70">{u.role === 'ADMIN' && !u.setor ? 'all' : u.setor || "—"}</td>
                  <td className="p-4 opacity-70">{u.Empresa?.nome || "—"}</td>
                  <td className="p-4 opacity-70">{new Date(u.createdAt).toLocaleDateString("pt-BR")}</td>
                  <td className="p-4">
                    {u.role !== "GOD" && (
                      <button
                        onClick={() => deletarUsuario(u.id, u.name)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                        style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground)" }}
                      >
                        Remover
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
