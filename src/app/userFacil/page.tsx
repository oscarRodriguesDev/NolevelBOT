"use client"

import { useState } from "react"

export default function CreateUserFacil() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [cpf, setCpf] = useState("")
  const [password, setPassword] = useState("")
  const [setor, setSetor] = useState("")
  const [role, setRole] = useState("X11")
  const [avatar, setAvatar] = useState<File | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const formData = new FormData()
    formData.append("name", name)
    formData.append("email", email)
    formData.append("cpf", cpf)
    formData.append("password", password)
    formData.append("setor", setor)
    formData.append("role", role)
    if (avatar) formData.append("avatar", avatar)

    await fetch("/api/userFacil", {
      method: "POST",
      body: formData,
    })

    setName("")
    setEmail("")
    setCpf("")
    setPassword("")
    setSetor("")
    setRole("X11")
    setAvatar(null)
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-lg font-semibold">Criar usuário</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} className="w-full border p-2 rounded" />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-2 rounded" />
        <input placeholder="CPF" value={cpf} onChange={e => setCpf(e.target.value)} className="w-full border p-2 rounded" />
        <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-2 rounded" />
        <input placeholder="Setor" value={setor} onChange={e => setSetor(e.target.value)} className="w-full border p-2 rounded" />

        <select value={role} onChange={e => setRole(e.target.value)} className="w-full border p-2 rounded">
          <option value="XX!">GOD</option>
          <option value="X1X">ADMIN</option>
          <option value="1XX">GESTOR</option>
          <option value="X11">ATENDENTE</option>
        </select>

        <input type="file" onChange={e => setAvatar(e.target.files?.[0] || null)} />

        <button type="submit" className="w-full bg-black text-white p-2 rounded">
          Criar
        </button>
      </form>
    </div>
  )
}