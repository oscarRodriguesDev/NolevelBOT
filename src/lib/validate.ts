import { NextResponse } from "next/server"
import type { ZodSchema } from "zod"

export function validateOrError<T>(data: unknown, schema: ZodSchema<T>): T | NextResponse {
  const result = schema.safeParse(data)
  if (!result.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: result.error.flatten().fieldErrors },
      { status: 400 }
    )
  }
  return result.data
}
