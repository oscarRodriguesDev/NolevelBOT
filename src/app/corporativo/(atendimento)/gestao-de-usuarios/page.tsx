"use client"

import { useHeader } from "../layout"
import SharedGestaoUsuariosPage from "@/app/components/shared-gestao-usuarios"

export default function CriarUsuarioPage() {
  const { setHeader } = useHeader()
  return <SharedGestaoUsuariosPage setHeader={setHeader} />
}
