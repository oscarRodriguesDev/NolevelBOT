import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const publicRoutes = [
  '/corporativo/chamado',
  '/corporativo/chatbot-app',
  '/corporativo/consulta',
  '/oficina/chamado',
  '/oficina/chatbot-app',
  '/oficina/consulta',
  '/contact',
  '/ideias',
]

const rateStore = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateStore.get(key)
  if (!record || now > record.resetAt) {
    rateStore.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (record.count >= maxRequests) return false
  record.count++
  return true
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  const realIp = req.headers.get("x-real-ip")
  if (realIp) return realIp.trim()
  return "unknown"
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // A4: Rate limiting para page routes
  if (pathname === "/") {
    const ip = getClientIp(req)
    if (!checkRateLimit(`page:root:${ip}`, 60, 60 * 1000)) {
      return new NextResponse(null, { status: 429 })
    }
  }
  if (pathname.startsWith('/dashboard')) {
    const ip = getClientIp(req)
    if (!checkRateLimit(`page:dashboard:${ip}`, 120, 60 * 1000)) {
      return new NextResponse(null, { status: 429 })
    }
  }

  // Guard ENABLE_TESTES
  if (process.env.ENABLE_TESTES !== 'true') {
    if (
      pathname === '/testes' ||
      pathname.startsWith('/testes/') ||
      pathname === '/api/testes' ||
      pathname.startsWith('/api/testes/')
    ) {
      return new NextResponse(null, { status: 404 })
    }
  }

  if (process.env.ENABLE_TESTES === 'true') {
    if (
      pathname === '/testes' ||
      pathname.startsWith('/testes/') ||
      pathname === '/api/testes' ||
      pathname.startsWith('/api/testes/')
    ) {
      return NextResponse.next()
    }
  }

  const token = await getToken({ req })

  // A3: Proteger /api-docs — exige autenticação
  if (pathname.startsWith('/api-docs')) {
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url))
    }
    return NextResponse.next()
  }

  // A5: Bloqueio por IP — tracking de acesso não autenticado a páginas protegidas
  const isPublic = publicRoutes.some(route => pathname.startsWith(route) || pathname === route.replace(/\/$/, ''))
  if (isPublic || pathname === '/oficina') {
    return NextResponse.next()
  }

  if (!token) {
    const ip = getClientIp(req)
    checkRateLimit(`login:ip:${ip}`, 20, 15 * 60 * 1000)
  }

  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (!token) {
    if (pathname === "/") {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL("/", req.url))
  }

  if (pathname.startsWith('/god') && token.role !== 'GOD') {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/corporativo/:path*", "/oficina/:path*", "/eventos/:path*", "/god/:path*", "/dashboard/:path*", "/testes/:path*", "/api/testes/:path*", "/api-docs/:path*", "/ideias/:path*"],
}
