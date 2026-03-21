"use client"

import { useState } from "react"

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

  const [loading, setLoading] = useState(false)

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

      console.log(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Criar Usuário</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Nome"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="cpf"
          placeholder="CPF"
          value={form.cpf}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="password"
          type="password"
          placeholder="Senha"
          value={form.password}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="">Selecione o papel</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">Usuário</option>
        </select>

        <input
          name="setor"
          placeholder="Setor"
          value={form.setor}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <div className="w-full border p-4 rounded">
          <label className="block mb-2 text-sm font-medium">
            Foto de perfil
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />

          {form.avatarFile && (
            <p className="text-sm mt-2">
              {form.avatarFile.name}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? "Criando..." : "Criar usuário"}
        </button>
      </form>
    </div>
  )
}