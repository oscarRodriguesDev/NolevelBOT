"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { ROLE } from "@prisma/client"
import usuarios from "../../../../public/users/usuarios.png"
import { useHeader } from "../layout"
import toast from "react-hot-toast"
import { rolesQuePodeCriar, roleParaDisplay, VIEW_USERS_ROLES } from "@/lib/rbac"

interface Empresa {
  id: string
  nome: string
  setores: string[]
}

interface UserListItem {
  id: string
  name: string
  email: string
  cpf: string
  role: ROLE
  setor: string
  empresaId: string
  avatarUrl: string | null
  createdAt: string
}

const roleMap: Record<string, ROLE> = {
  "XX!": "GOD",
  "X1X": "ADMIN",
  "1XX": "GESTOR",
  "X11": "ATENDENTE",
}

function roleBackToFront(role: ROLE): string {
  const inv: Record<string, string> = {
    GOD: "XX!",
    ADMIN: "X1X",
    GESTOR: "1XX",
    ATENDENTE: "X11",
  }
  return inv[role]
}

export default function CriarUsuarioPage() {
  const { data: session } = useSession()
  const userRole = (session?.user?.role as ROLE) || null

  const [form, setForm] = useState({
    name: "",
    email: "",
    cpf: "",
    password: "",
    role: "",
    setor: "",
    empresaId: "",
    avatarFile: null as File | null,
  })

  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [setoresDisponiveis, setSetoresDisponiveis] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingDados, setLoadingDados] = useState(true)

  const [userList, setUserList] = useState<UserListItem[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const { setHeader } = useHeader()

  useEffect(() => {
    setHeader({
      titulo: 'Criar Novo Usuário',
      descricao: 'Preencha os dados para registrar um novo usuário no sistema',
    })
  }, [setHeader])

  async function fetchUsers() {
    if (!userRole) return
    const viewConfig = VIEW_USERS_ROLES[userRole]
    if (!viewConfig || viewConfig.roles.length === 0) return

    setLoadingUsers(true)
    try {
      const res = await fetch("/api/users")
      if (res.ok) {
        const data = await res.json()
        setUserList(data)
      }
    } catch (error) {
      console.error("Erro ao buscar usuários", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    async function fetchDados() {
      try {
        setLoadingDados(true)

        const [empresaRes, usersRes] = await Promise.all([
          fetch("/api/empresa"),
          userRole ? fetch("/api/users") : Promise.resolve(null),
        ])

        const data = await empresaRes.json()

        if (userRole === "GOD" && Array.isArray(data)) {
          setEmpresas(data)
          if (data.length > 0) {
            setForm(prev => ({ ...prev, empresaId: data[0].id }))
            setSetoresDisponiveis(data[0].setores || [])
          }
        } else if (!Array.isArray(data) && data.setores) {
          setSetoresDisponiveis(data.setores)
        } else if (Array.isArray(data) && data.length > 0) {
          setSetoresDisponiveis(data[0].setores || [])
        }

        if (usersRes && usersRes.ok) {
          const userData = await usersRes.json()
          setUserList(userData)
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoadingDados(false)
      }
    }

    fetchDados()
  }, [userRole])

  function handleEmpresaChange(empresaId: string) {
    setForm(prev => ({ ...prev, empresaId, setor: "" }))
    const emp = empresas.find(e => e.id === empresaId)
    setSetoresDisponiveis(emp?.setores || [])
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    if (name === "empresaId") {
      handleEmpresaChange(value)
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null
    setForm((prev) => ({ ...prev, avatarFile: file }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("email", form.email)
      formData.append("cpf", form.cpf)
      formData.append("password", form.password)
      formData.append("role", form.role)
      formData.append("setor", form.setor)

      if (userRole === "GOD" && form.empresaId) {
        formData.append("empresaId", form.empresaId)
      }

      if (form.avatarFile) {
        formData.append("avatar", form.avatarFile)
      }

      const response = await fetch("/api/users", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast.success("Usuário criado com sucesso!")
        setForm({
          name: "", email: "", cpf: "", password: "",
          role: "", setor: "", empresaId: userRole === "GOD" ? form.empresaId : "",
          avatarFile: null,
        })
        fetchUsers()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Erro ao criar usuário")
      }
    } catch (error) {
      toast.error("Erro ao conectar com o servidor.")
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteUser(userId: string, userName: string) {
    if (!confirm(`Tem certeza que deseja remover "${userName}"?`)) return

    try {
      const res = await fetch(`/api/users?id=${userId}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Erro ao remover")
        return
      }
      toast.success("Usuário removido com sucesso")
      fetchUsers()
    } catch {
      toast.error("Erro ao remover usuário")
    }
  }

  const rolesPermitidas = userRole ? rolesQuePodeCriar(userRole) : []
  const podeVerLista = userRole ? VIEW_USERS_ROLES[userRole]?.roles.length > 0 : false

  return (
    <div
      className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div
            className="rounded-2xl border shadow-lg p-6 sm:p-8 flex items-center justify-center min-h-96 lg:min-h-full transition-colors duration-300"
            style={{
              backgroundColor: "var(--surface-elevated)",
              borderColor: "var(--border-subtle)",
              border: "2px solid var(--border-subtle)",
              backgroundImage: `url(${usuarios.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />

          <div
            className="rounded-2xl border shadow-lg p-6 sm:p-8 transition-colors duration-300"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {userRole === "GOD" && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Empresa</label>
                  <select
                    name="empresaId"
                    value={form.empresaId}
                    onChange={handleChange}
                    required
                    disabled={loadingDados || empresas.length === 0}
                    className="w-full px-4 py-3 border rounded-lg outline-none disabled:opacity-50"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-elevated)",
                      color: "var(--foreground)",
                    }}
                  >
                    <option value="">
                      {loadingDados ? "Carregando..." : "Selecione a empresa"}
                    </option>
                    {empresas.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.nome}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2">Nome Completo</label>
                <input
                  name="name"
                  placeholder="Digite o nome"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-elevated)",
                    color: "var(--foreground)",
                    "--tw-ring-color": "var(--primary)",
                  } as never}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="exemplo@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-elevated)",
                      color: "var(--foreground)",
                    } as never}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">CPF</label>
                  <input
                    name="cpf"
                    placeholder="000.000.000-00"
                    value={form.cpf}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-elevated)",
                      color: "var(--foreground)",
                    } as never}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Senha</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Digite uma senha"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg outline-none"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-elevated)",
                    color: "var(--foreground)",
                  } as never}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Papel</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-elevated)",
                      color: "var(--foreground)",
                    } as never}
                  >
                    <option value="">Selecione um papel</option>
                    {rolesPermitidas.map(role => (
                      <option key={role} value={roleBackToFront(role)}>
                        {roleParaDisplay(role)}
                      </option>
                    ))}
                  </select>
                  {rolesPermitidas.length === 0 && userRole && (
                    <p className="text-xs mt-1 opacity-60">Seu perfil não permite criar usuários</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Setor</label>
                  <select
                    name="setor"
                    value={form.setor}
                    onChange={handleChange}
                    required
                    disabled={loadingDados}
                    className="w-full px-4 py-3 border rounded-lg outline-none disabled:opacity-50"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-elevated)",
                      color: "var(--foreground)",
                    } as never}
                  >
                    <option value="">
                      {loadingDados ? "Carregando setores..." : "Selecione o setor"}
                    </option>
                    {setoresDisponiveis.map((setor, index) => (
                      <option key={index} value={setor}>
                        {setor}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                className="border rounded-lg p-4"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-elevated)",
                }}
              >
                <label className="block text-sm font-semibold mb-3">Foto de Perfil (Opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading || rolesPermitidas.length === 0}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {loading ? "Criando usuário..." : "Criar Usuário"}
              </button>
            </form>
          </div>
        </div>

        {podeVerLista && (
          <div
            className="mt-8 rounded-2xl shadow-lg border p-6 sm:p-8 transition-colors duration-300"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <h3 className="text-lg font-semibold mb-4">Usuários Cadastrados</h3>

            {loadingUsers ? (
              <p className="text-sm opacity-60">Carregando...</p>
            ) : userList.length === 0 ? (
              <p className="text-sm opacity-60">Nenhum usuário cadastrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead
                    style={{
                      borderBottom: "2px solid var(--border-subtle)",
                    }}
                  >
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Nome</th>
                      <th className="px-4 py-3 text-left font-semibold">Email</th>
                      <th className="px-4 py-3 text-left font-semibold">CPF</th>
                      <th className="px-4 py-3 text-left font-semibold">Papel</th>
                      <th className="px-4 py-3 text-left font-semibold">Setor</th>
                      {userRole === "GOD" && <th className="px-4 py-3 text-left font-semibold">Empresa ID</th>}
                      <th className="px-4 py-3 text-center font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList.map((u, idx) => (
                      <tr
                        key={u.id}
                        style={{
                          borderBottom: "1px solid var(--border-subtle)",
                          backgroundColor: idx % 2 === 0 ? "transparent" : "var(--surface-elevated)",
                        }}
                      >
                        <td className="px-4 py-3 font-medium">{u.name}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">{u.cpf}</td>
                        <td className="px-4 py-3">{roleParaDisplay(u.role)}</td>
                        <td className="px-4 py-3">{u.setor}</td>
                        {userRole === "GOD" && <td className="px-4 py-3 text-xs font-mono">{u.empresaId.slice(0, 8)}</td>}
                        <td className="px-4 py-3 text-center">
                          {u.role !== "GOD" && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                              style={{
                                color: "#fff",
                                backgroundColor: "var(--status-cancelled)",
                              }}
                            >
                              Excluir
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
        )}
      </div>
    </div>
  )
}
