"use client"

import { useState, useCallback } from 'react'
import { Play, Shield, CheckCircle, XCircle, AlertTriangle, FileWarning, Bug, RefreshCw } from 'lucide-react'

interface TestAssertion {
  title: string
  status: 'passed' | 'failed'
  failureMessages: string[]
  ancestorTitles?: string[]
}

interface CategoryData {
  total: number
  passed: number
  failed: number
  tests: TestAssertion[]
}

interface TestReport {
  stats: {
    total: number
    passed: number
    failed: number
    suitesTotal: number
    suitesPassed: number
    suitesFailed: number
  }
  categories: Record<string, CategoryData>
  vulnerabilities: string[]
  crashRisks: string[]
  allPassed: boolean
}

const categoryMeta: Record<string, { icon: string; label: string; color: string }> = {
  rbac: { icon: '🔒', label: 'Controle de Acesso (RBAC)', color: 'var(--status-new)' },
  validation: { icon: '✅', label: 'Validação de Entrada', color: 'var(--status-in-progress)' },
  phoneMap: { icon: '📞', label: 'Persistência de Dados (PhoneMap)', color: 'var(--status-waiting)' },
  security: { icon: '🛡️', label: 'Segurança e Privacidade', color: 'var(--status-completed)' },
}

export default function TestesPage() {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<TestReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runTests = useCallback(async () => {
    setLoading(true)
    setError(null)
    setReport(null)

    try {
      const res = await fetch('/api/testes')
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        if (data.raw) console.error('Raw output:', data.raw)
      } else {
        setReport(data)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield size={32} style={{ color: 'var(--primary)' }} />
            <h1 className="text-2xl font-bold">Central de Testes</h1>
          </div>
          <p className="opacity-60 text-sm">
            Testes unitários e de segurança para validação do sistema. Clique no botão abaixo para executar todos os testes automaticamente.
          </p>
        </header>

        <button
          onClick={runTests}
          disabled={loading}
          className="w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all mb-8"
          style={{
            background: loading ? 'var(--border-subtle)' : 'var(--primary)',
            color: '#fff',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.filter = 'brightness(1.1)' }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.filter = 'none' }}
        >
          {loading ? (
            <>
              <RefreshCw size={24} className="animate-spin" />
              Executando testes...
            </>
          ) : (
            <>
              <Play size={24} />
              Executar Todos os Testes
            </>
          )}
        </button>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin inline-block w-8 h-12 border-4 border-t-transparent rounded-full mb-4" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
            <p className="opacity-60">Compilando e executando testes... Isso pode levar alguns segundos.</p>
          </div>
        )}

        {error && (
          <div className="p-6 rounded-xl mb-8" style={{ background: 'var(--surface)', border: '1px solid var(--status-cancelled)' }}>
            <div className="flex items-start gap-3">
              <Bug size={24} style={{ color: 'var(--status-cancelled)', flexShrink: 0 }} />
              <div>
                <h3 className="font-bold mb-1">Erro ao executar testes</h3>
                <p className="text-sm opacity-70">{error}</p>
                <p className="text-xs mt-2 opacity-50">
                  Verifique se as dependências estão instaladas (npm install) e se o Vitest está configurado corretamente.
                </p>
              </div>
            </div>
          </div>
        )}

        {report && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total de Testes" value={report.stats.total} color="var(--primary)" />
              <StatCard label="Aprovados" value={report.stats.passed} color="var(--status-completed)" />
              <StatCard label="Falhos" value={report.stats.failed} color="var(--status-cancelled)" />
              <StatCard label="Suítes" value={report.stats.suitesTotal} color="var(--status-waiting)" />
            </div>

            {report.allPassed ? (
              <div className="p-6 rounded-xl text-center" style={{ background: 'var(--surface)', border: '2px solid var(--status-completed)' }}>
                <CheckCircle size={48} style={{ color: 'var(--status-completed)' }} className="mx-auto mb-3" />
                <h2 className="text-xl font-bold" style={{ color: 'var(--status-completed)' }}>Todos os testes passaram! 🎉</h2>
                <p className="text-sm opacity-60 mt-1">Nenhuma vulnerabilidade encontrada.</p>
              </div>
            ) : (
              <div className="p-6 rounded-xl" style={{ background: 'var(--surface)', border: '2px solid var(--status-cancelled)' }}>
                <div className="flex items-start gap-3">
                  <XCircle size={32} style={{ color: 'var(--status-cancelled)', flexShrink: 0 }} />
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--status-cancelled)' }}>
                      {report.stats.failed} teste{report.stats.failed > 1 ? 's' : ''} falharam
                    </h2>
                    <p className="text-sm opacity-60 mt-1">Revise os detalhes abaixo antes de prosseguir.</p>
                  </div>
                </div>
              </div>
            )}

            {report.stats.total === 0 && (
              <div className="p-6 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--status-waiting)' }}>
                <p className="text-center opacity-60">Nenhum teste foi encontrado. Verifique se os arquivos .test.ts estão no diretório src/__tests__/.</p>
              </div>
            )}

            {report.vulnerabilities.length > 0 && (
              <div className="p-6 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--status-cancelled)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={20} style={{ color: 'var(--status-cancelled)' }} />
                  <h3 className="font-bold text-lg">Análise de Vulnerabilidades</h3>
                </div>
                <ul className="space-y-2">
                  {report.vulnerabilities.map((v, i) => <li key={i} className="flex items-start gap-2 text-sm"><span>{v}</span></li>)}
                </ul>
              </div>
            )}

            {report.crashRisks.length > 0 && (
              <div className="p-6 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--status-in-progress)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <FileWarning size={20} style={{ color: 'var(--status-in-progress)' }} />
                  <h3 className="font-bold text-lg">Riscos de Crash / Parada da Aplicação</h3>
                </div>
                <ul className="space-y-2">
                  {report.crashRisks.map((r, i) => <li key={i} className="flex items-start gap-2 text-sm"><span>{r}</span></li>)}
                </ul>
              </div>
            )}

            {Object.entries(report.categories).map(([key, cat]) => {
              const meta = categoryMeta[key]
              if (cat.total === 0) return null
              const allOk = cat.failed === 0
              return (
                <div key={key} className="p-6 rounded-xl" style={{ background: 'var(--surface)', border: `1px solid ${allOk ? 'var(--border-subtle)' : 'var(--status-cancelled)'}` }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{meta?.icon || '⚙️'}</span>
                      <h3 className="font-bold">{meta?.label || key}</h3>
                    </div>
                    <span className="text-sm font-bold" style={{ color: allOk ? 'var(--status-completed)' : 'var(--status-cancelled)' }}>
                      {cat.passed}/{cat.total} aprovados
                    </span>
                  </div>
                  <div className="h-2 rounded-full mb-4" style={{ background: 'var(--border-subtle)' }}>
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${(cat.passed / cat.total) * 100}%`,
                      background: allOk ? 'var(--status-completed)' : 'var(--status-cancelled)',
                    }} />
                  </div>
                  <div className="space-y-1">
                    {cat.tests.map((test, i) => (
                      <div key={i} className="flex items-start gap-2 py-1 px-2 rounded-lg text-sm" style={{
                        background: test.status === 'passed' ? 'transparent' : 'rgba(239,68,68,0.1)',
                      }}>
                        {test.status === 'passed' ? (
                          <CheckCircle size={14} style={{ color: 'var(--status-completed)', flexShrink: 0 }} className="mt-0.5" />
                        ) : (
                          <XCircle size={14} style={{ color: 'var(--status-cancelled)', flexShrink: 0 }} className="mt-0.5" />
                        )}
                        <div>
                          <span className={test.status === 'passed' ? '' : 'font-bold'} style={{
                            color: test.status === 'passed' ? 'var(--foreground)' : 'var(--status-cancelled)',
                          }}>
                            {test.title}
                          </span>
                          {test.status === 'failed' && test.failureMessages?.length > 0 && (
                            <div className="mt-1 text-xs opacity-60 space-y-1">
                              {test.failureMessages.map((msg, j) => (
                                <p key={j} className="font-mono whitespace-pre-wrap break-all" style={{ maxHeight: 60, overflow: 'hidden' }}>
                                  {msg.substring(0, 300)}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && !report && !error && (
          <div className="text-center py-16 opacity-40">
            <Play size={48} className="mx-auto mb-4" />
            <p>Clique em "Executar Todos os Testes" para começar</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="p-4 rounded-xl text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
      <div className="text-3xl font-bold mb-1" style={{ color }}>{value}</div>
      <div className="text-xs opacity-60">{label}</div>
    </div>
  )
}
