"use client"

import { useHeader } from "../layout"
import SharedAvisosPage from "@/app/components/shared-avisos"

export default function AvisosPage() {
  const { setHeader } = useHeader()
  return <SharedAvisosPage setHeader={setHeader} />
}
