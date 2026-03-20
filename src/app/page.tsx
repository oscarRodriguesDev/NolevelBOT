"use client";

import Link from "next/link";
import { ThemeToggle } from "./components/theme-toggle";
import Image from "next/image";
import dash from "../../public/landing/dash.png";
import {
  FiInbox,
  FiCpu,
  FiClock,
  FiArchive,
  FiBarChart2,
  FiLink,
} from "react-icons/fi";

export default function LandingPage() {
  const items = [
    {
      icon: FiInbox,
      label: "Centralização de chamados",
    },
    {
      icon: FiCpu,
      label: "Automação inteligente",
    },
    {
      icon: FiClock,
      label: "Controle de SLA",
    },
    {
      icon: FiArchive,
      label: "Histórico completo",
    },
    {
      icon: FiBarChart2,
      label: "Relatórios em tempo real",
    },
    {
      icon: FiLink,
      label: "Integração via API",
    },
  ];
  return (

    
    <main
      className="min-h-screen overflow-hidden transition-colors duration-500 font-sans"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="absolute top-1 z-50">
        <ThemeToggle />
      </div>

      {/* --- HERO SECTION --- */}
      <section
        className="relative px-6 pt-24 pb-16 sm:pt-32 lg:pt-48 max-w-7xl mx-auto bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: "url('/landing/fundo.png')" }}
      >
        {/* overlay escuro para legibilidade */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Efeito de brilho */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] opacity-20 blur-[120px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
          <div className="space-y-8 text-center lg:text-left text-white">
            <span
              className="inline-flex items-center px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full border shadow-sm backdrop-blur-md"
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                borderColor: "rgba(255,255,255,0.2)",
                color: "white",
              }}
            >
              <span
                className="w-2 h-2 rounded-full mr-2 animate-pulse"
                style={{ backgroundColor: "var(--primary)" }}
              />
              Plataforma inteligente de atendimento
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
              Transforme seu atendimento em um sistema
              <span className="block mt-2" style={{ color: "var(--primary)" }}>
                rápido e automatizado
              </span>
            </h1>

            <p className="text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 text-white/80 leading-relaxed">
              Centralize chamados, automatize processos e tenha total controle
              da operação com uma interface moderna e intuitiva.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/login"
                className="px-8 py-4 rounded-2xl font-bold shadow-lg transition-all duration-300 hover:-translate-y-1 active:scale-95 text-center"
                style={{ backgroundColor: "var(--primary)", color: "white" }}
              >
                Acessar sistema
              </Link>

              <Link
                href="/login"
                className="px-8 py-4 rounded-2xl font-semibold border transition-all duration-300 hover:bg-white/10 text-center"
                style={{
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "white",
                  backgroundColor: "rgba(255,255,255,0.05)",
                }}
              >
                Saiba mais
              </Link>
            </div>
          </div>

          <div className="relative group perspective-1000">
            <div
              className="absolute -inset-4 blur-2xl opacity-10 rounded-full transition-opacity group-hover:opacity-20"
              style={{ backgroundColor: "var(--primary)" }}
            />
            <div
              className="relative rounded-[2.5rem] border p-3 sm:p-4 shadow-2xl transition-transform duration-700 group-hover:rotate-1 group-hover:scale-[1.02]"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <div
                className="aspect-video lg:aspect-square xl:aspect-video rounded-[1.8rem] overflow-hidden relative"
                style={{ backgroundColor: "var(--surface-elevated)" }}
              >
                <Image
                  src={dash}
                  alt="Dashboard Preview"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- BENEFÍCIOS --- */}
      <section
        className="py-24 px-6 mt-16"
        style={{ backgroundColor: "var(--surface)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Escalabilidade e Controle
            </h2>
            <div
              className="w-16 h-1 mx-auto rounded-full"
              style={{ backgroundColor: "var(--primary)" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, i) => (
              <div
                key={i}
                className="p-8 rounded-[2rem] border transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <div
                  className="w-12 h-12 mb-6 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-md"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.label}</h3>
                <p className="text-sm opacity-70 leading-relaxed">
                  Estrutura organizada para garantir eficiência e controle total
                  da operação em tempo real.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        {/* background imagem */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/landing/footer.png')" }}
        />

        {/* overlay para legibilidade */}
        <div className="absolute inset-0 bg-black/60" />

        <div
          className="max-w-5xl mx-auto rounded-[3rem] px-8 py-16 relative overflow-hidden shadow-2xl z-10"
          style={{ backgroundColor: "rgba(var(--primary-rgb), 0.85)", backdropFilter: "blur(10px)" }}
        >
          {/* Decoração interna */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-32 -mt-32" />

          <div className="relative z-10 space-y-8 text-white">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Pronto para elevar o nível?
            </h2>

            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Acesse o sistema de gestão de chamados Nolevel e comece a
              gerenciar suas operações agora.
            </p>

            <Link
              href="/login"
              className="inline-block px-10 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
              style={{
                backgroundColor: "var(--background)",
                color: "var(--primary)"
              }}
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </section>
    </main>
    
 
  );
}
