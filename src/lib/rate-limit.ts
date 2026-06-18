import { prisma } from "@/lib/prisma"

if (!process.env.TURNSTILE_SECRET_KEY) {
  console.warn("⚠️  TURNSTILE_SECRET_KEY não definida — captcha desativado em produção! Defina em .env")
}

const LOGIN_WINDOW_MS = 60 * 60 * 1000
const LOGIN_MAX_ATTEMPTS = 3

async function getOrInitRecord(key: string, windowMs: number) {
  const now = Date.now()
  const row = await prisma.cache.findUnique({ where: { key } })
  if (row && row.expiresAt.getTime() > now) {
    return JSON.parse(row.value) as { count: number }
  }
  return null
}

async function setRecord(key: string, count: number, windowMs: number) {
  const now = Date.now()
  await prisma.cache.upsert({
    where: { key },
    update: { value: JSON.stringify({ count }), expiresAt: new Date(now + windowMs) },
    create: { key, value: JSON.stringify({ count }), expiresAt: new Date(now + windowMs) },
  })
}

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const now = Date.now()
  const record = await getOrInitRecord(key, windowMs)

  if (!record) {
    await setRecord(key, 1, windowMs)
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs }
  }

  if (record.count >= maxRequests) {
    const row = await prisma.cache.findUnique({ where: { key } })
    const resetIn = row ? row.expiresAt.getTime() - now : windowMs
    return { allowed: false, remaining: 0, resetIn }
  }

  record.count++
  await setRecord(key, record.count, windowMs)
  return { allowed: true, remaining: maxRequests - record.count, resetIn: windowMs }
}

export async function trackFailedLogin(email: string): Promise<number> {
  const key = `login:${email.toLowerCase()}`
  const record = await getOrInitRecord(key, LOGIN_WINDOW_MS)

  if (!record) {
    await setRecord(key, 1, LOGIN_WINDOW_MS)
    return 1
  }

  record.count++
  await setRecord(key, record.count, LOGIN_WINDOW_MS)
  return record.count
}

export async function resetFailedLogin(email: string) {
  const key = `login:${email.toLowerCase()}`
  await prisma.cache.delete({ where: { key } }).catch(() => {})
}

export async function needsCaptcha(email: string): Promise<boolean> {
  const key = `login:${email.toLowerCase()}`
  const record = await getOrInitRecord(key, LOGIN_WINDOW_MS)
  if (!record) return false
  return record.count >= LOGIN_MAX_ATTEMPTS
}

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return false
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

import { NextResponse } from "next/server"

export async function applyRateLimit(
  req: Request | null | undefined,
  prefix: string,
  maxRequests = 30,
  windowMs = 60000
): Promise<NextResponse | null> {
  if (!req) return null
  const ip = getClientIp(req)
  const result = await checkRateLimit(`${prefix}:${ip}`, maxRequests, windowMs)
  if (!result.allowed) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em instantes." },
      { status: 429 }
    )
  }
  return null
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  const realIp = req.headers.get("x-real-ip")
  if (realIp) return realIp.trim()
  return "unknown"
}
