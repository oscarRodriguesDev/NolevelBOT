import { prisma } from "@/lib/prisma"

export async function obterBaseDeConhecimento(empresaId: string): Promise<string> {
  try {
    const avisos = await prisma.avisos.findMany({
      where: {
        empresaId: empresaId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      select: {
        titulo: true,
        conteudo: true
      }
    })

    if (!avisos || avisos.length === 0) {
      return "Não há informações adicionais no banco de dados no momento."
    }

    return avisos.map(aviso => `Informação sobre o produto/empresa: ${aviso.conteudo}`).join('\n\n')
  } catch (error) {
    console.error("Erro ao buscar avisos no Prisma:", error)
    return "Erro ao carregar base de conhecimento."
  }
}