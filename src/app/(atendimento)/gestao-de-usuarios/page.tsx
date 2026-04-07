"use client"

import { useEffect, useState } from "react"
import usuarios from "../../../../public/users/usuarios.png"
import { useHeader } from "../layout"

// Interface para tipar os dados da empresa vindos da API
interface Empresa {
  id: string
  nome: string
  cnpj: string
  setores: string[] // Ajuste para string[] ou objeto conforme seu Prisma
}

export default function CriarUsuarioPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    cpf: "",
    password: "",
    role: "",
    setor: "",
    avatarFile: null as File | null,
  })

  const [setoresDisponiveis, setSetoresDisponiveis] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSetores, setLoadingSetores] = useState(true)

  const { setHeader } = useHeader()

  // 1. useEffect para o Header
  useEffect(() => {
    setHeader({
      titulo: 'Criar Novo Usuário',
      descricao: 'Preencha os dados para registrar um novo usuário no sistema',
    })
  }, [setHeader])

  // 2. useEffect para buscar os setores da API
  useEffect(() => {
    async function fetchSetores() {
      try {
        setLoadingSetores(true)
        const response = await fetch("/api/empresa")
        const data = await response.json()

        if (Array.isArray(data) && data.length > 0) {
          // Se retornar array, pegamos os setores da primeira empresa
          // Se você tiver o CNPJ em mãos, pode usar fetch(`/api/empresas?cnpj=${cnpj}`)
          setSetoresDisponiveis(data[0].setores || [])
        } else if (data.setores) {
          setSetoresDisponiveis(data.setores)
        }
      } catch (error) {
        console.error("Erro ao carregar setores:", error)
      } finally {
        setLoadingSetores(false)
      }
    }

    fetchSetores()
  }, [])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
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

      if (form.avatarFile) {
        formData.append("avatar", form.avatarFile)
      }

      const response = await fetch("/api/users", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        alert("Usuário criado com sucesso!")
        // Opcional: resetar form ou redirecionar
      } else {
        const errorData = await response.json()
        alert(`Erro: ${errorData.error}`)
      }
    } catch (error) {
      console.error(error)
      alert("Erro ao conectar com o servidor.")
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
          
          {/* Coluna Esquerda - Imagem */}
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

          {/* Coluna Direita - Formulário */}
          <div
            className="rounded-2xl border shadow-lg p-6 sm:p-8 transition-colors duration-300"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome */}
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

              {/* Email e CPF */}
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

              {/* Senha */}
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

              {/* Grid para Seletores (Papel e Setor) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Papel */}
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
                   <option value="XX!">Master</option> {/* GOD */} 
                    <option value="X1X">Admin</option> {/* ADMIN */}
                    <option value="1XX">Gestor</option> {/* GESTOR */}
                    <option value="X11">Atendente</option> {/* ATENDENTE */}
                  </select>
                </div>

                {/* Setor DINÂMICO */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Setor</label>
                  <select
                    name="setor"
                    value={form.setor}
                    onChange={handleChange}
                    required
                    disabled={loadingSetores}
                    className="w-full px-4 py-3 border rounded-lg outline-none disabled:opacity-50"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-elevated)",
                      color: "var(--foreground)",
                    } as never}
                  >
                    <option value="">
                      {loadingSetores ? "Carregando setores..." : "Selecione o setor"}
                    </option>
                    {setoresDisponiveis.map((setor, index) => (
                      <option key={index} value={setor}>
                        {setor}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Foto de Perfil */}
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

              {/* Submit Button */}
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