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