import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma";
import { getSessionOrFail } from "@/util/permission"

// CREATE
export async function POST(req: NextRequest) {
  const session = await getSessionOrFail(["GOD"])

  if(!session) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    const body = await req.json()

    const empresa = await prisma.empresa.create({
      data: {
        nome: body.nome,
        cnpj: body.cnpj,
        setores: body.setores || [],
        databaseUrl: 'postgresql://user:password@host:port/dbname', // Placeholder, deve ser gerada dinamicamente
      },
    })

    return NextResponse.json(empresa)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao criar empresa" },
      { status: 500 }
    )
  }
}

// READ ALL / READ BY CNPJ
export async function GET(request: Request) {
 const session = await getSessionOrFail(["GOD"])


  if(!session) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }
console.log('rota de empresas precisa configurar para colocar o banco de dados via front end')
  try {
    const { searchParams } = new URL(request.url)
    const cnpj = searchParams.get("cnpj")

    if (!cnpj) {
      const empresas = await prisma.empresa.findMany({
        select: {
          id: true,
          nome: true,
          cnpj: true,
          setores: true,
          databaseUrl: true,
        },
      })

      return NextResponse.json(empresas)
    }

    const empresa = await prisma.empresa.findUnique({
      where: { cnpj },
      select: {
        id: true,
        nome: true,
        cnpj: true,
        setores: true,
        databaseUrl: true,
      },
    })

    if (!empresa) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(empresa)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao buscar empresa" },
      { status: 500 }
    )
  }
}