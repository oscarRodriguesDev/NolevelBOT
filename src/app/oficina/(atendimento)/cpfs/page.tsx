"use client"

import { useHeader } from "../layout"
import SharedCpfsPage from "@/app/components/shared-cpfs"

// pagina de cadastro de colaboradores do modulo oficina
export default function CadastroColaboradores() {
  const { setHeader } = useHeader()
  return <SharedCpfsPage setHeader={setHeader} moduleSlug="oficina" />
}
