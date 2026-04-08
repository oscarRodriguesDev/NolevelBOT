import { headers, cookies } from "next/headers"

// Esse contexto vai evoluir depois (tenant, auth, etc)
// Por enquanto ele centraliza tudo que vem da request

export async function getRequestContext() {
  const headersList = await headers()
  const cookiesList = await cookies()

  // Exemplo: pegar IP (útil pra log/auditoria)
  const ip =
    headersList.get("x-forwarded-for") ||
    headersList.get("x-real-ip") ||
    "unknown"

  // Exemplo: user-agent
  const userAgent = headersList.get("user-agent") || "unknown"

  // Futuro:
  // const tenant = cookiesList.get("tenant")?.value

  return {
    headers: headersList,
    cookies: cookiesList,
    ip,
    userAgent,
  }
}