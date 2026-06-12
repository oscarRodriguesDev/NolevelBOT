"use client"

type KpiCardProps = {
  title: string
  value: string | number
  subtitle?: string
  color?: string
  icon?: string
  isLoading?: boolean
}

export function KpiCard({ title, value, subtitle, color, icon, isLoading }: KpiCardProps) {
  return (
    <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm relative overflow-hidden group">
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"
        style={{ backgroundColor: color || "var(--primary)", opacity: 0.04 }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          {icon && <span className="text-lg">{icon}</span>}
          <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">{title}</p>
        </div>
        <p className="text-4xl font-black" style={{ color: color || "var(--foreground)" }}>
          {isLoading ? (
            <span className="animate-pulse">...</span>
          ) : (
            <>
              {value}
              {subtitle && <span className="text-sm opacity-40 ml-2 font-bold uppercase">{subtitle}</span>}
            </>
          )}
        </p>
      </div>
    </div>
  )
}
