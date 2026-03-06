"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { LuMail, LuLock, LuLoader } from "react-icons/lu";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validEmail = "oscar@nolevel.com.br";
  const validPassword = "12345678";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simular delay de autenticação
    setTimeout(() => {
      if (email === validEmail && password === validPassword) {
        // Login bem-sucedido - redirecionar para página inicial
        router.push("/all-tickets");
      } else {
        // Login falhou
        setError("Email ou senha incorretos");
        setPassword("");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <ThemeToggle />

      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Seção de Branding (Visível apenas em MD+) */}
        <div className="hidden md:flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight" style={{ color: "var(--primary)" }}>
              Bem-vindo de volta
            </h2>
            <p className="text-lg opacity-75 leading-relaxed">
              Acesse o sistema de gestão de chamados Nolevel para gerenciar sua operação de atendimento de forma eficiente.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div
                className="p-3 rounded-lg mt-1 flex-shrink-0"
                style={{ backgroundColor: "var(--surface)" }}
              >
                <svg className="w-6 h-6" style={{ color: "var(--primary)" }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Gerenciamento Centralizado</h3>
                <p className="text-sm opacity-70">Todos os chamados em um único lugar</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div
                className="p-3 rounded-lg mt-1 flex-shrink-0"
                style={{ backgroundColor: "var(--surface)" }}
              >
                <svg className="w-6 h-6" style={{ color: "var(--primary)" }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Acompanhamento em Tempo Real</h3>
                <p className="text-sm opacity-70">Monitore o status de cada operação</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div
                className="p-3 rounded-lg mt-1 flex-shrink-0"
                style={{ backgroundColor: "var(--surface)" }}
              >
                <svg className="w-6 h-6" style={{ color: "var(--primary)" }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Relatórios Detalhados</h3>
                <p className="text-sm opacity-70">Decisões baseadas em dados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de Login */}
        <div
          className="w-full rounded-2xl lg:rounded-3xl shadow-2xl border p-8 sm:p-10 space-y-6 transition-colors duration-300"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          {/* Logo */}
          <div className="space-y-2 mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: "var(--primary)" }}>
              Nolevel
            </h1>
            <p className="text-sm opacity-70">Acesse sua conta</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <LuMail
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-50"
                  size={20}
                  aria-hidden="true"
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-3 border rounded-xl outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                  style={{
                    backgroundColor: "var(--surface-elevated)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--foreground)",
                    "--tw-ring-color": "var(--primary)"
                  } as any}
                  disabled={loading}
                  required
                  aria-label="Endereço de email"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Senha
              </label>
              <div className="relative">
                <LuLock
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-50"
                  size={20}
                  aria-hidden="true"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-14 py-3 border rounded-xl outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50"
                  style={{
                    backgroundColor: "var(--surface-elevated)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--foreground)",
                    "--tw-ring-color": "var(--primary)"
                  } as any}
                  disabled={loading}
                  required
                  aria-label="Senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-medium opacity-60 hover:opacity-100 transition-opacity"
                  disabled={loading}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div
                className="p-4 rounded-xl text-sm border flex items-start gap-3"
                style={{
                  backgroundColor: "var(--error-light)",
                  borderColor: "var(--status-cancelled)",
                  color: "var(--status-cancelled)",
                }}
                role="alert"
              >
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{
                backgroundColor: "var(--primary)",
              }}
              onMouseEnter={(e) => {
                if (e.currentTarget instanceof HTMLElement && !loading) {
                  e.currentTarget.style.backgroundColor = "var(--primary-hover)";
                }
              }}
              onMouseLeave={(e) => {
                if (e.currentTarget instanceof HTMLElement) {
                  e.currentTarget.style.backgroundColor = "var(--primary)";
                }
              }}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <LuLoader className="animate-spin" size={20} aria-hidden="true" />
                  <span>Entrando...</span>
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" style={{ opacity: 0.3 }}>
              <div className="w-full border-t" style={{ borderColor: "var(--border-subtle)" }}></div>
            </div>
            <div className="relative flex justify-center text-sm" style={{ color: "var(--foreground)" }}>
              <span style={{ backgroundColor: "var(--surface)", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}>
                Ou use as credenciais de teste
              </span>
            </div>
          </div>

          {/* Informações de Teste */}
          <div
            className="p-4 rounded-xl border text-sm space-y-3"
            style={{
              backgroundColor: "var(--surface-elevated)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <p className="font-semibold flex items-center gap-2">
              <span style={{ color: "var(--accent-secondary)" }}>ℹ️</span>
              Credenciais de Teste
            </p>
            <div className="space-y-2 text-xs opacity-75 font-mono bg-opacity-50 p-3 rounded-lg" style={{ backgroundColor: "var(--background)" }}>
              <div className="flex items-center justify-between">
                <span>Email:</span>
                <span className="font-semibold" style={{ color: "var(--primary)" }}>oscar@nolevel.com.br</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Senha:</span>
                <span className="font-semibold" style={{ color: "var(--primary)" }}>12345678</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
