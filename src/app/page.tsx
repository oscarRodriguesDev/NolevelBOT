"use client";

import { useTheme } from "./providers";

export default function Home() {
  const { theme } = useTheme();

  return (
    <div
      className="min-h-screen transition-colors duration-300 flex items-center justify-center px-4"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="text-center space-y-8 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold">
          <span style={{ color: "var(--primary)" }}>Nolevel</span>BOT
        </h1>
        <p className="text-xl md:text-2xl font-light">
          Sistema inteligente de gestão de chamados e atendimento
        </p>
        <div
          className="p-8 rounded-lg border transition-all duration-300"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <p className="text-lg">
            Bem-vindo ao sistema{" "}
            <span style={{ color: "var(--accent-secondary)" }}>Nolevel</span>
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div
            className="p-6 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: "var(--surface)",
              borderLeft: `4px solid var(--status-new)`,
            }}
          >
            <p className="font-semibold">Chamados Novos</p>
            <p className="text-sm opacity-75">Gerenciamento rápido</p>
          </div>
          <div
            className="p-6 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: "var(--surface)",
              borderLeft: `4px solid var(--status-in-progress)`,
            }}
          >
            <p className="font-semibold">Em Andamento</p>
            <p className="text-sm opacity-75">Acompanhamento em tempo real</p>
          </div>
          <div
            className="p-6 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: "var(--surface)",
              borderLeft: `4px solid var(--status-completed)`,
            }}
          >
            <p className="font-semibold">Completados</p>
            <p className="text-sm opacity-75">Histórico detalhado</p>
          </div>
        </div>
      </div>
    </div>
  );
}
