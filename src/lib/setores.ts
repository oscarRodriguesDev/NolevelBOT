import { prisma } from "@/lib/prisma"
import { cacheGetOrSet } from "@/lib/db-cache"


export async function getSetores(cpf: string) {
  try {
    if (!cpf) {
      throw new Error("CPF é obrigatório")
    }

    return await cacheGetOrSet(`setores:${cpf}`, async () => {
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
    }, 1800) // 30min

  } catch (error) {
    console.error(error)
    return []
  }
}