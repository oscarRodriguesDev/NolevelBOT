import { headers } from "next/headers"
import { empresaRepository } from "@/repositories/empresa.repository"

export async function resolveTenant() {
  const headersList = await headers()

  let host = headersList.get("host") || ""

  console.log("RAW HOST HEADER:", host)


  // remove protocolo
  host = host.replace("http://", "").replace("https://", "")


  // remove path (/login)
  host = host.split("/")[0]


  // remove porta
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

  const empresas = await empresaRepository.findAll()


  const empresa = empresas.find((e) => e.nome === slug)


  if (!empresa) {
   
    throw new Error(`Empresa não encontrada para o tenant: ${slug}`)
  }



  return {
    slug,
    empresa,
    databaseUrl: empresa.databaseUrl,
  }
}
