"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { LuHeadphones, LuWrench, LuCalendarCheck, LuLoader } from "react-icons/lu"
import packageJson from "../../../package.json"
import Image from "next/image"
import icone from "../../../public/header/favicon.png"
import { ThemeToggle } from "@/app/components/theme-toggle"

type ModuloInfo = {
  key: string
  label: string
  descricao: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  href: string
}

const MODULOS_DISPONIVEIS: ModuloInfo[] = [
  {
    key: "CORPORATIVO",
    label: "Corporativo",
    descricao: "Gestão de chamados, dashboard, avisos e CPFs autorizados",
    icon: LuHeadphones,
    href: "/corporativo/dashboards",
  },
  {
    key: "OFICINA",
    label: "Oficina",
    descricao: "Manutenção veicular para transportadoras",
    icon: LuWrench,
    href: "/oficina/dashboards",
  },
  {
    key: "EVENTOS",
    label: "Eventos",
    descricao: "Captura de leads em feiras e eventos",
    icon: LuCalendarCheck,
    href: "/corporativo/leads",
  },
]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [empresaModulos, setEmpresaModulos] = useState<string[]>([])
  const [loadingModulos, setLoadingModulos] = useState(true)
  const userRole = session?.user?.role

  useEffect(() => {
    if (status === "loading") return
    if (!session) { router.replace("/login"); return }

    if (userRole === "GOD") {
      setEmpresaModulos(MODULOS_DISPONIVEIS.map(m => m.key))
      setLoadingModulos(false)
      return
    }

    if (!session.user?.empresaId) {
      setLoadingModulos(false)
      return
    }

    fetch(`/api/empresa?id=${session.user.empresaId}`)
      .then(r => r.json())
      .then(data => {
        const modulos = data.modulos || []
        setEmpresaModulos(modulos)
        setLoadingModulos(false)
      })
      .catch(() => setLoadingModulos(false))
  }, [session, status, userRole, router])

  const modulosDisponiveis = MODULOS_DISPONIVEIS.filter(m =>
    empresaModulos.includes(m.key)
  )

  if (status === "loading" || loadingModulos) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <LuLoader size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  if (!session) return null

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <header
        className="sticky top-0 z-30 border-b p-4 sm:p-6"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={icone}
              alt="Ícone"
              width={40}
              height={40}
              className="h-6 w-6 sm:h-8 sm:w-8"
            />
            <h1
              className="text-lg sm:text-xl font-bold"
              style={{ color: 'var(--primary)' }}
            >
              Nolevel
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            Bem-vindo, {session.user?.name || "Usuário"}!
          </h2>
          <p className="text-sm opacity-60">
            Selecione um módulo para acessar
          </p>
        </div>

        {modulosDisponiveis.length === 0 ? (
          <div className="text-center p-8 rounded-2xl border" style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border-subtle)',
          }}>
            <p className="opacity-60">Nenhum módulo disponível para sua empresa.</p>
            <p className="text-xs opacity-40 mt-2">Entre em contato com o administrador.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full">
            {modulosDisponiveis.map((modulo) => {
              const Icon = modulo.icon
              return (
                <button
                  key={modulo.key}
                  onClick={() => router.push(modulo.href)}
                  className="group flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg active:scale-[0.98]"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  <div
                    className="p-5 rounded-2xl transition-all duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                    }}
                  >
                    <Icon size={36} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                      {modulo.label}
                    </h3>
                    <p className="text-xs opacity-60 mt-1 max-w-[200px]">
                      {modulo.descricao}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </main>

      <footer
        className="border-t p-4 text-center text-xs opacity-40"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        Nolevel v{packageJson.version}
      </footer>
    </div>
  )
}
