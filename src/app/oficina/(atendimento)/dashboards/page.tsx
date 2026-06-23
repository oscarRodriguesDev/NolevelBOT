"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useHeader } from "../layout"

const Charts = dynamic(() => import("./_charts").then((m) => m.Charts), { ssr: false })

interface StatItem {
  setor?: string;
  periodo?: string;
  status?: string;
  prioridade?: string;
  defeito?: string;
  funcao?: string;
  veiculo?: string;
  total: number;
}

interface CorrelacaoItem {
  defeito: string;
  veiculos: StatItem[];
}

interface SazonalidadeItem {
  mes: string;
  defeitos: StatItem[];
}

interface ReincidenciaItem {
  veiculo: string;
  defeito: string;
  ocorrencias: number;
  intervaloDias: number;
}

interface TempoDefeitoItem {
  defeito: string;
  total: number;
}

const STATUS_CORES: Record<string, string> = {
  NOVO: "var(--status-new)",
  EM_ATENDIMENTO: "var(--status-in-progress)",
  AGUARDANDO: "var(--status-waiting)",
  CONCLUIDO: "var(--status-completed)",
  CANCELADO: "var(--status-cancelled)",
  FECHADO: "var(--status-completed)",
}

export default function Dashboard() {
  const router = useRouter()
  const [periodo, setPeriodo] = useState<"dia" | "semana" | "mes" | "ano">("mes")
  const [chamadosPorSetor, setChamadosPorSetor] = useState<StatItem[]>([])
  const [chamadosPeriodo, setChamadosPeriodo] = useState<StatItem[]>([])
  const [statusStats, setStatusStats] = useState<StatItem[]>([])
  const [tempoMedio, setTempoMedio] = useState(0)
  const [totalAbertos, setTotalAbertos] = useState(0)
  const [totalFechados, setTotalFechados] = useState(0)
  const [taxaConclusao, setTaxaConclusao] = useState(0)
  const [defeitosStats, setDefeitosStats] = useState<StatItem[]>([])
  const [funcoesStats, setFuncoesStats] = useState<StatItem[]>([])
  const [veiculosStats, setVeiculosStats] = useState<StatItem[]>([])
  const [melhoresVeiculos, setMelhoresVeiculos] = useState<StatItem[]>([])
  const [tempoMedioPorDefeito, setTempoMedioPorDefeito] = useState<StatItem[]>([])
  const [reincidenciaStats, setReincidenciaStats] = useState<ReincidenciaItem[]>([])
  const [correlacaoDefeitoVeiculo, setCorrelacaoDefeitoVeiculo] = useState<CorrelacaoItem[]>([])
  const [sazonalidadeDefeitos, setSazonalidadeDefeitos] = useState<SazonalidadeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState(true)
  const { setHeader } = useHeader()

  const totalGeral = useMemo(() => totalAbertos + totalFechados, [totalAbertos, totalFechados])

  useEffect(() => {
    setHeader({
      titulo: "Dashboards",
      descricao: "Visualize metricas e analises de manutencao de veiculos",
    })
  }, [setHeader])

  useEffect(() => {
    let isMounted = true

    async function fetchDashboardData() {
      if (!isLoading) setIsLoading(true)

      try {
        const response = await fetch(`/api/dashboards?periodo=${periodo}&modulo=oficina`)

        if (response.status === 403) {
          if (isMounted) setHasPermission(false)
          return
        }

        if (!response.ok) throw new Error("Erro na requisicao")

        const data = await response.json()

        if (data.allowed === false) {
          if (isMounted) setHasPermission(false)
          return
        }

        if (isMounted) {
          setChamadosPorSetor(data.chamadosPorSetor || [])
          setChamadosPeriodo(data.chamadosPeriodo || [])
          setStatusStats(data.statusStats || [])
          setTempoMedio(data.tempoMedio || 0)
          setTotalAbertos(data.totalAbertos || 0)
          setTotalFechados(data.totalFechados || 0)
          setTaxaConclusao(data.taxaConclusao || 0)
          setDefeitosStats(data.defeitosStats || [])
          setFuncoesStats(data.funcoesStats || [])
          setVeiculosStats(data.veiculosStats || [])
          setMelhoresVeiculos(data.melhoresVeiculos || [])
          setTempoMedioPorDefeito(data.tempoMedioPorDefeito || [])
          setReincidenciaStats(data.reincidenciaStats || [])
          setCorrelacaoDefeitoVeiculo(data.correlacaoDefeitoVeiculo || [])
          setSazonalidadeDefeitos(data.sazonalidadeDefeitos || [])
          setHasPermission(true)
        }
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchDashboardData()

    return () => {
      isMounted = false
    }
  }, [periodo])

  useEffect(() => {
    if (!hasPermission) {
      router.push("/oficina/all-tickets")
    }
  }, [hasPermission, router])

  function downloadCSV() {
    const linhas: string[] = []
    linhas.push(`Relatorio de Manutencao - Oficina - Periodo: ${periodo}`)
    linhas.push(`Gerado em: ${new Date().toLocaleString("pt-BR")}`)
    linhas.push("")
    linhas.push("--- INDICADORES ---")
    linhas.push(`Total de Solicitacoes,${totalGeral}`)
    linhas.push(`Em Aberto,${totalAbertos}`)
    linhas.push(`Concluidas,${totalFechados}`)
    linhas.push(`Taxa de Conclusao,${taxaConclusao}%`)
    linhas.push(`Tempo Medio,${tempoMedio}h`)
    linhas.push("")
    linhas.push("--- STATUS ---")
    linhas.push("Status,Total")
    statusStats.forEach((s) => linhas.push(`${s.status},${s.total}`))
    linhas.push("")
    linhas.push("--- DEFEITOS MAIS COMUNS ---")
    linhas.push("Defeito,Total")
    defeitosStats.forEach((d) => linhas.push(`${d.defeito},${d.total}`))
    linhas.push("")
    linhas.push("--- POR FUNCAO ---")
    linhas.push("Funcao,Total")
    funcoesStats.forEach((f) => linhas.push(`${f.funcao},${f.total}`))
    linhas.push("")
    linhas.push("--- POR VEICULO ---")
    linhas.push("Veiculo,Total")
    veiculosStats.forEach((v) => linhas.push(`${v.veiculo},${v.total}`))
    linhas.push("")
    linhas.push("--- MELHORES VEICULOS (MENOS OCORRENCIAS) ---")
    linhas.push("Veiculo,Total")
    melhoresVeiculos.forEach((v) => linhas.push(`${v.veiculo},${v.total}`))
    linhas.push("")
    linhas.push("--- TEMPO MEDIO POR DEFEITO ---")
    linhas.push("Defeito,Tempo(h)")
    tempoMedioPorDefeito.forEach((t) => linhas.push(`${t.defeito},${t.total}`))
    linhas.push("")
    linhas.push("--- REINCIDENCIA (<=15 DIAS) ---")
    linhas.push("Veiculo,Defeito,Ocorrencias,Intervalo(dias)")
    reincidenciaStats.forEach((r) => linhas.push(`${r.veiculo},${r.defeito},${r.ocorrencias},${r.intervaloDias}`))
    linhas.push("")
    linhas.push("--- SAZONALIDADE DE DEFEITOS ---")
    linhas.push("Mes,Defeito,Total")
    sazonalidadeDefeitos.forEach((s) => s.defeitos.forEach((d) => linhas.push(`${s.mes},${d.defeito},${d.total}`)))
    linhas.push("")
    linhas.push("--- EVOLUCAO TEMPORAL ---")
    linhas.push("Periodo,Total")
    chamadosPeriodo.forEach((c) => linhas.push(`${c.periodo},${c.total}`))
    const blob = new Blob([linhas.join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dashboard_oficina_${periodo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function downloadPDF() {
    const jsPDF = (await import("jspdf")).default
    const pdf = new jsPDF()
    let y = 20
    const pageHeight = 280
    const checkPage = () => { if (y > pageHeight) { pdf.addPage(); y = 20 } }

    pdf.setFontSize(18)
    pdf.text("Relatorio de Manutencao - Oficina", 10, y)
    y += 8
    pdf.setFontSize(10)
    pdf.text(`Gerado em: ${new Date().toLocaleString("pt-BR")} | Periodo: ${periodo}`, 10, y)
    y += 12

    pdf.setFontSize(14)
    pdf.text("Indicadores", 10, y); y += 8
    pdf.setFontSize(11)
    pdf.text(`Total de Solicitacoes: ${totalGeral}`, 15, y); y += 6
    pdf.text(`Em Aberto: ${totalAbertos}`, 15, y); y += 6
    pdf.text(`Concluidas: ${totalFechados}`, 15, y); y += 6
    pdf.text(`Taxa de Conclusao: ${taxaConclusao}%`, 15, y); y += 6
    pdf.text(`Tempo Medio: ${tempoMedio} horas`, 15, y); y += 10
    checkPage()

    if (statusStats.length > 0) {
      pdf.setFontSize(14)
      pdf.text("Status", 10, y); y += 8
      pdf.setFontSize(11)
      statusStats.forEach((s) => {
        pdf.text(`${s.status}: ${s.total}`, 15, y); y += 6; checkPage()
      })
      y += 4; checkPage()
    }

    if (defeitosStats.length > 0) {
      pdf.setFontSize(14)
      pdf.text("Defeitos mais Comuns", 10, y); y += 8
      pdf.setFontSize(11)
      defeitosStats.slice(0, 20).forEach((d) => {
        pdf.text(`${d.defeito}: ${d.total}`, 15, y); y += 6; checkPage()
      })
      y += 4; checkPage()
    }

    if (funcoesStats.length > 0) {
      pdf.setFontSize(14)
      pdf.text("Por Funcao", 10, y); y += 8
      pdf.setFontSize(11)
      funcoesStats.forEach((f) => {
        pdf.text(`${f.funcao}: ${f.total}`, 15, y); y += 6; checkPage()
      })
      y += 4; checkPage()
    }

    if (veiculosStats.length > 0) {
      pdf.setFontSize(14)
      pdf.text("Por Veiculo", 10, y); y += 8
      pdf.setFontSize(11)
      veiculosStats.slice(0, 20).forEach((v) => {
        pdf.text(`Veiculo ${v.veiculo}: ${v.total}`, 15, y); y += 6; checkPage()
      })
      y += 4; checkPage()
    }

    if (melhoresVeiculos.length > 0) {
      pdf.setFontSize(14)
      pdf.text("Melhores Veiculos (menos ocorrencias)", 10, y); y += 8
      pdf.setFontSize(11)
      melhoresVeiculos.slice(0, 10).forEach((v) => {
        pdf.text(`Veiculo ${v.veiculo}: ${v.total}`, 15, y); y += 6; checkPage()
      })
      y += 4; checkPage()
    }

    if (tempoMedioPorDefeito.length > 0) {
      pdf.setFontSize(14)
      pdf.text("Tempo Medio por Defeito", 10, y); y += 8
      pdf.setFontSize(11)
      tempoMedioPorDefeito.forEach((t) => {
        pdf.text(`${t.defeito}: ${t.total}h`, 15, y); y += 6; checkPage()
      })
      y += 4; checkPage()
    }

    if (reincidenciaStats.length > 0) {
      pdf.setFontSize(14)
      pdf.text("Reincidencia (<=15 dias)", 10, y); y += 8
      pdf.setFontSize(11)
      reincidenciaStats.forEach((r) => {
        pdf.text(`${r.veiculo} - ${r.defeito}: ${r.ocorrencias}x em ${r.intervaloDias}d`, 15, y); y += 6; checkPage()
      })
      y += 4; checkPage()
    }

    if (sazonalidadeDefeitos.length > 0) {
      pdf.setFontSize(14)
      pdf.text("Sazonalidade de Defeitos", 10, y); y += 8
      pdf.setFontSize(11)
      sazonalidadeDefeitos.forEach((s) => {
        pdf.text(`${s.mes}:`, 15, y); y += 5
        s.defeitos.slice(0, 5).forEach((d) => {
          pdf.text(`  ${d.defeito}: ${d.total}`, 20, y); y += 5; checkPage()
        })
      })
      y += 4; checkPage()
    }

    if (chamadosPeriodo.length > 0) {
      pdf.setFontSize(14)
      pdf.text("Evolucao Temporal", 10, y); y += 8
      pdf.setFontSize(11)
      chamadosPeriodo.forEach((c) => {
        pdf.text(`${c.periodo}: ${c.total}`, 15, y); y += 6; checkPage()
      })
    }

    pdf.save("dashboard_oficina.pdf")
  }

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 bg-red-500/10 rounded-full">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m0 0v2m0-2h2m-2 0H10m3.332-4.76a2 2 0 11-2.828 2.829 2 2 0 012.828-2.829zm4-8a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-black uppercase tracking-widest opacity-80">Acesso Negado</h1>
        <p className="text-sm opacity-50 max-w-md text-center font-medium">
          Voce nao possui as permissoes necessarias para visualizar as metricas deste dashboard.
          Contate o administrador do sistema.
        </p>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen px-4 py-8 space-y-6 transition-colors duration-300 max-w-[1600px] mx-auto select-none"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[var(--surface)] p-2 pl-4 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
        <span className="text-xs font-black uppercase tracking-[0.2em] opacity-50">Filtros</span>

        <div className="flex items-center gap-4">
          <nav className="flex bg-[var(--background)] p-1 rounded-xl border border-[var(--border-subtle)]">
            {(["dia", "semana", "mes", "ano"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                disabled={isLoading}
                className={`px-4 py-1.5 rounded-lg font-bold transition-all capitalize text-xs ${
                  periodo === p ? "shadow-md scale-105" : "opacity-40 hover:opacity-100"
                } ${isLoading ? "cursor-not-allowed" : ""}`}
                style={{
                  backgroundColor: periodo === p ? "var(--primary)" : "transparent",
                  color: periodo === p ? "white" : "var(--foreground)",
                }}
              >
                {p}
              </button>
            ))}
          </nav>

          <div className="h-8 w-[1px] bg-[var(--border-subtle)] hidden md:block" />

          <div className="flex gap-2">
            <button
              onClick={downloadCSV}
              className="p-2 px-4 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:brightness-110 transition-all"
              style={{ backgroundColor: "var(--status-completed)" }}
            >
              CSV
            </button>
            <button
              onClick={downloadPDF}
              className="p-2 px-4 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:brightness-110 transition-all"
              style={{ backgroundColor: "var(--status-in-progress)" }}
            >
              PDF
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            label="Solicitacoes"
            value={isLoading ? "..." : totalGeral}
            unit="total"
            color="var(--foreground)"
          />
          <KPICard
            label="Em Aberto"
            value={isLoading ? "..." : totalAbertos}
            unit="aguardando"
            color="var(--status-in-progress)"
          />
          <KPICard
            label="Concluidas"
            value={isLoading ? "..." : totalFechados}
            unit="finalizadas"
            color="var(--status-completed)"
          />
          <KPICard
            label="Tempo Medio"
            value={isLoading ? "..." : tempoMedio}
            unit="horas"
            color="var(--primary)"
          />
        </div>

        {!isLoading && statusStats.length > 0 && (
          <Charts
            statusStats={statusStats}
            funcoesStats={funcoesStats}
            veiculosStats={veiculosStats}
            tempoMedioPorDefeito={tempoMedioPorDefeito}
            melhoresVeiculos={melhoresVeiculos}
            defeitosStats={defeitosStats}
            chamadosPeriodo={chamadosPeriodo}
          />
        )}

        {isLoading && (
          <>
            {[1,2,3,4,5,6,7].map((i) => (
              <div key={i} className="lg:col-span-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
                <div className="w-full h-[260px] flex items-center justify-center opacity-20 font-black text-xs tracking-widest">CARREGANDO...</div>
              </div>
            ))}
          </>
        )}

        {!isLoading && statusStats.length === 0 && (
          <div className="lg:col-span-12 flex flex-col items-center justify-center py-20 space-y-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] shadow-sm">
            <div className="text-6xl">🔧</div>
            <p className="text-lg font-bold opacity-60">Nenhum dado disponível</p>
            <p className="text-sm opacity-40">Não há registros no período selecionado para exibir nos gráficos.</p>
          </div>
        )}

        {/* Reincidencia */}
        <div className="lg:col-span-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-70">{'Reincidencia (<=15dias)'}</h2>
          <div className="h-[260px] overflow-auto">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center opacity-20 font-black text-xs tracking-widest">CARREGANDO...</div>
            ) : reincidenciaStats.length > 0 ? (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left opacity-30 border-b border-[var(--border-subtle)]">
                    <th className="pb-2 font-black tracking-widest text-[9px]">VEICULO</th>
                    <th className="pb-2 font-black tracking-widest text-[9px]">DEFEITO</th>
                    <th className="pb-2 font-black tracking-widest text-right text-[9px]">REINCIDENCIAS</th>
                    <th className="pb-2 font-black tracking-widest text-right text-[9px]">INTERVALO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {reincidenciaStats.slice(0, 8).map((r, i) => (
                    <tr key={i} className="hover:bg-[var(--background)] hover:bg-opacity-40 transition-colors">
                      <td className="py-2 pr-2 font-bold opacity-80 text-[10px]">{r.veiculo}</td>
                      <td className="py-2 pr-2 font-bold opacity-60 text-[10px] max-w-[100px] truncate">{r.defeito}</td>
                      <td className="py-2 text-right">
                        <span className="bg-[var(--background)] px-2 py-0.5 rounded-lg font-black text-[11px]" style={{ color: "var(--status-waiting)" }}>{r.ocorrencias}x</span>
                      </td>
                      <td className="py-2 text-right text-[10px] font-bold opacity-40">{r.intervaloDias}d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-30 font-bold uppercase text-xs tracking-widest">Sem reincidencias</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-12 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--background)] bg-opacity-20 flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">
              Solicitacoes por Veiculo
            </h2>
            <span className="text-[10px] font-bold opacity-40">RANKING</span>
          </div>
          <div className="overflow-auto max-h-[300px]">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left opacity-30 border-b border-[var(--border-subtle)]">
                  <th className="px-6 py-3 font-black tracking-widest text-[9px]">#</th>
                  <th className="px-6 py-3 font-black tracking-widest text-[9px]">VEICULO</th>
                  <th className="px-6 py-3 font-black tracking-widest text-right text-[9px]">SOLICITACOES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {veiculosStats.length > 0 ? (
                  veiculosStats.slice(0, 10).map((v, i) => (
                    <tr
                      key={i}
                      className="hover:bg-[var(--background)] hover:bg-opacity-40 transition-colors group"
                    >
                      <td className="px-6 py-3 font-black opacity-30 w-10">
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td className="px-6 py-3 font-bold opacity-80 group-hover:opacity-100">
                        Veiculo {v.veiculo}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span
                          className="bg-[var(--background)] px-3 py-1 rounded-lg font-black"
                          style={{ color: "var(--status-in-progress)" }}
                        >
                          {v.total}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-10 text-center opacity-30 font-bold uppercase tracking-widest"
                    >
                      {isLoading ? "Buscando dados..." : "Nenhum dado encontrado"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sazonalidade de Defeitos */}
        <div className="lg:col-span-12 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Sazonalidade de Defeitos</h2>
            <span className="text-[10px] font-bold opacity-40">DEFEITOS POR MES</span>
          </div>
          <div className="overflow-auto max-h-[400px]">
            {isLoading ? (
              <div className="w-full h-40 flex items-center justify-center opacity-20 font-black text-xs tracking-widest">CARREGANDO...</div>
            ) : sazonalidadeDefeitos.length > 0 ? (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left opacity-30 border-b border-[var(--border-subtle)]">
                    <th className="px-4 py-3 font-black tracking-widest text-[9px]">MES</th>
                    <th className="px-4 py-3 font-black tracking-widest text-[9px]">DEFEITO</th>
                    <th className="px-4 py-3 font-black tracking-widest text-right text-[9px]">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {sazonalidadeDefeitos.map((s, mi) => s.defeitos.slice(0, 5).map((d, di) => (
                    <tr key={`${mi}-${di}`} className="hover:bg-[var(--background)] hover:bg-opacity-40 transition-colors">
                      {di === 0 && (
                        <td className="px-4 py-3 font-black opacity-50 align-top" rowSpan={Math.min(s.defeitos.length, 5)}>
                          {s.mes}
                        </td>
                      )}
                      <td className="px-4 py-3 font-bold opacity-80">{d.defeito}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="bg-[var(--background)] px-3 py-1 rounded-lg font-black" style={{ color: "var(--status-in-progress)" }}>
                          {d.total}
                        </span>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            ) : (
              <div className="w-full h-40 flex items-center justify-center opacity-30 font-bold uppercase text-xs tracking-widest">Sem dados</div>
            )}
          </div>
        </div>

        {/* Correlacao Defeito x Veiculo */}
        {correlacaoDefeitoVeiculo.length > 0 && correlacaoDefeitoVeiculo.slice(0, 5).map((item) => (
          <div key={item.defeito} className="lg:col-span-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-70 truncate">{item.defeito}</h2>
            <div className="space-y-2">
              {item.veiculos.slice(0, 6).map((v, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[11px] font-bold opacity-70 truncate mr-2">{v.veiculo}</span>
                  <span className="text-[11px] font-black" style={{ color: "var(--status-cancelled)" }}>{v.total}x</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function KPICard({
  label,
  value,
  unit,
  color,
}: {
  label: string
  value: string | number
  unit: string
  color: string
}) {
  return (
    <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-sm relative overflow-hidden group">
      <div
        className="absolute top-0 right-0 w-28 h-28 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"
        style={{ backgroundColor: color, opacity: 0.04 }}
      />
      <p className="text-[10px] font-black uppercase opacity-40 mb-1.5 tracking-widest">{label}</p>
      <p className="text-3xl font-black" style={{ color }}>
        {value}
      </p>
      <p className="text-[10px] font-bold opacity-30 mt-0.5 uppercase tracking-wider">{unit}</p>
    </div>
  )
}
