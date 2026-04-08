import { headers } from "next/headers"
import { empresaRepository } from "@/repositories/empresa.repository"

// Esse cara será o ponto único de resolução de tenant
// Nenhuma outra parte do sistema deve tentar descobrir tenant manualmente

export async function resolveTenant() {
  const headersList = await headers()

  const host = headersList.get("host") || ""

  // Exemplo:
  // empresa1.meusistema.com -> empresa1
  // localhost:3000 -> fallback

  let slug: string | null = null

  if (host.includes("localhost")) {
    // Ambiente dev → define um tenant fixo
    slug = "NoLevel"
  } else {
    const parts = host.split(".")

    if (parts.length > 2) {
      slug = parts[0]
    }
  }

  if (!slug) {
    throw new Error("Tenant não identificado")
  }

  // Busca empresa no banco master
  const empresa = await empresaRepository.findAll().then((empresas) =>
    empresas.find((e) => e.nome === slug)
  )

  if (!empresa) {
    throw new Error("Empresa não encontrada para o tenant")
  }

  return {
    slug,
    empresa,
    databaseUrl: empresa.databaseUrl, // será usado depois
  }
}