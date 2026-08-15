import { NextRequest, NextResponse } from "next/server"
import { applyRateLimit } from "@/lib/rate-limit"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import crypto from "crypto"
import { limparCPF } from "@/util/limparcpfs"
import { validarModulos, gerarEmailAdmin } from "@/lib/planos"
import { getPlanoPorSlug } from "@/lib/planos-server"
import { criarAssinatura, isAsaasConfigured } from "@/lib/asaas"

// Gera uma chave de API segura de 32 bytes (64 caracteres hex)
function gerarApiKey(): string {
  return crypto.randomBytes(32).toString("hex")
}

// Cria a empresa + admin automaticamente (auto-onboarding SaaS)
// Rota PUBLICA — não exige sessão. Cliente assina o plano e já ganha acesso.
export async function POST(req: NextRequest) {
  const rateLimit = await applyRateLimit(req, "signup", 10, 60 * 1000)
  if (rateLimit) return rateLimit

  try {
    const body = await req.json()
    const { plano, empresa, admin, modulos } = body

    // Validações básicas
    if (!plano) {
      return NextResponse.json({ error: "Plano é obrigatório" }, { status: 400 })
    }
    const planoRegistro = await getPlanoPorSlug(String(plano))
    if (!planoRegistro || !planoRegistro.ativo) {
      return NextResponse.json({ error: "Plano inválido ou indisponível" }, { status: 400 })
    }
    const planoId = planoRegistro.slug

    if (!empresa?.nome || !empresa?.cnpj || !Array.isArray(empresa?.setores) || empresa.setores.length === 0) {
      return NextResponse.json({ error: "Dados da empresa incompletos (nome, CNPJ e setores)" }, { status: 400 })
    }
    if (!admin?.nome || !admin?.cpf || !admin?.password) {
      return NextResponse.json({ error: "Dados do administrador incompletos (nome, CPF e senha)" }, { status: 400 })
    }

    const cnpj = String(empresa.cnpj).replace(/\D/g, "")
    if (cnpj.length !== 14) {
      return NextResponse.json({ error: "CNPJ inválido" }, { status: 400 })
    }

    const cpf = limparCPF(String(admin.cpf))
    if (cpf.length !== 11) {
      return NextResponse.json({ error: "CPF inválido" }, { status: 400 })
    }

    const nomeEmpresa = String(empresa.nome).trim()
    const nomeAdmin = String(admin.nome).trim()
    const setores = empresa.setores.map((s: string) => String(s).trim()).filter(Boolean)

    const { ok: modulosOk, modulos: modulosFinais, error: modulosError } = validarModulos(planoRegistro, modulos || [])
    if (!modulosOk) {
      return NextResponse.json({ error: modulosError || "Módulos inválidos" }, { status: 400 })
    }

    // Email gerado automaticamente: cpf@slug-empresa.com.br
    const emailAdmin = gerarEmailAdmin(cpf, nomeEmpresa)

    // Checagens de duplicidade
    const [empresaCnpjExiste, adminCpfExiste, adminEmailExiste] = await Promise.all([
      prisma.empresa.findUnique({ where: { cnpj } }),
      prisma.user.findFirst({ where: { cpf } }),
      prisma.user.findUnique({ where: { email: emailAdmin } }),
    ])

    if (empresaCnpjExiste) {
      return NextResponse.json({ error: "Já existe uma empresa com este CNPJ" }, { status: 409 })
    }
    if (adminCpfExiste) {
      return NextResponse.json({ error: "Já existe uma conta com este CPF" }, { status: 409 })
    }
    if (adminEmailExiste) {
      return NextResponse.json({ error: "Já existe uma conta com este email" }, { status: 409 })
    }

    // Transação atômica: empresa + admin + registro CPF do admin
    const resultado = await prisma.$transaction(async (tx) => {
      const novaEmpresa = await tx.empresa.create({
        data: {
          nome: nomeEmpresa,
          cnpj,
          setores,
          modulos: modulosFinais as any,
          plano: planoId,
          evolution_token: gerarApiKey(),
          // SaaS: nova conta nasce em trial, com pagamento pendente
          statusPagamento: "PENDENTE",
          trialAtivo: true,
        },
      })

      const hashedPassword = await hash(String(admin.password), 10)

      const novoAdmin = await tx.user.create({
        data: {
          name: nomeAdmin,
          email: emailAdmin,
          cpf,
          password: hashedPassword,
          role: "ADMIN",
          setor: "all",
          avatarUrl: "../../../../public/users/default-avatar.png",
          empresaId: novaEmpresa.id,
        },
      })

      await tx.cpfs.upsert({
        where: { cpf },
        update: { nome: nomeAdmin, empresaId: novaEmpresa.id },
        create: { cpf, nome: nomeAdmin, empresaId: novaEmpresa.id },
      })

      return { novaEmpresa, novoAdmin }
    })

    // Assinatura no Asaas (fallback mock em dev quando sem ASAAS_API_KEY)
    let assinatura = null
    try {
      assinatura = await criarAssinatura({
        trial: 7,
        cycle: "MONTHLY",
        externalReference: resultado.novaEmpresa.id,
        nome: nomeEmpresa,
        cpfCnpj: cnpj,
        email: emailAdmin,
      })
      if (assinatura.subscriptionId) {
        await prisma.empresa.update({
          where: { id: resultado.novaEmpresa.id },
          data: {
            asaasCustomerId: assinatura.customerId,
            asaasSubscriptionId: assinatura.subscriptionId,
            asaasPaymentId: assinatura.paymentId,
          },
        })
      }
    } catch (e) {
      // Falha no Asaas não derruba o signup (fluxo atual continua em dev)
      console.error("Falha ao criar assinatura Asaas:", e)
    }

    return NextResponse.json(
      {
        message: "Conta criada com sucesso!",
        empresa: { id: resultado.novaEmpresa.id, nome: resultado.novaEmpresa.nome },
        admin: { id: resultado.novoAdmin.id, email: resultado.novoAdmin.email },
        plano: planoRegistro.nome,
        asaas: assinatura
          ? { subscriptionId: assinatura.subscriptionId, mock: assinatura.mock }
          : null,
      },
      { status: 201 }
    )
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Já existe um registro com estes dados" }, { status: 409 })
    }
    console.error("Erro no signup:", error)
    return NextResponse.json({ error: "Erro ao criar conta. Tente novamente." }, { status: 500 })
  }
}
