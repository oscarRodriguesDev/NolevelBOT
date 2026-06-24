import { prisma } from "@/lib/prisma"

// Obtem a base de conhecimento (avisos) de uma empresa a partir do CPF do lead
export async function obterBaseDeConhecimento(cpf: string): Promise<string> {
  try {
    const usuario = await prisma.cpfsLeads.findUnique({
      where: { cpf },
      select: { empresa: true },
    })

    if (!usuario?.empresa) {
      return "Não há informações adicionais no banco de dados no momento."
    }

    const empresa = await prisma.empresa.findUnique({
      where: { nome: usuario.empresa },
      select: { id: true },
    })

    if (!empresa) {
      return "Não há informações adicionais no banco de dados no momento."
    }

    const avisos = await prisma.avisos.findMany({
      where: {
        empresaId: empresa.id,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      select: {
        titulo: true,
        conteudo: true,
      },
    })

    if (avisos.length === 0) {
      return "Não há informações adicionais no banco de dados no momento."
    }

    return avisos.map(aviso => `${aviso.conteudo}`).join('\n\n')
  } catch (error) {
    console.error("Erro ao buscar base de conhecimento por CPF no Prisma:", error)
    return "Erro ao carregar base de conhecimento."
  }
}
