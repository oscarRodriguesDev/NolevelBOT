"use client"

import Link from "next/link"

export default function LandingPage() {
  return (
    <main className="bg-[#0F172A] text-[#F8FAFC] overflow-hidden">

      {/* HERO */}
      <section className="relative px-6 py-28 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <span className="inline-block mb-6 px-4 py-1 text-sm rounded-full bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/40">
            Plataforma inteligente de atendimento
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Transforme seu atendimento em um sistema
            <span className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
              {" "}rápido, inteligente e automatizado
            </span>
          </h1>

          <p className="text-lg text-[#94A3B8] mb-8 max-w-xl">
            Centralize chamados, automatize processos e tenha total controle da operação com uma plataforma moderna, escalável e intuitiva.
          </p>

          <div className="flex gap-4 flex-wrap">
            <Link
              href="/register"
              className="px-8 py-4 rounded-2xl font-semibold bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(124,58,237,0.4)]"
            >
              Criar conta gratuita
            </Link>

            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl font-semibold border border-[#334155] hover:border-[#7C3AED] transition-all duration-300"
            >
              Acessar sistema
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-10 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] blur-3xl opacity-30 rounded-full animate-pulse" />
          <div className="relative bg-[#111827] rounded-3xl border border-[#1E293B] p-6 shadow-2xl hover:scale-[1.02] transition-all duration-500">
            <div className="h-80 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center text-[#94A3B8]">
              Mockup do Dashboard
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="px-6 py-24 bg-[#111827]">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo que você precisa para escalar seu suporte
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto">
            Recursos pensados para empresas que precisam de organização, velocidade e controle.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
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
              className="p-8 rounded-2xl bg-[#0F172A] border border-[#1E293B] hover:-translate-y-2 hover:border-[#7C3AED] hover:shadow-[0_0_25px_rgba(124,58,237,0.2)] transition-all duration-300"
            >
              <div className="w-10 h-10 mb-6 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]" />
              <h3 className="text-xl font-semibold mb-3">{item}</h3>
              <p className="text-[#94A3B8] text-sm">
                Estrutura organizada para garantir eficiência e controle total da operação.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PLANOS */}
      <section className="px-6 py-28 bg-[#0F172A]">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Planos para cada fase do seu crescimento
          </h2>
          <p className="text-[#94A3B8]">
            Simulação de valores. Você pode ajustar conforme sua estratégia.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">

          <div className="p-8 rounded-3xl bg-[#111827] border border-[#1E293B] hover:-translate-y-2 transition-all duration-300">
            <h3 className="text-xl font-semibold mb-4">Start</h3>
            <p className="text-4xl font-bold mb-6">
              R$ 49<span className="text-lg text-[#94A3B8]">/mês</span>
            </p>
            <ul className="space-y-3 text-[#94A3B8] text-sm mb-8">
              <li>Até 2 agentes</li>
              <li>500 tickets/mês</li>
              <li>Painel básico</li>
              <li>Suporte por email</li>
            </ul>
            <button className="w-full py-3 rounded-xl border border-[#334155] hover:border-[#7C3AED] transition-all">
              Escolher plano
            </button>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#1E1B4B] to-[#0F172A] border border-[#7C3AED] scale-105 shadow-[0_0_40px_rgba(124,58,237,0.3)]">
            <div className="mb-4 text-sm px-3 py-1 rounded-full bg-[#7C3AED]/20 text-[#7C3AED] inline-block">
              Mais escolhido
            </div>
            <h3 className="text-xl font-semibold mb-4">Pro</h3>
            <p className="text-4xl font-bold mb-6">
              R$ 149<span className="text-lg text-[#94A3B8]">/mês</span>
            </p>
            <ul className="space-y-3 text-[#94A3B8] text-sm mb-8">
              <li>Até 10 agentes</li>
              <li>Tickets ilimitados</li>
              <li>Automação avançada</li>
              <li>Integração API</li>
              <li>Relatórios completos</li>
            </ul>
            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] font-semibold hover:opacity-90 transition-all">
              Escolher plano
            </button>
          </div>

          <div className="p-8 rounded-3xl bg-[#111827] border border-[#1E293B] hover:-translate-y-2 transition-all duration-300">
            <h3 className="text-xl font-semibold mb-4">Enterprise</h3>
            <p className="text-4xl font-bold mb-6">Sob consulta</p>
            <ul className="space-y-3 text-[#94A3B8] text-sm mb-8">
              <li>Agentes ilimitados</li>
              <li>SLA avançado</li>
              <li>Integração personalizada</li>
              <li>Suporte prioritário</li>
              <li>Customização total</li>
            </ul>
            <button className="w-full py-3 rounded-xl border border-[#334155] hover:border-[#7C3AED] transition-all">
              Falar com vendas
            </button>
          </div>

        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-6 py-24 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Pronto para elevar o nível do seu atendimento?
        </h2>
        <Link
          href="/register"
          className="inline-block px-10 py-4 rounded-2xl bg-[#0F172A] font-semibold hover:scale-105 transition-all"
        >
          Começar agora
        </Link>
      </section>

    </main>
  )
}