import { NextResponse } from "next/server"
import type { ZodSchema } from "zod"

//valida dados com schema Zod ou retorna erro 400
export function validateOrError<T>(data: unknown, schema: ZodSchema<T>): T | NextResponse {
  const result = schema.safeParse(data)
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = result.error.flatten().fieldErrors as Record<string, string[]>
    const entries = Object.entries(fieldErrors)
    const msgDetalhe = entries.length > 0 ? `${entries[0][0]}: ${entries[0][1][0]}` : "campos inválidos"
    return NextResponse.json(
      { error: `Dados inválidos — ${msgDetalhe}`, details: fieldErrors },
      { status: 400 }
    )
  }
  return result.data
}
