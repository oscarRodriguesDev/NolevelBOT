// /src/repositories/user.repository.ts

import { prisma } from "@/lib/prisma"

export const userRepository = {
  async findAll() {
    return prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    })
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    })
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    })
  },

  async create(data: {
    email: string
    cpf: string
    name: string
    role: "GOD" | "ADMIN" | "GESTOR" | "ATENDENTE"
    password: string
    setor: string
  }) {
    return prisma.user.create({
      data,
    })
  },
}