import { useEffect, useState } from 'react'

interface CompanyConfig {
  id: string
  databaseUrl: string
  aiProvider: string
  aiModel: string
  aiApiKey: string | null
  companyName: string
  companyLogo: string | null
  createdAt: string
  updatedAt: string
}

export function useCompanyConfig() {
  const [config, setConfig] = useState<CompanyConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/company-config')
        if (!response.ok) throw new Error('Erro ao carregar configurações')
        
        const data = await response.json()
        setConfig(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        console.error('Erro ao carregar configurações da empresa:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  return { config, loading, error }
}
