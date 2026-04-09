// /src/app/api/auth/[...nextauth]/route.ts

import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { Chamado, ROLE } from "@prisma/client"

import { resolveTenant } from "@/lib/tenant"
import { getTenantPrisma } from "@/lib/prisma-tenant"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const tenant = await resolveTenant()
        console.log("TENANT:", tenant)

        if (!tenant?.databaseUrl) {
          console.log("SEM DATABASE URL")
          return null
        }

        const prisma = getTenantPrisma(tenant.databaseUrl)

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            chamados: true,
          },
        })

        console.log("USER:", user?.email)

        if (!user || !user.password) {
          console.log("USER NÃO ENCONTRADO OU SEM SENHA")
          return null
        }

        const isValid = await compare(credentials.password, user.password)

        console.log("PASSWORD VALID:", isValid)

        if (!isValid){
          console.log("senha invalida")
        }else{
          console.log("senha correta")
        }

        const chamadosSetor = await prisma.chamado.findMany({
          where: {
            setor: user.setor,
            status: "ABERTO",
          },
        })

        return {
          id: user.id,
          email: user.email,
          cpf: user.cpf,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
          setor: user.setor,
          chamados: user.chamados,
          chamadosSetor,
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.cpf = user.cpf
        token.role = user.role
        token.avatarUrl = user.avatarUrl
        token.setor = user.setor
        token.chamados = user.chamados
        token.chamadosSetor = user.chamadosSetor
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.cpf = token.cpf as string
        session.user.role = token.role as ROLE
        session.user.avatarUrl = token.avatarUrl as string | null
        session.user.setor = token.setor as string
        session.user.chamados = token.chamados as Chamado[]
        session.user.chamadosSetor = token.chamadosSetor as Chamado[]
      }

      return session
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }