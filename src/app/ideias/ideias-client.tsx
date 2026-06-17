'use client'

import { useState, useMemo } from 'react'
import type { IdeiaItem, IdeiaCategory } from '@/lib/ideias-data'

const SEVERITY_CONFIG: Record<string, { emoji: string; color: string; label: string }> = {
  'CRÍTICO': { emoji: '🔴', color: '#FF4444', label: 'Crítico' },
  'ALTO': { emoji: '🟡', color: '#FF8C00', label: 'Alto' },
  'MÉDIO': { emoji: '⚠️', color: '#FFD700', label: 'Médio' },
  'BAIXO': { emoji: '🔵', color: '#00BFFF', label: 'Baixo' },
}

const EFFORT_CONFIG: Record<string, { emoji: string; color: string; label: string }> = {
  'Pequeno': { emoji: '🟢', color: '#00D084', label: 'Pequeno' },
  'Médio': { emoji: '🟡', color: '#FF8C00', label: 'Médio' },
  'Grande': { emoji: '🔴', color: '#FF4444', label: 'Grande' },
}

const CATEGORY_ICONS: Record<string, string> = {
  SEG: '🔴',
  ARQ: '🟡',
  PERF: '⚡',
  UX: '🎨',
  INFRA: '🛠️',
  TEST: '🧪',
}

type FilterKey = 'CRÍTICO' | 'ALTO' | 'MÉDIO' | 'BAIXO'
type EffortKey = 'Pequeno' | 'Médio' | 'Grande'

