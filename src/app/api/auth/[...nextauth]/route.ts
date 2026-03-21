import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"
import { Chamado, ROLE } from "@prisma/client"

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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            chamados: true,
          },
        })

        // Verifica se usuário existe e se a senha (hash) está presente
        if (!user || !user.password) return null

        const isValid = await compare(credentials.password, user.password)
        if (!isValid) return null

        const chamadosSetor = await prisma.chamado.findMany({
          where: {
            setor: user.setor,
            status: "ABERTO",
          },
        })

        // O objeto retornado aqui vai para o callback JWT na primeira vez
        return {
          id: user.id,
          email: user.email,
          cpf: user.cpf,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
          setor: user.setor,
          chamados: user.chamados,
          chamadosSetor: chamadosSetor,
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      // Se o 'user' existir, é o momento do login. Salvamos os dados no token.
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
      // Passamos os dados do token para a sessão
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
    signIn: '/login', // Recomendado definir sua página de login
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }