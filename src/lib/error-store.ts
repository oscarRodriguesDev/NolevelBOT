export interface StoredError {
  code: string
  message: string
  stack?: string
  context?: string
  timestamp: number
}

const PREFIX = "ERR"
const TTL_MS = 24 * 60 * 60 * 1000
const CLEANUP_INTERVAL = 10 * 60 * 1000

let counter = 0
const store = new Map<string, StoredError>()

// Preenche numero com zeros a esquerda para 5 digitos
function pad(n: number): string {
  return String(n).padStart(5, "0")
}

// Remove entradas expiradas do armazenamento interno
function cleanup() {
  const now = Date.now()
  for (const [code, err] of store) {
    if (now - err.timestamp > TTL_MS) store.delete(code)
  }
}

if (typeof setInterval !== "undefined") {
  setInterval(cleanup, CLEANUP_INTERVAL).unref()
}

// Armazena erro e retorna codigo unico de rastreamento
export function storeError(error: unknown, context?: string): string {
  counter++
  const code = `${PREFIX}-${pad(counter)}`
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined

  store.set(code, { code, message, stack, context, timestamp: Date.now() })

  if (process.env.NODE_ENV !== "production") {
    console.error(`[${code}] ${context ? `(${context}) ` : ""}${message}`)
  }

  return code
}

// Retorna erro armazenado pelo codigo informado
export function getError(code: string): StoredError | undefined {
  return store.get(code)
}

// Retorna todos os erros armazenados ordenados do mais recente
export function getAllErrors(): StoredError[] {
  return Array.from(store.values()).sort((a, b) => b.timestamp - a.timestamp)
}

// Limpa todos os erros armazenados e reseta o contador
export function clearErrors(): void {
  store.clear()
  counter = 0
}
