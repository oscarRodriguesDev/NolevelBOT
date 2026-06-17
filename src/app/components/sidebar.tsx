'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { LuMenu, LuX, LuTickets, LuBell, LuUsers, LuHouse, LuSettings, LuBuilding2, LuWrench, LuChevronDown, LuChevronRight, LuHeadphones, LuTruck, LuGlobe } from 'react-icons/lu'
import { useSession } from 'next-auth/react'
import { ROLE } from '@prisma/client'
import packageJson from '../../../package.json'
import Image from 'next/image'
import icone from '../../../public/header/favicon.png'
import UserCard from './cardUser'

type MenuItem = {
  label: string
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  show: boolean
}

type ModuloSection = {
  key: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  modulos: string[]
  items: MenuItem[]
}

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()
  const userRole = session?.user?.role as ROLE | undefined
  const [empresaModulos, setEmpresaModulos] = useState<string[]>([])

  useEffect(() => {
    if (!session?.user?.empresaId || userRole === "GOD") return
    fetch(`/api/empresa?id=${session.user.empresaId}`)
      .then(r => r.json())
      .then(data => setEmpresaModulos(data.modulos || []))
      .catch(() => {})
  }, [session, userRole])

  const temModulo = (mod: string) => userRole === "GOD" || empresaModulos.includes(mod)

  const isAdmin = userRole === "GOD" || userRole === "ADMIN" || userRole === "GESTOR"

  const modulos: ModuloSection[] = [
    {
      key: 'corporativo',
      label: 'Corporativo',
      icon: LuHeadphones,
      modulos: ['CORPORATIVO'],
      items: [
        { label: 'Dashboard', href: '/corporativo/dashboards', icon: LuHouse, show: userRole !== "ATENDENTE" },
        { label: 'Chamados', href: '/corporativo/all-tickets', icon: LuTickets, show: true },
        { label: 'Avisos', href: '/corporativo/avisos', icon: LuBell, show: true },
        { label: 'CPFs Autorizados', href: '/corporativo/cpfs', icon: LuUsers, show: true },
        { label: 'Usuários', href: '/corporativo/usuarios', icon: LuUsers, show: isAdmin },
        { label: 'Criar Usuário', href: '/corporativo/gestao-de-usuarios', icon: LuSettings, show: isAdmin },
      ],
    },
    {
      key: 'oficina',
      label: 'Operacional',
      icon: LuWrench,
      modulos: ['OFICINA'],
      items: [
        { label: 'Dashboard', href: '/oficina/dashboards', icon: LuHouse, show: userRole !== "ATENDENTE" },
        { label: 'Solicitações', href: '/oficina/all-tickets', icon: LuTickets, show: true },
        { label: 'Avisos', href: '/oficina/avisos', icon: LuBell, show: true },
        { label: 'Colaboradores', href: '/oficina/cpfs', icon: LuTruck, show: true },
        { label: 'Usuários', href: '/oficina/usuarios', icon: LuUsers, show: isAdmin },
        { label: 'Criar Usuário', href: '/oficina/gestao-de-usuarios', icon: LuSettings, show: userRole !== "GOD" && isAdmin },
       
      ],
    },
    {
      key: 'Eventos',
      label: 'Eventos',
      icon: LuWrench,
      modulos: ['EVENTOS'],
      items: [
        { label: 'Dashboard', href: '/eventos/dashboards', icon: LuHouse, show: userRole !== "ATENDENTE" },
        { label: 'Solicitações', href: '/eventos/all-tickets', icon: LuTickets, show: true },
        { label: 'Avisos', href: '/eventos/avisos', icon: LuBell, show: true },
        { label: 'Motoristas', href: '/eventos/cpfs', icon: LuTruck, show: true },
        { label: 'Usuários', href: '/eventos/usuarios', icon: LuUsers, show: isAdmin },
        { label: 'Criar Usuário', href: '/eventos/gestao-de-usuarios', icon: LuSettings, show: userRole !== "GOD" && isAdmin },
       
      ],
    },
  ]

  if (userRole === "GOD") {
    modulos.length = 0
    modulos.push({
      key: 'plataforma',
      label: 'Plataforma',
      icon: LuGlobe,
      modulos: [],
      items: [
        { label: 'Dashboard Global', href: '/god/dashboard', icon: LuHouse, show: true },
        { label: 'Empresas', href: '/corporativo/empresa', icon: LuBuilding2, show: true },
        { label: 'Usuários', href: '/god/usuarios', icon: LuUsers, show: true },
        { label: 'Admins', href: '/god/admins', icon: LuSettings, show: true },
      ],
    })
  }

  const modulosDisponiveis = modulos.filter(m => m.modulos.some(mod => temModulo(mod)) || m.key === 'plataforma')

  const [modulosAbertos, setModulosAbertos] = useState<string[]>(() => {
    const inicial: string[] = []
    modulosDisponiveis.forEach(m => {
      if (pathname.startsWith('/' + m.key + '/')) inicial.push(m.key)
    })
    if (inicial.length === 0 && modulosDisponiveis.length > 0) inicial.push(modulosDisponiveis[0].key)
    return inicial
  })

  useEffect(() => {
    setModulosAbertos(prev => {
      const modKeys = modulosDisponiveis.map(m => m.key)
      const hasMatch = prev.some(k => {
        if (pathname.startsWith('/' + k + '/')) return true
        const secao = modulosDisponiveis.find(m => m.key === k)
        return secao?.items.some(item => item.show && pathname.includes(item.href))
      })
      if (hasMatch) return prev
      const found = modulosDisponiveis.find(m => m.items.some(item => item.show && pathname.includes(item.href)))
      if (found && !prev.includes(found.key)) return [...prev, found.key]
      return prev
    })
  }, [pathname])

  const toggleModulo = (key: string) => {
    setModulosAbertos(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.includes(href)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg transition-colors duration-300 hover:scale-110"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--foreground)',
        }}
      >
        {isOpen ? <LuX size={24} /> : <LuMenu size={24} />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`sticky top-0 h-screen w-64 transition-all duration-300 z-40 lg:z-0 flex-shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{
          backgroundColor: 'var(--surface)',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        <div className="h-full flex flex-col">
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

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {modulosDisponiveis.map((modulo) => {
              const aberto = modulosAbertos.includes(modulo.key)
              const ModIcon = modulo.icon

              return (
                <div key={modulo.key} className="space-y-1">
                  <button
                    onClick={() => toggleModulo(modulo.key)}
                    className="flex items-center justify-between w-full gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:opacity-80"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <div className="flex items-center gap-3">
                      <ModIcon size={20} className="flex-shrink-0" />
                      <span className="text-sm font-semibold uppercase tracking-wider">
                        {modulo.label}
                      </span>
                    </div>
                    {aberto ? <LuChevronDown size={18} /> : <LuChevronRight size={18} />}
                  </button>

                  {aberto && (
                    <div className="ml-2 space-y-1 border-l-2 pl-3"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      {modulo.items
                        .filter(item => item.show)
                        .map((item) => {
                          const Icon = item.icon
                          const active = isActive(item.href)

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 group ${
                                active ? 'font-semibold' : 'opacity-75 hover:opacity-100'
                              }`}
                              style={{
                                backgroundColor: active ? 'var(--primary)' : 'transparent',
                                color: active ? '#ffffff' : 'var(--foreground)',
                              }}
                            >
                              <Icon size={17} className="flex-shrink-0" />
                              <span className="text-sm">{item.label}</span>
                              {active && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                              )}
                            </Link>
                          )
                        })}
                    </div>
                  )}
                </div>
              )
            })}

            {modulosDisponiveis.length === 0 && (
              <p className="text-sm opacity-50 px-4 py-3 text-center">
                Nenhum módulo disponível
              </p>
            )}
          </nav>

          <div
            className="border-t p-4 text-xs opacity-50"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <UserCard />

            <p className="mt-4">Skora</p>
            <p>Versão: {packageJson.version}</p>
          </div>
        </div>
      </aside>
    </>
  )
}
