"use client"

import { useHeader } from "../layout"
import SharedCpfsPage from "@/app/components/shared-cpfs"

export default function CadastroCPFs() {
  const { setHeader } = useHeader()
  return <SharedCpfsPage setHeader={setHeader} moduleSlug="eventos" />
}
