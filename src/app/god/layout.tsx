'use client'

import { createContext, useContext, useState } from 'react'
import { Sidebar } from '@/app/components/sidebar'
import { Header } from '@/app/components/module-header'

type HeaderContextType = {
  titulo: string
  descricao: string
  setHeader: (data: { titulo: string; descricao: string }) => void
}

const HeaderContext = createContext<HeaderContextType | null>(null)

// Hook para acessar contexto de header
export function useHeader() {
  const ctx = useContext(HeaderContext)
  if (!ctx) throw new Error('useHeader must be used within provider')
  return ctx
}

// Layout do modulo God com sidebar e header
export default function GodLayout({ children }: { children: React.ReactNode }) {
  const [titulo, setTitulo] = useState('Painel GOD')
  const [descricao, setDescricao] = useState('Controle total da plataforma')

  // Atualiza titulo e descricao do header
  function setHeader(data: { titulo: string; descricao: string }) {
    setTitulo(data.titulo)
    setDescricao(data.descricao)
  }

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
