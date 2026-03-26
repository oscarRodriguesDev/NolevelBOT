'use client'

import { createContext, useContext, useState } from 'react'
import { Sidebar } from './components/sidebar'
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
  const [titulo, setTitulo] = useState('Atendimento')
  const [descricao, setDescricao] = useState('Suporte Tecnico')

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