// /src/services/chamado.service.ts

import { chamadoRepository } from "@/repositories/chamado.repository"

export const chamadoService = {
  async listarChamados() {
    return chamadoRepository.findAll()
  },

  async criarChamado(data: {
    nome: string
    cpf: string
    setor: string
    descricao: string
    prioridade?: string
    anexoUrl?: string
  }) {
    const prioridade = data.prioridade ?? "normal"

    return chamadoRepository.create({
      ...data,
      prioridade,
    })
  },

  async fecharChamado(id: string) {
    const chamado = await chamadoRepository.findById(id)

    if (!chamado) {
      throw new Error("Chamado não encontrado")
    }

    return chamadoRepository.updateStatus(id, "FECHADO")
  },

  async atribuirAtendente(id: string, atendenteId: string) {
    const chamado = await chamadoRepository.findById(id)

    if (!chamado) {
      throw new Error("Chamado não encontrado")
    }

    return chamadoRepository.assignAtendente(id, atendenteId)
  },
}