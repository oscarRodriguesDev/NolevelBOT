import { headers } from "next/headers"
import { empresaRepository } from "@/repositories/empresa.repository"

export async function resolveTenant() {
  const headersList = await headers()

  let host = headersList.get("host") || ""

  // =========================
  // SIMULAÇÃO (APENAS DEV)
  // =========================
  // Em produção o host NÃO vem com protocolo nem path
  // Exemplo real: dev-teste.nolevel.hiskra.com.br
  if (process.env.NODE_ENV === "development") {
    host = "dev-teste.nolevel.hiskra.com.br"
  }

  // remove porta (ex: :3000)
  host = host.split(":")[0]

  let slug: string | null = null

  if (host.includes("localhost")) {
    slug = "dev-teste"
  } else {
    const parts = host.split(".")

    if (parts.length >= 3) {
      slug = parts[0]
    }
  }

  if (!slug) {
    throw new Error("Tenant não identificado")
  }

  const empresa = await empresaRepository.findAll().then((empresas) =>
    empresas.find((e) => e.nome === slug) // ideal: trocar para e.slug no futuro
  )

  if (!empresa) {
    throw new Error(`Empresa não encontrada para o tenant: ${slug}`)
  }
  console.log("bd url",empresa.databaseUrl)
  return {
    slug,
    empresa,
    databaseUrl: empresa.databaseUrl,
  }
}