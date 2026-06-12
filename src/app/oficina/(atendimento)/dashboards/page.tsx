"use client"

import { useEffect } from "react"
import { useHeader } from "../layout"
import { DashboardContainer } from "@/app/components/dashboard/DashboardContainer"
import { OFICINA_INDICATORS } from "@/app/components/dashboard/types"

export default function Dashboard() {
  const { setHeader } = useHeader()

  useEffect(() => {
    setHeader({
      titulo: "Dashboards",
      descricao: "Visualize métricas e análises de manutenção de veículos",
    })
  }, [setHeader])

  return (
    <DashboardContainer
      modulo="oficina"
      indicators={OFICINA_INDICATORS}
    />
  )
}
