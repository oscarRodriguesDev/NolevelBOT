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
        router.push("/");
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
      className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <ThemeToggle />

      <div
        className="w-full max-w-md rounded-2xl shadow-2xl border p-8 space-y-8 transition-colors duration-300"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Logo e Título */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold" style={{ color: "var(--primary)" }}>
            Nolevel
          </h1>
          <p className="text-sm opacity-70">Sistema de Gestão de Chamados</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <LuMail
                className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-50"
                size={20}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-12 pr-4 py-3 border rounded-lg outline-none transition-colors duration-300"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--foreground)",
                }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium mb-2">Senha</label>
            <div className="relative">
              <LuLock
                className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-50"
                size={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3 border rounded-lg outline-none transition-colors duration-300"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--foreground)",
                }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                disabled={loading}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div
              className="p-4 rounded-lg text-sm border"
              style={{
                backgroundColor: "var(--error-light)",
                borderColor: "var(--status-cancelled)",
                color: "var(--status-cancelled)",
              }}
            >
              {error}
            </div>
          )}

          {/* Botão de Login */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          >
            {loading ? (
              <>
                <LuLoader className="animate-spin" size={20} />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        {/* Informações de Teste */}
        <div
          className="p-4 rounded-lg border text-sm space-y-2"
          style={{
            backgroundColor: "var(--surface-elevated)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <p className="font-semibold" style={{ color: "var(--accent-secondary)" }}>
            Credenciais de Teste:
          </p>
          <div className="space-y-1 text-xs opacity-70 font-mono">
            <p>Email: oscar@nolevel.com.br</p>
            <p>Senha: 12345678</p>
          </div>
        </div>

        {/* Rodapé */}
        <div className="text-center text-xs opacity-60">
          <p>Sistema de Gestão de Chamados Nolevel</p>
        </div>
      </div>
    </div>
  );
}
