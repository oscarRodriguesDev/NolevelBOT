import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@/lib/prisma/master";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const host = req.headers.get("host") || "";
  const hostname = host.split(":")[0];
  const parts = hostname.split(".");

  let subdomain: string | null = null;

  if (hostname === "localhost") {
    subdomain = "empresa1";
  } else if (parts.length > 2) {
    subdomain = parts[0];
  }

  if (!subdomain || subdomain === "www") {
    return NextResponse.redirect("https://nolevel.hiskra.com.br");
  }

  const tenant = await prisma.empresa.findFirst({
    where: { slug: subdomain },
  });

  if (!tenant) {
    return NextResponse.json(
      { error: "Tenant não encontrado" },
      { status: 404 }
    );
  }

  const res = NextResponse.next();
  res.cookies.set("tenant", tenant.slug);

  const token = await getToken({ req });

  const protectedRoutes = [
    "/dashboards",
    "/all-tickets",
    "/admin",
    "/gestao-de-usuarios",
    "/avisos",
    "/cpfs",
  ];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/all-tickets", req.url));
  }

  if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return res;
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
};