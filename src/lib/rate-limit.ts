const store = new Map<string, { count: number; resetAt: number }>()

const LOGIN_WINDOW_MS = 60 * 60 * 1000
const LOGIN_MAX_ATTEMPTS = 3

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const record = store.get(key)

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: record.resetAt - now }
  }

  record.count++
  return { allowed: true, remaining: maxRequests - record.count, resetIn: record.resetAt - now }
}

export function trackFailedLogin(email: string): number {
  const key = `login:${email.toLowerCase()}`
  const now = Date.now()
  const record = store.get(key)
  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS })
    return 1
  }
  record.count++
  return record.count
}

export function resetFailedLogin(email: string) {
  store.delete(`login:${email.toLowerCase()}`)
}

export function needsCaptcha(email: string): boolean {
  const key = `login:${email.toLowerCase()}`
  const now = Date.now()
  const record = store.get(key)
  if (!record || now > record.resetAt) return false
  return record.count >= LOGIN_MAX_ATTEMPTS
}

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secret}&response=${token}`,
    })
    const data = await res.json()
    return data.success === true
  } catch {
    return false
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  const realIp = req.headers.get("x-real-ip")
  if (realIp) return realIp.trim()
  return "unknown"
}
