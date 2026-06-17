import fs from 'fs'
import path from 'path'

function parseMarkdown(md: string) {
  const sections: { type: string; content: string; level?: number }[] = []
  const lines = md.split('\n')

  for (const line of lines) {
    if (line.startsWith('# ')) {
      sections.push({ type: 'h1', content: line.slice(2).trim(), level: 1 })
    } else if (line.startsWith('## ')) {
      sections.push({ type: 'h2', content: line.slice(3).trim(), level: 2 })
    } else if (line.startsWith('### ')) {
      sections.push({ type: 'h3', content: line.slice(4).trim(), level: 3 })
    } else if (line.startsWith('#### ')) {
      sections.push({ type: 'h4', content: line.slice(5).trim(), level: 4 })
    } else if (line.startsWith('|')) {
      sections.push({ type: 'table', content: line })
    } else if (line.startsWith('---')) {
      sections.push({ type: 'hr', content: '' })
    } else if (line.trim() === '') {
      sections.push({ type: 'empty', content: '' })
    } else if (line.match(/^- \*\*([^*]+)\*\*/)) {
      sections.push({ type: 'bold-li', content: line.replace(/^- /, '') })
    } else if (line.match(/^\d\. /)) {
      sections.push({ type: 'ol', content: line })
    } else if (line.startsWith('- ')) {
      sections.push({ type: 'li', content: line.slice(2) })
    } else if (line.startsWith('> ')) {
      sections.push({ type: 'blockquote', content: line.slice(2) })
    } else if (line.match(/^\|/)) {
      if (sections.length > 0 && sections[sections.length - 1].type === 'table') {
        sections.push({ type: 'table-row', content: line })
      } else {
        sections.push({ type: 'table', content: line })
      }
    } else {
      sections.push({ type: 'p', content: line })
    }
  }

  return sections
}

