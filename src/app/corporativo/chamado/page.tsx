'use client'
import { useState } from 'react'
import { 
  LuCheck, 
  LuLoader, 
  LuMegaphone, 
  LuInfo, 
  LuCircleAlert as  LuAlertCircle, 
  LuTriangle as LuAlertTriangle,
  LuHeadphones
} from 'react-icons/lu'
import { ThemeToggle } from '../../components/theme-toggle'
import { FileUpload } from '../../components/fileInput'
import toast from 'react-hot-toast'

type Prioridade = 'baixa' | 'normal' | 'alta' | null

export default function ChamadoPage() {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    descricao: '',
  })

  const [prioridade, setPrioridade] = useState<Prioridade>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [setoresDisponiveis, setSetoresDisponiveis] = useState<string[]>([])
  const [setorSelecionado, setSetorSelecionado] = useState('')
  const [avisos, setAvisos] = useState<any[]>([])
  const [showAvisos, setShowAvisos] = useState(false)
  const [cpfValido, setCpfValido] = useState(false)

  function formatCPF(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    return digits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2')
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    if (name === 'cpf') {
      setFormData(prev => ({ ...prev, cpf: formatCPF(value) }))
      return
    }
    if (name === 'telefone') {
      const digits = value.replace(/\D/g, '').slice(0, 15)
      setFormData(prev => ({ ...prev, telefone: digits }))
      return
    }
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  async function validarCPF(cpf: string) {
    const digits = cpf.replace(/\D/g, '')
    if (digits.length < 11) return
    try {
      const res = await fetch(`/api/empresa?cpf=${digits}`)
      if (res.ok) {
        const data = await res.json()
        setSetoresDisponiveis(data.setores || [])
        setCpfValido(true)
        fetchAvisos(digits)
      } else {
        setCpfValido(false)
        setSetoresDisponiveis([])
        toast.error('CPF não encontrado')
      }
    } catch {
      setCpfValido(false)
    }
  }

  async function fetchAvisos(cpf: string) {
    try {
      const res = await fetch(`/api/quadro-avisos/mostrar-avisos?cpf=${cpf}`)
      if (res.ok) {
        const data = await res.json()
        const filtrados = data.filter((a: any) =>
          !a.setor || a.setor === setorSelecionado || a.setor === ''
        )
        setAvisos(filtrados)
        if (filtrados.length > 0) setShowAvisos(true)
      }
    } catch { }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prioridade) {
      toast.error('Selecione a prioridade do chamado')
      return
    }

    if (!formData.descricao.trim()) {
      toast.error('Descreva o problema')
      return
    }

    if (!setorSelecionado) {
      toast.error('Selecione o setor de destino')
      return
    }

    setLoading(true)

    try {
      const form = new FormData()
      form.append('nome', formData.nome)
      form.append('cpf', formData.cpf.replace(/\D/g, ''))
      form.append('setor', setorSelecionado)
      form.append('descricao', formData.descricao)
      form.append('prioridade', prioridade)

      if (formData.telefone) {
        form.append('telefone', formData.telefone)
      }

      if (file) {
        form.append('anexo', file)
      }

      const response = await fetch('/api/tickets', {
        method: 'POST',
        body: form,
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || `Erro HTTP ${response.status}`)
      }

      setLoading(false)
      setSubmitted(true)
      toast.success('Chamado registrado com sucesso')
    } catch (error: any) {
      console.error('Erro ao registrar:', error)
      toast.error(error?.message || 'Erro ao processar. Tente novamente.')
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-colors duration-300"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <div className="absolute right-4 top-4 z-50">
          <ThemeToggle />
        </div>
        <div
          className="rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm w-full text-center border transition-colors duration-300"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <LuCheck className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--primary)' }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
            Chamado Registrado
          </h2>
          <p className="mb-6 text-sm opacity-70">
            Sua solicitação foi registrada com sucesso e direcionada ao setor responsável.
          </p>
          <button
            onClick={() => window.close()}
            className="w-full py-4 rounded-xl font-bold transition-all duration-300 text-white hover:scale-105 active:scale-95"
            style={{ backgroundColor: 'var(--primary)' }}
            onMouseEnter={e => {
              if (e.target instanceof HTMLElement) {
                e.target.style.backgroundColor = 'var(--primary-hover)'
              }
            }}
            onMouseLeave={e => {
              if (e.target instanceof HTMLElement) {
                e.target.style.backgroundColor = 'var(--primary)'
              }
            }}
          >
            Concluído
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-8 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >
      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: 'var(--primary)' }}>
            Abrir Chamado
          </h2>
          <p className="text-sm opacity-70">Preencha os dados abaixo e selecione a prioridade da sua solicitação</p>
        </div>

        <div
          className="rounded-2xl p-6 sm:p-8 border shadow-lg transition-colors duration-300"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                  style={{
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--foreground)',
                    '--tw-ring-color': 'var(--primary)',
                  } as never}
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
                  CPF
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  onBlur={() => validarCPF(formData.cpf)}
                  required
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                  style={{
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--foreground)',
                    '--tw-ring-color': 'var(--primary)',
                  } as never}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
                Telefone <span className="font-normal opacity-50">(opcional — para notificação via WhatsApp)</span>
              </label>
              <input
                type="text"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                style={{
                  backgroundColor: 'var(--surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--foreground)',
                  '--tw-ring-color': 'var(--primary)',
                } as never}
                placeholder="5511999999999"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-3">
                Nível de Prioridade
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPrioridade('baixa')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                    prioridade === 'baixa'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--border-subtle)] hover:border-[var(--primary)]/50'
                  }`}
                  style={{
                    backgroundColor: prioridade === 'baixa' ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'var(--surface-elevated)',
                  }}
                >
                  <LuInfo className={`h-6 w-6 ${prioridade === 'baixa' ? 'text-[var(--primary)]' : 'opacity-60'}`} />
                  <div className="text-left">
                    <span className={`block text-sm font-semibold ${prioridade === 'baixa' ? 'text-[var(--primary)]' : ''}`}>
                      Baixa
                    </span>
                    <span className="text-xs opacity-60">Dúvida ou solicitação simples</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPrioridade('normal')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                    prioridade === 'normal'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--border-subtle)] hover:border-[var(--primary)]/50'
                  }`}
                  style={{
                    backgroundColor: prioridade === 'normal' ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'var(--surface-elevated)',
                  }}
                >
                  <LuAlertCircle className={`h-6 w-6 ${prioridade === 'normal' ? 'text-[var(--primary)]' : 'opacity-60'}`} />
                  <div className="text-left">
                    <span className={`block text-sm font-semibold ${prioridade === 'normal' ? 'text-[var(--primary)]' : ''}`}>
                      Normal
                    </span>
                    <span className="text-xs opacity-60">Problema técnico rotineiro</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPrioridade('alta')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                    prioridade === 'alta'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--border-subtle)] hover:border-[var(--primary)]/50'
                  }`}
                  style={{
                    backgroundColor: prioridade === 'alta' ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'var(--surface-elevated)',
                  }}
                >
                  <LuAlertTriangle className={`h-6 w-6 ${prioridade === 'alta' ? 'text-[var(--primary)]' : 'opacity-60'}`} />
                  <div className="text-left">
                    <span className={`block text-sm font-semibold ${prioridade === 'alta' ? 'text-[var(--primary)]' : ''}`}>
                      Alta
                    </span>
                    <span className="text-xs opacity-60">Urgência ou sistema parado</span>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
                Descrição do Problema
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 resize-none focus:ring-2 focus:ring-opacity-50"
                style={{
                  backgroundColor: 'var(--surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--foreground)',
                  '--tw-ring-color': 'var(--primary)',
                } as never}
                placeholder="Descreva detalhadamente o problema ou solicitação..."
              />
            </div>

            {cpfValido && setoresDisponiveis.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
                  Setor de Destino
                </label>
                <select
                  name="setor"
                  value={setorSelecionado}
                  onChange={(e) => setSetorSelecionado(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 border focus:ring-2 focus:ring-opacity-50"
                  style={{
                    backgroundColor: 'var(--surface-elevated)',
                    color: 'var(--foreground)',
                    borderColor: 'var(--border-subtle)',
                    '--tw-ring-color': 'var(--primary)',
                  } as never}
                >
                  <option value="" disabled>Selecione o setor</option>
                  {setoresDisponiveis.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            <FileUpload file={file} setFile={setFile} handleFileChange={handleFileChange} />

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full font-semibold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base text-white transition-all duration-300 hover:brightness-110 hover:shadow-lg active:scale-[0.98] disabled:hover:scale-100"
                style={{ backgroundColor: 'var(--primary)' }}
                onMouseEnter={e => {
                  if (e.currentTarget instanceof HTMLElement && !loading) {
                    e.currentTarget.style.backgroundColor = 'var(--primary-hover)'
                  }
                }}
                onMouseLeave={e => {
                  if (e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.style.backgroundColor = 'var(--primary)'
                  }
                }}
              >
                {loading ? (
                  <>
                    <LuLoader className="animate-spin h-5 w-5" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <LuCheck className="h-5 w-5" />
                    Registrar Chamado
                  </>
                )}
              </button>
            </div>
          </form>

          {showAvisos && avisos.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <LuMegaphone className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                <span className="text-xs font-bold uppercase tracking-wider opacity-70">Avisos</span>
              </div>
              {avisos.map((aviso: any) => (
                <div
                  key={aviso.id}
                  className="p-4 rounded-xl border text-sm transition-colors duration-300"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--primary) 5%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--primary) 15%, transparent)',
                    color: 'var(--foreground)',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                      {aviso.titulo}
                    </span>
                    {aviso.setor && (
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: 'var(--surface-elevated)',
                          color: 'var(--foreground)',
                          opacity: 0.6,
                        }}
                      >
                        {aviso.setor}
                      </span>
                    )}
                  </div>
                  <p className="opacity-80 whitespace-pre-wrap text-xs">{aviso.conteudo}</p>
                </div>
              ))}
              <button
                onClick={() => setShowAvisos(false)}
                className="text-xs font-semibold opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: 'var(--primary)' }}
              >
                Fechar avisos
              </button>
            </div>
          )}

          <div
            className="mt-6 p-3 rounded-xl text-xs border"
            style={{
              backgroundColor: 'var(--surface-elevated)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--foreground)',
            }}
          >
            <p className="opacity-60 flex items-center gap-2">
              <LuHeadphones className="h-4 w-4" />
              * Preencha todos os campos obrigatórios. Seu chamado será direcionado ao setor responsável com base na prioridade selecionada.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}