// app/api/dev/create-empresa/route.ts
import { prismaMaster } from "@/lib/prisma/masterClient"

export async function GET() {
  const empresa = await prismaMaster.empresa.create({
    data: {
      nome: "Empresa Teste",
      slug: "empresa1",
      cnpj: "00000000000000",
      databaseUrl: "postgresql://postgres.tcgvuhoyojgdnzobmxxl:asdfasdfasdfasdqwerwer2@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true"
    }
  })

  return Response.json(empresa)
}