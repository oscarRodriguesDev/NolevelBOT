'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ROLE } from '@prisma/client'
import { Sidebar } from '@/app/components/sidebar'
import { Header } from './components/header'

type HeaderContextType = {
  titulo: string
  descricao: string
  setHeader: (data: { titulo: string; descricao: string }) => void
}

const HeaderContext = createContext<HeaderContextType | null>(null)

export function useHeader() {
  const ctx = useContext(HeaderContext)
  if (!ctx) throw new Error('useHeader must be used within provider')
  return ctx
}

export default function AtendimentoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const userRole = session?.user?.role as ROLE | undefined
  const router = useRouter()
  const pathname = usePathname()
  const [autorizado, setAutorizado] = useState<boolean | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (userRole === "GOD") { setAutorizado(true); return }
    if (!session?.user?.empresaId) { setAutorizado(false); return }

    fetch(`/api/empresa?id=${session.user.empresaId}`)
      .then(r => r.json())
      .then(data => {
        const modulos = data.modulos || []
        if (modulos.includes('OFICINA')) {
          setAutorizado(true)
        } else {
          setAutorizado(false)
          router.replace('/dashboards')
        }
      })
      .catch(() => { setAutorizado(false); router.replace('/dashboards') })
  }, [session, status, userRole, router])

  const [titulo, setTitulo] = useState('Oficina')
  const [descricao, setDescricao] = useState('Manutenção de Veículos')

  function setHeader(data: { titulo: string; descricao: string }) {
    setTitulo(data.titulo)
    setDescricao(data.descricao)
  }

  if (status === 'loading' || autorizado === null) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="animate-spin w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!autorizado) return null

  return (
    <HeaderContext.Provider value={{ titulo, descricao, setHeader }}>
      <div className="flex min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--background)' }}>
        <Sidebar />

        <div className="flex-1 flex flex-col">
          <Header titulo={titulo} descricao={descricao} />

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </HeaderContext.Provider>
  )
}