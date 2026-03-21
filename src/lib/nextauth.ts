import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"
import { Chamado, ROLE } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            chamados: true,
          },
        })

        if (!user || !user.password) return null

        const isValid = await compare(credentials.password, user.password)
        if (!isValid) return null

        const chamadosSetor = await prisma.chamado.findMany({
          where: {
            setor: user.setor,
            status: "ABERTO",
          },
        })

        // Retorno para o Callback JWT
        return {
          id: user.id,
          email: user.email ?? "",
          cpf: user.cpf ?? "",
          name: user.name ?? "",
          role: user.role,
          avatarUrl: user.avatarUrl ?? null,
          setor: user.setor ?? "",
          chamados: user.chamados ?? [],
          chamadosSetor: chamadosSetor ?? [],
        }
      },
    }),
  ],
  
  // ESSENCIAL: Persistir os dados do authorize no Token e na Sessão
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
      if (session.user) {
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

  session: {
    strategy: "jwt",
  },
  
  pages: {
    signIn: '/login', // Redireciona para sua página customizada se houver erro
  },
  
  secret: process.env.NEXTAUTH_SECRET,
}