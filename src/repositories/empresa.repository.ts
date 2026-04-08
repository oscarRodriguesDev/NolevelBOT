// /src/repositories/empresa.repository.ts

import { prisma } from "@/lib/prisma"

export const empresaRepository = {
  async findAll() {
    return prisma.empresa.findMany({
      orderBy: { createdAt: "desc" },
    })
  },

  async findById(id: string) {
    return prisma.empresa.findUnique({
      where: { id },
    })
  },

  async findByCnpj(cnpj: string) {
    return prisma.empresa.findUnique({
      where: { cnpj },
    })
  },

  async create(data: {
    nome: string
    cnpj: string
    setores: string[]
    databaseUrl?: string
  }) {
    return prisma.empresa.create({
      data,
    })
  },

  async update(id: string, data: Partial<{
    nome: string
    setores: string[]
    databaseUrl: string
  }>) {
    return prisma.empresa.update({
      where: { id },
      data,
    })
  },
}