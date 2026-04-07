import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { Chamado, ROLE } from "@prisma/client"
import { cookies } from "next/headers"

// master
import { PrismaClient as PrismaMaster } from "@/lib/prisma/master"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

// tenant
import { PrismaClient } from "@prisma/client"

const poolMaster = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapterMaster = new PrismaPg(poolMaster)

const prismaMaster = new PrismaMaster({
  adapter: adapterMaster,
})

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

        const cookieStore = await cookies()
        const tenantSlug = cookieStore.get("tenant")?.value

        if (!tenantSlug) return null

        const empresa = await prismaMaster.empresa.findFirst({
          where: { slug: tenantSlug },
        })

        if (!empresa) return null

        const poolTenant = new Pool({
          connectionString: empresa.databaseUrl,
        })

        const adapterTenant = new PrismaPg(poolTenant)

        const prismaTenant = new PrismaClient({
          adapter: adapterTenant,
        } as any)

        const user = await prismaTenant.user.findUnique({
          where: { email: credentials.email },
          include: {
            chamados: true,
          },
        })

        if (!user || !user.password) return null

        const isValid = await compare(credentials.password, user.password)
        if (!isValid) return null

        const chamadosSetor = await prismaTenant.chamado.findMany({
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