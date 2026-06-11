/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { LuMail, LuLock } from "react-icons/lu";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { BtnVoltar } from "@/app/components/back";

export default function LoginPage() {
  const router = useRouter();
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | undefined>(undefined);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReady, setTurnstileReady] = useState(false);

  const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"

  useEffect(() => {
    if (failedAttempts >= 3 && turnstileRef.current && !turnstileWidgetId.current) {
      const script = document.createElement("script")
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"
      script.async = true
      script.defer = true
      script.onload = () => {
        if (window.turnstile && turnstileRef.current) {
          const id = window.turnstile.render(turnstileRef.current, {
            sitekey: SITE_KEY,
            callback: (token: string) => {
              setTurnstileToken(token)
              setTurnstileReady(true)
            },
            "expired-callback": () => {
              setTurnstileToken("")
              setTurnstileReady(false)
            },
          })
          turnstileWidgetId.current = id
        }
      }
      document.head.appendChild(script)
    }
  }, [failedAttempts, SITE_KEY])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Preencha email e senha");
      setLoading(false);
      return;
    }

    if (failedAttempts >= 3 && !turnstileToken) {
      setError("Complete a verificação de segurança");
      setLoading(false);
      return;
    }

    try {
      const credentials: Record<string, string> = { email, password }
      if (failedAttempts >= 3 && turnstileToken) {
        credentials.turnstileToken = turnstileToken
      }

      const result = await signIn("credentials", {
        ...credentials,
        redirect: false,
      });

      if (result?.error) {
        const newCount = failedAttempts + 1
        setFailedAttempts(newCount)
        setError("Email ou senha incorretos");
        setPassword("");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-colors duration-300"
      style={{ backgroundImage: "url('/landing/footer.png')" }}
    >
      <BtnVoltar />

      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <div
        className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch rounded-3xl overflow-hidden shadow-2xl border animate-in fade-in duration-500"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--surface)",
        }}
      >
        <div className="hidden md:flex relative flex-col justify-end overflow-hidden">
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)",
            }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 25% 25%, white 0%, transparent 50%), radial-gradient(circle at 75% 75%, white 0%, transparent 50%)",
              }}
            />

            <div className="relative z-10 p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <span className="text-4xl font-black text-white">N</span>
              </div>

              <h2 className="text-3xl font-bold text-white mb-3">
                Gestão inteligente
              </h2>

              <p className="text-lg text-white/80 font-medium max-w-xs mx-auto">
                Elimine gargalos, automatize processos e aumente a eficiência do
                seu suporte.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full p-8 sm:p-12 space-y-8">
          <div className="space-y-2">
            <h1
              className="text-4xl sm:text-5xl font-black tracking-tight"
              style={{ color: "var(--primary)" }}
            >
              Nolevel
            </h1>

            <p className="text-sm opacity-50 font-medium">
              Acesse sua conta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-wider opacity-70"
              >
                Email
              </label>

              <div className="relative">
                <LuMail
                  className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40"
                  size={18}
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-11 pr-4 py-3.5 border rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  style={{
                    backgroundColor: "var(--surface-elevated)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--foreground)",
                  }}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-bold uppercase tracking-wider opacity-70"
              >
                Senha
              </label>

              <div className="relative">
                <LuLock
                  className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40"
                  size={18}
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-14 py-3.5 border rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  style={{
                    backgroundColor: "var(--surface-elevated)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--foreground)",
                  }}
                  disabled={loading}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wider opacity-50 hover:opacity-100 transition-opacity"
                  disabled={loading}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            {failedAttempts >= 3 && (
              <div className="flex justify-center">
                <div ref={turnstileRef} />
              </div>
            )}

            {error && (
              <div
                className="p-4 rounded-xl text-sm border flex items-start gap-3 animate-in slide-in-from-top-2 duration-200"
                style={{
                  backgroundColor: "var(--error-light)",
                  borderColor: "var(--status-cancelled)",
                  color: "var(--status-cancelled)",
                }}
              >
                <span className="font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password || (failedAttempts >= 3 && !turnstileReady)}
              className="w-full py-3.5 rounded-xl font-bold text-white transition-all duration-200 hover:brightness-110 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
              style={{ backgroundColor: "var(--primary)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <div className="pt-2">
            <Link
              href="/contact"
              className="text-sm font-medium opacity-50 hover:opacity-100 hover:text-[var(--primary)] transition-all"
            >
              Não possui uma conta?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
