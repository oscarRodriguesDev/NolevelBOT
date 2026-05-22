'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ROLE } from '@prisma/client'
import Link from 'next/link'
import { ArrowLeft, Building2, CheckCircle2, Loader2 } from 'lucide-react'
import { useHeader } from '../../layout'
import toast from 'react-hot-toast'

export default function CreateEmpresa() {
  const { data: session, status } = useSession()
  const router = useRouter()

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          cnpj: cnpj.replace(/\D/g, ''),
          setores: setores.split(',').map((s) => s.trim()).filter(Boolean),
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
      <div className="max-w-2xl mx-auto">
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
