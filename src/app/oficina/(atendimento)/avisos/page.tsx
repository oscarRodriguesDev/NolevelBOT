"use client"

import { useHeader } from "../layout"
import SharedAvisosPage from "@/app/components/shared-avisos"

// pagina de avisos do modulo oficina
export default function AvisosPage() {
  const { setHeader } = useHeader()
  return <SharedAvisosPage setHeader={setHeader} />
}
