"use client"

import { useState, useCallback } from 'react'
import { Play, Shield, CheckCircle, XCircle, AlertTriangle, FileWarning, Bug, RefreshCw, UserCheck, KeyRound } from 'lucide-react'

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
  stats: { total: number; passed: number; failed: number; suitesTotal: number; suitesPassed: number; suitesFailed: number }
  categories: Record<string, CategoryData>
  vulnerabilities: string[]
  crashRisks: string[]
  allPassed: boolean
}

interface AccessTestItem {
  nome: string; resultado: boolean; esperado: boolean; critico: boolean; explicacao: string
}

interface AccessReport {
  autenticado: boolean
  usuario: { nome: string; email: string; role: string; roleLabel: string; setor: string; empresa: { id: string; nome: string } | null }
  estatisticas: { totalUsuariosSistema: number; usuariosMesmaEmpresa: number; totalEmpresas: number; chamadosEmpresa: number; chamadosGeral: number }
  permissoes: {
    criacao: { papel: string; label: string; permitido: boolean }[]
    exclusao: { papel: string; label: string; permitido: boolean; motivo?: string }[]
    podeVerPapeis: string[]
    podeCriarPapeis: string[]
  }
  testes: AccessTestItem[]
  vulnerabilidades: { nivel: string; teste: string; explicacao: string; resultado: boolean; esperado: boolean }[]
  warnings: { nivel: string; teste: string; explicacao: string; resultado: boolean; esperado: boolean }[]
  seguro: boolean
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

  const [accessEmail, setAccessEmail] = useState('')
  const [accessPassword, setAccessPassword] = useState('')
  const [accessLoading, setAccessLoading] = useState(false)
  const [accessReport, setAccessReport] = useState<AccessReport | null>(null)
  const [accessError, setAccessError] = useState<string | null>(null)

  const runTests = useCallback(async () => {
    setLoading(true)
    setError(null)
    setReport(null)
    try {
      const res = await fetch('/api/testes')
      const data = await res.json()
      if (data.error) { setError(data.error); if (data.raw) console.error(data.raw) }
      else { setReport(data) }
    } catch (err: any) { setError(err.message || 'Erro ao conectar com o servidor') }
    finally { setLoading(false) }
  }, [])

