import { headers } from "next/headers"
import { empresaRepository } from "@/repositories/empresa.repository"

export async function resolveTenant() {
  const headersList = await headers()

  let host = headersList.get("host") || ""

  console.log("RAW HOST HEADER:", host)

  // =========================
  // SIMULAÇÃO (DEBUG)
  // =========================
  host = "https://dev-teste.nolevel.hiskra.com.br/login"
  console.log("SIMULATED HOST:", host)

  // remove protocolo
  host = host.replace("http://", "").replace("https://", "")
  console.log("WITHOUT PROTOCOL:", host)

  // remove path (/login)
  host = host.split("/")[0]
  console.log("WITHOUT PATH:", host)

  // remove porta
  host = host.split(":")[0]
  console.log("WITHOUT PORT:", host)

  let slug: string | null = null

  if (host.includes("localhost")) {
    slug = "dev-teste"
    console.log("LOCALHOST DETECTED, SLUG FIXED:", slug)
  } else {
    const parts = host.split(".")
    console.log("HOST PARTS:", parts)

    if (parts.length >= 3) {
      slug = parts[0]
      console.log("EXTRACTED SLUG:", slug)
    }
  }

  if (!slug) {
    console.error("SLUG NOT IDENTIFIED")
    throw new Error("Tenant não identificado")
  }

  const empresas = await empresaRepository.findAll()
  console.log("EMPRESAS NO BANCO:", empresas.map(e => e.nome))

  const empresa = empresas.find((e) => e.nome === slug)
  console.log("EMPRESA ENCONTRADA:", empresa)

  if (!empresa) {
    console.error("EMPRESA NÃO ENCONTRADA PARA SLUG:", slug)
    throw new Error(`Empresa não encontrada para o tenant: ${slug}`)
  }

  console.log("DATABASE URL:", empresa.databaseUrl)

  return {
    slug,
    empresa,
    databaseUrl: empresa.databaseUrl,
  }
}