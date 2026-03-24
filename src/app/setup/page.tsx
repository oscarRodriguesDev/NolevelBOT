'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LuCheck, LuAlertTriangle, LuLoader } from 'react-icons/lu'

interface CompanyConfig {
  id: string
  databaseUrl: string
  aiProvider: string
  aiModel: string
  aiApiKey: string | null
  companyName: string
  companyLogo: string | null
}

export default function SetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [hasConfig, setHasConfig] = useState(false)

  const [formData, setFormData] = useState({
    databaseUrl: '',
    aiProvider: 'gpt',
    aiModel: 'gpt-4-turbo',
    aiApiKey: '',
    companyName: 'NolevelBOT',
    companyLogo: '',
  })

  useEffect(() => {
    buscarConfiguracoes()
  }, [])

  const buscarConfiguracoes = async () => {
    try {
      const response = await fetch('/api/company-config')
      const data = await response.json()

      if (data.id) {
        setHasConfig(true)
        setFormData({
          databaseUrl: data.databaseUrl || '',
          aiProvider: data.aiProvider || 'gpt',
          aiModel: data.aiModel || 'gpt-4-turbo',
          aiApiKey: '',
          companyName: data.companyName || 'NolevelBOT',
          companyLogo: data.companyLogo || '',
        })
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/company-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessageType('success')
        setMessage('Configurações salvas com sucesso!')
        setTimeout(() => {
          router.push('/')
        }, 1500)
      } else {
        setMessageType('error')
        setMessage(data.error || 'Erro ao salvar configurações')
      }
    } catch (error) {
      setMessageType('error')
      setMessage('Erro ao salvar configurações')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <div className="text-center space-y-4">
          <LuLoader className="w-8 h-8 animate-spin mx-auto" style={{ color: "var(--primary)" }} />
          <p style={{ color: "var(--foreground)" }}>Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen px-4 sm:px-6 lg:px-8 py-10 sm:py-16 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold" style={{ color: "var(--primary)" }}>
            Bem-vindo ao NolevelBOT
          </h1>
          <p className="text-sm sm:text-base opacity-70">
            Configure os dados da sua empresa para começar
          </p>
        </div>

        {/* Form Card */}
        <div
          className="rounded-2xl border shadow-2xl p-6 sm:p-10 transition-colors duration-300"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          {/* Alert se já houver config */}
          {hasConfig && (
            <div
              className="mb-8 p-4 rounded-lg border-l-4 flex gap-3"
              style={{
                backgroundColor: "var(--status-waiting)",
                opacity: 0.15,
                borderColor: "var(--status-waiting)",
              }}
            >
              <LuAlertTriangle style={{ color: "var(--status-waiting)", flexShrink: 0 }} />
              <p className="text-sm">Você está atualizando as configurações existentes</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome da Empresa */}
            <div>
              <label className="block text-sm font-semibold mb-2">Nome da Empresa</label>
              <input
                type="text"
                name="companyName"
                placeholder="ex: Minha Empresa"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--foreground)",
                  "--tw-ring-color": "var(--primary)",
                } as any}
              />
            </div>

            {/* URL do Banco de Dados */}
            <div>
              <label className="block text-sm font-semibold mb-2">URL do Banco de Dados</label>
              <p className="text-xs opacity-60 mb-2">Ex: postgresql://user:pass@host:5432/dbname</p>
              <input
                type="text"
                name="databaseUrl"
                placeholder="postgresql://..."
                value={formData.databaseUrl}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50 font-mono text-sm"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--foreground)",
                  "--tw-ring-color": "var(--primary)",
                } as any}
              />
            </div>

            {/* Divisor */}
            <div
              className="h-px"
              style={{ backgroundColor: "var(--border-subtle)" }}
            />

            {/* Título IA */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Configuração de IA</h3>
            </div>

            {/* Provedor de IA */}
            <div>
              <label className="block text-sm font-semibold mb-2">Provedor de IA</label>
              <select
                name="aiProvider"
                value={formData.aiProvider}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--foreground)",
                  "--tw-ring-color": "var(--primary)",
                } as any}
              >
                <option value="">Selecione um provedor</option>
                <option value="gpt">OpenAI (GPT)</option>
                <option value="gemini">Google (Gemini)</option>
              </select>
            </div>

            {/* Modelo de IA */}
            <div>
              <label className="block text-sm font-semibold mb-2">Modelo de IA</label>
              <input
                type="text"
                name="aiModel"
                placeholder={formData.aiProvider === 'gpt' ? 'gpt-4-turbo' : 'gemini-pro'}
                value={formData.aiModel}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--foreground)",
                  "--tw-ring-color": "var(--primary)",
                } as any}
              />
            </div>

            {/* Chave de API */}
            <div>
              <label className="block text-sm font-semibold mb-2">Chave de API</label>
              <input
                type="password"
                name="aiApiKey"
                placeholder={`Chave da API ${formData.aiProvider === 'gpt' ? 'OpenAI' : 'Google'}`}
                value={formData.aiApiKey}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--foreground)",
                  "--tw-ring-color": "var(--primary)",
                } as any}
              />
              <p className="text-xs opacity-60 mt-2">
                {hasConfig ? 'Deixe em branco para manter a chave atual' : 'Será armazenada com segurança'}
              </p>
            </div>

            {/* Mensagem de Status */}
            {message && (
              <div
                className="p-4 rounded-lg flex gap-3 items-start"
                style={{
                  backgroundColor: messageType === 'success'
                    ? "var(--status-completed)"
                    : "var(--status-cancelled)",
                  color: '#fff',
                  opacity: 0.9,
                }}
              >
                <LuCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{message}</p>
              </div>
            )}

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{
                backgroundColor: "var(--primary)",
              }}
              onMouseEnter={(e) => {
                if (e.currentTarget instanceof HTMLElement && !saving) {
                  e.currentTarget.style.backgroundColor = "var(--primary-hover)";
                }
              }}
              onMouseLeave={(e) => {
                if (e.currentTarget instanceof HTMLElement) {
                  e.currentTarget.style.backgroundColor = "var(--primary)";
                }
              }}
            >
              {saving && <LuLoader className="w-4 h-4 animate-spin" />}
              {saving ? 'Salvando...' : hasConfig ? 'Atualizar Configurações' : 'Começar'}
            </button>
          </form>

          {/* Rodapé com informações */}
          <div className="mt-8 pt-8 border-t" style={{ borderColor: "var(--border-subtle)" }}>
            <p className="text-xs opacity-60 text-center">
              Essas configurações podem ser alteradas a qualquer momento. Seus dados serão armazenados com segurança.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
