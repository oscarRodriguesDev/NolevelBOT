import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/nextauth"
import { prisma } from "@/lib/prisma"
import { ROLE } from "@prisma/client"
import ChamadoTerceirosForm from "./chamado-terceiros-form"

export const dynamic = "force-dynamic"

// Página exclusiva desta versão (branch dikma): abertura de chamado para terceiros
// Acesso restrito a atendentes/gestores/admin/god autenticados.
export default async function ChamadoTerceirosPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/dashboard")
  }

  const role = session.user.role as ROLE
  if (!["ATENDENTE", "GESTOR", "ADMIN", "GOD"].includes(role)) {
    redirect("/dashboard")
  }

  const empresaId = session.user.empresaId
  const empresa = empresaId
    ? await prisma.empresa.findUnique({
        where: { id: empresaId },
        select: { setores: true, nome: true },
      })
    : null

  return (
    <ChamadoTerceirosForm
      setores={empresa?.setores || []}
      empresaNome={empresa?.nome || ""}
    />
  )
}