  const runAccessTest = useCallback(async () => {
    if (!accessEmail || !accessPassword) return
    setAccessLoading(true)
    setAccessError(null)
    setAccessReport(null)
    try {
      const res = await fetch('/api/testes/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: accessEmail, password: accessPassword }),
      })
      const data = await res.json()
      if (data.error) { setAccessError(data.error) }
      else { setAccessReport(data) }
    } catch (err: any) { setAccessError(err.message || 'Erro ao conectar') }
    finally { setAccessLoading(false) }
  }, [accessEmail, accessPassword])

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield size={32} style={{ color: 'var(--primary)' }} />
            <h1 className="text-2xl font-bold">Central de Testes</h1>
          </div>
          <p className="opacity-60 text-sm">
            Testes unitários, de segurança e validação de acessos por papel.
          </p>
        </header>

        <div className="mb-12">
          <button onClick={runTests} disabled={loading}
            className="w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all"
            style={{ background: loading ? 'var(--border-subtle)' : 'var(--primary)', color: '#fff', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.filter = 'brightness(1.1)' }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.filter = 'none' }}>
            {loading ? <><RefreshCw size={24} className="animate-spin" /> Executando testes...</> : <><Play size={24} /> Executar Todos os Testes</>}
          </button>

          {loading && <div className="text-center py-8"><div className="animate-spin inline-block w-8 h-8 border-4 border-t-transparent rounded-full mb-3" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} /><p className="opacity-60">Compilando e executando testes...</p></div>}

          {error && <div className="p-4 rounded-xl mt-4" style={{ background: 'var(--surface)', border: '1px solid var(--status-cancelled)' }}>
            <div className="flex items-start gap-3"><Bug size={20} style={{ color: 'var(--status-cancelled)', flexShrink: 0 }} /><div><p className="font-bold mb-1">Erro</p><p className="text-sm opacity-70">{error}</p></div></div></div>}

          {report && <div className="space-y-6 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total" value={report.stats.total} color="var(--primary)" />
              <StatCard label="Aprovados" value={report.stats.passed} color="var(--status-completed)" />
              <StatCard label="Falhos" value={report.stats.failed} color="var(--status-cancelled)" />
              <StatCard label="Suítes" value={report.stats.suitesTotal} color="var(--status-waiting)" />
            </div>
            {report.allPassed
              ? <div className="p-6 rounded-xl text-center" style={{ background: 'var(--surface)', border: '2px solid var(--status-completed)' }}>
                  <CheckCircle size={48} style={{ color: 'var(--status-completed)' }} className="mx-auto mb-3" />
                  <h2 className="text-xl font-bold" style={{ color: 'var(--status-completed)' }}>Todos os testes passaram! 🎉</h2>
                  <p className="text-sm opacity-60 mt-1">Nenhuma vulnerabilidade encontrada.</p></div>
              : <div className="p-6 rounded-xl" style={{ background: 'var(--surface)', border: '2px solid var(--status-cancelled)' }}>
                  <div className="flex items-start gap-3"><XCircle size={32} style={{ color: 'var(--status-cancelled)', flexShrink: 0 }} />
                    <div><h2 className="text-xl font-bold" style={{ color: 'var(--status-cancelled)' }}>{report.stats.failed} teste{report.stats.failed > 1 ? 's' : ''} falharam</h2><p className="text-sm opacity-60 mt-1">Revise os detalhes abaixo.</p></div></div></div>}

            {report.vulnerabilities.length > 0 && <div className="p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--status-cancelled)' }}>
              <div className="flex items-center gap-2 mb-3"><AlertTriangle size={18} style={{ color: 'var(--status-cancelled)' }} /><h3 className="font-bold">Vulnerabilidades</h3></div>
              {report.vulnerabilities.map((v, i) => <p key={i} className="text-sm mb-1">{v}</p>)}</div>}

            {report.crashRisks.length > 0 && <div className="p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--status-in-progress)' }}>
              <div className="flex items-center gap-2 mb-3"><FileWarning size={18} style={{ color: 'var(--status-in-progress)' }} /><h3 className="font-bold">Riscos de Crash</h3></div>
              {report.crashRisks.map((r, i) => <p key={i} className="text-sm mb-1">{r}</p>)}</div>}

            {Object.entries(report.categories).map(([key, cat]) => {
              const meta = categoryMeta[key]
              if (cat.total === 0) return null
              const allOk = cat.failed === 0
              return <div key={key} className="p-4 rounded-xl" style={{ background: 'var(--surface)', border: `1px solid ${allOk ? 'var(--border-subtle)' : 'var(--status-cancelled)'}` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2"><span>{meta?.icon || '⚙️'}</span><h3 className="font-bold text-sm">{meta?.label || key}</h3></div>
                  <span className="text-sm font-bold" style={{ color: allOk ? 'var(--status-completed)' : 'var(--status-cancelled)' }}>{cat.passed}/{cat.total}</span></div>
                <div className="h-1.5 rounded-full mb-3" style={{ background: 'var(--border-subtle)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${(cat.passed / cat.total) * 100}%`, background: allOk ? 'var(--status-completed)' : 'var(--status-cancelled)' }} /></div>
                <div className="space-y-0.5">
                  {cat.tests.map((test, i) => <div key={i} className="flex items-start gap-2 py-0.5 px-1.5 rounded text-xs" style={{ background: test.status === 'passed' ? 'transparent' : 'rgba(239,68,68,0.1)' }}>
                    {test.status === 'passed' ? <CheckCircle size={11} style={{ color: 'var(--status-completed)', flexShrink: 0 }} className="mt-0.5" />
                      : <XCircle size={11} style={{ color: 'var(--status-cancelled)', flexShrink: 0 }} className="mt-0.5" />}
                    <div><span style={{ color: test.status === 'passed' ? 'var(--foreground)' : 'var(--status-cancelled)' }}>{test.title}</span>
                      {test.status === 'failed' && test.failureMessages?.length > 0 && <div className="mt-0.5 text-[10px] opacity-60">{test.failureMessages.map((msg, j) => <p key={j} className="font-mono">{msg.substring(0, 200)}</p>)}</div>}</div></div>)}</div></div>
            })}
          </div>}

          {!loading && !report && !error && <div className="text-center py-12 opacity-40"><Play size={40} className="mx-auto mb-3" /><p>Clique em "Executar Todos os Testes"</p></div>}
        </div>

        <hr className="mb-12" style={{ borderColor: 'var(--border-subtle)' }} />

        <section>
          <div className="flex items-center gap-3 mb-2">
            <UserCheck size={28} style={{ color: 'var(--primary)' }} />
            <h2 className="text-xl font-bold">Teste de Acessos por Papel</h2>
          </div>
          <p className="opacity-60 text-sm mb-6">
            Insira email e senha de um usuário do sistema para testar suas permissões de acesso. 
            O teste verifica o RBAC, isolamento multi-tenancy e regras de segurança.
          </p>

          <div className="p-6 rounded-xl mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1 block">Email do usuário</label>
                <input type="email" value={accessEmail} onChange={e => setAccessEmail(e.target.value)} placeholder="email@exemplo.com"
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all"
                  style={{ background: 'var(--background)', border: '1px solid var(--border-subtle)', color: 'var(--foreground)', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'} />
              </div>
              <div className="flex-1 w-full">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1 block">Senha</label>
                <input type="password" value={accessPassword} onChange={e => setAccessPassword(e.target.value)} placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all"
                  style={{ background: 'var(--background)', border: '1px solid var(--border-subtle)', color: 'var(--foreground)', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'} />
              </div>
              <button onClick={runAccessTest} disabled={accessLoading || !accessEmail || !accessPassword}
                className="px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all whitespace-nowrap"
                style={{ background: accessLoading ? 'var(--border-subtle)' : 'var(--primary)', color: '#fff', opacity: (accessLoading || !accessEmail || !accessPassword) ? 0.6 : 1, cursor: (accessLoading || !accessEmail || !accessPassword) ? 'not-allowed' : 'pointer' }}
                onMouseEnter={(e) => { if (!accessLoading) e.currentTarget.style.filter = 'brightness(1.1)' }}
                onMouseLeave={(e) => { if (!accessLoading) e.currentTarget.style.filter = 'none' }}>
                {accessLoading ? <><RefreshCw size={16} className="animate-spin" /> Testando...</> : <><KeyRound size={16} /> Testar Acesso</>}
              </button>
            </div>
          </div>

          {accessLoading && <div className="text-center py-8"><div className="animate-spin inline-block w-8 h-8 border-4 border-t-transparent rounded-full mb-3" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} /><p className="opacity-60">Autenticando e testando permissões...</p></div>}

          {accessError && <div className="p-4 rounded-xl mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--status-cancelled)' }}>
            <div className="flex items-start gap-3"><XCircle size={20} style={{ color: 'var(--status-cancelled)', flexShrink: 0 }} />
              <div><p className="font-bold mb-1">Falha na autenticação</p><p className="text-sm opacity-70">{accessError}</p></div></div></div>}

          {accessReport && (
            <div className="space-y-6">
              {accessReport.seguro
                ? <div className="p-6 rounded-xl text-center" style={{ background: 'var(--surface)', border: '2px solid var(--status-completed)' }}>
                    <CheckCircle size={40} style={{ color: 'var(--status-completed)' }} className="mx-auto mb-2" />
                    <h2 className="text-lg font-bold" style={{ color: 'var(--status-completed)' }}>Acesso seguro ✅</h2>
                    <p className="text-sm opacity-60">Nenhuma vulnerabilidade crítica encontrada para este usuário.</p></div>
                : <div className="p-6 rounded-xl" style={{ background: 'var(--surface)', border: '2px solid var(--status-cancelled)' }}>
                    <div className="flex items-start gap-3"><AlertTriangle size={28} style={{ color: 'var(--status-cancelled)', flexShrink: 0 }} />
                      <div><h2 className="text-lg font-bold" style={{ color: 'var(--status-cancelled)' }}>Vulnerabilidades detectadas!</h2>
                        <p className="text-sm opacity-60 mt-1">Este usuário possui permissões que precisam ser revisadas.</p></div></div></div>}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
                  <p className="text-xs uppercase tracking-wider opacity-60 mb-2">Usuário</p>
                  <p className="font-bold">{accessReport.usuario.nome}</p>
                  <p className="text-sm opacity-60">{accessReport.usuario.email}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
                  <p className="text-xs uppercase tracking-wider opacity-60 mb-2">Papel / Setor</p>
                  <p className="font-bold">{accessReport.usuario.roleLabel}</p>
                  <p className="text-sm opacity-60">{accessReport.usuario.role} {accessReport.usuario.setor ? `• ${accessReport.usuario.setor}` : ''}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
                  <p className="text-xs uppercase tracking-wider opacity-60 mb-2">Empresa</p>
                  <p className="font-bold">{accessReport.usuario.empresa?.nome || 'N/A'}</p>
                  <p className="text-sm opacity-60">ID: {(accessReport.usuario.empresa?.id || '').substring(0, 8)}...</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatCard label="Usuários (sistema)" value={accessReport.estatisticas.totalUsuariosSistema} color="var(--primary)" />
                <StatCard label="Usuários (empresa)" value={accessReport.estatisticas.usuariosMesmaEmpresa} color="var(--status-completed)" />
                <StatCard label="Empresas" value={accessReport.estatisticas.totalEmpresas} color="var(--status-waiting)" />
                <StatCard label="Chamados (empresa)" value={accessReport.estatisticas.chamadosEmpresa} color="var(--status-in-progress)" />
                <StatCard label="Chamados (geral)" value={accessReport.estatisticas.chamadosGeral} color="var(--status-new)" />
              </div>

              <div className="p-5 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
                <h3 className="font-bold mb-4">🔑 Matriz de Permissões</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">Criação de papéis</p>
                    <div className="space-y-1.5">
                      {accessReport.permissoes.criacao.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          {p.permitido ? <CheckCircle size={14} style={{ color: 'var(--status-completed)' }} /> : <XCircle size={14} style={{ color: 'var(--status-cancelled)' }} />}
                          <span>{p.label}</span>
                          <span className="text-[10px] opacity-50">({p.papel})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">Exclusão de papéis</p>
                    <div className="space-y-1.5">
                      {accessReport.permissoes.exclusao.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          {p.permitido ? <CheckCircle size={14} style={{ color: 'var(--status-completed)' }} /> : <XCircle size={14} style={{ color: 'var(--status-cancelled)' }} />}
                          <span>{p.label}</span>
                          <span className="text-[10px] opacity-50">({p.papel})</span>
                          {p.motivo && <span className="text-[10px] opacity-40 ml-1">— {p.motivo}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {accessReport.permissoes.podeCriarPapeis.length > 0 && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">Pode criar:</p>
                    <p className="text-sm">{accessReport.permissoes.podeCriarPapeis.join(', ') || 'Nenhum'}</p>
                  </div>
                )}
                {accessReport.permissoes.podeVerPapeis.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">Pode ver na listagem:</p>
                    <p className="text-sm">{accessReport.permissoes.podeVerPapeis.join(', ') || 'Nenhum'}</p>
                  </div>
                )}
              </div>

              <div className="p-5 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
                <h3 className="font-bold mb-4">📋 Resultado dos Testes de Acesso</h3>
                <div className="space-y-1.5">
                  {accessReport.testes.map((test, i) => {
                    const passou = test.resultado === test.esperado
                    return <div key={i} className="flex items-start gap-2 py-1.5 px-2 rounded-lg text-sm" style={{ background: passou ? 'transparent' : 'rgba(239,68,68,0.08)' }}>
                      {passou ? <CheckCircle size={14} style={{ color: 'var(--status-completed)', flexShrink: 0 }} className="mt-0.5" /> : <XCircle size={14} style={{ color: 'var(--status-cancelled)', flexShrink: 0 }} className="mt-0.5" />}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={passou ? '' : 'font-bold'} style={{ color: passou ? 'var(--foreground)' : 'var(--status-cancelled)' }}>{test.nome}</span>
                          {test.critico && !passou && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.2)', color: 'var(--status-cancelled)' }}>CRÍTICO</span>}
                        </div>
                        <p className="text-xs opacity-50 mt-0.5">{test.explicacao}</p>
                      </div>
                    </div>
                  })}
                </div>
              </div>

              {accessReport.vulnerabilidades.length > 0 && (
                <div className="p-5 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--status-cancelled)' }}>
                  <div className="flex items-center gap-2 mb-3"><AlertTriangle size={18} style={{ color: 'var(--status-cancelled)' }} /><h3 className="font-bold">🔴 Vulnerabilidades Críticas</h3></div>
                  {accessReport.vulnerabilidades.map((v, i) => (
                    <div key={i} className="mb-3 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.08)' }}>
                      <p className="font-bold" style={{ color: 'var(--status-cancelled)' }}>{v.teste}</p>
                      <p className="opacity-70 mt-1">{v.explicacao}</p>
                      <p className="text-xs mt-1 opacity-50">Esperado: {String(v.esperado)} | Obtido: {String(v.resultado)}</p>
                    </div>
                  ))}
                </div>
              )}

              {accessReport.warnings.length > 0 && (
                <div className="p-5 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--status-in-progress)' }}>
                  <div className="flex items-center gap-2 mb-3"><FileWarning size={18} style={{ color: 'var(--status-in-progress)' }} /><h3 className="font-bold">🟡 Alertas de Permissão</h3></div>
                  {accessReport.warnings.map((w, i) => (
                    <div key={i} className="mb-2 p-2.5 rounded-lg text-sm" style={{ background: 'rgba(251,191,36,0.08)' }}>
                      <p className="font-bold">{w.teste}</p>
                      <p className="opacity-70 text-xs mt-0.5">{w.explicacao}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!accessLoading && !accessReport && !accessError && (
            <div className="text-center py-12 opacity-40">
              <KeyRound size={40} className="mx-auto mb-3" />
              <p>Insira email e senha de um usuário para testar seus acessos</p>
              <p className="text-xs mt-1">Teste com diferentes papéis (GOD, ADMIN, GESTOR, ATENDENTE) para verificar o isolamento</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="p-4 rounded-xl text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
    <div className="text-2xl font-bold mb-1" style={{ color }}>{value}</div>
    <div className="text-[10px] opacity-60 uppercase tracking-wider">{label}</div>
  </div>
}
