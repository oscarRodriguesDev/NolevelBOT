import { userRepository } from "@/repositories/user.repository"
import { chamadoRepository } from "@/repositories/chamado.repository"
import { compare } from "bcryptjs"

export const authService = {
  async login(email: string, password: string) {
    // Busca usuário
    const user = await userRepository.findByEmail(email)

    if (!user || !user.password) return null

    // Valida senha
    const isValid = await compare(password, user.password)
    if (!isValid) return null

    // Busca chamados do setor (regra de negócio, não é responsabilidade do auth em si)
    const chamadosSetor = await chamadoRepository.findAll()

    // Filtra aqui (evita duplicar lógica no repository)
    const chamadosDoSetor = chamadosSetor.filter(
      (c) => c.setor === user.setor && c.status === "ABERTO"
    )

    return {
      id: user.id,
      email: user.email,
      cpf: user.cpf,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      setor: user.setor,
      chamadosSetor: chamadosDoSetor,
    }
  },
}