'use client'
import { useEffect, useState } from 'react'
import { LuCheck, LuLoader, LuArrowRight } from 'react-icons/lu'
import { ThemeToggle } from '@/app/components/theme-toggle'
import { FileUpload } from '@/app/components/fileInput'

export default function TicketPage() {



  
  
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    setor: '',
    descricao: '',
  })

  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [SETORES, setSetores] = useState<string[]>([])

  useEffect(() => {
    async function fetchSetores() {
      try {
        const response = await fetch(`/api/empresa?cnpj=${process.env.NEXT_PUBLIC_CNPJ}`) // cnpj da empresa deve ser definida em variavel de ambiente
        const data = await response.json()

        if (response.ok) {
          setSetores(data.setores || [])
        }
      } catch (error) {
        console.error('Erro ao buscar setores', error)
      }
    }

    fetchSetores()
  }, [])





  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const form = new FormData()
      form.append('nome', formData.nome)
      form.append('cpf', formData.cpf)
      form.append('setor', formData.setor)
      form.append('descricao', formData.descricao)
      form.append('prioridade', 'normal')

      if (file) {
        form.append('anexo', file)
      }

      const response = await fetch('/api/tickets', {
        method: 'POST',
        body: form,
      })

      if (!response.ok) {
        throw new Error('Erro na requisição')
      }

      setSubmitted(true)
    } catch {
      alert('Erro ao processar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
 return (
      <div
        className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-colors duration-300"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="absolute right-4 top-4 z-50">
          <ThemeToggle />
        </div>
        <div
          className="rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm w-full text-center border transition-colors duration-300"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <LuCheck className="h-16 w-16 mx-auto mb-4" style={{ color: "var(--primary)" }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--primary)" }}>
            Solicitação Enviada
          </h2>
          <p className="mb-6 text-sm opacity-70">
            O chamado foi enviado com sucesso.
          </p>
          <button
            onClick={() => window.close()}
            className="w-full py-4 rounded-xl font-bold transition-all duration-300 text-white hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "var(--primary)",
            }}
            onMouseEnter={e => {
              if (e.target instanceof HTMLElement) {
                e.target.style.backgroundColor = "var(--primary-hover)";
              }
            }}
            onMouseLeave={e => {
              if (e.target instanceof HTMLElement) {
                e.target.style.backgroundColor = "var(--primary)";
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
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>


      <div className="max-w-2xl mx-auto">
        <div className="space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: "var(--primary)" }}>
            Criar Novo Chamado
          </h2>
          <p className="text-sm opacity-70">Preencha os campos abaixo para registrar uma solicitação</p>
        </div>

        <div
          className="rounded-2xl p-6 sm:p-8 border shadow-lg transition-colors duration-300"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--foreground)",
                  "--tw-ring-color": "var(--primary)",
                } as never}
                placeholder="Digite seu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                required
                pattern="\d{11}"
                maxLength={11}
                className="w-full px-4 py-3 border rounded-lg outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--foreground)",
                  "--tw-ring-color": "var(--primary)",
                } as never}
                placeholder="00000000000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
               Setor
              </label>
              <select
                name="setor"
                value={formData.setor}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg outline-none transition-all duration-300 border focus:ring-2 focus:ring-opacity-50"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--foreground)",
                  borderColor: "var(--border-subtle)",
                  "--tw-ring-color": "var(--primary)",
                } as never}
              >
                <option value="">Esse chamado é para qual setor?</option>
                {SETORES.map(setor => (
                  <option key={setor} value={setor}>
                    {setor}
                  </option>
                ))}

              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Descrição do Problema
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border rounded-lg outline-none transition-all duration-300 resize-none focus:ring-2 focus:ring-opacity-50"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--foreground)",
                  "--tw-ring-color": "var(--primary)",
                } as never}
                placeholder="Descreva o problema ou solicitação em detalhes..."
              />
            </div>

{/* 
            <div>
              <label className="block text-sm font-semibold mb-2">
                Anexar Arquivo (Opcional)
              </label>

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--foreground)",
                  "--tw-ring-color": "var(--primary)",
                } as never}
              />

              {file && (
                <p className="text-xs mt-2 font-mono" style={{ color: "var(--primary)" }}>
                  Arquivo selecionado: {file.name}
                </p>
              )}
            </div>

 */}
  <FileUpload file={file} setFile={setFile} handleFileChange={handleFileChange} />


            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full font-semibold py-3 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:hover:scale-100"
                style={{
                  backgroundColor: "var(--primary)",
                }}
                onMouseEnter={e => {
                  if (e.currentTarget instanceof HTMLElement && !loading) {
                    e.currentTarget.style.backgroundColor = "var(--primary-hover)";
                  }
                }}
                onMouseLeave={e => {
                  if (e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.style.backgroundColor = "var(--primary)";
                  }
                }}
              >
                {loading ? (
                  <>
                    <LuLoader className="animate-spin h-5 w-5" />
                    Processando
                  </>
                ) : (
                  <>
                    Enviar Chamado
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
