"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import usuarios from "../../../../public/users/usuarios.png"
import { useHeader } from "../layout"

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

  function resetForm() {
    setForm({
      name: "",
       email: "", 
       cpf: "", 
       password: "", 
       role: "",
        setor: "", 
        avatarFile: null as File | null,
    })
  }

  const [loading, setLoading] = useState(false)


  const { setHeader } = useHeader()

  useEffect(() => {
    setHeader({
      titulo: 'Criar Novo Usuário',
      descricao: 'Preencha os dados para registrar um novo usuário no sistema',
    })
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

      const data = await response.json()
      if(response.ok) {
        resetForm()
        alert("Usuário criado com sucesso!")
      }

      console.log(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }


  const ROLES = [
    { value: "GOD", label: "System Admin" },
    { value: "ADMIN", label: "Administrador" },
    { value: "GESTOR", label: "Gestor" },
    { value: "ATENDENTE", label: "Atendente" },
  ]

  return (
    <div
      className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="max-w-6xl mx-auto">


        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Image Area */}
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
          >

          </div>

          {/* Right Column - Form */}
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

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={form.email}
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

              {/* CPF */}
              <div>
                <label className="block text-sm font-semibold mb-2">CPF</label>
                <input
                  name="cpf"
                  placeholder="00000000000"
                  value={form.cpf}
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

              {/* Senha */}
              <div>
                <label className="block text-sm font-semibold mb-2">Senha</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Digite uma senha segura"
                  value={form.password}
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

              {/* Papel / Role */}
              {/* Papel / Role */}
              <div>
                <label className="block text-sm font-semibold mb-2">Papel</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                  style={{
                    borderColor: "var(--border-subtle)",
                    backgroundColor: "var(--surface-elevated)",
                    color: "var(--foreground)",
                    "--tw-ring-color": "var(--primary)",
                  } as never}
                >
                  <option value="">Selecione um papel</option>
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Setor */}
              <div>
                <label className="block text-sm font-semibold mb-2">Setor</label>
                <input
                  name="setor"
                  placeholder="Digite o setor"
                  value={form.setor}
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

              {/* Foto de Perfil */}
              <div
                className="border rounded-lg p-4 transition-colors duration-300"
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
                  style={{
                    color: "var(--foreground)",
                  }}
                />
                {form.avatarFile && (
                  <p className="text-xs mt-3 opacity-70">
                    ✓ {form.avatarFile.name}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  backgroundColor: "var(--primary)",
                }}
                onMouseEnter={(e) => {
                  if (e.currentTarget instanceof HTMLElement && !loading) {
                    e.currentTarget.style.backgroundColor = "var(--primary-hover)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.style.backgroundColor = "var(--primary)";
                  }
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
