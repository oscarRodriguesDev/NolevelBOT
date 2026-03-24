import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Obter configurações da empresa
export async function GET() {
  try {
    let config = await prisma.companyConfig.findFirst()
    
    // Se não existe configuração, criar uma padrão
    if (!config) {
      config = await prisma.companyConfig.create({
        data: {
          databaseUrl: process.env.DATABASE_URL || '',
          aiProvider: 'gpt',
          aiModel: 'gpt-4-turbo',
          companyName: 'NolevelBOT',
        },
      })
    }

    // Não enviar dados sensíveis para o frontend
    const safeConfig = {
      ...config,
      aiApiKey: config.aiApiKey ? '***' : null,
      databaseUrl: config.databaseUrl ? '***' : null,
    }

    return NextResponse.json(safeConfig)
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    )
  }
}

// POST - Atualizar configurações da empresa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Buscar configuração existente
    let config = await prisma.companyConfig.findFirst()

    if (!config) {
      // Criar nova se não existir
      config = await prisma.companyConfig.create({
        data: {
          databaseUrl: body.databaseUrl || process.env.DATABASE_URL || '',
          aiProvider: body.aiProvider || 'gpt',
          aiModel: body.aiModel || 'gpt-4-turbo',
          aiApiKey: body.aiApiKey || null,
          companyName: body.companyName || 'NolevelBOT',
          companyLogo: body.companyLogo || null,
        },
      })
    } else {
      // Atualizar existente
      config = await prisma.companyConfig.update({
        where: { id: config.id },
        data: {
          databaseUrl: body.databaseUrl || config.databaseUrl,
          aiProvider: body.aiProvider || config.aiProvider,
          aiModel: body.aiModel || config.aiModel,
          aiApiKey: body.aiApiKey || config.aiApiKey,
          companyName: body.companyName || config.companyName,
          companyLogo: body.companyLogo || config.companyLogo,
        },
      })
    }

    // Não retornar dados sensíveis
    const safeConfig = {
      ...config,
      aiApiKey: config.aiApiKey ? '***' : null,
      databaseUrl: config.databaseUrl ? '***' : null,
    }

    return NextResponse.json(safeConfig)
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    )
  }
}
