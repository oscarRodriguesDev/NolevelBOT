export class TTLMap<K, V> {
  private map = new Map<K, { value: V; expiresAt: number }>()
  private ttl: number
  private cleanupTimer: ReturnType<typeof setInterval> | null = null

  constructor(ttlMs: number, cleanupIntervalMs = 30_000) {
    this.ttl = ttlMs
    this.cleanupTimer = setInterval(() => this.cleanup(), cleanupIntervalMs)
    this.cleanupTimer.unref()
  }

  get(key: K): V | undefined {
    const entry = this.map.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) {
      this.map.delete(key)
      return undefined
    }
    return entry.value
  }

  set(key: K, value: V): this {
    this.map.set(key, { value, expiresAt: Date.now() + this.ttl })
    return this
  }

  delete(key: K): boolean {
    return this.map.delete(key)
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.map) {
      if (now > entry.expiresAt) {
        this.map.delete(key)
      }
    }
  }

  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.map.clear()
  }
}
