// /src/repositories/chamado.repository.ts

import { prisma as defaultPrisma } from "@/lib/prisma"
import { PrismaClient } from "@prisma/client"

// Função central para decidir qual prisma usar
// Se vier um prisma (tenant) → usa ele
// Se não vier → usa o prisma padrão (single-tenant atual)
function getPrisma(prisma?: PrismaClient) {
  return prisma ?? defaultPrisma
}

export const chamadoRepository = {
  async findAll(prisma?: PrismaClient) {
    return getPrisma(prisma).chamado.findMany({
      orderBy: { createdAt: "desc" },
    })
  },

  async findById(id: string, prisma?: PrismaClient) {
    return getPrisma(prisma).chamado.findUnique({
      where: { id },
    })
  },

  async create(
    data: {
      nome: string
      cpf: string
      setor: string
      descricao: string
      prioridade?: string
      anexoUrl?: string
    },
    prisma?: PrismaClient
  ) {
    return getPrisma(prisma).chamado.create({
      data: {
        ...data,
        ticket: crypto.randomUUID(), // geração de ticket única
      },
    })
  },

  async updateStatus(id: string, status: string, prisma?: PrismaClient) {
    return getPrisma(prisma).chamado.update({
      where: { id },
      data: { status },
    })
  },

  async assignAtendente(
    id: string,
    atendenteId: string,
    prisma?: PrismaClient
  ) {
    return getPrisma(prisma).chamado.update({
      where: { id },
      data: { atendenteId },
    })
  },
}