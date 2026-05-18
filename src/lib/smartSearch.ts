import { prisma } from "@/lib/prisma"

export async function obterBaseDeConhecimento(): Promise<string> {
  try {
    const nomeEmpresa = process.env.PUBLIC_NAME_EMPRESA || "Nolevel"
    const empresa = await prisma.empresa.findFirst({
      where: { nome: nomeEmpresa },
      select: { id: true }
    })

    if (!empresa) {
      return "Não há informações adicionais no banco de dados no momento."
    }

    const avisos = await prisma.avisos.findMany({
      where: {
        empresaId: empresa.id,
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

    return avisos.map(aviso => `${aviso.conteudo}`).join('\n\n')
  } catch (error) {
    console.error("Erro ao buscar avisos no Prisma:", error)
    return "Erro ao carregar base de conhecimento."
  }
}