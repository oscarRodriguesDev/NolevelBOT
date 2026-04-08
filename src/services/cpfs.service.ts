// /src/services/cpfs.service.ts

import { cpfsRepository } from "@/repositories/cpfs.repository"

export const cpfsService = {
  async listar() {
    return cpfsRepository.findAll()
  },

  async adicionar(data: { cpf: string; nome: string }) {
    const existente = await cpfsRepository.findByCpf(data.cpf)

    if (existente) {
      throw new Error("CPF já autorizado")
    }

    return cpfsRepository.create(data)
  },
}