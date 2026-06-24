"use client"

import { useHeader } from "../layout"
import SharedUsuariosPage from "@/app/components/shared-usuarios"
import { MODULES } from "@/lib/modules"

// Pagina de usuarios do modulo corporativo
// Pagina de listagem de usuarios do modulo corporativo
export default function UsuariosPage() {
  const { setHeader } = useHeader()
  return (
    <SharedUsuariosPage
      setHeader={setHeader}
      redirectBase={MODULES.corporativo.redirectBase}
    />
  )
}
