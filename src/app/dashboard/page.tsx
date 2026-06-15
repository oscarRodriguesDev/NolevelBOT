"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LuHeadphones,
  LuWrench,
  LuCalendarCheck,
  LuLoader,
  LuLogOut,
  LuArrowRight,
} from "react-icons/lu"
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
    label: "Operacional",
    descricao: "Manutenção veicular e operações",
    icon: LuWrench,
    href: "/oficina/dashboards",
  },
 /*  {
    key: "EVENTOS",
    label: "Eventos",
    descricao: "Captura de leads em feiras e eventos",
    icon: LuCalendarCheck,
    href: "/corporativo/leads",
  }, */
]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [empresaModulos, setEmpresaModulos] = useState<string[]>([])
  const [loadingModulos, setLoadingModulos] = useState(true)

  const userRole = session?.user?.role

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.replace("/")
      return
    }

    if (userRole === "GOD") {
      setEmpresaModulos(MODULOS_DISPONIVEIS.map((m) => m.key))
      setLoadingModulos(false)
      return
    }

    if (!session.user?.empresaId) {
      setLoadingModulos(false)
      return
    }

    fetch(`/api/empresa?id=${session.user.empresaId}`)
      .then((r) => r.json())
      .then((data) => {
        setEmpresaModulos(data.modulos || [])
        setLoadingModulos(false)
      })
      .catch(() => {
        setLoadingModulos(false)
      })
  }, [session, status, userRole, router])

  if (status === "loading" || loadingModulos) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--background)" }}
      >
        <LuLoader
          size={36}
          className="animate-spin"
          style={{ color: "var(--primary)" }}
        />
      </div>
    )
  }

  if (!session) return null

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--background)" }}
    >
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={icone}
              alt="Nolevel"
              width={40}
              height={40}
              className="h-8 w-8"
            />

            <div>
              <h1
                className="font-bold text-lg"
                style={{ color: "var(--foreground)" }}
              >
                Nolevel
              </h1>

              <p className="text-xs opacity-50">
                Plataforma de Gestão
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <div className="hidden sm:block text-right">
              <p
                className="text-sm font-medium"
                style={{ color: "var(--foreground)" }}
              >
                {session.user?.name}
              </p>

              <p className="text-xs opacity-50">
                {userRole || "Usuário"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
              style={{ color: "var(--foreground)" }}
            >
              <LuLogOut size={16} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div
            className="rounded-3xl border p-8 sm:p-10 mb-10"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <p
              className="text-sm font-semibold mb-3"
              style={{ color: "var(--primary)" }}
            >
              Plataforma Nolevel
            </p>

            <h2
              className="text-3xl sm:text-5xl font-bold mb-4"
              style={{ color: "var(--foreground)" }}
            >
              Bem-vindo, {session.user?.name || "Usuário"}
            </h2>

            <p
              className="max-w-2xl text-sm sm:text-base opacity-70"
              style={{ color: "var(--foreground)" }}
            >
              Acesse os módulos disponíveis para sua empresa e acompanhe
              operações, indicadores, processos e informações em um único
              ambiente.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <div
                className="px-5 py-4 rounded-2xl border min-w-[180px]"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <p className="text-xs opacity-50">
                  Módulos liberados
                </p>

                <p
                  className="text-2xl font-bold mt-1 flex items-baseline gap-1"
                  style={{ color: "var(--foreground)" }}
                >
                  {empresaModulos.length} 
                  <span className="text-sm font-normal opacity-50">
                    / {MODULOS_DISPONIVEIS.length}
                  </span>
                </p>
              </div>

              <div
                className="px-5 py-4 rounded-2xl border min-w-[180px]"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <p className="text-xs opacity-50">
                  Perfil
                </p>

                <p
                  className="text-lg font-semibold mt-1"
                  style={{ color: "var(--foreground)" }}
                >
                  {userRole || "Usuário"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3
              className="text-2xl font-bold"
              style={{ color: "var(--foreground)" }}
            >
              Módulos
            </h3>

            <p className="text-sm opacity-60 mt-1">
              Escolha um módulo para continuar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {MODULOS_DISPONIVEIS.map((modulo) => {
              const Icon = modulo.icon
              const temAcesso = empresaModulos.includes(modulo.key)

              return (
                <button
                  key={modulo.key}
                  onClick={() => temAcesso ? router.push(modulo.href) : null}
                  disabled={!temAcesso}
                  className={`group relative overflow-hidden rounded-3xl border p-8 text-left transition-all duration-300 ${
                    temAcesso 
                      ? "hover:-translate-y-2 hover:shadow-2xl cursor-pointer" 
                      : "opacity-50 cursor-not-allowed grayscale"
                  }`}
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  {temAcesso && (
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.04), transparent)",
                      }}
                    />
                  )}

                  <div className="relative z-10">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 ${
                        temAcesso ? "group-hover:scale-110" : ""
                      }`}
                      style={{
                        backgroundColor: temAcesso ? "var(--primary)" : "var(--border-subtle)",
                        color: temAcesso ? "#fff" : "var(--foreground)",
                      }}
                    >
                      <Icon size={32} />
                    </div>

                    <h4
                      className="text-xl font-bold mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      {modulo.label}
                    </h4>

                    <p className="text-sm opacity-65 leading-relaxed">
                      {modulo.descricao}
                    </p>

                    <div
                      className="flex items-center gap-2 mt-6 text-sm font-medium"
                      style={{ color: temAcesso ? "var(--primary)" : "var(--foreground)" }}
                    >
                      {temAcesso ? (
                        <>
                          <span>Acessar módulo</span>
                          <LuArrowRight size={16} />
                        </>
                      ) : (
                        <span className="opacity-50 italic">Acesso restrito</span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </main>

      <footer
        className="border-t py-4 text-center text-xs opacity-40"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        Nolevel v{packageJson.version}
      </footer>
    </div>
  )
}