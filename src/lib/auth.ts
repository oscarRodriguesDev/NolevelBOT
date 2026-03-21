import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"

export const authOptions: NextAuthOptions = {
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
  secret: process.env.NEXTAUTH_SECRET,
}