"use client"

import { useState, useEffect } from "react"

interface Empresa {
  id: string
  nome: string
  cnpj: string
}

export default function CreateUserFacil() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [cpf, setCpf] = useState("")
  const [password, setPassword] = useState("")
  const [setor, setSetor] = useState("")
  const [role, setRole] = useState("X11")
  const [avatar, setAvatar] = useState<File | null>(null)
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [empresaId, setEmpresaId] = useState("")
  const [loadingEmpresas, setLoadingEmpresas] = useState(true)

  useEffect(() => {
    async function fetchEmpresas() {
      try {
        const response = await fetch("/api/userFacil")
        if (response.ok) {
          const data = await response.json()
          setEmpresas(data)
          if (data.length > 0) {
            setEmpresaId(data[0].id)
          }
        }
      } catch (error) {
        console.error("Erro ao carregar empresas:", error)
      } finally {
        setLoadingEmpresas(false)
      }
    }
    fetchEmpresas()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      alert("Nome é obrigatório")
      return
    }
    if (!email.trim()) {
      alert("Email é obrigatório")
      return
    }
    if (!cpf.trim()) {
      alert("CPF é obrigatório")
      return
    }
    if (!password.trim()) {
      alert("Senha é obrigatória")
      return
    }
    if (!setor.trim()) {
      alert("Setor é obrigatório")
      return
    }
    if (!empresaId) {
      alert("Empresa é obrigatória")
      return
    }

    const formData = new FormData()
    formData.append("name", name)
    formData.append("email", email)
    formData.append("cpf", cpf)
    formData.append("password", password)
    formData.append("setor", setor)
    formData.append("role", role)
    formData.append("empresaId", empresaId)

    if (avatar) formData.append("avatar", avatar)

    try {
      const response = await fetch("/api/userFacil", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || "Erro ao criar usuário")
      }
      setName("")
      setEmail("")
      setCpf("")
      setPassword("")
      setSetor("")
      setRole("X11")
      setAvatar(null)

    } catch (error) {
      alert(
        "Erro ao criar usuário: " +
          (error instanceof Error ? error.message : "Erro desconhecido")
      )
    }
  }


  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-lg font-semibold">Criar usuário</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="Setor"
          value={setor}
          onChange={(e) => setSetor(e.target.value)}
          className="w-full border p-2 rounded"
        />

        {loadingEmpresas ? (
          <select disabled className="w-full border p-2 rounded">
            <option>Carregando empresas...</option>
          </select>
        ) : (
          <select
            value={empresaId}
            onChange={(e) => setEmpresaId(e.target.value)}
            className="w-full border p-2 rounded"
          >
            {empresas.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nome} - {emp.cnpj}
              </option>
            ))}
          </select>
        )}

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="XX!">GOD</option>
          <option value="X1X">ADMIN</option>
          <option value="1XX">GESTOR</option>
          <option value="X11">ATENDENTE</option>
        </select>

        <input
          type="file"
          onChange={(e) => setAvatar(e.target.files?.[0] || null)}
        />

        <button type="submit" className="w-full bg-black text-white p-2 rounded">
          Criar
        </button>
      </form>
    </div>
  )
}