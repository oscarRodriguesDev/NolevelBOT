"use client"

import { useEffect } from "react"

// Pagina global de erro inesperado
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Erro global:", error)
  }, [error])

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠</div>
        <h1 className="text-2xl font-bold mb-2">Algo deu errado</h1>
        <p className="mb-6" style={{ opacity: 0.7 }}>
          Ocorreu um erro inesperado. Tente recarregar a página.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 hover:scale-105"
          style={{ backgroundColor: "var(--primary)" }}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
