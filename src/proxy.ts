import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(req: NextRequest) {
  const token = await getToken({ req })

  const { pathname } = req.nextUrl

  const protectedRoutes = [
    "/dashboards",
    "/all-tickets",
    "/admin",
    "/gestao-de-usuarios",
    "/avisos",
    "/cpfs",
  ]

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // não logado tentando acessar rota protegida
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // logado tentando acessar login (mas NÃO a "/")
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/all-tickets", req.url))
  }

  // controle de role
  if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboards/:path*",
    "/all-tickets/:path*",
    "/gestao-de-usuarios/:path*",
    "/avisos/:path*",
    "/cpfs/:path*",
    "/admin/:path*",
  ],
}