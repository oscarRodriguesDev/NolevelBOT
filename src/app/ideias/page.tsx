import fs from 'fs'
import path from 'path'

// Parseia conteudo markdown em secoes tipadas
function parseMarkdown(md: string) {
  const sections: { type: string; content: string }[] = []
  const lines = md.split('\n')

  for (const line of lines) {
    if (line.startsWith('# ')) {
      sections.push({ type: 'h1', content: line.slice(2).trim() })
    } else if (line.startsWith('## ')) {
      sections.push({ type: 'h2', content: line.slice(3).trim() })
    } else if (line.startsWith('### ')) {
      sections.push({ type: 'h3', content: line.slice(4).trim() })
    } else if (line.startsWith('#### ')) {
      sections.push({ type: 'h4', content: line.slice(5).trim() })
    } else if (line.startsWith('---')) {
      sections.push({ type: 'hr', content: '' })
    } else if (line.trim() === '') {
      sections.push({ type: 'empty', content: '' })
    } else if (line.match(/^- \*\*([^*]+)\*\*/)) {
      sections.push({ type: 'bold-li', content: line.replace(/^- /, '') })
    } else if (line.startsWith('- ')) {
      sections.push({ type: 'li', content: line.slice(2) })
    } else if (line.startsWith('> ')) {
      sections.push({ type: 'blockquote', content: line.slice(2) })
    } else if (line.match(/^\|/)) {
      sections.push({ type: 'table', content: line })
    } else {
      sections.push({ type: 'p', content: line })
    }
  }

  return sections
}

