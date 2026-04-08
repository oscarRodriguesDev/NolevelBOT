// /src/repositories/ticketsFechados.repository.ts

import { prisma } from "@/lib/prisma"

export const ticketsFechadosRepository = {
  async findAll() {
    return prisma.tickets_fechados.findMany({
      orderBy: { createdAt: "desc" },
    })
  },

  async create(data: {
    ticket: string
    nome: string
    cpf: string
    setor: string
    historico?: string
    prioridade: string
    anexoUrl?: string
    atendente?: string
  }) {
    return prisma.tickets_fechados.create({
      data,
    })
  },
}