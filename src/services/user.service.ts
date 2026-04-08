// /src/services/user.service.ts

import { userRepository } from "@/repositories/user.repository"

export const userService = {
  async listarUsuarios() {
    return userRepository.findAll()
  },

  async criarUsuario(data: {
    email: string
    cpf: string
    name: string
    role: "GOD" | "ADMIN" | "GESTOR" | "ATENDENTE"
    password: string
    setor: string
  }) {
    // Regra: evitar duplicidade de email
    const existente = await userRepository.findByEmail(data.email)

    if (existente) {
      throw new Error("Email já cadastrado")
    }

    return userRepository.create(data)
  },
}