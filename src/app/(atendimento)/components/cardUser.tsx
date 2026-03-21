"use client"

import { Chamado } from "@prisma/client"
import { useSession, signOut } from "next-auth/react" // Importando o signOut
import Image from "next/image"
import { LogOut } from "lucide-react" // Sugestão: use o lucide-react para ícones

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

export default function UserCard() {
  const { data: session, status } = useSession()
  const user = session?.user as User | undefined

  // Função de logout
  const handleLogout = () => {
    signOut({ callbackUrl: "/login" }) // Redireciona para o login após sair
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
    <div
      className="flex items-center justify-between gap-3 p-4 rounded-xl border shadow-sm transition-all"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Avatar Section */}
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border bg-neutral-200">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name || "Avatar"}
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: "var(--primary)", color: "#fff" }}
            >
              {user.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-semibold truncate leading-none mb-1">
            {user.name || "Sem nome"}
          </span>
          <span className="text-xs opacity-60 truncate">
            {user.email}
          </span>
        </div>
      </div>

      {/* Botão de Logout */}
      <button
        onClick={handleLogout}
        className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors group"
        title="Sair do sistema"
      >
        <LogOut size={18} className="opacity-60 group-hover:opacity-100" />
      </button>
    </div>
  )
}