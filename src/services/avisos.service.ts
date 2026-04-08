// /src/services/empresa.service.ts

import { empresaRepository } from "@/repositories/empresa.repository"

export const empresaService = {
  async listarEmpresas() {
    return empresaRepository.findAll()
  },

  async criarEmpresa(data: {
    nome: string
    cnpj: string
    setores: string[]
    databaseUrl?: string
  }) {
    // Regra: evitar duplicidade por CNPJ
    const existente = await empresaRepository.findByCnpj(data.cnpj)

    if (existente) {
      throw new Error("Empresa já cadastrada com este CNPJ")
    }

    return empresaRepository.create(data)
  },
}