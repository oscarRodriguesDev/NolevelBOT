'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ROLE } from '@prisma/client'
import Link from 'next/link'
import { ArrowLeft, Building2, CheckCircle2, Loader2, Upload, Sparkles, Image } from 'lucide-react'
import { useHeader } from '../../layout'
import toast from 'react-hot-toast'

export default function CreateEmpresa() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'loading') return
    const role = session?.user?.role as ROLE | undefined
    if (role !== 'GOD') {
      router.replace('/dashboards')
    }
  }, [status, session, router])

  const [nome, setNome] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [setores, setSetores] = useState('')
  const [loading, setLoading] = useState(false)
  const [gerandoPrompt, setGerandoPrompt] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState('')

  const [botName, setBotName] = useState('')
  const [botPresentation, setBotPresentation] = useState('')
  const [botServiceDesc, setBotServiceDesc] = useState('')
  const [botAvisosDesc, setBotAvisosDesc] = useState('')
  const [botPrompt, setBotPrompt] = useState('')

  const { setHeader } = useHeader()

  useEffect(() => {
    setHeader({
      titulo: ' Cadastrar Empresa',
      descricao: 'Preencha as informações abaixo para o registro de uma nova empresa',
    })
  }, [setHeader])

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5')
      .substring(0, 18)
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem válida')
      return
    }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  async function handleGerarPrompt() {
    if (!botPresentation && !botServiceDesc && !botAvisosDesc) {
      toast.error('Preencha pelo menos uma descrição para gerar o prompt')
      return
    }

    setGerandoPrompt(true)
    try {
      toast.success('Gerando prompt personalizado com IA...')
      await new Promise(r => setTimeout(r, 2000))

      const descricoes = [
        botPresentation ? `APRESENTAÇÃO: O assistente deve se apresentar da seguinte forma: ${botPresentation}` : null,
        botServiceDesc ? `ATENDIMENTO: Durante o atendimento, deve seguir estas diretrizes: ${botServiceDesc}` : null,
        botAvisosDesc ? `AVISOS: Para apresentar avisos, deve: ${botAvisosDesc}` : null,
      ].filter(Boolean).join('\n')

      const systemPrompt = `Crie um prompt curto e direto para um assistente virtual chamado "${botName || 'Hevelyn'}" da empresa "${nome}".
Use as descrições abaixo para montar instruções claras sobre apresentação, atendimento e avisos.
Máximo 400 caracteres. Seja objetivo.`

      const res = await fetch('/api/empresa/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId: 'preview',
          botPresentation,
          botServiceDesc,
          botAvisosDesc,
          botName,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erro ao gerar prompt')
        return
      }

      const data = await res.json()
      setBotPrompt(data.botPrompt)
      toast.success('Prompt gerado com sucesso!')
    } catch {
      toast.error('Erro ao gerar prompt')
    } finally {
      setGerandoPrompt(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      let finalLogoUrl = logoUrl
      if (logoFile) {
        const formData = new FormData()
        formData.append('file', logoFile)
        formData.append('bucket', 'profile')
        formData.append('folder', 'empresas')

        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          finalLogoUrl = uploadData.url || ''
        }
      }

      const res = await fetch('/api/empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          cnpj: cnpj.replace(/\D/g, ''),
          setores: setores.split(',').map((s) => s.trim()).filter(Boolean),
          logoUrl: finalLogoUrl || undefined,
          botName: botName || undefined,
          botPresentation: botPresentation || undefined,
          botServiceDesc: botServiceDesc || undefined,
          botAvisosDesc: botAvisosDesc || undefined,
          botPrompt: botPrompt || undefined,
        }),
      })

      if (!res.ok) throw new Error()
      toast.success('Empresa criada com sucesso!')
      router.push('/empresa')
      router.refresh()
    } catch (error) {
      toast.error('Erro ao criar empresa. Verifique os dados.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="max-w-3xl mx-auto">
        <Link
          href="/empresa"
          className="inline-flex items-center gap-2 text-sm mb-8 transition-colors duration-300 group"
          style={{ color: "var(--foreground)", opacity: 0.7 }}
          onMouseEnter={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.color = "var(--primary)";
            }
          }}
          onMouseLeave={(e) => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.style.opacity = "0.7";
              e.currentTarget.style.color = "var(--foreground)";
            }
          }}
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para a listagem
        </Link>

        <div
          className="rounded-2xl border shadow-lg overflow-hidden"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div
            className="border-b p-6 sm:p-8 flex items-center gap-4"
            style={{
              backgroundColor: "var(--surface-elevated)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <div className="p-3 rounded-xl text-white shadow-lg" style={{ backgroundColor: "var(--primary)" }}>
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Cadastrar Empresa</h2>
              <p className="text-xs opacity-50">Preencha as informações da nova empresa</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="space-y-1.5">
              <label htmlFor="nome" className="block text-xs font-bold uppercase tracking-wider opacity-70">
                Nome Fantasia
              </label>
              <input
                id="nome"
                type="text"
                placeholder="Ex: Minha Empresa LTDA"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--foreground)",
                }}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cnpj" className="block text-xs font-bold uppercase tracking-wider opacity-70">
                CNPJ
              </label>
              <input
                id="cnpj"
                type="text"
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border font-mono outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--foreground)",
                }}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="setores" className="block text-xs font-bold uppercase tracking-wider opacity-70">
                Setores de Atuação
              </label>
              <input
                id="setores"
                type="text"
                placeholder="Tecnologia, Varejo, Educação..."
                value={setores}
                onChange={(e) => setSetores(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--foreground)",
                }}
              />
              <p className="text-xs opacity-50 mt-1">Separe os setores utilizando vírgulas</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider opacity-70">
                Logo da Empresa
              </label>
              <div className="flex items-center gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all hover:brightness-110 overflow-hidden"
                  style={{
                    backgroundColor: "var(--surface-elevated)",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-2" />
                  ) : (
                    <Image size={28} style={{ opacity: 0.4 }} />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <p className="text-xs opacity-50">Clique para fazer upload da logo.</p>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={() => { setLogoFile(null); setLogoPreview(null) }}
                      className="text-xs mt-1"
                      style={{ color: "var(--status-cancelled)" }}
                    >
                      Remover logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div
              className="border rounded-2xl p-6 space-y-5"
              style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-elevated)" }}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={18} style={{ color: "var(--primary)" }} />
                <h3 className="text-sm font-bold uppercase tracking-wider">Configuração do Assistente Virtual</h3>
              </div>
              <p className="text-xs opacity-50 -mt-3">
                Preencha como o assistente deve se comportar. A IA vai gerar um prompt personalizado.
              </p>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70">
                  Nome do Assistente
                </label>
                <input
                  type="text"
                  placeholder="Hevelyn"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--foreground)",
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70">
                  Como o assistente deve se apresentar?
                </label>
                <textarea
                  placeholder="Ex: Se apresente de forma calorosa, diga que é da empresa e pergunte como pode ajudar..."
                  value={botPresentation}
                  onChange={(e) => setBotPresentation(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--foreground)",
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70">
                  Como o assistente deve atender?
                </label>
                <textarea
                  placeholder="Ex: Seja educado, resolva problemas de suporte técnico, encaminhe chamados para os setores corretos..."
                  value={botServiceDesc}
                  onChange={(e) => setBotServiceDesc(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--foreground)",
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70">
                  Como apresentar os avisos da empresa?
                </label>
                <textarea
                  placeholder="Ex: Apresente os avisos de forma resumida, destaque os mais importantes, pergunte se a pessoa quer saber mais detalhes..."
                  value={botAvisosDesc}
                  onChange={(e) => setBotAvisosDesc(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--foreground)",
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleGerarPrompt}
                disabled={gerandoPrompt}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-all duration-200 hover:brightness-110 hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {gerandoPrompt ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Gerar Prompt com IA
                  </>
                )}
              </button>

              {botPrompt && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-70">
                    Prompt Gerado
                  </label>
                  <div
                    className="w-full px-4 py-3 rounded-xl border text-sm leading-relaxed whitespace-pre-wrap"
                    style={{
                      backgroundColor: "var(--surface)",
                      borderColor: "var(--status-completed)",
                      color: "var(--foreground)",
                    }}
                  >
                    {botPrompt}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white transition-all duration-200 hover:brightness-110 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Confirmar Cadastro
                  </>
                )}
              </button>

              <Link
                href="/empresa"
                className="px-6 py-3.5 font-bold rounded-xl text-center transition-all duration-200 hover:brightness-95"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--foreground)",
                }}
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
