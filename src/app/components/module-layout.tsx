'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ROLE } from '@prisma/client'
import { Sidebar } from '@/app/components/sidebar'
import { Header } from '@/app/components/module-header'
import type { ModuleConfig } from '@/lib/modules'

type HeaderContextType = {
  titulo: string
  descricao: string
  setHeader: (data: { titulo: string; descricao: string }) => void
}

export const HeaderContext = createContext<HeaderContextType | null>(null)

// Hook para acessar dados do cabecalho do contexto
export function useHeader() {
  const ctx = useContext(HeaderContext)
  if (!ctx) throw new Error('useHeader must be used within provider')
  return ctx
}

interface Props {
  module: ModuleConfig
  children: ReactNode
}

// Layout protegido do modulo com sidebar e cabecalho
export function ModuleLayout({ module, children }: Props) {
  const { data: session, status } = useSession()
  const userRole = session?.user?.role as ROLE | undefined
  const router = useRouter()
  const [autorizado, setAutorizado] = useState<boolean | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    // Verifica se o usuario tem acesso ao modulo
    async function checkAuthorization() {
      if (userRole === 'GOD') {
        setAutorizado(true)
        return
      }

      if (!session?.user?.empresaId) {
        setAutorizado(false)
        return
      }

      try {
        const response = await fetch(`/api/empresa?id=${session.user.empresaId}`)
        const data = await response.json()
        const modulos = data.modulos || []

        if (modulos.includes(module.moduleCheck)) {
          setAutorizado(true)
        } else {
          setAutorizado(false)
          router.replace('/dashboard')
        }
        
      } catch {
        setAutorizado(false)
        router.replace('/dashboard')
      }
    }

    checkAuthorization()
  }, [session, status, userRole, router, module.moduleCheck])

  const [titulo, setTitulo] = useState(module.moduleLabel)
  const [descricao, setDescricao] = useState(module.description)

  // Atualiza titulo e descricao do cabecalho
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
