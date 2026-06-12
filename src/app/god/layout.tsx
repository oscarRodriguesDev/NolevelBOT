'use client'

import { Sidebar } from '@/app/components/sidebar'

export default function GodLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--background)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
