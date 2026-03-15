'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LuChevronDown, LuMenu, LuX, LuTickets, LuBell, LuUsers, LuHouse } from 'react-icons/lu'

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/dashboards',
      icon: LuHouse,
    },
    {
      label: 'Chamados',
      href: '/all-tickets',
      icon: LuTickets,
    },
    {
      label: 'Avisos',
      href: '/avisos',
      icon: LuBell,
    },
    {
      label: 'CPFs Autorizados',
      href: '/cpfs',
      icon: LuUsers,
    },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.includes(href)
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 lg:hidden p-2 rounded-lg transition-colors duration-300 hover:scale-110"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--foreground)',
        }}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <LuX size={24} /> : <LuMenu size={24} />}
      </button>

      {/* Overlay Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 transition-all duration-300 z-40 lg:z-0 lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: 'var(--surface)',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        {/* Sidebar Content */}
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <h2 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--primary)' }}>
              Menu
            </h2>
            <p className="text-xs opacity-60">Administração</p>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                    active
                      ? 'font-semibold'
                      : 'opacity-75 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: active ? 'var(--primary)' : 'transparent',
                    color: active ? '#ffffff' : 'var(--foreground)',
                  }}
                >
                  <Icon
                    size={20}
                    className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                  {active && (
                    <div className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor: '#ffffff' }} />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div
            className="border-t p-4 text-xs opacity-50"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <p>NolevelBOT</p>
            <p>v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}
