'use client'

import { ThemeToggle } from '@/app/components/theme-toggle'

interface Props {
  titulo: string
  descricao: string
}

export function Header({ titulo, descricao }: Props) {
  return (
    <div
      className="sticky top-0 z-30 border-b p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg lg:text-xl font-bold uppercase tracking-tight">
            Nolevel • {titulo}
          </h1>
          <p
            className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase opacity-70"
            style={{ color: 'var(--primary)' }}
          >
            {descricao}
          </p>
        </div>

        <ThemeToggle />
      </div>
    </div>
  )
}