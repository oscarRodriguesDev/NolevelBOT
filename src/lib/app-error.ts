import { storeError } from "./error-store"

export class AppError extends Error {
  public readonly code: string

  constructor(message: string, context?: string) {
    super(message)
    this.name = "AppError"
    this.code = storeError(this, context)
  }
}

export function captureError(error: unknown, context?: string): string {
  return storeError(error, context)
}
