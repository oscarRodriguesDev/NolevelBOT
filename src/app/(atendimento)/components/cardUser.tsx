"use client"

import { Chamado } from "@prisma/client"
import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import { LogOut, Settings } from "lucide-react"
import { useState } from "react"
import { UserProfileModal } from "./modal-edit-user"

type User = {
  id: string
  name: string
  email: string
  cpf?: string
  role?: string
  avatarUrl?: string | null
  setor?: string
  chamados?: Chamado[]
  chamadosSetor?: Chamado[]
}

type Props = {
  name?: string
  email?: string
  role?: string
  avatarUrl?: string
}

export default function UserCard(props: Props) {
  const { data: session, status } = useSession()
  const sessionUser = session?.user as User | undefined

  const [openModal, setOpenModal] = useState(false)

  const user = sessionUser ?? {
    name: props.name,
    email: props.email,
    role: props.role,
    avatarUrl: props.avatarUrl,
  }

  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
  }

  if (status === "loading") {
    return (
      <div className="p-4 text-sm opacity-60 animate-pulse">
        Carregando...
      </div>
    )
  }

  if (!user) return null

  return (
    <>
      <div className="flex items-center justify-between gap-3 p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-full overflow-hidden border bg-neutral-200">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name || "Avatar"}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-bold bg-black text-white">
                {user.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
          </div>

          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate">
              {user.name || "Sem nome"}
            </span>
            <span className="text-xs opacity-60 truncate">
              {user.email}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setOpenModal(true)}>
            <Settings size={18} />
          </button>

          <button onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <UserProfileModal
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </>
  )
}