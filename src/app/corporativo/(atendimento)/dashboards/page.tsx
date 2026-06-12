"use client"

import { useEffect } from "react"
import { useHeader } from "../layout"
import { DashboardContainer } from "@/app/components/dashboard/DashboardContainer"
import { CORPORATIVO_INDICATORS } from "@/app/components/dashboard/types"

export default function Dashboard() {
  const { setHeader } = useHeader()

  useEffect(() => {
    setHeader({
      titulo: "Dashboards",
      descricao: "Visualize métricas e análises de desempenho do seu sistema",
    })
  }, [setHeader])

  return (
    <DashboardContainer
      modulo="corporativo"
      indicators={CORPORATIVO_INDICATORS}
    />
  )
}
