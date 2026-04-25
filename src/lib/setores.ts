import { prisma } from "@/lib/prisma"


export async function getSetores(cpf: string) {
  try {
    if (!cpf) {
      throw new Error("CPF é obrigatório")
    }

    const registro = await prisma.cpfs.findUnique({
      where: { cpf },
      select: {
        Empresa: {
          select: {
            setores: true
          }
        }
      }
    })

    return registro?.Empresa?.setores || []

  } catch (error) {
    console.error(error)
    return []
  }
}