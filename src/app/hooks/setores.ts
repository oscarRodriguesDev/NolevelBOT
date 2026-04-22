import { prisma } from "@/lib/prisma"

//tem que alterar para buscar o setor da empresa usando o cnpj da mesma,podemos usar uma key ou uma autenticaçaço
export async function getSetores(cnpj: string) {
  try {
    if (!cnpj) {
      throw new Error("CNPJ é obrigatório")
    }

    const empresa = await prisma.empresa.findUnique({
      where: { cnpj },
      select: { setores: true }
    })

    return empresa?.setores || []
  } catch (error) {
    console.error(error)
    return []
  }
}