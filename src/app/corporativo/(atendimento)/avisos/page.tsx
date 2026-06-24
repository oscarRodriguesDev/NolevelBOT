"use client"

import { useHeader } from "../layout"
import SharedAvisosPage from "@/app/components/shared-avisos"

// Pagina de avisos do modulo corporativo
export default function AvisosPage() {
  const { setHeader } = useHeader()
  return <SharedAvisosPage setHeader={setHeader} />
}
