import { prisma } from "@/lib/prisma"

export async function cacheGetOrSet<T>(
  key: string,
  fetch: () => Promise<T>,
  ttlSegundos = 300
): Promise<T> {
  try {
    const row = await prisma.cache.findUnique({ where: { key } })
    if (row && row.expiresAt > new Date()) {
      return JSON.parse(row.value) as T
    }
  } catch {
    // fallback: query fails, just fetch fresh
  }

  const value = await fetch()

  try {
    await prisma.cache.upsert({
      where: { key },
      update: { value: JSON.stringify(value), expiresAt: new Date(Date.now() + ttlSegundos * 1000) },
      create: { key, value: JSON.stringify(value), expiresAt: new Date(Date.now() + ttlSegundos * 1000) },
    })
  } catch {
    // fallback: write fails, stale cache is fine
  }

  return value
}
