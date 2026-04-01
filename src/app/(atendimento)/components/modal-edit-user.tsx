"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface User {
  id: string
  name: string
  email: string
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

  useEffect(() => {
    if (!open) return

    const fetchUser = async () => {
      const res = await fetch("/api/users/user-active")
      const data = await res.json()

      setUser(data)
    }

    fetchUser()
  }, [open])

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)

    let avatarUrl: string | undefined = undefined

    if (avatarFile) {
      const formData = new FormData()
      formData.append("file", avatarFile)

      const upload = await fetch("/api/users/user-active", {
        method: "POST",
        body: formData,
      })

      const uploadData = await upload.json()
      avatarUrl = uploadData.url
    }

    await fetch("/api/users/user-active", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        password: password || undefined,
        avatarUrl,
      }),
    })

    setLoading(false)
    setPassword("")
    setAvatarFile(null)
    onClose()
  }

  if (!open || typeof window === "undefined") return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md mx-4 rounded-xl bg-white text-black dark:bg-zinc-900 dark:text-white shadow-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Perfil</h2>

        <div className="space-y-2">
          <label className="text-sm">Nome</label>
          <input
            value={user?.name || ""}
            disabled
            className="w-full p-2 rounded-md border bg-gray-100 text-black dark:bg-zinc-800 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Email</label>
          <input
            value={user?.email || ""}
            disabled
            className="w-full p-2 rounded-md border bg-gray-100 text-black dark:bg-zinc-800 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Alterar foto de perfil</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            className="w-full text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Nova senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded-md border bg-white text-black dark:bg-zinc-800 dark:text-white"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-gray-300"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-md bg-black text-white dark:bg-white dark:text-black disabled:opacity-50"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}