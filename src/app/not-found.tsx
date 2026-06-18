import Link from "next/link"
import { ThemeToggle } from "@/app/components/theme-toggle"

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <div className="text-center max-w-md space-y-6">
        <div
          className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl font-black shadow-lg"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <span className="text-white">!</span>
        </div>

        <h1 className="text-6xl font-black tracking-tight" style={{ color: "var(--primary)" }}>
          404
        </h1>

        <p className="text-lg font-medium opacity-70 leading-relaxed">
          Página não encontrada
        </p>

        <p className="text-sm opacity-40 leading-relaxed">
          A rota que você tentou acessar não existe ou foi removida.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:brightness-110 hover:shadow-lg active:scale-95"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Ir para o Login
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl font-bold border-2 transition-all hover:brightness-110 hover:shadow-lg active:scale-95"
            style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
          >
            Selecionar Módulo
          </Link>
        </div>
      </div>
    </div>
  )
}
