import { NextRequest, NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"
import { getSessionOrFail } from '@/util/permission'
import { limparCPF } from "@/util/limparcpfs"
import { CAN_BATCH_CPF } from "@/lib/rbac"

export async function POST(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "cpfs", 30, 60 * 1000)
  if (rateLimit) return rateLimit
  const session = await getSessionOrFail(["GOD", "ADMIN", "GESTOR"])
  const empresaId = session?.user?.empresaId

  if (!session || !empresaId) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  try {
    const contentType = req.headers.get("content-type") || ""

    if (contentType.includes("multipart/form-data")) {
      const userRole = session.user.role as string
      if (!CAN_BATCH_CPF.includes(userRole as any)) {
        return NextResponse.json(
          { error: "Seu perfil não permite importação em lote" },
          { status: 403 }
        )
      }

      const formData = await req.formData()
      const file = formData.get("file")

      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 })
      }

      const nomeArquivo = file.name.toLowerCase()

      let registros: { nome: string; cpf: string }[] = []

      if (nomeArquivo.endsWith(".txt") || nomeArquivo.endsWith(".csv")) {
        const text = await file.text()
        const linhas = text.replace(/\r/g, "").split("\n").map(l => l.trim()).filter(Boolean)

        registros = linhas.map(linha => {
          const partes = linha.split(",")
          if (partes.length < 2) return null
          const nome = partes[0].trim()
          const cpf = limparCPF(partes[1].trim())
          if (!nome || !cpf) return null
          return { nome, cpf }
        }).filter((r): r is { nome: string; cpf: string } => Boolean(r))
      } else if (nomeArquivo.endsWith(".xlsx")) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const workbook = XLSX.read(buffer, { type: "buffer" })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const json: (string | number | boolean | null)[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })

        registros = json.slice(1).map((row) => {
          if (!row?.[0] || !row?.[1]) return null
          const nome = String(row[0]).trim()
          const cpf = limparCPF(String(row[1]).trim())
          if (!nome || !cpf) return null
          return { nome, cpf }
        }).filter((r): r is { nome: string; cpf: string } => Boolean(r))
      } else {
        return NextResponse.json({ error: "Formato não suportado" }, { status: 400 })
      }

      if (registros.length === 0) {
        return NextResponse.json({ error: "Nenhum registro válido encontrado" }, { status: 400 })
      }

      const result = await prisma.cpfs.createMany({
        data: registros.map((r) => ({
          nome: r.nome,
          cpf: r.cpf,
          empresaId,
        })),
        skipDuplicates: true,
      })

      return NextResponse.json({
        message: "Importação concluída",
        inseridos: result.count,
      })
    }

    const body = await req.json()
    const nome = body?.nome?.trim()
    const cpf = limparCPF(body?.cpf || "")

    if (!nome || !cpf) {
      return NextResponse.json({ error: "Nome e CPF obrigatórios" }, { status: 400 })
    }

    const existe = await prisma.cpfs.findFirst({ where: { cpf, empresaId } })
    if (existe) {
      return NextResponse.json({ error: "CPF já cadastrado nesta empresa" }, { status: 400 })
    }

    const telefone = body?.telefone?.replace(/\D/g, "") || undefined

    const novo = await prisma.cpfs.create({
      data: { nome, cpf, empresaId, telefone },
    })

    return NextResponse.json(novo)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "cpfs", 60, 60 * 1000)
  if (rateLimit) return rateLimit
  try {
    const session = await getSessionOrFail()
    const empresaId = session?.user?.empresaId

    if (!empresaId) {
      return NextResponse.json({ error: "Empresa não encontrada na sessão" }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const cpfParaFiltrar = searchParams.get("cpf")

    if (cpfParaFiltrar) {
      const registro = await prisma.cpfs.findFirst({
        where: { cpf: cpfParaFiltrar, empresaId },
        select: { nome: true, cpf: true, telefone: true },
      })

      if (!registro) {
        return NextResponse.json({ valido: false, message: "CPF não encontrado nesta empresa" }, { status: 404 })
      }

      return NextResponse.json({ valido: true, ...registro })
    }

    const todosCPFs = await prisma.cpfs.findMany({
      where: { empresaId },
      select: { nome: true, cpf: true, telefone: true },
    })

    return NextResponse.json(todosCPFs)
  } catch (error) {
    return NextResponse.json({ error: "Erro interno ao processar requisição" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "cpfs", 20, 60 * 1000)
  if (rateLimit) return rateLimit
  const session = await getSessionOrFail(["GOD", "ADMIN", "GESTOR"])
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const empresaId = session.user.empresaId
  if (!empresaId) {
    return NextResponse.json({ error: "Empresa não encontrada na sessão" }, { status: 400 })
  }

  try {
    const { cpf } = await req.json()

    if (!cpf) {
      return NextResponse.json({ error: "CPF é obrigatório" }, { status: 400 })
    }

    const cleanCpf = limparCPF(cpf)

    const registro = await prisma.cpfs.findFirst({
      where: { cpf: cleanCpf, empresaId },
    })

    if (!registro) {
      return NextResponse.json({ error: "CPF não encontrado nesta empresa" }, { status: 404 })
    }

    const userComEsteCpf = await prisma.user.findFirst({
      where: { cpf: cleanCpf },
    })
    if (userComEsteCpf) {
      return NextResponse.json(
        { error: "Este CPF pertence a um usuário do sistema e não pode ser removido manualmente" },
        { status: 400 }
      )
    }

    await prisma.cpfs.deleteMany({ where: { cpf: cleanCpf, empresaId } })

    return NextResponse.json({ message: "CPF deletado com sucesso" })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar CPF" }, { status: 500 })
  }
}
