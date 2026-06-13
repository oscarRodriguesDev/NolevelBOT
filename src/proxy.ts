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
  '/api-docs',
]

export async function proxy(req: NextRequest) {
  const token = await getToken({ req })
  const { pathname } = req.nextUrl

  const isPublic = publicRoutes.some(route => pathname.startsWith(route) || pathname === route.replace(/\/$/, ''))
  if (isPublic || pathname === '/oficina') {
    return NextResponse.next()
  }

  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (!token && pathname !== "/") {
    return NextResponse.redirect(new URL("/", req.url))
  }

  if (pathname.startsWith('/god') && token?.role !== 'GOD') {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/corporativo/:path*", "/oficina/:path*", "/eventos/:path*", "/god/:path*", "/dashboard/:path*"],
}
