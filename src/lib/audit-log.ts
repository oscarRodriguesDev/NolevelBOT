import { prisma } from "@/lib/prisma"
import type { modulo } from "@prisma/client"

// Registra log de acesso do usuario no banco de dados
export async function logAcesso(params: {
  cpf?: string | null
  nome?: string | null
  empresa: string
  modulo: modulo
  acao: string
}) {
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO logs_de_acesso (id, cpf, nome, empresa, modulo, acao) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
      params.cpf || null,
      params.nome || null,
      params.empresa,
      params.modulo,
      params.acao,
    )
  } catch (error) {
    console.warn("Erro ao salvar log de acesso:", error)
  }
}
