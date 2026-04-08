// /src/services/ticketsFechados.service.ts

import { ticketsFechadosRepository } from "@/repositories/ticketsFechados"

export const ticketsFechadosService = {
  async listar() {
    return ticketsFechadosRepository.findAll()
  },

  async criar(data: {
    ticket: string
    nome: string
    cpf: string
    setor: string
    historico?: string
    prioridade: string
    anexoUrl?: string
    atendente?: string
  }) {
    return ticketsFechadosRepository.create(data)
  },
}