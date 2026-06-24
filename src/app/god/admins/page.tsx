"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { ROLE } from "@prisma/client"
import usuarios from '../../../../public/users/usuarios.png'
import { useHeader } from "../layout"
import toast from "react-hot-toast"
import { rolesQuePodeCriar, roleParaDisplay } from "@/lib/rbac"

interface Empresa {
  id: string
  nome: string
  setores: string[]
}

const roleMap: Record<string, ROLE> = {
  "XX!": "GOD",
  "X1X": "ADMIN",
  "1XX": "GESTOR",
  "X11": "ATENDENTE",
}

// Converte role do banco para codigo interno
function roleBackToFront(role: ROLE): string {
  const inv: Record<string, string> = {
    GOD: "XX!",
    ADMIN: "X1X",
    GESTOR: "1XX",
    ATENDENTE: "X11",
  }
  return inv[role]
}

// Formata CPF com mascara de digitos
function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2")
}

// Pagina de criacao de usuario pelo admin
export default function CriarUsuarioPage() {
  const { data: session } = useSession()
  const userRole = (session?.user?.role as ROLE) || null
  const userSetor = session?.user?.setor

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

  const { setHeader } = useHeader()

  useEffect(() => {
    setHeader({
      titulo: 'Criar Novo Usuário',
      descricao: 'Preencha os dados para registrar um novo usuário no sistema',
    })
  }, [setHeader])

  useEffect(() => {
    // Carrega dados de empresas e setores do servidor
    async function fetchDados() {
      try {
        setLoadingDados(true)

        const empresaRes = await fetch("/api/empresa")
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

        if (userRole === "GESTOR" && userSetor) {
          setForm(prev => ({ ...prev, setor: userSetor }))
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoadingDados(false)
      }
    }

    fetchDados()
  }, [userRole, userSetor])

  // Atualiza setores ao trocar empresa selecionada
  function handleEmpresaChange(empresaId: string) {
    setForm(prev => ({ ...prev, empresaId, setor: "" }))
    const emp = empresas.find(e => e.id === empresaId)
    setSetoresDisponiveis(emp?.setores || [])
  }

  // Lida com mudancas em todos os campos do formulario
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    if (name === "empresaId") {
      handleEmpresaChange(value)
      return
    }
    if (name === "cpf") {
      setForm((prev) => ({ ...prev, cpf: formatCPF(value) }))
      return
    }
    if (name === "role") {
      setForm((prev) => ({
        ...prev,
        role: value,
        setor: value === roleBackToFront("ADMIN") ? "" : prev.setor,
      }))
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Lida com selecao de arquivo de avatar
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null
    setForm((prev) => ({ ...prev, avatarFile: file }))
  }

  // Envia formulario de criacao de usuario para a API
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("email", form.email)
      formData.append("cpf", form.cpf.replace(/\D/g, ""))
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

  const rolesPermitidas = userRole ? rolesQuePodeCriar(userRole) : []

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
            className="rounded-2xl border shadow-lg p-6 sm:p-8"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Novo Usuário</h3>
              <p className="text-xs opacity-50 mt-0.5">Preencha os dados para registrar</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {userRole === "GOD" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Empresa</label>
                  <select
                    name="empresaId"
                    value={form.empresaId}
                    onChange={handleChange}
                    required
                    disabled={loadingDados || empresas.length === 0}
                    className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent disabled:opacity-50"
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
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Nome Completo</label>
                <input
                  name="name"
                  placeholder="Digite o nome"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-elevated)",
                    color: "var(--foreground)",
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="exemplo@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-elevated)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-70">CPF</label>
                  <input
                    name="cpf"
                    placeholder="000.000.000-00"
                    value={form.cpf}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent font-mono"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-elevated)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Senha</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Digite uma senha"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-elevated)",
                    color: "var(--foreground)",
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Papel</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)]"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-elevated)",
                      color: "var(--foreground)",
                    }}
                  >
                    <option value="">Selecione um papel</option>
                    {rolesPermitidas.map(role => (
                      <option key={role} value={roleBackToFront(role)}>
                        {roleParaDisplay(role)}
                      </option>
                    ))}
                  </select>
                  {rolesPermitidas.length === 0 && userRole && (
                    <p className="text-xs mt-1.5 opacity-50">Seu perfil não permite criar usuários</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Setor</label>
                  {userRole === "GESTOR" ? (
                    <div>
                      <input
                        value={form.setor}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border outline-none font-medium cursor-not-allowed opacity-60"
                        style={{
                          borderColor: "var(--border-subtle)",
                          backgroundColor: "var(--surface-elevated)",
                          color: "var(--foreground)",
                        }}
                      />
                      <p className="text-[10px] mt-1.5 opacity-50">Setor definido automaticamente</p>
                    </div>
                  ) : form.role === roleBackToFront("ADMIN") ? (
                    <div>
                      <input
                        value="Todos os setores"
                        disabled
                        className="w-full px-4 py-3 rounded-xl border outline-none font-medium cursor-not-allowed opacity-60"
                        style={{
                          borderColor: "var(--border-subtle)",
                          backgroundColor: "var(--surface-elevated)",
                          color: "var(--foreground)",
                        }}
                      />
                      <p className="text-[10px] mt-1.5 opacity-50">Administrador tem acesso a todos os setores</p>
                    </div>
                  ) : (
                    <select
                      name="setor"
                      value={form.setor}
                      onChange={handleChange}
                      required
                      disabled={loadingDados}
                      className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50"
                      style={{
                        borderColor: "var(--border-subtle)",
                        backgroundColor: "var(--surface-elevated)",
                        color: "var(--foreground)",
                      }}
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
                  )}
                </div>
              </div>

              <div
                className="rounded-xl border border-dashed p-4 transition-all hover:brightness-95"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-elevated)",
                }}
              >
                <label className="block text-xs font-bold uppercase tracking-wider mb-3 opacity-70">Foto de Perfil</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:text-white file:bg-[var(--primary)] hover:file:brightness-110"
                />
              </div>

              <button
                type="submit"
                disabled={loading || rolesPermitidas.length === 0}
                className="w-full py-3.5 rounded-xl font-bold text-white transition-all duration-200 hover:brightness-110 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {loading ? "Criando usuário..." : "Criar Usuário"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
