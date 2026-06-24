import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/nextauth'
import {
  podeCriarRole, podeDeletarRole, getSetorFilter,
  roleParaDisplay, rolesQuePodeCriar, rolesQuePodeVer,
  CAN_VIEW_EMPRESAS, CAN_BATCH_CPF, CAN_CREATE_EMPRESA,
} from '@/lib/rbac'
import type { ROLE } from '@prisma/client'

const ALL_ROLES: ROLE[] = ['GOD', 'ADMIN', 'GESTOR', 'ATENDENTE']

// Executa testes de seguranca e permissoes para um usuario especifico
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'GOD') {
    return NextResponse.json({ error: 'Acesso restrito a GOD' }, { status: 403 })
  }
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { Empresa: true },
    })

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 })
    }

    const senhaValida = await compare(password, user.password)
    if (!senhaValida) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
    }

    const userRole = user.role as ROLE

    const totalUsers = await prisma.user.count()
    const empresaUsers = await prisma.user.count({ where: { empresaId: user.empresaId } })
    const totalEmpresas = await prisma.empresa.count()
    const totalChamadosEmpresa = await prisma.chamado.count({ where: { empresaId: user.empresaId } })
    const totalChamadosGeral = await prisma.chamado.count()

    const permissoesCriacao = ALL_ROLES.map(alvo => ({
      papel: alvo,
      label: roleParaDisplay(alvo),
      permitido: podeCriarRole(userRole, alvo),
    }))

    const permissoesExclusao = ALL_ROLES.map(alvo => ({
      papel: alvo,
      label: roleParaDisplay(alvo),
      permitido: podeDeletarRole(userRole, alvo),
      motivo: alvo === 'GOD' ? 'GOD nunca pode ser deletado' : undefined,
    }))

    const permissoesVisao = rolesQuePodeVer(userRole).map(r => roleParaDisplay(r))

    const escopo = getSetorFilter(userRole, user.setor || '', user.empresaId)

    const tests = [
      {
        nome: 'Pode ver lista de empresas',
        resultado: CAN_VIEW_EMPRESAS.includes(userRole),
        esperado: userRole === 'GOD',
        critico: true,
        explicacao: userRole === 'GOD'
          ? 'GOD pode ver todas as empresas do sistema'
          : 'Apenas GOD deve ver a lista de empresas. Se true, vulnerabilidade de vazamento de dados.',
      },
      {
        nome: 'Pode criar empresa',
        resultado: CAN_CREATE_EMPRESA.includes(userRole),
        esperado: userRole === 'GOD',
        critico: true,
        explicacao: userRole === 'GOD'
          ? 'GOD pode criar novas empresas'
          : 'Apenas GOD deve criar empresas. Se true, vulnerabilidade grave.',
      },
      {
        nome: 'Pode importar CPF em lote',
        resultado: CAN_BATCH_CPF.includes(userRole),
        esperado: userRole !== 'ATENDENTE',
        critico: false,
        explicacao: userRole === 'ATENDENTE'
          ? 'ATENDENTE não deve importar CPFs em lote. Se true, privilégio excessivo.'
          : 'GOD, ADMIN e GESTOR podem importar CPFs em lote.',
      },
      {
        nome: 'Pode criar ADMIN',
        resultado: podeCriarRole(userRole, 'ADMIN'),
        esperado: userRole === 'GOD',
        critico: true,
        explicacao: 'Apenas GOD cria ADMIN. Se outro papel pode, escalada de privilégio.',
      },
      {
        nome: 'Pode criar GESTOR',
        resultado: podeCriarRole(userRole, 'GESTOR'),
        esperado: userRole === 'ADMIN',
        critico: false,
        explicacao: 'GOD e ADMIN podem criar GESTOR.',
      },
      {
        nome: 'Pode criar ATENDENTE',
        resultado: podeCriarRole(userRole, 'ATENDENTE'),
        esperado: userRole === 'GESTOR',
        critico: false,
        explicacao: 'GESTOR criam ATENDENTE. ATENDENTE não cria ninguém.',
      },
      {
        nome: 'Pode deletar GOD',
        resultado: podeDeletarRole(userRole, 'GOD'),
        esperado: false,
        critico: true,
        explicacao: 'NINGUÉM pode deletar GOD. Se true, vulnerabilidade crítica de segurança.',
      },
      {
        nome: 'Pode deletar ADMIN',
        resultado: podeDeletarRole(userRole, 'ADMIN'),
        esperado: userRole === 'GOD',
        critico: true,
        explicacao: 'Apenas GOD deleta ADMIN. ADMIN não deleta ADMIN (evita empresa sem admin).',
      },
      {
        nome: 'Pode deletar GESTOR',
        resultado: podeDeletarRole(userRole, 'GESTOR'),
        esperado: userRole === 'GOD' || userRole === 'ADMIN',
        critico: false,
        explicacao: 'GOD e ADMIN podem deletar GESTOR.',
      },
      {
        nome: 'Pode deletar ATENDENTE',
        resultado: podeDeletarRole(userRole, 'ATENDENTE'),
        esperado: userRole !== 'ATENDENTE',
        critico: false,
        explicacao: 'GOD, ADMIN e GESTOR deletam ATENDENTE. ATENDENTE não deleta ninguém.',
      },
      {
        nome: 'Filtro de setor ativo',
        resultado: escopo.setor !== undefined,
        esperado: userRole === 'ATENDENTE' || userRole === 'GESTOR',
        critico: false,
        explicacao: escopo.setor
          ? `Usuário só vê tickets do setor "${user.setor}"`
          : 'Usuário vê tickets de todos os setores da empresa.',
      },
      {
        nome: 'Isolamento multi-tenancy (dados da empresa)',
        resultado: empresaUsers < totalUsers,
        esperado: true,
        critico: true,
        explicacao: totalUsers > empresaUsers
          ? `Usuário vê ${empresaUsers} de ${totalUsers} usuários (isolamento OK)`
          : `Usuário vê todos os ${totalUsers} usuários (sem isolamento)`,
      },
    ]

    const criticas = tests.filter(t => t.critico && t.resultado !== t.esperado)
    const warnings = tests.filter(t => !t.critico && t.resultado !== t.esperado)

    return NextResponse.json({
      autenticado: true,
      usuario: {
        id: user.id,
        nome: user.name,
        email: user.email,
        role: userRole,
        roleLabel: roleParaDisplay(userRole),
        setor: user.setor,
        empresa: user.Empresa ? { id: user.Empresa.id, nome: user.Empresa.nome } : null,
      },
      estatisticas: {
        totalUsuariosSistema: totalUsers,
        usuariosMesmaEmpresa: empresaUsers,
        totalEmpresas,
        chamadosEmpresa: totalChamadosEmpresa,
        chamadosGeral: totalChamadosGeral,
      },
      permissoes: {
        criacao: permissoesCriacao,
        exclusao: permissoesExclusao,
        podeVerPapeis: permissoesVisao,
        podeCriarPapeis: rolesQuePodeCriar(userRole).map(r => roleParaDisplay(r)),
      },
      testes: tests,
      vulnerabilidades: criticas.map(t => ({
        nivel: 'CRITICO',
        teste: t.nome,
        explicacao: t.explicacao,
        resultado: t.resultado,
        esperado: t.esperado,
      })),
      warnings: warnings.map(t => ({
        nivel: 'AVISO',
        teste: t.nome,
        explicacao: t.explicacao,
        resultado: t.resultado,
        esperado: t.esperado,
      })),
      seguro: criticas.length === 0,
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message || 'Erro interno ao testar acesso',
    }, { status: 500 })
  }
}
