"use client"

type RankingTableProps = {
  title: string
  data: { label: string; value: number }[]
  labelCol?: string
  valueCol?: string
  color?: string
  maxItems?: number
  isLoading?: boolean
  emptyMessage?: string
  valueSuffix?: string
}

export function RankingTable({
  title,
  data,
  labelCol = "ITEM",
  valueCol = "TOTAL",
  color,
  maxItems = 6,
  isLoading,
  emptyMessage,
  valueSuffix = "",
}: RankingTableProps) {
  const items = data.slice(0, maxItems)

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--background)] bg-opacity-20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">{title}</h2>
        </div>
        <span className="text-[10px] font-bold opacity-40">RANKING</span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left opacity-30 border-b border-[var(--border-subtle)]">
              <th className="px-6 py-3 font-black tracking-widest text-[9px]">#</th>
              <th className="px-6 py-3 font-black tracking-widest text-[9px]">{labelCol}</th>
              <th className="px-6 py-3 font-black tracking-widest text-right text-[9px]">{valueCol}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {items.length > 0 ? (
              items.map((item, i) => (
                <tr
                  key={i}
                  className="hover:bg-[var(--background)] hover:bg-opacity-40 transition-colors group"
                >
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-black ${
                        i === 0
                          ? "bg-yellow-500/20 text-yellow-500"
                          : i === 1
                          ? "bg-gray-400/20 text-gray-400"
                          : i === 2
                          ? "bg-amber-700/20 text-amber-700"
                          : "opacity-30"
                      }`}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-bold opacity-80 group-hover:opacity-100 truncate max-w-[200px]">
                    {item.label}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span
                      className="px-3 py-1 rounded-lg font-black text-xs"
                      style={{
                        backgroundColor: "var(--background)",
                        color: color || "var(--primary)",
                      }}
                    >
                      {item.value}
                      {valueSuffix}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-10 text-center opacity-30 font-bold uppercase tracking-widest">
                  {isLoading ? "Buscando dados..." : emptyMessage || "Nenhum dado encontrado"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
