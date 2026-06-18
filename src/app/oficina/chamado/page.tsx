'use client'
import { useState, useEffect } from 'react'
import { LuCheck, LuWrench, LuTruck, LuClipboardList, LuLoader, LuArrowRight, LuMegaphone } from 'react-icons/lu'
import { ThemeToggle } from '../../components/theme-toggle'
import { FileUpload } from '../../components/fileInput'
import toast from 'react-hot-toast'

type TipoRegistro = 'defeito' | 'socorro' | 'sem_defeito' | null

export default function ManutencaoPage() {
  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    nome: '',
    matricula: '',
    data: '',
    veiculo: '',
    discriminacao: '',
  })

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted) {
      const hoje = new Date().toISOString().split('T')[0]
      setFormData(prev => ({ ...prev, data: hoje }))
    }
  }, [mounted])

  const [tipoRegistro, setTipoRegistro] = useState<TipoRegistro>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [setoresDisponiveis, setSetoresDisponiveis] = useState<string[]>([])
  const [setorSelecionado, setSetorSelecionado] = useState('')
  const [avisos, setAvisos] = useState<any[]>([])
  const [showAvisos, setShowAvisos] = useState(false)
  const [matriculaValida, setMatriculaValida] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    if (name === 'matricula') {
      const digits = value.replace(/\D/g, '').slice(0, 6)
      setFormData(prev => ({ ...prev, matricula: digits }))
      return
    }
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  async function validarMatricula(matricula: string) {
    if (matricula.length < 3) return
    try {
      const res = await fetch(`/api/oficina/tickets?matricula=${matricula}`)
      if (res.ok) {
        const data = await res.json()
        setFormData(prev => ({ ...prev, nome: data.nome || prev.nome }))
        setSetoresDisponiveis(data.setores || [])
        setMatriculaValida(true)
        fetchAvisos(matricula)
      } else {
        setMatriculaValida(false)
        setSetoresDisponiveis([])
      }
    } catch {
      setMatriculaValida(false)
    }
  }

  async function fetchAvisos(matricula: string) {
    try {
      const res = await fetch(`/api/quadro-avisos/mostrar-avisos?cpf=${matricula}`)
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

    if (!tipoRegistro) {
      toast.error('Selecione o tipo de registro')
      return
    }

    if (tipoRegistro !== 'sem_defeito' && !formData.discriminacao.trim()) {
      toast.error('Descreva os serviços necessários')
      return
    }

    if (!setorSelecionado) {
      toast.error('Selecione o setor de destino')
      return
    }

    setLoading(true)

    try {
      const form = new FormData()
      form.append('matricula', formData.matricula)
      form.append('nome', formData.nome)
      form.append('funcao', tipoRegistro)
      form.append('numeroOnibus', formData.veiculo)
      form.append('data', formData.data)
      form.append('defeito', formData.discriminacao)
      form.append('setor', setorSelecionado)

      if (file) {
        form.append('anexo', file)
      }

      const response = await fetch('/api/oficina/tickets', {
        method: 'POST',
        body: form,
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || `Erro HTTP ${response.status}`)
      }

      setLoading(false)
      setSubmitted(true)
      toast.success('Solicitação registrada com sucesso')
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
            Registro Enviado
          </h2>
          <p className="mb-6 text-sm opacity-70">
            {tipoRegistro === 'sem_defeito'
              ? 'Veículo registrado sem defeitos.'
              : 'Solicitação de manutenção registrada com sucesso.'}
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
            Registro de Manutenção
          </h2>
          <p className="text-sm opacity-70">Preencha os dados do veículo e informe o tipo de ocorrência</p>
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
                  Nome do Motorista
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
                  Matrícula
                </label>
                <input
                  type="text"
                  name="matricula"
                  value={formData.matricula}
                  onChange={handleChange}
                  onBlur={() => validarMatricula(formData.matricula)}
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                  style={{
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--foreground)',
                    '--tw-ring-color': 'var(--primary)',
                  } as never}
                  placeholder="000000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  name="data"
                  value={formData.data}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                  style={{
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--foreground)',
                    '--tw-ring-color': 'var(--primary)',
                  } as never}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
                  Veículo / Placa
                </label>
                <input
                  type="text"
                  name="veiculo"
                  value={formData.veiculo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                  style={{
                    backgroundColor: 'var(--surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--foreground)',
                    '--tw-ring-color': 'var(--primary)',
                  } as never}
                  placeholder="Ex: Ônibus 102 - ABC1D23"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-3">
                Tipo de Registro
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoRegistro('defeito')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                    tipoRegistro === 'defeito'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--border-subtle)] hover:border-[var(--primary)]/50'
                  }`}
                  style={{
                    backgroundColor: tipoRegistro === 'defeito' ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'var(--surface-elevated)',
                  }}
                >
                  <LuWrench className={`h-6 w-6 ${tipoRegistro === 'defeito' ? 'text-[var(--primary)]' : 'opacity-60'}`} />
                  <div className="text-left">
                    <span className={`block text-sm font-semibold ${tipoRegistro === 'defeito' ? 'text-[var(--primary)]' : ''}`}>
                      Defeito
                    </span>
                    <span className="text-xs opacity-60">Problema mecânico/técnico</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoRegistro('socorro')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                    tipoRegistro === 'socorro'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--border-subtle)] hover:border-[var(--primary)]/50'
                  }`}
                  style={{
                    backgroundColor: tipoRegistro === 'socorro' ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'var(--surface-elevated)',
                  }}
                >
                  <LuTruck className={`h-6 w-6 ${tipoRegistro === 'socorro' ? 'text-[var(--primary)]' : 'opacity-60'}`} />
                  <div className="text-left">
                    <span className={`block text-sm font-semibold ${tipoRegistro === 'socorro' ? 'text-[var(--primary)]' : ''}`}>
                      Socorro de Rua
                    </span>
                    <span className="text-xs opacity-60">Veículo quebrado em circulação</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoRegistro('sem_defeito')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${
                    tipoRegistro === 'sem_defeito'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--border-subtle)] hover:border-[var(--primary)]/50'
                  }`}
                  style={{
                    backgroundColor: tipoRegistro === 'sem_defeito' ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'var(--surface-elevated)',
                  }}
                >
                  <LuCheck className={`h-6 w-6 ${tipoRegistro === 'sem_defeito' ? 'text-[var(--primary)]' : 'opacity-60'}`} />
                  <div className="text-left">
                    <span className={`block text-sm font-semibold ${tipoRegistro === 'sem_defeito' ? 'text-[var(--primary)]' : ''}`}>
                      Sem Defeito
                    </span>
                    <span className="text-xs opacity-60">Veículo OK ao final do turno</span>
                  </div>
                </button>
              </div>
            </div>

            {(tipoRegistro === 'defeito' || tipoRegistro === 'socorro') && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
                  Discriminação dos Serviços
                </label>
                <textarea
                  name="discriminacao"
                  value={formData.discriminacao}
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
                  placeholder={tipoRegistro === 'defeito'
                    ? 'Descreva detalhadamente o defeito apresentado...'
                    : 'Descreva o ocorrido e o motivo do socorro...'}
                />
              </div>
            )}

            {tipoRegistro === 'sem_defeito' && (
              <div
                className="p-4 rounded-xl text-sm border"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--primary) 8%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--primary) 20%, transparent)',
                  color: 'var(--foreground)',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <LuClipboardList className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                  <span className="font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                    Final de Turno
                  </span>
                </div>
                <p className="opacity-70 text-xs">
                  O veículo será registrado como OK. Nenhum serviço de manutenção será solicitado.
                </p>
              </div>
            )}

            {matriculaValida && setoresDisponiveis.length > 0 && (
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
                    Registrar Solicitação
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
            <p className="opacity-60">
              * Preencha todos os campos obrigatórios. Ao registrar sem defeito, apenas os dados do colaborador e veículo serão salvos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
