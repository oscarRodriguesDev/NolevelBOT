"use client"

import { useHeader } from "../layout"
import SharedGestaoUsuariosPage from "@/app/components/shared-gestao-usuarios"

// Pagina de gestao de usuarios do modulo corporativo
// Pagina de gestao de usuarios pelo admin
export default function CriarUsuarioPage() {
  const { setHeader } = useHeader()
  return <SharedGestaoUsuariosPage setHeader={setHeader} />
}
