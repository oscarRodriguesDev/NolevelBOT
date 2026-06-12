'use client'
import { useState, useEffect } from 'react'
import { LuCheck, LuLoader, LuArrowRight, LuBus } from 'react-icons/lu'
import { ThemeToggle } from '../components/theme-toggle'
import toast from 'react-hot-toast'

export default function OficinaPage() {
  const [step, setStep] = useState<'matricula' | 'form' | 'sucesso'>('matricula')
  const [matricula, setMatricula] = useState('')
  const [loading, setLoading] = useState(false)
  const [nome, setNome] = useState('')
  const [setores, setSetores] = useState<string[]>([])
  const [empresaId, setEmpresaId] = useState('')

  const [form, setForm] = useState({
    funcao: '',
    numeroOnibus: '',
    data: '',
    defeito: '',
    setor: '',
  })

  async function buscarMatricula() {
    const clean = matricula.replace(/\D/g, '')
    if (!clean) {
      toast.error('Digite sua matrícula')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/oficina/tickets?matricula=${clean}`)
      if (!res.ok) {
        toast.error('Matrícula não encontrada')
        return
      }
      const data = await res.json()

      setNome(data.nome || '')
      setSetores(data.setores || [])
      setEmpresaId(data.empresaId || '')
      setStep('form')
    } catch {
      toast.error('Erro ao validar matrícula')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (step === 'form' && !form.data) {
      const hoje = new Date()
      const dia = String(hoje.getDate()).padStart(2, '0')
      const mes = String(hoje.getMonth() + 1).padStart(2, '0')
      const ano = hoje.getFullYear()
      setForm(prev => ({ ...prev, data: `${dia}/${mes}/${ano}` }))
    }
  }, [step, form.data])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.setor) {
      toast.error('Selecione um setor')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/oficina/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matricula,
          nome,
          funcao: form.funcao,
          numeroOnibus: form.numeroOnibus,
          data: form.data,
          defeito: form.defeito,
          setor: form.setor,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao registrar')
      }

      setStep('sucesso')
      toast.success('Registro enviado com sucesso!')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'sucesso') {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <div className="absolute right-4 top-4 z-50">
          <ThemeToggle />
        </div>
        <div
          className="rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border transition-colors duration-300"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <LuCheck className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--primary)' }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
            Registro Enviado!
          </h2>
          <p className="mb-6 text-sm opacity-70">
            Seu registro de defeito foi enviado para a operacional. Acompanhe pelo sistema de Pedidos de Manutenção (PM).
          </p>
          <button
            onClick={() => window.close()}
            className="w-full py-4 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ backgroundColor: 'var(--primary)' }}
            onMouseEnter={e => { if (e.target instanceof HTMLElement) e.target.style.backgroundColor = 'var(--primary-hover)' }}
            onMouseLeave={e => { if (e.target instanceof HTMLElement) e.target.style.backgroundColor = 'var(--primary)' }}
          >
            Concluído
          </button>
        </div>
      </div>
    )
  }

  if (step === 'form') {
    return (
      <div
        className="min-h-screen px-4 py-8 transition-colors duration-300"
        style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
      >
        <div className="absolute right-4 top-4 z-50">
          <ThemeToggle />
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="space-y-2 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--primary)' }}>
              <LuBus className="inline mr-2 mb-1" />
              Registro de Defeito - Operacional
            </h2>
            <p className="text-sm opacity-70">Preencha os dados do veículo e do defeito encontrado</p>
          </div>

          <div
            className="rounded-2xl p-6 sm:p-8 border shadow-lg transition-colors duration-300"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
                  Matrícula
                </label>
                <input
                  type="text"
                  value={matricula}
                  disabled
                  className="w-full px-4 py-3 border rounded-xl outline-none opacity-60 cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--surface-elevated)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
                  Nome do Colaborador
                </label>
                <input
                  type="text"
                  value={nome}
                  disabled
                  className="w-full px-4 py-3 border rounded-xl outline-none opacity-60 cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--surface-elevated)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
                  Função
                </label>
                <input
                  type="text"
                  value={form.funcao}
                  onChange={e => setForm(prev => ({ ...prev, funcao: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border rounded-xl outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                  style={{
                    backgroundColor: 'var(--surface-elevated)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--foreground)',
                    '--tw-ring-color': 'var(--primary)',
                  } as never}
                  placeholder="Ex: Colaborador, Cobrador..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
                  Número do Ônibus
                </label>
                <input
                  type="text"
                  value={form.numeroOnibus}
                  onChange={e => setForm(prev => ({ ...prev, numeroOnibus: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border rounded-xl outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                  style={{
                    backgroundColor: 'var(--surface-elevated)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--foreground)',
                    '--tw-ring-color': 'var(--primary)',
                  } as never}
                  placeholder="Ex: 1234"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
                  Data do Ocorrido
                </label>
                <input
                  type="text"
                  value={form.data}
                  disabled
                  className="w-full px-4 py-3 border rounded-xl outline-none opacity-60 cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--surface-elevated)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
                  Defeito Encontrado
                </label>
                <textarea
                  value={form.defeito}
                  onChange={e => setForm(prev => ({ ...prev, defeito: e.target.value }))}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border rounded-xl outline-none transition-all duration-300 resize-none focus:ring-2 focus:ring-opacity-50"
                  style={{
                    backgroundColor: 'var(--surface-elevated)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--foreground)',
                    '--tw-ring-color': 'var(--primary)',
                  } as never}
                  placeholder="Descreva o defeito em detalhes..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
                  Setor
                </label>
                <select
                  value={form.setor}
                  onChange={e => setForm(prev => ({ ...prev, setor: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border rounded-xl outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                  style={{
                    backgroundColor: 'var(--surface-elevated)',
                    color: 'var(--foreground)',
                    borderColor: 'var(--border-subtle)',
                    '--tw-ring-color': 'var(--primary)',
                  } as never}
                >
                  <option value="">Selecione um setor</option>
                  {setores.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-bold py-4 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 text-white transition-all duration-300 hover:brightness-110 hover:shadow-lg active:scale-[0.98] disabled:hover:scale-100"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {loading ? (
                    <>
                      <LuLoader className="animate-spin h-5 w-5" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar Registro
                      <LuArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <div
        className="rounded-3xl shadow-2xl p-8 max-w-md w-full border transition-colors duration-300"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="text-center mb-8">
          <LuBus className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--primary)' }} />
          <h2 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
            Operacional - Registro de Defeito
          </h2>
          <p className="text-sm opacity-70 mt-2">
            Digite sua matrícula para começar
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={matricula}
            onChange={e => setMatricula(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => { if (e.key === 'Enter') buscarMatricula() }}
            placeholder="Digite sua matrícula"
            className="w-full px-4 py-3 border rounded-xl outline-none text-center text-lg font-bold tracking-widest transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
            style={{
              backgroundColor: 'var(--surface-elevated)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--foreground)',
              '--tw-ring-color': 'var(--primary)',
            } as never}
          />

          <button
            onClick={buscarMatricula}
            disabled={loading || !matricula}
            className="w-full font-bold py-4 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 text-white transition-all duration-300 hover:brightness-110 hover:shadow-lg active:scale-[0.98]"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {loading ? (
              <>
                <LuLoader className="animate-spin h-5 w-5" />
                Validando...
              </>
            ) : (
              'Acessar'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
