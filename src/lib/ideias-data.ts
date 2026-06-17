import fs from 'fs'
import path from 'path'

export type IdeiaItem = {
  id: string
  emoji: string
  severity: string
  category: string
  title: string
  location: string
  problem: string
  suggestion: string
  effort: string
  effortEmoji: string
}

export type IdeiaCategory = {
  emoji: string
  prefix: string
  name: string
}

const SEVERITY_ORDER: Record<string, number> = {
  'CRÍTICO': 0,
  'ALTO': 1,
  'MÉDIO': 2,
  'BAIXO': 3,
}

const EFFORT_ORDER: Record<string, number> = {
  'Pequeno': 0,
  'Médio': 1,
  'Grande': 2,
}

export function getSeverityOrder(s: string): number {
  return SEVERITY_ORDER[s] ?? 99
}

export function getEffortOrder(e: string): number {
  return EFFORT_ORDER[e] ?? 99
}

function parseEffortTables(content: string): Map<string, { effort: string; effortEmoji: string }> {
  const effortMap = new Map<string, { effort: string; effortEmoji: string }>()
  const effortTableRegex = /\| (\w+-\d+) \| .+ \| ([🟢🟡🔴]) (\w+) \|/g
  let match: RegExpExecArray | null
  while ((match = effortTableRegex.exec(content)) !== null) {
    effortMap.set(match[1], { effort: match[3], effortEmoji: match[2] })
  }
  return effortMap
}

export function parseIdeias(): { items: IdeiaItem[]; categories: IdeiaCategory[] } {
  const mdPath = path.join(process.cwd(), 'ideias.md')
  let content = ''
  try {
    content = fs.readFileSync(mdPath, 'utf-8')
  } catch {
    return { items: [], categories: [] }
  }

  const categories: IdeiaCategory[] = []
  const items: IdeiaItem[] = []
  const effortMap = parseEffortTables(content)

  const catTable = content.match(/## 🏆 Categorias\n\n([\s\S]*?)\n---/)
  if (catTable) {
    const tableLines = catTable[1].split('\n').filter(l => l.startsWith('|') && !l.includes('---') && !l.includes('Código'))
    for (const row of tableLines) {
      const parts = row.split('|').filter(Boolean)
      if (parts.length >= 2) {
        const match = parts[0].match(/([🔴🟡⚡🎨🛠️🧪])\s+\*\*(\w+)\*\*/)
        if (match) {
          categories.push({ emoji: match[1], prefix: match[2], name: parts[1].trim() })
        }
      }
    }
  }

  let currentItem: Partial<IdeiaItem> | null = null

  for (const line of content.split('\n')) {
    const itemHeader = line.match(/^##\s+([🔴🟡⚡🎨🛠️🧪])\s+(\w+)-(\d+):\s+(.+)/)
    if (itemHeader) {
      if (currentItem?.id) {
        items.push(currentItem as IdeiaItem)
      }
      currentItem = {
        emoji: itemHeader[1],
        id: `${itemHeader[2]}-${itemHeader[3]}`,
        category: itemHeader[2],
        title: itemHeader[4],
        severity: '',
        location: '',
        problem: '',
        suggestion: '',
        effort: '',
        effortEmoji: '',
      }
      continue
    }

    if (!currentItem) continue

    const sevMatch = line.match(/^\*\*Severidade:\*\*\s+([🔴🟡⚠️🔵])\s+(.+)/)
    if (sevMatch) {
      currentItem.severity = sevMatch[2].trim()
      continue
    }

    const locMatch = line.match(/^\*\*Local:\*\*\s+(.+)/)
    if (locMatch) {
      currentItem.location = locMatch[1].trim()
      continue
    }

    const probMatch = line.match(/^\*\*Problema:\*\*\s+(.+)/)
    if (probMatch) {
      if (currentItem.problem) currentItem.problem += ' '
      currentItem.problem += probMatch[1].trim()
      continue
    }

    const sugMatch = line.match(/^\*\*Sugestão:\*\*\s+(.+)/)
    if (sugMatch) {
      if (currentItem.suggestion) currentItem.suggestion += ' '
      currentItem.suggestion += sugMatch[1].trim()
      continue
    }

    if (currentItem.problem && !currentItem.suggestion && line.trim() && !line.startsWith('---') && !line.startsWith('#')) {
      if (currentItem.problem) currentItem.problem += ' '
      currentItem.problem += line.trim()
    }

    if (currentItem.suggestion && line.trim() && !line.startsWith('---') && !line.startsWith('#')) {
      if (currentItem.suggestion) currentItem.suggestion += ' '
      currentItem.suggestion += line.trim()
    }
  }

  if (currentItem?.id) {
    items.push(currentItem as IdeiaItem)
  }

  for (const item of items) {
    const effort = effortMap.get(item.id)
    if (effort) {
      item.effort = effort.effort
      item.effortEmoji = effort.effortEmoji
    }
  }

  return { items, categories }
}
