import { Chamado, ROLE } from "@prisma/client"
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      empresaId: string
      cpf: string
      name: string
      role: ROLE
      avatarUrl: string | null
      setor: string
      chamados: Chamado[]
      chamadosSetor: Chamado[]
    }
  }

  interface User {
    id: string
    email: string
    cpf: string
    empresaId: string
    name: string
    role: ROLE
    avatarUrl: string | null
    setor: string
    chamados: Chamado[]
    chamadosSetor: Chamado[]
  }
}

interface TurnstileObject {
  render: (container: HTMLElement, opts: {
    sitekey: string
    callback: (token: string) => void
    "expired-callback": () => void
  }) => string
}

declare global {
  interface Window {
    turnstile?: TurnstileObject
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    email?: string
    cpf?: string
    empresaId?: string
    name?: string
    role?: ROLE
    avatarUrl?: string | null
    setor?: string
    chamados?: Chamado[]
    chamadosSetor?: Chamado[]
  }
}