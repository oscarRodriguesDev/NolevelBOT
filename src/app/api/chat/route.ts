import { NextRequest, NextResponse } from 'next/server'

function getAutoReply(message: string) {
  const text = message.toLowerCase()

  if (text.includes('oi') || text.includes('olá') || text.includes('ola')) {
    return 'Olá, eu sou a Hevelyn. Como posso ajudar você hoje?'
  }

  if (text.includes('abrir chamado') || text.includes('novo chamado')) {
    return 'Para abrir um chamado, informe o setor e descreva o problema.'
  }

  if (text.includes('status') || text.includes('meu chamado')) {
    return 'Informe o número do chamado para consultar o status.'
  }

  if (text.includes('ti')) {
    return 'Chamados de TI normalmente envolvem computador, sistema ou acesso. Descreva o problema.'
  }

  if (text.includes('financeiro')) {
    return 'Chamados financeiros podem incluir pagamentos, notas ou reembolsos. Descreva sua solicitação.'
  }

  if (text.includes('rh')) {
    return 'Chamados de RH podem incluir férias, folha de pagamento ou documentos.'
  }

  return 'Não entendi totalmente sua mensagem. Você pode explicar melhor ou informar se deseja abrir um chamado?'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const message = body.message || ''

    const reply = getAutoReply(message)

    return NextResponse.json({
      reply
    })
  } catch {
    return NextResponse.json(
      { reply: 'Erro ao processar mensagem.' },
      { status: 500 }
    )
  }
}