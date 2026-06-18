import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"
import { Chamado, ROLE } from "@prisma/client"
import { needsCaptcha, verifyTurnstileToken, trackFailedLogin, resetFailedLogin } from "@/lib/rate-limit"
import { logAcesso } from "@/lib/audit-log"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
        turnstileToken: { label: "Turnstile", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

         console.log("Tentativa de login para:", credentials.email)

        if (needsCaptcha(credentials.email)) {
          if (!credentials.turnstileToken) return null
          const valid = await verifyTurnstileToken(credentials.turnstileToken)
          if (!valid) return null
        }
       
        console.log("Verificando usuário no banco de dados para:", credentials.email)
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            chamados: true,
          },
        })

        console.log("Usuário encontrado:", user)

        if (!user || !user.password) {
          trackFailedLogin(credentials.email)
          return null
        }

        console.log("Comparando senhas para:", credentials.email)

        const isValid = await compare(credentials.password, user.password)
        console.log(credentials.password, user.password, "Resultado da comparação:", isValid)
        if (!isValid) {
          trackFailedLogin(credentials.email)
          return null
        }

        resetFailedLogin(credentials.email)

        const empresa = await prisma.empresa.findUnique({
          where: { id: user.empresaId },
          select: { nome: true },
        })

        logAcesso({
          cpf: user.cpf,
          nome: user.name,
          empresa: empresa?.nome || "Desconhecida",
          modulo: "CORPORATIVO",
          acao: "login",
        })

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
          empresaId: user.empresaId,
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
        token.empresaId = user.empresaId
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
        session.user.empresaId = token.empresaId as string
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
    signIn: '/', // Redireciona para sua página customizada se houver erro
  },
  
  secret: process.env.NEXTAUTH_SECRET,
}