"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { ROLE } from "@prisma/client"
import { useHeader } from "../layout"
import { FaTrash, FaEdit } from "react-icons/fa"
import toast from "react-hot-toast"
import { CAN_BATCH_CPF } from "@/lib/rbac"

interface Admin {
  id: string
  name: string
  email: string
  cpf: string
  role: string
  setor: string
  Empresa: { id: string; nome: string } | null
}

export default function CadastroMotoristas() {
  const { data: session } = useSession()
  const userRole = session?.user?.role as ROLE | null
  const isGod = userRole === "GOD"
  const podeImportarLote = userRole ? CAN_BATCH_CPF.includes(userRole) : false

  const [nome, setNome] = useState("")
  const [matricula, setMatricula] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [motoristas, setMotoristas] = useState<{ id?: string; nome: string; cpf: string }[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const [admins, setAdmins] = useState<Admin[]>([])
  const currentUserId = session?.user?.id
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", cpf: "", setor: "" })

  const { setHeader } = useHeader()

  async function fetchMotoristas() {
    try {
      const res = await fetch("/api/cpfs")
      const data = await res.json()
      setMotoristas(data)
    } catch (error) {
      console.error("Erro ao buscar motoristas", error)
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
    titulo: "Cadastro de Motoristas",
    descricao: "Gerencie motoristas cadastrados no sistema",
  })

  const loadData = async () => {
    try {
      const res = await fetch("/api/cpfs")
      const data = await res.json()
      setMotoristas(data)
    } catch (error) {
      console.error("Erro ao buscar motoristas", error)
    }
  }

  loadData()
}, [setHeader])

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

      setMotoristas(prev => prev.filter(item => item.cpf !== cpfToDelete))
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
      <div className="flex flex-col lg:flex-row gap-6">

        <div className="flex-1 max-w-lg">
          <div
            className="p-6 sm:p-8 rounded-2xl shadow-lg space-y-8 border"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <div>
              <h3 className="text-lg font-semibold mb-1">Cadastrar CPF</h3>
              <p className="text-xs opacity-60 mb-6">Adicione CPFs autorizados manualmente</p>
            </div>
            <form onSubmit={cadastrarManual} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Nome</label>
                <input
                  placeholder="Nome completo"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  style={{
                    backgroundColor: "var(--surface-elevated)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--foreground)",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-70">CPF</label>
                <input
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={e => setCpf(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent font-mono"
                  style={{
                    backgroundColor: "var(--surface-elevated)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--foreground)",
                  }}
                />
              </div>
              <button
                type="submit"
                className="w-full text-white py-3 rounded-xl font-semibold transition-all duration-200 hover:brightness-110 hover:shadow-lg active:scale-[0.98]"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Cadastrar
              </button>
            </form>

            {podeImportarLote && (
              <div className="border-t pt-6" style={{ borderColor: "var(--border-subtle)" }}>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Importar em Lote</h3>
                  <p className="text-xs opacity-60 mb-4">Upload de arquivos .csv, .txt ou .xlsx</p>
                </div>
                <form onSubmit={enviarArquivo} className="space-y-4">
                  <label className="flex items-center justify-between gap-4 w-full px-4 py-3.5 rounded-xl border border-dashed transition-all cursor-pointer hover:brightness-95"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-elevated)",
                    }}>
                    <span className="text-sm truncate flex-1">
                      {file ? file.name : "Clique para selecionar arquivo"}
                    </span>
                    <span className="px-4 py-1.5 text-xs font-bold rounded-lg text-white flex-shrink-0"
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
                  <button
                    type="submit"
                    className="w-full text-white py-3 rounded-xl font-semibold transition-all duration-200 hover:brightness-110 hover:shadow-lg active:scale-[0.98]"
                    style={{ backgroundColor: "var(--status-completed)" }}
                  >
                    Importar Arquivo
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 max-w-md">
          <div
            className="p-6 rounded-2xl shadow-lg border"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <h3 className="text-lg font-semibold mb-1">CPFs Cadastrados</h3>
            <p className="text-xs opacity-60 mb-4">{cpfsFiltrados.length} registro(s)</p>

            <input
              placeholder="Buscar por Nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 mb-4 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              style={{
                backgroundColor: "var(--surface-elevated)",
                borderColor: "var(--border-subtle)",
                color: "var(--foreground)",
              }}
            />

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
              {cpfsFiltrados.length > 0 ? (
                cpfsFiltrados.map((item, idx) => (
                  <div
                    key={item.cpf || idx}
                    className="p-3.5 rounded-xl border flex justify-between items-start transition-all duration-150 hover:brightness-95"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-elevated)",
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.nome}</p>
                      <p className="text-xs font-mono opacity-60 mt-0.5">{item.cpf}</p>
                    </div>

                    <button
                      onClick={() => handleDelete(item.cpf)}
                      className="p-2 rounded-xl transition-all duration-150 hover:bg-[var(--error-light)] shrink-0 ml-2"
                      style={{ color: "var(--status-cancelled)" }}
                      title="Deletar CPF"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm opacity-40 font-medium">Nenhum CPF encontrado</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

     
    </div>
  )
}
