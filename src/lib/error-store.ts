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

function pad(n: number): string {
  return String(n).padStart(5, "0")
}

function cleanup() {
  const now = Date.now()
  for (const [code, err] of store) {
    if (now - err.timestamp > TTL_MS) store.delete(code)
  }
}

if (typeof setInterval !== "undefined") {
  setInterval(cleanup, CLEANUP_INTERVAL).unref()
}

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

export function getError(code: string): StoredError | undefined {
  return store.get(code)
}

export function getAllErrors(): StoredError[] {
  return Array.from(store.values()).sort((a, b) => b.timestamp - a.timestamp)
}

export function clearErrors(): void {
  store.clear()
  counter = 0
}
