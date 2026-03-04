"use client";

import { ThemeToggle } from "./components/theme-toggle";
import Link from "next/link";

export default function Home() {
  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <ThemeToggle />

      <main>
        {/* Hero */}
        <section
          className="px-6 py-24 text-center"
          style={{ backgroundColor: "var(--surface)" }}
        >
          <h1 className="text-5xl font-bold mb-6">
            <span style={{ color: "var(--primary)" }}>Nolevel</span>BOT
          </h1>

          <p className="text-xl max-w-2xl mx-auto mb-8 opacity-80">
            Sistema inteligente de gestão de chamados com abertura automática via WhatsApp
            e direcionamento por categoria para os setores da empresa.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="px-6 py-3 rounded-lg transition"
              style={{
                backgroundColor: "var(--primary)",
                color: "#fff",
              }}
            >
              Acessar Sistema
            </Link>

            <Link
              href="#planos"
              className="px-6 py-3 rounded-lg border transition"
              style={{
                borderColor: "var(--border-subtle)",
              }}
            >
              Ver Planos
            </Link>
          </div>
        </section>

        {/* Funcionalidades */}
        <section className="px-6 py-20 max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-12">
            Principais Funcionalidades
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Abertura via WhatsApp",
                desc: "Usuários abrem chamados diretamente pelo bot no WhatsApp.",
              },
              {
                title: "Direcionamento Automático",
                desc: "Chamados são classificados e enviados ao setor responsável.",
              },
              {
                title: "Painel de Gestão",
                desc: "Visualização completa de chamados e histórico detalhado.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border transition"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <h3 className="font-semibold text-lg mb-3">
                  {item.title}
                </h3>
                <p className="text-sm opacity-75">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Planos - Simulação */}
        <section id="planos" className="px-6 py-20 max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-12">
            Planos (Simulação)
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Start",
                price: "R$ 99/mês",
                features: [
                  "Até 200 chamados por mês",
                  "1 setor configurado",
                  "Relatórios básicos",
                ],
              },
              {
                name: "Pro",
                price: "R$ 249/mês",
                features: [
                  "Chamados ilimitados",
                  "Até 5 setores",
                  "Relatórios avançados",
                  "Suporte prioritário",
                ],
              },
              {
                name: "Enterprise",
                price: "Sob consulta",
                features: [
                  "Infraestrutura dedicada",
                  "Setores ilimitados",
                  "Integrações personalizadas",
                  "SLA customizado",
                ],
              },
            ].map((plan, index) => (
              <div
                key={index}
                className="p-8 rounded-lg border transition"
                style={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <h3 className="text-xl font-semibold mb-4">
                  {plan.name}
                </h3>

                <p
                  className="text-3xl font-bold mb-6"
                  style={{ color: "var(--primary)" }}
                >
                  {plan.price}
                </p>

                <ul className="text-sm space-y-3 mb-6 opacity-80">
                  {plan.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>

                <button
                  className="w-full py-3 rounded-lg transition"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "#fff",
                  }}
                >
                  Escolher Plano
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <section
          className="px-6 py-20 text-center"
          style={{ backgroundColor: "var(--primary)", color: "#fff" }}
        >
          <h2 className="text-3xl font-semibold mb-6">
            Pronto para organizar seu atendimento?
          </h2>

          <Link
            href="/login"
            className="px-8 py-3 rounded-lg"
            style={{
              backgroundColor: "#fff",
              color: "var(--primary)",
            }}
          >
            Começar Agora
          </Link>
        </section>

        <footer className="px-6 py-8 text-center text-sm opacity-60">
          © {new Date().getFullYear()} NolevelBOT
        </footer>
      </main>
    </div>
  );
}