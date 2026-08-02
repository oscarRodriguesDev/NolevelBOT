'use client'

import { Sidebar } from '@/app/components/sidebar'
import { Header } from '@/app/components/module-header'

// Layout do painel "Minha Empresa" (ADMIN/GESTOR).
// Usa sidebar + header, mas NÃO exige módulo contratado (o admin pode ter
// apenas OFICINA, por exemplo, e mesmo assim precisa ver a própria empresa).
export default function MinhaEmpresaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--background)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header titulo="Minha Empresa" descricao="Configurações e integrações da sua empresa" />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  )
}