export function IdeiasClient({
  items,
  categories,
}: {
  items: IdeiaItem[]
  categories: IdeiaCategory[]
}) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [severityFilters, setSeverityFilters] = useState<Set<FilterKey>>(new Set())
  const [effortFilters, setEffortFilters] = useState<Set<EffortKey>>(new Set())
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'severity' | 'effort'>('severity')

  const filtered = useMemo(() => {
    let result = [...items]

    if (severityFilters.size > 0) {
      result = result.filter(i => severityFilters.has(i.severity as FilterKey))
    }

    if (effortFilters.size > 0) {
      result = result.filter(i => effortFilters.has(i.effort as EffortKey))
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        i.problem.toLowerCase().includes(q) ||
        i.suggestion.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q)
      )
    }

    const severityOrder: Record<string, number> = { 'CRÍTICO': 0, 'ALTO': 1, 'MÉDIO': 2, 'BAIXO': 3 }
    const effortOrder: Record<string, number> = { 'Pequeno': 0, 'Médio': 1, 'Grande': 2 }

    result.sort((a, b) => {
      if (sortBy === 'severity') {
        const sa = severityOrder[a.severity] ?? 99
        const sb = severityOrder[b.severity] ?? 99
        if (sa !== sb) return sa - sb
        const ea = effortOrder[a.effort] ?? 99
        const eb = effortOrder[b.effort] ?? 99
        return ea - eb
      }
      const ea = effortOrder[a.effort] ?? 99
      const eb = effortOrder[b.effort] ?? 99
      if (ea !== eb) return ea - eb
      const sa = severityOrder[a.severity] ?? 99
      const sb = severityOrder[b.severity] ?? 99
      return sa - sb
    })

    return result
  }, [items, severityFilters, effortFilters, search, sortBy])

  const toggleFilter = (set: Set<string>, key: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setter(next)
  }

  const toggleSeverity = (k: FilterKey) => {
    const next = new Set(severityFilters)
    if (next.has(k)) next.delete(k)
    else next.add(k)
    setSeverityFilters(next)
  }

  const toggleEffort = (k: EffortKey) => {
    const next = new Set(effortFilters)
    if (next.has(k)) next.delete(k)
    else next.add(k)
    setEffortFilters(next)
  }

  const statCards = [
    { label: 'Críticos', count: items.filter(i => i.severity === 'CRÍTICO').length, color: '#FF4444' },
    { label: 'Alta', count: items.filter(i => i.severity === 'ALTO').length, color: '#FF8C00' },
    { label: 'Média', count: items.filter(i => i.severity === 'MÉDIO').length, color: '#FFD700' },
    { label: 'Baixa', count: items.filter(i => i.severity === 'BAIXO').length, color: '#00BFFF' },
  ]

  const activeFilters = severityFilters.size + effortFilters.size + (search.trim() ? 1 : 0)

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 16,
          padding: '2rem',
          marginBottom: 24,
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, var(--primary), var(--accent-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
            }}>
              💡
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: 'var(--foreground)' }}>Ideias e Melhorias</h1>
              <p style={{ fontSize: 14, color: 'var(--foreground)', opacity: 0.5, margin: '2px 0 0' }}>
                Análise minuciosa do sistema — 17/06/2026
              </p>
            </div>
          </div>
          <p style={{ fontSize: 14, color: 'var(--foreground)', opacity: 0.65, margin: 0, lineHeight: 1.6 }}>
            {items.length} oportunidades identificadas em {categories.length} categorias.
            Use os filtros abaixo para navegar por severidade, esforço ou palavra-chave.
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 10,
          marginBottom: 20,
        }}>
          {statCards.map(card => (
            <div key={card.label} style={{
              background: 'var(--surface)',
              borderRadius: 12,
              padding: '1rem',
              border: `1px solid ${card.color}33`,
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: card.color }}>{card.count}</div>
              <div style={{ fontSize: 12, color: 'var(--foreground)', opacity: 0.5, marginTop: 2 }}>{card.label}</div>
            </div>
          ))}
          <div style={{
            background: 'var(--surface)',
            borderRadius: 12,
            padding: '1rem',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--primary)' }}>{items.length}</div>
            <div style={{ fontSize: 12, color: 'var(--foreground)', opacity: 0.5, marginTop: 2 }}>Total</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 12,
          padding: '1.25rem',
          marginBottom: 20,
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>

            {/* Severity filter */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--foreground)', opacity: 0.4, marginBottom: 6 }}>Severidade</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Object.entries(SEVERITY_CONFIG).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => toggleSeverity(k as FilterKey)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      border: `1px solid ${v.color}44`,
                      background: severityFilters.has(k as FilterKey) ? `${v.color}22` : 'transparent',
                      color: severityFilters.has(k as FilterKey) ? v.color : 'var(--foreground)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      opacity: severityFilters.size === 0 || severityFilters.has(k as FilterKey) ? 1 : 0.4,
                    }}
                  >
                    {v.emoji} {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Effort filter */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--foreground)', opacity: 0.4, marginBottom: 6 }}>Esforço</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Object.entries(EFFORT_CONFIG).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => toggleEffort(k as EffortKey)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      border: `1px solid ${v.color}44`,
                      background: effortFilters.has(k as EffortKey) ? `${v.color}22` : 'transparent',
                      color: effortFilters.has(k as EffortKey) ? v.color : 'var(--foreground)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      opacity: effortFilters.size === 0 || effortFilters.has(k as EffortKey) ? 1 : 0.4,
                    }}
                  >
                    {v.emoji} {k}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--foreground)', opacity: 0.4, marginBottom: 6 }}>Ordenar</div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'severity' | 'effort')}
                style={{
                  padding: '4px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--surface-elevated)',
                  color: 'var(--foreground)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <option value="severity">Por Severidade</option>
                <option value="effort">Por Esforço</option>
              </select>
            </div>

            {/* Search */}
            <div style={{ marginLeft: 'auto' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--foreground)', opacity: 0.4, marginBottom: 6 }}>Buscar</div>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ID, título, local..."
                style={{
                  padding: '4px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--surface-elevated)',
                  color: 'var(--foreground)',
                  fontSize: 12,
                  width: 200,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Active filters bar */}
          {activeFilters > 0 && (
            <div style={{
              marginTop: 10,
              paddingTop: 10,
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: 'var(--foreground)',
              opacity: 0.6,
            }}>
              <span>Filtrando: {filtered.length} de {items.length} itens</span>
              <button
                onClick={() => { setSeverityFilters(new Set()); setEffortFilters(new Set()); setSearch('') }}
                style={{
                  padding: '2px 10px',
                  borderRadius: 12,
                  border: '1px solid var(--border-subtle)',
                  background: 'transparent',
                  color: 'var(--primary)',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Items List */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--foreground)',
            opacity: 0.4,
            fontSize: 14,
          }}>
            Nenhuma ideia encontrada com os filtros atuais.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(item => {
              const sevConf = SEVERITY_CONFIG[item.severity]
              const effConf = EFFORT_CONFIG[item.effort]
              const sevColor = sevConf?.color || '#888'
              const isExpanded = expanded === item.id

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--surface)',
                    borderRadius: 12,
                    border: `1px solid ${sevColor}44`,
                    borderLeft: `4px solid ${sevColor}`,
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.15s',
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpanded(isExpanded ? null : item.id)}
                >
                  {/* Compact header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 16px',
                  }}>
                    <span style={{ fontSize: 18, lineHeight: 1 }}>{item.emoji}</span>

                    <span style={{
                      background: `${sevColor}18`,
                      color: sevColor,
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      fontFamily: 'monospace',
                    }}>
                      {item.id}
                    </span>

                    <span style={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--foreground)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {item.title}
                    </span>

                    {/* Effort badge */}
                    {effConf && (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 12,
                        background: `${effConf.color}15`,
                        color: effConf.color,
                        fontSize: 11,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        {effConf.emoji} {effConf.label}
                      </span>
                    )}

                    {/* Severity badge */}
                    {sevConf && (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: `${sevColor}18`,
                        color: sevColor,
                        fontSize: 11,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}>
                        {sevConf.label}
                      </span>
                    )}

                    <span style={{ color: 'var(--foreground)', opacity: 0.3, fontSize: 14 }}>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div style={{
                      padding: '0 16px 16px',
                      borderTop: '1px solid var(--border-subtle)',
                      marginTop: 0,
                    }}>
                      <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--foreground)', opacity: 0.8, lineHeight: 1.6 }}>
                        {item.location && (
                          <div>
                            <strong style={{ color: 'var(--foreground)', opacity: 1 }}>Local:</strong>{' '}
                            <code style={{
                              background: 'var(--surface-elevated)',
                              padding: '1px 6px',
                              borderRadius: 4,
                              fontSize: 12,
                              fontFamily: 'monospace',
                            }}>{item.location}</code>
                          </div>
                        )}
                        <div>
                          <strong style={{ color: 'var(--foreground)', opacity: 1 }}>Problema:</strong>{' '}
                          {item.problem}
                        </div>
                        <div>
                          <strong style={{ color: 'var(--foreground)', opacity: 1 }}>Sugestão:</strong>{' '}
                          {item.suggestion}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <footer style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--foreground)',
          opacity: 0.35,
        }}>
          Skora — Análise gerada em 17/06/2026 • {items.length} itens identificados
        </footer>
      </div>
    </div>
  )
}
