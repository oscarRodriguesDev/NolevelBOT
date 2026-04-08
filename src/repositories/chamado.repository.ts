// /src/repositories/chamado.repository.ts

import { prisma } from "@/lib/prisma"

export const chamadoRepository = {
  async findAll() {
    return prisma.chamado.findMany({
      orderBy: { createdAt: "desc" },
    })
  },

  async findById(id: string) {
    return prisma.chamado.findUnique({
      where: { id },
    })
  },

  async create(data: {
    nome: string
    cpf: string
    setor: string
    descricao: string
    prioridade?: string
    anexoUrl?: string
  }) {
    return prisma.chamado.create({
      data: {
        ...data,
        ticket: crypto.randomUUID(),
      },
    })
  },

  async updateStatus(id: string, status: string) {
    return prisma.chamado.update({
      where: { id },
      data: { status },
    })
  },

  async assignAtendente(id: string, atendenteId: string) {
    return prisma.chamado.update({
      where: { id },
      data: { atendenteId },
    })
  },
}