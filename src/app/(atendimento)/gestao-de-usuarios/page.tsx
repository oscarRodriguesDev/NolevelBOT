"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import usuarios from "../../../../public/users/usuarios.png"
import { useHeader } from "../layout"
import toast from "react-hot-toast"

interface Empresa {
  id: string
  nome: string
  setores: string[]
}

export default function CriarUsuarioPage() {
  const { data: session } = useSession()
  const isGod = session?.user?.role === "GOD"

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
    async function fetchDados() {
      try {
        setLoadingDados(true)
        const res = await fetch("/api/empresa")
        const data = await res.json()

        if (isGod && Array.isArray(data)) {
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
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setLoadingDados(false)
      }
    }

    fetchDados()
  }, [isGod])

  function handleEmpresaChange(empresaId: string) {
    setForm(prev => ({ ...prev, empresaId, setor: "" }))
    const emp = empresas.find(e => e.id === empresaId)
    setSetoresDisponiveis(emp?.setores || [])
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
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

      if (isGod && form.empresaId) {
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
          role: "", setor: "", empresaId: isGod ? form.empresaId : "",
          avatarFile: null,
        })
      } else {
        const errorData = await response.json()
        toast.error(`Erro: ${errorData.error}`)
      }
    } catch (error) {
      console.error(error)
      toast.error("Erro ao conectar com o servidor.")
    } finally {
      setLoading(false)
    }
  }

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
              {isGod && (
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
                    {isGod && <option value="XX!">Master</option>}
                    <option value="X1X">Admin</option>
                    <option value="1XX">Gestor</option>
                    <option value="X11">Atendente</option>
                  </select>
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
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                style={{
                  backgroundColor: "var(--primary)",
                }}
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
