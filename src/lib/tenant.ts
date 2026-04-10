import { headers } from "next/headers"
import { empresaRepository } from "@/repositories/empresa.repository"

export async function resolveTenant() {
  const headersList = await headers()

  let host = headersList.get("host") || ""

  // remove porta se existir (ex: :3000)
  host = host.split(":")[0]

  let slug: string | null = null

  if (host.includes("localhost")) {
    slug = "dev-teste"
  } else {
    const parts = host.split(".")
    console.log('Host parts:', parts[0])

    if (parts.length >= 3) {
      // pega sempre o primeiro nível como tenant
      slug = parts[0] // aqui vai vir o http tambem, então precisa remover o http:// ou https://
      slug = slug.replace("http://", "").replace("https://", "")
    }
  }

  if (!slug) {
    throw new Error("Tenant não identificado")
  }

  const empresa = await empresaRepository.findAll().then((empresas) =>
    empresas.find((e) => e.nome === slug)
  )

  if (!empresa) {
    throw new Error(`Empresa não encontrada para o tenant: ${slug}`)
  }

  return {
    slug,
    empresa,
    databaseUrl: empresa.databaseUrl,
  }
}