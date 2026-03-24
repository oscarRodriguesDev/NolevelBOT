'use client'

import { useEffect, useState } from 'react'
import { LuCheck, LuAlertTriangle, LuLoader } from 'react-icons/lu'

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

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<CompanyConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

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
      setLoading(true)
      const response = await fetch('/api/company-config')
      const data = await response.json()
      
      setConfig(data)
      setFormData({
        databaseUrl: data.databaseUrl || '',
        aiProvider: data.aiProvider || 'gpt',
        aiModel: data.aiModel || 'gpt-4-turbo',
        aiApiKey: data.aiApiKey ? '' : '', // Não mostrar chave sensível
        companyName: data.companyName || 'NolevelBOT',
        companyLogo: data.companyLogo || '',
      })
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
      setMessage('Erro ao carregar configurações')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.databaseUrl.trim()) {
      setMessage('A URL do banco de dados é obrigatória')
      setMessageType('error')
      return
    }

    try {
      setSaving(true)
      setMessage('')
      
      const response = await fetch('/api/company-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Erro ao salvar')

      const data = await response.json()
      setConfig(data)
      setMessage('Configurações salvas com sucesso!')
      setMessageType('success')
      
      setTimeout(() => setMessage(''), 5000)
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      setMessage('Erro ao salvar configurações')
      setMessageType('error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        <div className="text-center space-y-4">
          <svg className="w-12 h-12 mx-auto animate-spin" style={{ color: "var(--primary)" }} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: "var(--primary)" }}>
            Configurações da Empresa
          </h1>
          <p className="text-sm opacity-70">Configure os dados da sua empresa, banco de dados e provedor de IA</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`px-6 py-4 rounded-2xl flex items-center gap-3 border ${
              messageType === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
            }`}
            style={{
              borderColor: messageType === 'success' ? 'var(--status-completed)' : 'var(--status-cancelled)',
              backgroundColor: messageType === 'success' ? 'rgba(0, 208, 132, 0.1)' : 'rgba(255, 91, 91, 0.1)',
            }}
          >
            {messageType === 'success' ? (
              <LuCheck className="w-5 h-5" style={{ color: 'var(--status-completed)' }} />
            ) : (
              <LuAlertTriangle className="w-5 h-5" style={{ color: 'var(--status-cancelled)' }} />
            )}
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações da Empresa */}
          <div
            className="rounded-2xl border shadow-lg p-6 sm:p-8 space-y-6 transition-colors duration-300"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <div>
              <h2 className="text-xl font-bold mb-6" style={{ color: "var(--primary)" }}>
                Informações da Empresa
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nome da Empresa</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Digite o nome da empresa"
                    className="w-full px-4 py-3 border rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-elevated)",
                      color: "var(--foreground)",
                      "--tw-ring-color": "var(--primary)",
                    } as any}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Logo da Empresa (URL)</label>
                  <input
                    type="text"
                    name="companyLogo"
                    value={formData.companyLogo}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-4 py-3 border rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-elevated)",
                      color: "var(--foreground)",
                      "--tw-ring-color": "var(--primary)",
                    } as any}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Configurações do Banco de Dados */}
          <div
            className="rounded-2xl border shadow-lg p-6 sm:p-8 space-y-6 transition-colors duration-300"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <div>
              <h2 className="text-xl font-bold mb-6" style={{ color: "var(--primary)" }}>
                Banco de Dados
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">URL do Banco de Dados *</label>
                  <input
                    type="text"
                    name="databaseUrl"
                    value={formData.databaseUrl}
                    onChange={handleChange}
                    placeholder="postgresql://user:password@host:port/database"
                    required
                    className="w-full px-4 py-3 border rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50 font-mono text-xs"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-elevated)",
                      color: "var(--foreground)",
                      "--tw-ring-color": "var(--primary)",
                    } as any}
                  />
                  <p className="text-xs opacity-60 mt-2">
                    Exemplo: postgresql://user:password@localhost:5432/nolevelbot
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Configurações de IA */}
          <div
            className="rounded-2xl border shadow-lg p-6 sm:p-8 space-y-6 transition-colors duration-300"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <div>
              <h2 className="text-xl font-bold mb-6" style={{ color: "var(--primary)" }}>
                Inteligência Artificial
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">Provedor de IA</label>
                  <select
                    name="aiProvider"
                    value={formData.aiProvider}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-elevated)",
                      color: "var(--foreground)",
                      "--tw-ring-color": "var(--primary)",
                    } as any}
                  >
                    <option value="gpt">OpenAI (GPT)</option>
                    <option value="gemini">Google Gemini</option>
                  </select>
                  <p className="text-xs opacity-60 mt-2">
                    {formData.aiProvider === 'gpt'
                      ? 'Usando OpenAI GPT para processamento de linguagem natural'
                      : 'Usando Google Gemini para processamento de linguagem natural'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Modelo de IA</label>
                  <input
                    type="text"
                    name="aiModel"
                    value={formData.aiModel}
                    onChange={handleChange}
                    placeholder={formData.aiProvider === 'gpt' ? 'gpt-4-turbo' : 'gemini-pro'}
                    className="w-full px-4 py-3 border rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-elevated)",
                      color: "var(--foreground)",
                      "--tw-ring-color": "var(--primary)",
                    } as any}
                  />
                  <p className="text-xs opacity-60 mt-2">
                    {formData.aiProvider === 'gpt'
                      ? 'Exemplos: gpt-4, gpt-4-turbo, gpt-3.5-turbo'
                      : 'Exemplos: gemini-pro, gemini-pro-vision'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Chave API</label>
                  <input
                    type="password"
                    name="aiApiKey"
                    value={formData.aiApiKey}
                    onChange={handleChange}
                    placeholder="Deixe em branco para manter a chave atual"
                    className="w-full px-4 py-3 border rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50 font-mono text-xs"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-elevated)",
                      color: "var(--foreground)",
                      "--tw-ring-color": "var(--primary)",
                    } as any}
                  />
                  <p className="text-xs opacity-60 mt-2">
                    Sua chave será armazenada com segurança. Deixe em branco para manter a chave existente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={buscarConfiguracoes}
              disabled={saving}
              className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              style={{ backgroundColor: "var(--border-subtle)" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
              style={{ backgroundColor: "var(--primary)" }}
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
              {saving ? (
                <>
                  <LuLoader className="w-5 h-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <LuCheck className="w-5 h-5" />
                  Salvar Configurações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
