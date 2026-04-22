import { prisma } from "@/lib/prisma";
export function normalizeCpf(cpf: string) {
    return cpf.replace(/\D/g, "")
}
export async function getEmpresaIdByCpf(cpf: string) {
    const cleanCpf = normalizeCpf(cpf)

    const record = await prisma.cpfs.findUnique({
        where: {
            cpf: cleanCpf,
        },
        select: {
            empresaId: true,
        },
    })

    return record?.empresaId ?? null
}