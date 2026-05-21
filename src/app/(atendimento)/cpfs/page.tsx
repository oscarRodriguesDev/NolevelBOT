"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useHeader } from "../layout"
import { FaTrash, FaEdit } from "react-icons/fa"
import toast from "react-hot-toast"

interface Admin {
  id: string
  name: string
  email: string
  cpf: string
  role: string
  setor: string
  Empresa: { id: string; nome: string } | null
}

export default function CadastroCPFs() {
  const { data: session } = useSession()
  const isGod = session?.user?.role === "GOD"

  const [nome, setNome] = useState("")
  const [cpf, setCpf] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [cpfs, setCpfs] = useState<{ id: string; nome: string; cpf: string }[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const [admins, setAdmins] = useState<Admin[]>([])
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", cpf: "", setor: "" })

  const { setHeader } = useHeader()

  async function fetchCpfs() {
    try {
      const res = await fetch("/api/cpfs")
      const data = await res.json()
      setCpfs(data)
    } catch (error) {
      console.error("Erro ao buscar CPFs", error)
    }
  }

  async function fetchAdmins() {
    if (!isGod) return
    try {
      const res = await fetch("/api/users/admins")
      if (res.ok) {
        const data = await res.json()
        setAdmins(data)
      }
    } catch (error) {
      console.error("Erro ao buscar admins", error)
    }
  }

  useEffect(() => {
    setHeader({
      titulo: 'Cadastro de CPFs',
      descricao: 'Gerencie e importe CPFs autorizados'
    })
    fetchCpfs()
  }, [])

  useEffect(() => {
    if (isGod) fetchAdmins()
  }, [isGod])

  async function handleDelete(cpfToDelete: string) {
    try {
      const res = await fetch("/api/cpfs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: cpfToDelete }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Erro ao deletar")
        return
      }

      setCpfs(prev => prev.filter(item => item.cpf !== cpfToDelete))
      toast.success("CPF deletado com sucesso")
    } catch {
      toast.error("Erro ao deletar CPF")
    }
  }

  async function cadastrarManual(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch("/api/cpfs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cpf })
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Erro ao cadastrar")
        return
      }

      toast.success("CPF cadastrado com sucesso")
      setNome("")
      setCpf("")
      fetchCpfs()
    } catch {
      toast.error("Erro ao conectar com o servidor")
    }
  }

  async function enviarArquivo(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      toast.error("Selecione um arquivo")
      return
    }

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/cpfs", {
        method: "POST",
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Erro ao importar")
        return
      }

      toast.success(`Arquivo importado com sucesso (${data.inseridos ?? 0} registros)`)
      setFile(null)
      fetchCpfs()
    } catch {
      toast.error("Erro ao conectar com o servidor")
    }
  }

  async function handleDeleteAdmin(adminId: string, adminName: string) {
    if (!confirm(`Tem certeza que deseja remover o admin "${adminName}"?`)) return

    try {
      const res = await fetch(`/api/users/admins?id=${adminId}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Erro ao remover admin")
        return
      }
      toast.success("Administrador removido com sucesso")
      fetchAdmins()
    } catch {
      toast.error("Erro ao remover administrador")
    }
  }

  function openEditAdmin(admin: Admin) {
    setEditingAdmin(admin)
    setEditForm({
      name: admin.name,
      email: admin.email,
      cpf: admin.cpf,
      setor: admin.setor,
    })
  }

  async function saveEditAdmin() {
    if (!editingAdmin) return

    try {
      const res = await fetch("/api/users/admins", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingAdmin.id,
          name: editForm.name,
          email: editForm.email,
          cpf: editForm.cpf,
          setor: editForm.setor,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Erro ao atualizar")
        return
      }

      toast.success("Administrador atualizado com sucesso")
      setEditingAdmin(null)
      fetchAdmins()
    } catch {
      toast.error("Erro ao atualizar administrador")
    }
  }

  const cpfsFiltrados = cpfs.filter((item) => {
    if (!searchTerm) return true
    const termo = searchTerm.toLowerCase()
    const matchNome = item.nome.toLowerCase().includes(termo)
    const cpfLimpo = item.cpf.replace(/\D/g, "")
    const termoLimpo = termo.replace(/\D/g, "")
    const matchCpf = termoLimpo !== "" && cpfLimpo.includes(termoLimpo)
    return matchNome || matchCpf
  })

  return (
    <div
      className="flex flex-col gap-8 px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Linha superior: CPF e Admins lado a lado */}
      <div className="flex flex-col lg:flex-row gap-8">

        {/* CPF Management */}
        <div className="flex-1 max-w-lg">
          <div
            className="p-6 sm:p-8 rounded-2xl shadow-lg space-y-8 border transition-colors duration-300"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <form onSubmit={cadastrarManual} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome</label>
                <input
                  placeholder="Nome completo"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full p-3 rounded-lg border outline-none transition-colors duration-300"
                  style={{
                    backgroundColor: "var(--surface-elevated)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--foreground)",
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">CPF</label>
                <input
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={e => setCpf(e.target.value)}
                  className="w-full p-3 rounded-lg border outline-none transition-colors duration-300"
                  style={{
                    backgroundColor: "var(--surface-elevated)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--foreground)",
                  }}
                />
              </div>
              <button
                type="submit"
                className="w-full text-white py-3 rounded transition-all duration-300 hover:scale-105 active:scale-95 font-medium"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Cadastrar
              </button>
            </form>

            <div className="border-t pt-6" style={{ borderColor: "var(--border-subtle)" }}>
              <h3 className="text-lg font-semibold mb-4">Ou importe em lote</h3>
              <form onSubmit={enviarArquivo} className="space-y-4">
                <div>
                  <label className="flex items-center justify-between gap-4 w-full px-4 py-3 rounded-lg border transition-all cursor-pointer hover:opacity-80"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-elevated)",
                    }}>
                    <span className="text-sm truncate flex-1">
                      {file ? file.name : "Selecione um arquivo (.csv, .txt, .xlsx)"}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium rounded text-white flex-shrink-0"
                      style={{ backgroundColor: "var(--primary)" }}>
                      Escolher
                    </span>
                    <input
                      type="file"
                      accept=".csv,.txt,.xlsx"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full text-white py-3 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 font-medium"
                  style={{ backgroundColor: "var(--status-completed)" }}
                >
                  Importar Arquivo
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* CPFs cadastrados */}
        <div className="flex-1 max-w-md">
          <div
            className="p-6 rounded-2xl shadow-lg border"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <h3 className="text-lg font-semibold mb-4">CPFs cadastrados</h3>

            <input
              placeholder="Buscar por Nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 mb-4 rounded-lg border outline-none"
              style={{
                backgroundColor: "var(--surface-elevated)",
                borderColor: "var(--border-subtle)",
                color: "var(--foreground)",
              }}
            />

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {cpfsFiltrados.length > 0 ? (
                cpfsFiltrados.map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border flex justify-between items-start transition-all hover:bg-black/5"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-elevated)",
                    }}
                  >
                    <div>
                      <p className="text-sm font-medium">{item.nome}</p>
                      <p className="text-xs opacity-70">{item.cpf}</p>
                    </div>

                    <button
                      onClick={() => handleDelete(item.cpf)}
                      className="text-xs p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Deletar CPF"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-center opacity-60 py-4">Nenhum CPF encontrado.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Lista de Administradores (apenas GOD) */}
      {isGod && (
        <div
          className="rounded-2xl shadow-lg border p-6 sm:p-8 transition-colors duration-300"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <h3 className="text-lg font-semibold mb-4">Administradores Cadastrados</h3>

          {editingAdmin && (
            <div className="mb-6 p-4 rounded-lg border"
              style={{
                backgroundColor: "var(--surface-elevated)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <h4 className="font-semibold mb-3">Editando: {editingAdmin.name}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Nome</label>
                  <input
                    value={editForm.name}
                    onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border outline-none"
                    style={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Email</label>
                  <input
                    value={editForm.email}
                    onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border outline-none"
                    style={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">CPF</label>
                  <input
                    value={editForm.cpf}
                    onChange={e => setEditForm(p => ({ ...p, cpf: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border outline-none"
                    style={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Setor</label>
                  <input
                    value={editForm.setor}
                    onChange={e => setEditForm(p => ({ ...p, setor: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border outline-none"
                    style={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={saveEditAdmin}
                  className="px-4 py-2 rounded-lg text-white font-medium text-sm"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  Salvar
                </button>
                <button
                  onClick={() => setEditingAdmin(null)}
                  className="px-4 py-2 rounded-lg font-medium text-sm"
                  style={{ color: "var(--border-subtle)" }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  borderBottom: "2px solid var(--border-subtle)",
                }}
              >
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Nome</th>
                  <th className="px-4 py-3 text-left font-semibold">CPF</th>
                  <th className="px-4 py-3 text-left font-semibold">Empresa</th>
                  <th className="px-4 py-3 text-left font-semibold">Setor</th>
                  <th className="px-4 py-3 text-center font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center opacity-60">
                      Nenhum administrador cadastrado.
                    </td>
                  </tr>
                ) : (
                  admins.map((admin, idx) => (
                    <tr
                      key={admin.id}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        backgroundColor: idx % 2 === 0 ? "transparent" : "var(--surface-elevated)",
                      }}
                    >
                      <td className="px-4 py-3 font-medium">{admin.name}</td>
                      <td className="px-4 py-3">{admin.cpf}</td>
                      <td className="px-4 py-3">{admin.Empresa?.nome || "-"}</td>
                      <td className="px-4 py-3">{admin.setor}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditAdmin(admin)}
                            className="p-2 rounded-lg transition-colors hover:opacity-70"
                            style={{ color: "var(--primary)" }}
                            title="Editar"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                            className="p-2 rounded-lg transition-colors hover:opacity-70"
                            style={{ color: "var(--status-cancelled)" }}
                            title="Apagar"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
