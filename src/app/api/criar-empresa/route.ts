// app/api/dev/create-empresa/route.ts
import { prismaMaster } from "@/lib/prisma/masterClient"

export async function GET() {
  const empresa = await prismaMaster.empresa.create({
    data: {
      nome: "Empresa Teste",
      slug: "empresa1",
      cnpj: "00000000000000",
      databaseUrl: "SUA_URL_DO_BANCO"
    }
  })

  return Response.json(empresa)
}