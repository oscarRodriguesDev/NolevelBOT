import { prisma } from "@/lib/prisma";
import { cacheGetOrSet } from "@/lib/db-cache";
// Remove caracteres nao numericos do CPF
export function normalizeCpf(cpf: string) {
    return cpf.replace(/\D/g, "")
}
// Busca o ID da empresa associado a um CPF com cache de 30min
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