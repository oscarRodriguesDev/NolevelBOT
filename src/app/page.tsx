"use client"

import Link from "next/link"
import { ThemeToggle } from "./components/theme-toggle"

export default function LandingPage() {
  return (
    <main className="overflow-hidden transition-colors duration-300" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>

      <ThemeToggle />

      {/* HERO */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="space-y-8">
            <span className="inline-block px-4 py-1 text-sm rounded-full border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--primary)", color: "var(--primary)" }}>
              Plataforma inteligente de atendimento
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight" style={{ color: "var(--primary)" }}>
              Transforme seu atendimento em um sistema
              <span className="block mt-2" style={{ color: "var(--accent-secondary)" }}>
                rápido, inteligente e automatizado
              </span>
            </h1>

            <p className="text-base sm:text-lg max-w-xl opacity-75 leading-relaxed">
              Centralize chamados, automatize processos e tenha total controle da operação com uma plataforma moderna, escalável e intuitiva.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-white text-center transition-all duration-300 hover:scale-105 active:scale-95"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Acessar sistema
              </Link>

              <Link
                href="/login"
                className="px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-center transition-all duration-300 border hover:opacity-80"
                style={{ borderColor: "var(--border-subtle)", color: "var(--foreground)" }}
              >
                Saiba mais
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-10 blur-3xl opacity-20 rounded-full animate-pulse" style={{ backgroundColor: "var(--primary)" }} />
            <div className="relative rounded-3xl border p-6 sm:p-8 shadow-2xl hover:scale-105 transition-all duration-500" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}>
              <div className="h-80 rounded-2xl flex items-center justify-center text-center opacity-50" style={{ backgroundColor: "var(--surface-elevated)" }}>
                <div>
                  <p className="text-lg font-semibold">Dashboard Preview</p>
                  <p className="text-sm opacity-70 mt-2">Visualização da plataforma</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32" style={{ backgroundColor: "var(--surface)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Tudo que você precisa para escalar seu suporte
            </h2>
            <p className="max-w-2xl mx-auto opacity-70">
              Recursos pensados para empresas que precisam de organização, velocidade e controle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              "Centralização de chamados",
              "Automação inteligente",
              "Controle de SLA",
              "Histórico completo",
              "Relatórios em tempo real",
              "Integração via API"
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 sm:p-8 rounded-2xl border hover:-translate-y-1 transition-all duration-300"
                style={{ backgroundColor: "var(--background)", borderColor: "var(--border-subtle)" }}
              >
                <div className="w-10 h-10 mb-4 rounded-lg" style={{ backgroundColor: "var(--primary)" }} />
                <h3 className="text-lg font-semibold mb-2">{item}</h3>
                <p className="text-sm opacity-70">
                  Estrutura organizada para garantir eficiência e controle total da operação.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 text-center" style={{ backgroundColor: "var(--primary)" }}>
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Pronto para elevar o nível do seu atendimento?
          </h2>
          <p className="text-white opacity-90">
            Acesse o sistema de gestão de chamados Nolevel e comece a gerenciar suas operações agora.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ backgroundColor: "var(--background)" }}
          >
            Acessar sistema
          </Link>
        </div>
      </section>

    </main>
  )
}