// Pagina de exibicao de ideias e melhorias do sistema
export default function IdeiasPage() {
  const mdPath = path.join(process.cwd(), 'ideias.md')
  let mdContent = ''
  try {
    mdContent = fs.readFileSync(mdPath, 'utf-8')
  } catch {
    mdContent = '# Ideias e Melhorias\n\nArquivo ideias.md não encontrado.'
  }

  const sections = parseMarkdown(mdContent)

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <a
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--primary)',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 24,
            padding: '8px 16px',
            borderRadius: 8,
            background: 'color-mix(in srgb, var(--primary) 10%, transparent)',
            transition: 'opacity 0.2s',
          }}
        >
          ← Voltar ao Login
        </a>

        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 16,
            padding: '2rem',
            marginBottom: 32,
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'linear-gradient(135deg, var(--primary), var(--accent-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
              }}
            >
              💡
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Ideias e Melhorias</h1>
              <p style={{ fontSize: 14, opacity: 0.5, margin: '4px 0 0' }}>
                Análise minuciosa do sistema — 17/06/2026
              </p>
            </div>
          </div>
          <p style={{ fontSize: 14, opacity: 0.65, margin: 0, lineHeight: 1.6 }}>
            Mapeamento completo de oportunidades de melhoria identificadas após auditoria de segurança,
            arquitetura, performance, UX e infraestrutura. Organizado por prioridade e severidade.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sections.map((sec, i) => {
            if (sec.type === 'h1') {
              return (
                <h2
                  key={i}
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    margin: '32px 0 16px',
                    paddingBottom: 8,
                    borderBottom: '2px solid var(--border-subtle)',
                  }}
                >
                  {sec.content}
                </h2>
              )
            }

            if (sec.type === 'h2') {
              const isCategory = ['🔴', '🟡', '⚡', '🎨', '🛠️', '🧪'].some(e => sec.content.startsWith(e))
              const itemMatch = sec.content.match(/([🔴🟡⚡🎨🛠️🧪])\s+(\w+)-(\d+):\s*(.+)/)

              if (itemMatch) {
                const [, emoji, prefix, num, rawTitle] = itemMatch
                const hasCheck = rawTitle.includes('✅')
                const hasProgress = rawTitle.includes('🔄')
                const title = rawTitle.replace(/ [✅🔄]$/, '')
                const severityColors: Record<string, string> = {
                  '🔴': '#FF4444',
                  '🟡': '#FF8C00',
                  '⚠️': '#FFD700',
                  '🔵': '#00BFFF',
                }
                const color = severityColors[emoji] || '#888'

                let statusBadge = null
                if (hasCheck) {
                  statusBadge = (
                    <span
                      style={{
                        background: '#22c55e22',
                        color: '#22c55e',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        marginLeft: 'auto',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ✅ CONCLUÍDO
                    </span>
                  )
                } else if (hasProgress) {
                  statusBadge = (
                    <span
                      style={{
                        background: '#eab30822',
                        color: '#eab308',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        marginLeft: 'auto',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      🔄 EM ANDAMENTO
                    </span>
                  )
                }

                return (
                  <div
                    key={i}
                    style={{
                      background: 'var(--surface)',
                      borderRadius: 12,
                      padding: '1.25rem',
                      border: `1px solid ${color}44`,
                      borderLeft: `4px solid ${color}`,
                      boxShadow: 'var(--shadow-sm)',
                      opacity: hasCheck ? 0.6 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 18 }}>{emoji}</span>
                      <span
                        style={{
                          background: `${color}18`,
                          color,
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: 'monospace',
                        }}
                      >
                        {prefix}-{num}
                      </span>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h4>
                      {statusBadge}
                    </div>
                  </div>
                )
              }

              return (
                <h3
                  key={i}
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    margin: isCategory ? '24px 0 12px' : '20px 0 8px',
                    color: isCategory ? 'var(--primary)' : undefined,
                  }}
                >
                  {sec.content}
                </h3>
              )
            }

            if (sec.type === 'h3') {
              return (
                <h4 key={i} style={{ fontSize: 15, fontWeight: 600, margin: '16px 0 8px', opacity: 0.8 }}>
                  {sec.content}
                </h4>
              )
            }

            if (sec.type === 'h4') {
              return (
                <h5 key={i} style={{ fontSize: 14, fontWeight: 600, margin: '12px 0 4px', opacity: 0.7 }}>
                  {sec.content}
                </h5>
              )
            }

            if (sec.type === 'p' && sec.content.trim()) {
              const boldParts = sec.content.split(/(\*\*[^*]+\*\*)/g)
              return (
                <p key={i} style={{ fontSize: 14, opacity: 0.75, lineHeight: 1.6, margin: 0 }}>
                  {boldParts.map((part, j) =>
                    part.startsWith('**') && part.endsWith('**')
                      ? <strong key={j} style={{ opacity: 1 }}>{part.slice(2, -2)}</strong>
                      : part
                  )}
                </p>
              )
            }

            if (sec.type === 'li' || sec.type === 'bold-li') {
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    fontSize: 14,
                    opacity: 0.75,
                    lineHeight: 1.6,
                    paddingLeft: 8,
                  }}
                >
                  <span style={{ color: 'var(--primary)' }}>•</span>
                  <span>{sec.content}</span>
                </div>
              )
            }

            if (sec.type === 'blockquote') {
              return (
                <blockquote
                  key={i}
                  style={{
                    borderLeft: '3px solid var(--primary)',
                    padding: '8px 16px',
                    margin: '8px 0',
                    background: 'color-mix(in srgb, var(--primary) 5%, transparent)',
                    borderRadius: '0 8px 8px 0',
                    fontSize: 13,
                    opacity: 0.8,
                  }}
                >
                  {sec.content}
                </blockquote>
              )
            }

            if (sec.type === 'hr') {
              return (
                <hr key={i} style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '24px 0' }} />
              )
            }

            if (sec.type === 'table' && sec.content.trim()) {
              const isHeader = sec.content.includes('---')
              const cells = sec.content.split('|').filter(Boolean).map(c => c.trim())
              if (isHeader) return null

              const isEffortTable = cells.some(c => c.includes('🟢') || c.includes('🟡') || c.includes('🔴'))

              return (
                <div
                  key={i}
                  style={{
                    fontSize: 13,
                    fontFamily: 'monospace',
                    padding: '2px 8px',
                    opacity: 0.7,
                    background: isEffortTable ? 'color-mix(in srgb, var(--primary) 3%, transparent)' : undefined,
                    borderRadius: isEffortTable ? 6 : undefined,
                  }}
                >
                  {sec.content}
                </div>
              )
            }

            return null
          })}
        </div>

        <footer
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: 12,
            opacity: 0.35,
          }}
        >
          Skora — Análise gerada em 17/06/2026{' '}
          • {sections.filter(s => s.type === 'h2' && s.content.match(/\w+-\d+:/)).length} itens identificados
        </footer>
      </div>
    </div>
  )
}
