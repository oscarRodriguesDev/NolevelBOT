"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Camera, X, Lock, User as UserIcon, Mail, Loader2 } from "lucide-react"
import { useSession, signOut } from "next-auth/react"

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
  const session = useSession()

  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [formMessage, setFormMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)

  // 1. Lógica de Montagem e Tema
  useEffect(() => {
    setMounted(true)
    if (!open) return

    const checkTheme = () => {
      const hasDark =
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark")
      setIsDark(hasDark)
    }

    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/users/user-active")
        const data = await res.json()
        setUser(data)
        
        // CORREÇÃO: Preenche os inputs com os dados que vieram do banco
        if (data) {
          setName(data.name || "")
          setEmail(data.email || "")
        }
      } catch (err) {
        console.error("Erro ao carregar usuário", err)
      }
    }

    fetchUser()
    return () => observer.disconnect()
  }, [open])

  // 2. Lógica de Envio (Só envia se houver alteração)
  const handleSubmit = async () => {
    // Verifica o que realmente mudou comparado ao dado original
    const isNameChanged = name.trim() && name.trim() !== user?.name
    const isEmailChanged = email.trim() && email.trim() !== user?.email
    const isChangingPassword = password.trim().length > 0
    const isAvatarChanged = !!avatarFile

    // Se o usuário clicou em salvar sem mudar nada, apenas fecha o modal
    if (!isNameChanged && !isEmailChanged && !isChangingPassword && !isAvatarChanged) {
      onClose()
      return
    }

    setFormMessage(null)
    setLoading(true)

    try {
      const formData = new FormData()

      if (isNameChanged) formData.append("name", name.trim())
      if (isEmailChanged) formData.append("email", email.trim())
      if (isChangingPassword) formData.append("password", password)
      if (isAvatarChanged) formData.append("avatarFile", avatarFile)

      if (isEmailChanged || isChangingPassword) {
        formData.append("currentPassword", currentPassword)
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

      // Se mudou a senha ou a API exigiu logout
      if (isChangingPassword || data?.logout) {
        setFormMessage({ type: "success", text: "Senha alterada! Redirecionando para o login..." })
        setTimeout(() => {
          signOut({ redirect: false })
          window.location.href = "/login"
        }, 1500)
        return
      }

      // Atualiza a sessão do NextAuth
      if (data?.user && session.update) {
        await session.update({
          ...session.data,
          user: {
            ...session.data?.user,
            ...data.user,
          },
        })
      }

      setFormMessage({ type: "success", text: "Perfil atualizado com sucesso!" })
      setTimeout(() => {
        onClose()
      }, 800)
      
    } catch (error) {
      setFormMessage({ type: "error", text: error instanceof Error ? error.message : "Falha ao atualizar perfil" })
    } finally {
      setLoading(false)
    }
  }

  // Previne renderização no servidor de coisas do DOM
  if (!open || !mounted) return null

  return createPortal(
    <div className={isDark ? "dark" : ""}>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-edit-user-title"
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative w-full max-w-md rounded-3xl shadow-2xl border border-[var(--border-subtle)] bg-[var(--surface)] overflow-hidden transition-colors duration-300">
          <div className="relative h-32 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)]">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-white backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Fechar modal"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6 flex justify-center">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full border-4 border-[var(--surface)] bg-[var(--surface-elevated)] overflow-hidden shadow-lg transition-colors duration-300">
                  {avatarFile ? (
                    <img
                      src={URL.createObjectURL(avatarFile)}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  ) : user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      className="w-full h-full object-cover"
                      alt="Perfil"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--border-subtle)]">
                      <UserIcon size={44} />
                    </div>
                  )}
                </div>

                <label className="absolute bottom-0 right-0 p-2.5 rounded-full shadow-md border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--primary)] cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200">
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

            <div className="text-center mb-6">
              <h2
                id="modal-edit-user-title"
                className="text-2xl font-bold tracking-tight text-[var(--foreground)]"
              >
                Editar Perfil
              </h2>
              <p className="text-sm font-medium opacity-70 mt-1 text-[var(--foreground)]">
                Atualize suas informações pessoais
              </p>
            </div>

            <div className="grid gap-4">
              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider ml-1 opacity-70 text-[var(--foreground)]">
                  Nome Completo
                </label>
                <div className="relative">
                  <UserIcon
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 text-[var(--foreground)]"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={name} /* CORREÇÃO: name ao invés de formData.nome */
                    onChange={(e) => setName(e.target.value)} /* CORREÇÃO: setName ao invés de setNome */
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none transition-all focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              {/* E-mail */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider ml-1 opacity-70 text-[var(--foreground)]">
                  E-mail da Conta
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 text-[var(--foreground)]"
                    size={18}
                  />
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none transition-all focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider ml-1 opacity-70 text-[var(--foreground)]">
                  Segurança
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 text-[var(--foreground)]"
                    size={18}
                  />
                  <input
                    type="password"
                    placeholder="Alterar senha atual"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none transition-all focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              {(email !== user?.email || password.trim().length > 0) && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider ml-1 opacity-70 text-[var(--foreground)]">
                    Confirme sua senha atual
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 text-[var(--foreground)]"
                      size={18}
                    />
                    <input
                      type="password"
                      placeholder="Senha atual para confirmar alteração"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] text-[var(--foreground)] text-sm outline-none transition-all focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>
              )}
            </div>

            {formMessage && (
              <div
                className={`mt-6 px-4 py-3 rounded-xl text-sm font-medium text-center ${
                  formMessage.type === "error"
                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                    : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800"
                }`}
              >
                {formMessage.text}
              </div>
            )}

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 text-sm font-semibold rounded-xl border border-transparent hover:bg-black/5 dark:hover:bg-white/10 text-[var(--foreground)] transition-colors"
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-[2] relative px-4 py-3 text-sm font-semibold rounded-xl shadow-sm disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 bg-[var(--primary)] text-white hover:opacity-90"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
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