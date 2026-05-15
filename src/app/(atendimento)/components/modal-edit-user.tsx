"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Camera, X, Lock, User as UserIcon, Mail, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"


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
      alert(error instanceof Error ? error.message : "Falha ao atualizar perfil")
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
    alert(error instanceof Error ? error.message : "Falha ao atualizar perfil")
  } finally {
    setLoading(false)
  }
}

  if (!open || !mounted) return null

  return createPortal(
    <div className={isDark ? "dark" : ""}>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
        {/* Overlay: Opacidade levemente reduzida para não pesar o ambiente */}
        <div
          className="absolute inset-0 bg-zinc-900/30 dark:bg-black/50 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Card: Bordas e sombras mais suaves */}
        <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-zinc-100 dark:border-zinc-800/50 overflow-hidden">

          {/* Header Gradient: Tons mais pastéis/claros */}
          <div className="relative h-28 bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-zinc-800">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-8 pb-8">
            {/* Avatar Section: Border branca para "saltar" do fundo */}
            <div className="relative -mt-14 mb-6 flex justify-center">
              <div className="relative group">
                <div className="w-28 h-28 rounded-3xl border-[6px] border-white dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-800 overflow-hidden shadow-lg">
                  {avatarFile ? (
                    <img src={URL.createObjectURL(avatarFile)} className="w-full h-full object-cover" alt="Preview" />
                  ) : user?.avatarUrl ? (
                    <img src={user.avatarUrl} className="w-full h-full object-cover" alt="Perfil" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-600">
                      <UserIcon size={44} />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-1 right-1 p-2.5 rounded-2xl bg-white dark:bg-zinc-800 shadow-xl border border-zinc-100 dark:border-zinc-700 cursor-pointer hover:scale-110 active:scale-95 transition-all text-blue-500">
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
              <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
                {user?.name || "Usuário"}
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">Configurações de Perfil</p>
            </div>

            {/* Form Fields: Cores de background mais lavadas */}
            <div className="grid gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500 ml-1">
                  E-mail da Conta
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600" size={18} />
                  <input
                    value={user?.email || ""}
                    disabled
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 text-zinc-400 dark:text-zinc-500 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500 ml-1">
                  Segurança
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600" size={18} />
                  <input
                    type="password"
                    placeholder="Alterar senha atual"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 dark:focus:border-blue-500/50 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons: Botões com cantos arredondados e cores menos agressivas */}
            <div className="flex items-center gap-4 mt-10">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 text-sm font-bold text-zinc-500 dark:text-zinc-400 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
              >
                Voltar
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-[2] relative px-4 py-3 text-sm font-bold bg-blue-600 dark:bg-white text-white dark:text-zinc-950 rounded-2xl hover:bg-blue-700 dark:hover:bg-zinc-100 shadow-lg shadow-blue-500/20 dark:shadow-none disabled:opacity-50 transition-all flex items-center justify-center gap-2"
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