"use client"

import { useHeader } from "../layout"
import SharedGestaoUsuariosPage from "@/app/components/shared-gestao-usuarios"

// pagina de criacao/gestao de usuarios do modulo oficina
export default function CriarUsuarioPage() {
  const { setHeader } = useHeader()
  return <SharedGestaoUsuariosPage setHeader={setHeader} />
}
