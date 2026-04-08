// /src/repositories/cpfs.repository.ts

import { prisma } from "@/lib/prisma"

export const cpfsRepository = {
  async findAll() {
    return prisma.cpfs.findMany()
  },

  async findByCpf(cpf: string) {
    return prisma.cpfs.findUnique({
      where: { cpf },
    })
  },

  async create(data: { cpf: string; nome: string }) {
    return prisma.cpfs.create({
      data,
    })
  },
}