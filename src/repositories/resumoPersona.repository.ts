// /src/repositories/resumoPersona.repository.ts

import { prisma } from "@/lib/prisma"

export const resumoPersonaRepository = {
  async findByCpf(cpf: string) {
    return prisma.resumoPersona.findUnique({
      where: { cpf },
    })
  },

  async upsert(data: {
    cpf: string
    nome: string
    resumo: string
  }) {
    return prisma.resumoPersona.upsert({
      where: { cpf: data.cpf },
      update: {
        nome: data.nome,
        resumo: data.resumo,
      },
      create: data,
    })
  },
}