"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Camera, X, Lock, User as UserIcon, Mail, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"


interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

interface Props {
  open: boolean
  onClose: () => void
}

export function UserProfileModal({ open, onClose }: Props) {
  const [user, setUser] = useState<User | null>(null)
  const [password, setPassword] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)




  // 1. Lógica de Montagem e Tema
  useEffect(() => {
    setMounted(true)
    if (!open) return

    const checkTheme = () => {
      const hasDark = document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark")
      setIsDark(hasDark)
    }

    checkTheme()

    // Observa se o tema mudar com o modal aberto
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/users/user-active")
        const data = await res.json()
        setUser(data)
      } catch (err) {
        console.error("Erro ao carregar usuário", err)
      }
    }

    fetchUser()
    return () => observer.disconnect()
  }, [open])
  /* 
  const handleSubmit = async () => {
    setLoading(true)
  
    try {
      const formData = new FormData()
      console.log("Dados do formulário:", {
        name: user?.name,
        email: user?.email,
        password,
        avatarFile,
      })
  
      if (password.trim()) {
        formData.append("password", password)
      }
  
      if (avatarFile) {
        formData.append("avatarFile", avatarFile)
      }
  
      const res = await fetch("/api/users/user-active", {
        method: "PUT",
        body: formData,
        credentials: "include",
      })
  
      const data = await res.json()
  
      if (!res.ok) {
        throw new Error(data?.error || "Erro ao atualizar perfil")
      }
  
      setPassword("")
      setAvatarFile(null)
      onClose()
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao atualizar perfil")
    } finally {
      setLoading(false)
    }
  }

   */

const session = useSession()

const handleSubmit = async () => {
  setLoading(true)

  try {
    const formData = new FormData()

    const isChangingPassword = password.trim().length > 0

    if (isChangingPassword) {
      formData.append("password", password)
    }

    if (avatarFile) {
      formData.append("avatarFile", avatarFile)
    }

    const res = await fetch("/api/users/user-active", {
      method: "PUT",
      body: formData,
      credentials: "include",
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data?.error || "Erro ao atualizar perfil")
    }

    if (isChangingPassword || data?.logout) {
      window.location.href = "/login"
      return
    }

    if (data?.user) {
      await session.update({
        ...session.data,
        user: {
          ...session.data?.user,
          ...data.user,
        },
      })
      console.log("Sessão atualizada:", session.data)
    }

    setPassword("")
    setAvatarFile(null)
    onClose()
    } catch (error) {
    toast.error(error instanceof Error ? error.message : "Falha ao atualizar perfil")
  } finally {
    setLoading(false)
  }
}

  if (!open || !mounted) return null

  return createPortal(
    <div className={isDark ? "dark" : ""}>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-edit-user-title"
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        <div
          className="absolute inset-0 backdrop-blur-md"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={onClose}
        />

        <div
          className="relative w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden transition-colors duration-300"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div
            className="relative h-28"
            style={{
              background: "linear-gradient(to bottom right, var(--primary), var(--primary-hover))",
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all"
              aria-label="Fechar modal"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-8 pb-8">
            <div className="relative -mt-14 mb-6 flex justify-center">
              <div className="relative group">
                <div
                  className="w-28 h-28 rounded-3xl border-[6px] overflow-hidden shadow-lg transition-colors duration-300"
                  style={{
                    backgroundColor: "var(--surface-elevated)",
                    borderColor: "var(--surface)",
                  }}
                >
                  {avatarFile ? (
                    <img src={URL.createObjectURL(avatarFile)} className="w-full h-full object-cover" alt="Preview" />
                  ) : user?.avatarUrl ? (
                    <img src={user.avatarUrl} className="w-full h-full object-cover" alt="Perfil" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--border-subtle)" }}>
                      <UserIcon size={44} />
                    </div>
                  )}
                </div>
                <label
                  className="absolute bottom-1 right-1 p-2.5 rounded-2xl shadow-xl border cursor-pointer hover:scale-110 active:scale-95 transition-all"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--primary)",
                  }}
                >
                  <Camera size={18} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 id="modal-edit-user-title" className="text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
                {user?.name || "Usuário"}
              </h2>
              <p className="font-medium" style={{ color: "var(--border-subtle)" }}>Configurações de Perfil</p>
            </div>

            <div className="grid gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.1em] ml-1" style={{ color: "var(--border-subtle)" }}>
                  E-mail da Conta
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--border-subtle)" }} />
                  <input
                    value={user?.email || ""}
                    disabled
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border text-sm cursor-not-allowed transition-colors duration-300"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-elevated)",
                      color: "var(--border-subtle)",
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.1em] ml-1" style={{ color: "var(--border-subtle)" }}>
                  Segurança
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: "var(--border-subtle)" }} />
                  <input
                    type="password"
                    placeholder="Alterar senha atual"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border text-sm outline-none transition-all focus:ring-2"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--background)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-10">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 text-sm font-bold rounded-2xl transition-all"
                style={{ color: "var(--border-subtle)" }}
              >
                Voltar
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-[2] relative px-4 py-3 text-sm font-bold rounded-2xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "#fff",
                }}
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  "Salvar Alterações"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}