export default function IdeiasPage() {
  const mdPath = path.join(process.cwd(), 'ideias.md')
  let mdContent = ''
  try {
    mdContent = fs.readFileSync(mdPath, 'utf-8')
  } catch {
    mdContent = '# Ideias e Melhorias\n\nArquivo `ideias.md` não encontrado.'
  }

  const sections = parseMarkdown(mdContent)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A14',
      color: '#F0F0F0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <a
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: '#B800FF',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 24,
            padding: '8px 16px',
            borderRadius: 8,
            background: 'rgba(184, 0, 255, 0.1)',
            transition: 'background 0.2s',
          }}
          className="ideias-back-link"
        >
          ← Voltar ao Login
        </a>

        <div style={{
          background: 'linear-gradient(135deg, #1A1A2E 0%, #2A1A3E 100%)',
          borderRadius: 16,
          padding: '2rem',
          marginBottom: 32,
          border: '1px solid #3A3A52',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #B800FF, #FF00FF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}>
              💡
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Ideias e Melhorias</h1>
              <p style={{ fontSize: 14, color: '#888', margin: '4px 0 0' }}>
                Análise minuciosa do sistema — 17/06/2026
              </p>
            </div>
          </div>
          <p style={{ fontSize: 14, color: '#AAA', margin: 0, lineHeight: 1.6 }}>
            Mapeamento completo de oportunidades de melhoria identificadas após auditoria de segurança,
            arquitetura, performance, UX e infraestrutura. Organizado por prioridade e severidade.
          </p>
        </div>

        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          marginBottom: 32,
        }}>
          {[
            { label: 'Críticos', count: '6', color: '#FF4444' },
            { label: 'Alta Prioridade', count: '8', color: '#FF8C00' },
            { label: 'Média Prioridade', count: '10', color: '#FFD700' },
            { label: 'Melhorias', count: '8', color: '#00BFFF' },
          ].map(card => (
            <div key={card.label} style={{
              background: '#1A1A2E',
              borderRadius: 12,
              padding: '1rem',
              border: `1px solid ${card.color}33`,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: card.color }}>{card.count}</div>
              <div style={{ fontSize: 12, color: '#AAA', marginTop: 4 }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sections.map((sec, i) => {
            if (sec.type === 'h1') {
              return (
                <h2 key={i} style={{
                  fontSize: 24,
                  fontWeight: 800,
                  margin: '32px 0 16px',
                  paddingBottom: 8,
                  borderBottom: '2px solid #3A3A52',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  {sec.content}
                </h2>
              )
            }
            if (sec.type === 'h2') {
              const isCategory = ['🔴', '🟡', '⚡', '🎨', '🛠️', '🧪'].some(e => sec.content.startsWith(e))
              return (
                <h3 key={i} style={{
                  fontSize: 18,
                  fontWeight: 700,
                  margin: isCategory ? '24px 0 12px' : '20px 0 8px',
                  color: isCategory ? '#B800FF' : '#DDD',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  {sec.content}
                </h3>
              )
            }
            if (sec.type === 'h3') {
              const severityMatch = sec.content.match(/(🔴|🟡|⚠️|🔵)\s+(\w+)-(\d+):\s*(.+)/)
              if (severityMatch) {
                const [, emoji, prefix, num, title] = severityMatch
                const severityColors: Record<string, string> = {
                  '🔴': '#FF4444',
                  '🟡': '#FF8C00',
                  '⚠️': '#FFD700',
                  '🔵': '#00BFFF',
                }
                return (
                  <div key={i} style={{
                    background: '#1A1A2E',
                    borderRadius: 12,
                    padding: '1.25rem',
                    border: `1px solid ${(severityColors[emoji] || '#888')}44`,
                    borderLeft: `4px solid ${severityColors[emoji] || '#888'}`,
                    marginBottom: 4,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span>{emoji}</span>
                      <span style={{
                        background: `${(severityColors[emoji] || '#888')}22`,
                        color: severityColors[emoji] || '#888',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 700,
                      }}>
                        {prefix}-{num}
                      </span>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#FFF' }}>{title}</h4>
                    </div>
                  </div>
                )
              }
              return <h4 key={i} style={{ fontSize: 15, fontWeight: 600, margin: '16px 0 8px', color: '#CCC' }}>{sec.content}</h4>
            }
            if (sec.type === 'h4') {
              return <h5 key={i} style={{ fontSize: 14, fontWeight: 600, margin: '12px 0 4px', color: '#AAA' }}>{sec.content}</h5>
            }
            if (sec.type === 'p' && sec.content.trim()) {
              const boldParts = sec.content.split(/(\*\*[^*]+\*\*)/g)
              if (sec.content.startsWith('|') && sec.content.endsWith('|')) {
                return <div key={i} style={{ fontSize: 14, color: '#AAA', fontFamily: 'monospace', paddingLeft: 8 }}>{sec.content}</div>
              }
              return (
                <p key={i} style={{ fontSize: 14, color: '#AAA', lineHeight: 1.6, margin: 0 }}>
                  {boldParts.map((part, j) =>
                    part.startsWith('**') && part.endsWith('**')
                      ? <strong key={j} style={{ color: '#FFF' }}>{part.slice(2, -2)}</strong>
                      : part
                  )}
                </p>
              )
            }
            if (sec.type === 'li') {
              return (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  fontSize: 14,
                  color: '#AAA',
                  lineHeight: 1.6,
                  paddingLeft: 8,
                }}>
                  <span style={{ color: '#B800FF' }}>•</span>
                  <span>{sec.content}</span>
                </div>
              )
            }
            if (sec.type === 'bold-li') {
              return (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  fontSize: 14,
                  color: '#AAA',
                  lineHeight: 1.6,
                  paddingLeft: 8,
                }}>
                  <span style={{ color: '#B800FF' }}>•</span>
                  <span>{sec.content}</span>
                </div>
              )
            }
            if (sec.type === 'blockquote') {
              return (
                <blockquote key={i} style={{
                  borderLeft: '3px solid #B800FF',
                  padding: '8px 16px',
                  margin: '8px 0',
                  background: 'rgba(184,0,255,0.05)',
                  borderRadius: '0 8px 8px 0',
                  fontSize: 13,
                  color: '#BBB',
                }}>
                  {sec.content}
                </blockquote>
              )
            }
            if (sec.type === 'hr') {
              return <hr key={i} style={{ border: 'none', borderTop: '1px solid #3A3A52', margin: '24px 0' }} />
            }
            if (sec.type === 'ol') {
              return (
                <div key={i} style={{
                  fontSize: 14,
                  color: '#AAA',
                  lineHeight: 1.6,
                  paddingLeft: 8,
                }}>
                  {sec.content}
                </div>
              )
            }
            return null
          })}
        </div>

        <footer style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: '1px solid #3A3A52',
          textAlign: 'center',
          fontSize: 12,
          color: '#666',
        }}>
          Skora — Análise gerada em 17/06/2026 • {sections.filter(s => s.type === 'h3' && s.content.match(/SEG|ARQ|PERF|UX|INFRA|TEST/)).length} itens identificados
        </footer>
      </div>
    </div>
  )
}
