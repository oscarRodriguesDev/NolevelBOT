'use client'
import { getStatusColor } from '@/types/chamado'

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className="px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase"
      style={{ backgroundColor: getStatusColor(status) }}
    >
      {status?.replace(/_/g, ' ')}
    </span>
  )
}
