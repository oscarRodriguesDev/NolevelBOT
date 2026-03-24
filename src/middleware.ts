import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Rotas públicas que não precisam de validação
  const publicRoutes = ['/setup', '/api/company-config', '/consulta', '/chamado', '/chatbot-app', '/login']
  
  // Se for uma rota pública, deixa passar
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Para rotas protegidas, verifica se tem configuração
  try {
    const response = await fetch(`${request.nextUrl.origin}/api/company-config`, {
      headers: request.headers,
    })

    const config = await response.json()

    // Se não houver configuração e não for setup, redireciona para setup
    if (!config.id && pathname !== '/setup') {
      return NextResponse.redirect(new URL('/setup', request.url))
    }
  } catch (error) {
    // Em caso de erro, deixa passar (pode ser que o DB não esteja pronto ainda)
    console.error('Erro ao verificar configuração:', error)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Exclude paths:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
