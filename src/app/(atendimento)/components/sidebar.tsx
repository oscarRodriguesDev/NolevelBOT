'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LuMenu, LuX, LuTickets, LuBell, LuUsers, LuHouse } from 'react-icons/lu'
import packageJson from '../../../../package.json'
import Image from 'next/image'
import icone from '../../../../public/header/favicon.png'
import UserCard from './cardUser'

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

    {
      label: 'Gestão de Usuarios',
      href: '/gestao-de-usuarios',
      icon: LuUsers,
    },
    {
      label: 'Empresas',
      href: '/empresa',
      icon: LuUsers,
    }
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
    className={`sticky top-0 h-screen w-64 transition-all duration-300 z-40 lg:z-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0`}
    style={{
      backgroundColor: 'var(--surface)',
      borderRight: '1px solid var(--border-subtle)',
    }}
  >
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="p-2 sm:p-3 rounded-lg flex-shrink-0">
          <Image
            src={icone}
            alt="Ícone"
            width={50}
            height={50}
            className="h-5 w-5 sm:h-6 sm:w-6"
          />
        </div>

        <div>
          <h2
            className="text-lg sm:text-xl font-bold"
            style={{ color: "var(--primary)" }}
          >
            Menu
          </h2>
          <p className="text-xs opacity-60">Administração</p>
        </div>
      </div>

      <hr className="mx-4" style={{ borderColor: 'var(--border-subtle)' }} />

      {/* Navigation */}
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
                active ? 'font-semibold' : 'opacity-75 hover:opacity-100'
              }`}
              style={{
                backgroundColor: active ? 'var(--primary)' : 'transparent',
                color: active ? '#ffffff' : 'var(--foreground)',
              }}
            >
              <Icon size={20} className="flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
              {active && (
                <div className="ml-auto w-2 h-2 rounded-full bg-white" />
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
        <UserCard
          name={'Administrador'}
          email={'adm@nolevel.com.br'}
          role={'Admin'}
          avatarUrl={icone.src}
        />

        <p className="mt-4">Nolevel</p>
        <p>Versão: {packageJson.version}</p>
      </div>
    </div>
  </aside>
</>
  )
}
