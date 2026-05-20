'use client'
import { getPriorityColor } from '@/types/chamado'

interface PriorityBadgeProps {
  prioridade: string
}

export function PriorityBadge({ prioridade }: PriorityBadgeProps) {
  return (
    <span
      className="px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase"
      style={{ backgroundColor: getPriorityColor(prioridade) }}
    >
      {prioridade}
    </span>
  )
}
