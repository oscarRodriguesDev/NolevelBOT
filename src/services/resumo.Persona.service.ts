// /src/services/resumoPersona.service.ts

import { resumoPersonaRepository } from "@/repositories/resumoPersona.repository"

export const resumoPersonaService = {
  async obter(cpf: string) {
    return resumoPersonaRepository.findByCpf(cpf)
  },

  async salvar(data: {
    cpf: string
    nome: string
    resumo: string
  }) {
    return resumoPersonaRepository.upsert(data)
  },
}