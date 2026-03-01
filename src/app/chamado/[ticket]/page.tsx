'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { LuHardHat, LuCheck, LuLoader, LuArrowRight } from 'react-icons/lu'

export default function TicketPage() {
  const params = useParams()
  const ticketId = params.ticket as string

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    setor: '',
    descricao: '',
  })

  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
        <div className="bg-[#262626] rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border border-[#333]">
          <LuCheck className="h-16 w-16 text-[#f59e0b] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Solicitação Enviada
          </h2>
          <p className="text-gray-400 mb-6 text-sm">
            O chamado foi enviado com sucesso.
          </p>
          <button
            onClick={() => window.close()}
            className="w-full bg-[#f59e0b] text-black py-4 rounded-xl font-bold hover:bg-[#d97706] transition-all"
          >
            Concluído
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white pb-12 font-sans">
      <div className="bg-[#1a1a1a] border-b border-[#333] p-8 mb-8">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="bg-[#f59e0b] p-2 rounded-lg">
            <LuHardHat className="h-6 w-6 text-black" />
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tighter">
              Nolevel Suporte
            </h1>
            <p className="text-[#f59e0b] text-[10px] font-bold tracking-[0.2em] uppercase">
              Setor de Operações
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4">
        <div className="bg-[#1a1a1a] rounded-3xl p-8 border border-[#333] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Nome
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 bg-[#262626] border border-[#333] rounded-2xl outline-none text-white"
                placeholder="Digite seu nome completo"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
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
                className="w-full px-5 py-4 bg-[#262626] border border-[#333] rounded-2xl outline-none text-white"
                placeholder="Digite os 11 números do CPF"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Setor
              </label>
              <select
                name="setor"
                value={formData.setor}
                onChange={handleChange}
                required
                className="w-full px-5 py-4 bg-[#262626] rounded-2xl outline-none text-white"
              >
                <option value="">Selecione seu local</option>
                <option value="vitoria">Vitória - Matriz</option>
                <option value="serra">Serra - Logística</option>
                <option value="vale">Vale Tubarão</option>
                <option value="arcelor">ArcelorMittal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Descrição
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-5 py-4 bg-[#262626] border border-[#333] rounded-2xl outline-none text-white resize-none"
                placeholder="Descreva o problema"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Anexo
              </label>

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                className="w-full px-5 py-4 bg-[#262626] border border-[#333] rounded-2xl"
              />

              {file && (
                <p className="text-xs text-[#f59e0b] mt-2 font-mono">
                  Arquivo selecionado: {file.name}
                </p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#f59e0b] text-black font-black py-5 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-3 uppercase text-sm"
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