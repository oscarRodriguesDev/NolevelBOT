import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            chamados: true,
          },
        })

        if (!user) return null

        const isValid = await compare(credentials.password, user.password)
        if (!isValid) return null

        const chamadosSetor = await prisma.chamado.findMany({
          where: {
            setor: user.setor,
            status: "ABERTO",
          },
        })

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

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email ?? ""
        token.cpf = user.cpf ?? ""
        token.name = user.name ?? ""
        token.role = user.role
        token.avatarUrl = user.avatarUrl ?? null
        token.setor = user.setor ?? ""
        token.chamados = user.chamados ?? []
        token.chamadosSetor = user.chamadosSetor ?? []
      }
      return token
    },

    async session({ session, token }) {
      session.user = {
        id: token.id ?? "",
        email: token.email ?? "",
        cpf: token.cpf ?? "",
        name: token.name ?? "",
        role: token.role!,
        avatarUrl: token.avatarUrl ?? null,
        setor: token.setor ?? "",
        chamados: token.chamados ?? [],
        chamadosSetor: token.chamadosSetor ?? [],
      }

      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }