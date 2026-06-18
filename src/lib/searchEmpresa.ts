import { prisma } from "@/lib/prisma";
import { cacheGetOrSet } from "@/lib/db-cache";
export function normalizeCpf(cpf: string) {
    return cpf.replace(/\D/g, "")
}
export async function getEmpresaIdByCpf(cpf: string) {
    const cleanCpf = normalizeCpf(cpf)

    return await cacheGetOrSet(`cpf:empresa:${cleanCpf}`, async () => {
        const record = await prisma.cpfs.findUnique({
            where: {
                cpf: cleanCpf,
            },
            select: {
                empresaId: true,
            },
        })

        return record?.empresaId ?? null
    }, 1800) // 30min
}