import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(req: NextRequest) {
  const token = await getToken({ req })
  const { pathname } = req.nextUrl

  if (!token && pathname !== "/") {
    return NextResponse.redirect(new URL("/", req.url))
  }

  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/corporativo/:path*", "/oficina/:path*", "/eventos/:path*", "/god/:path*", "/dashboard/:path*"],
}
