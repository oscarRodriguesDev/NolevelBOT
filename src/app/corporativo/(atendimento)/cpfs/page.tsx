"use client"

import { useHeader } from "../layout"
import SharedCpfsPage from "@/app/components/shared-cpfs"

// Pagina de cadastro de CPFs do modulo corporativo
export default function CadastroCPFs() {
  const { setHeader } = useHeader()
  return <SharedCpfsPage setHeader={setHeader} moduleSlug="corporativo" />
}
