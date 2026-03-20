/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { LuMail, LuLock } from "react-icons/lu";

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
      style={{ backgroundImage: "url('/landing/footer.png')" }}
    >
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch rounded-3xl overflow-hidden shadow-2xl border"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--surface)"
        }}
      >
        {/* Lado esquerdo - imagem */}
        <div className="hidden md:block relative">
         
          <img
            src="/login/login.png"
            alt="Sistema Nolevel"
            className="w-full h-full object-cover"
          />

          {/* overlay leve para dar contraste */}
          <div className="absolute inset-0 bg-black/30" />

          <div className="absolute bottom-8 left-8 right-8 text-white z-10">
            <h2 className="text-3xl font-bold mb-2">
              Gestão inteligente de chamados
            </h2>
            
            <p className="font-bold text-white/80 ">
           Elimine gargalos, automatize processos e aumente a eficiência.
            </p>
          </div>
        </div>

        {/* Lado direito - login */}
        <div className="w-full p-8 sm:p-10 space-y-6">
          {/* Logo */}
          <div className="space-y-2 mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: "var(--primary)" }}>
              Nolevel
            </h1>
            <p className="text-sm opacity-70">Acesse sua conta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <LuMail
                  className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50"
                  size={20}
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
                  } as never}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Senha
              </label>
              <div className="relative">
                <LuLock
                  className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50"
                  size={20}
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
                  } as never}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm opacity-60 hover:opacity-100"
                  disabled={loading}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="p-4 rounded-xl text-sm border flex items-start gap-3"
                style={{
                  backgroundColor: "var(--error-light)",
                  borderColor: "var(--status-cancelled)",
                  color: "var(--status-cancelled)",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{
                backgroundColor: "var(--primary)",
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
