// app/api/cpfs/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"

function limparCPF(cpf: string) {
  return cpf.replace(/\D/g, "")
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || ""

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData()
      const file = formData.get("file")

      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 })
      }

      const nomeArquivo = file.name.toLowerCase()

      let registros: { nome: string; cpf: string }[] = []

      // ================= TXT / CSV =================
      if (nomeArquivo.endsWith(".txt") || nomeArquivo.endsWith(".csv")) {
        const text = await file.text()

        const linhas = text
          .replace(/\r/g, "")
          .split("\n")
          .map(l => l.trim())
          .filter(Boolean)

        registros = linhas
          .map(linha => {
            const partes = linha.split(",")

            if (partes.length < 2) return null

            const nome = partes[0].trim()
            const cpf = limparCPF(partes[1].trim())

            if (!nome || !cpf) return null

            return { nome, cpf }
          })
          .filter((r): r is { nome: string; cpf: string } => Boolean(r))
      }

      // ================= EXCEL =================
      else if (nomeArquivo.endsWith(".xlsx")) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const workbook = XLSX.read(buffer, { type: "buffer" })

        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]

        const json: (string | number)[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })

        registros = json
          .slice(1) // ignora possível cabeçalho
          .map((row: (string | number | boolean | null)[]) => {
            if (!row[0] || !row[1]) return null

            const nome = String(row[0]).trim()
            const cpf = limparCPF(String(row[1]).trim())

            if (!nome || !cpf) return null

            return { nome, cpf }
          })
          .filter((r): r is { nome: string; cpf: string } => Boolean(r))
      }

      else {
        return NextResponse.json({ error: "Formato não suportado" }, { status: 400 })
      }

      if (registros.length === 0) {
        return NextResponse.json({ error: "Nenhum registro válido encontrado" }, { status: 400 })
      }

      const result = await prisma.cpfs.createMany({
        data: registros,
        skipDuplicates: true
      })

      return NextResponse.json({
        message: "Importação concluída",
        inseridos: result.count
      })
    }

    // ================= CADASTRO MANUAL =================
    const body = await req.json()
    const nome = body?.nome?.trim()
    const cpf = limparCPF(body?.cpf || "")

    if (!nome || !cpf) {
      return NextResponse.json({ error: "Nome e CPF obrigatórios" }, { status: 400 })
    }

    const novo = await prisma.cpfs.create({
      data: { nome, cpf }
    })

    return NextResponse.json(novo)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 })
  }
}

// Certifique-se de que o caminho do prisma está correto

export async function GET(req: NextRequest) {
  try {
    // Captura o parâmetro 'cpf' da URL (ex: ?cpf=12345678901)
    const { searchParams } = new URL(req.url);
    const cpfParaFiltrar = searchParams.get("cpf");

    // Se um CPF foi passado, fazemos a busca específica (validação)
    if (cpfParaFiltrar) {
      const registro = await prisma.cpfs.findUnique({
        where: {
          cpf: cpfParaFiltrar,
        },
        select: {
          nome: true,
          cpf: true
        }
      });

      if (!registro) {
        return NextResponse.json({ 
          valido: false, 
          message: "CPF não encontrado no banco" 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        valido: true, 
        ...registro 
      });
    }

    // Se NÃO informou CPF, traz todos os registros
    const todosCPFs = await prisma.cpfs.findMany({
      select: {
        nome: true,
        cpf: true
      }
    });

    return NextResponse.json(todosCPFs);

  } catch (error) {
    console.error("Erro na rota GET CPFs:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar requisição" }, 
      { status: 500 }
    );
  }
}