"use client"

import { useHeader } from "../layout"
import SharedUsuariosPage from "@/app/components/shared-usuarios"
import { MODULES } from "@/lib/modules"

// pagina de listagem de usuarios do modulo oficina
export default function UsuariosPage() {
  const { setHeader } = useHeader()
  return (
    <SharedUsuariosPage
      setHeader={setHeader}
      redirectBase={MODULES.oficina.redirectBase}
    />
  )
}
