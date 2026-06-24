export class TTLMap<K, V> {
  private map = new Map<K, { value: V; expiresAt: number }>()
  private ttl: number
  private cleanupTimer: ReturnType<typeof setInterval> | null = null

  // Inicializa o mapa com TTL e inicia o intervalo de limpeza automatica
  constructor(ttlMs: number, cleanupIntervalMs = 30_000) {
    this.ttl = ttlMs
    this.cleanupTimer = setInterval(() => this.cleanup(), cleanupIntervalMs)
    this.cleanupTimer.unref()
  }

  // Retorna o valor se ainda estiver dentro do prazo de validade
  get(key: K): V | undefined {
    const entry = this.map.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) {
      this.map.delete(key)
      return undefined
    }
    return entry.value
  }

  // Armazena um valor com timestamp de expiracao baseado no TTL
  set(key: K, value: V): this {
    this.map.set(key, { value, expiresAt: Date.now() + this.ttl })
    return this
  }

  // Remove uma chave do mapa e retorna se foi removida
  delete(key: K): boolean {
    return this.map.delete(key)
  }

  // Remove todas as entradas expiradas do mapa interno
  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.map) {
      if (now > entry.expiresAt) {
        this.map.delete(key)
      }
    }
  }

  // Para o timer de limpeza e limpa todas as entradas do mapa
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.map.clear()
  }
}
