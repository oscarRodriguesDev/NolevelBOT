"use client"

type FunnelStep = {
  label: string
  count: number
  color: string
}

type FunnelCardProps = {
  title: string
  steps: FunnelStep[]
  isLoading?: boolean
  emptyMessage?: string
}

export function FunnelCard({ title, steps, isLoading, emptyMessage }: FunnelCardProps) {
  const maxCount = Math.max(...steps.map((s) => s.count), 1)

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">{title}</h2>
        <div className={`flex gap-1 ${isLoading ? "animate-pulse" : ""}`}>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
          <div className="w-2 h-2 rounded-full opacity-20" style={{ backgroundColor: "var(--primary)" }} />
        </div>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="w-full h-[250px] flex items-center justify-center opacity-20 font-black text-xs tracking-widest">
            CARREGANDO...
          </div>
        ) : steps.length === 0 ? (
          <div className="w-full h-[250px] flex items-center justify-center opacity-30 font-bold text-xs uppercase tracking-widest">
            {emptyMessage || "Nenhum dado encontrado"}
          </div>
        ) : (
          steps.map((step, i) => {
            const widthPct = (step.count / maxCount) * 100
            const retention = i > 0 ? (step.count / Math.max(steps[i - 1].count, 1)) * 100 : 100

            return (
              <div key={step.label}>
                {i > 0 && (
                  <div className="flex justify-center">
                    <div className="flex flex-col items-center -my-1">
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                        <path d="M6 10L0 0L12 0L6 10Z" fill="var(--border-subtle)" opacity="0.4" />
                      </svg>
                    </div>
                  </div>
                )}
                <div
                  className="relative flex items-center gap-4 p-4 rounded-xl transition-all group"
                  style={{
                    backgroundColor: "var(--background)",
                    borderLeft: `4px solid ${step.color}`,
                  }}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 rounded-l-xl transition-all duration-500"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: step.color,
                      opacity: 0.08,
                    }}
                  />
                  <div className="relative z-10 flex items-center justify-between w-full gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: step.color }}
                      />
                      <span className="text-xs font-bold opacity-80 truncate">{step.label}</span>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {i > 0 && (
                        <span
                          className="text-[10px] font-black tabular-nums"
                          style={{
                            color: retention < 50 ? "#EF4444" : retention < 80 ? "#F59E0B" : "#10B981",
                          }}
                        >
                          {retention.toFixed(0)}%
                        </span>
                      )}
                      <span
                        className="text-sm font-black tabular-nums min-w-[3ch] text-right"
                        style={{ color: step.color }}
                      >
                        {step.count}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
