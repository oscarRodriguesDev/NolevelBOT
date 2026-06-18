"use client"

import { useHeader } from "../layout"
import SharedUsuariosPage from "@/app/components/shared-usuarios"
import { MODULES } from "@/lib/modules"

export default function UsuariosPage() {
  const { setHeader } = useHeader()
  return (
    <SharedUsuariosPage
      setHeader={setHeader}
      redirectBase={MODULES.eventos.redirectBase}
    />
  )
}
