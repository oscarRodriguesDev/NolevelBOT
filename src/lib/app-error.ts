import { storeError } from "./error-store"

// Classe de erro personalizada com codigo unico de rastreamento
export class AppError extends Error {
  public readonly code: string

  // Inicializa o erro com mensagem e contexto opcional
  constructor(message: string, context?: string) {
    super(message)
    this.name = "AppError"
    this.code = storeError(this, context)
  }
}

// Captura e armazena erro generico, retornando o codigo gerado
export function captureError(error: unknown, context?: string): string {
  return storeError(error, context)
}
