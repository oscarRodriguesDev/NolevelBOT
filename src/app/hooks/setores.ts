import { prisma } from "@/lib/prisma"

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