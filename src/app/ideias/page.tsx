import { parseIdeias } from '@/lib/ideias-data'
import { IdeiasClient } from './ideias-client'

export default function IdeiasPage() {
  const { items, categories } = parseIdeias()
  return <IdeiasClient items={items} categories={categories} />
}
