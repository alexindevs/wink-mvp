// lib/rateLimiter.ts
import { kv } from './kv'

const RATE_LIMIT_WINDOW = 60 // seconds
const USAGE_LIMIT_WINDOW = 7 * 24 * 60 * 60 // 7 days
const RATE_LIMIT_MAX = 3
const USAGE_LIMIT_MAX = 15

export async function rateAndUsageLimiter(ip: string) {
  const rateKey = `rate:${ip}`
  const usageKey = `usage:${ip}`

  const rateCount = (await kv.incr(rateKey)) ?? 1
  if (rateCount === 1) await kv.expire(rateKey, RATE_LIMIT_WINDOW)

  if (rateCount > RATE_LIMIT_MAX) {
    return { ok: false, reason: "Whoa there! You're cooking too fast." }
  }

  const usageCount = (await kv.incr(usageKey)) ?? 1
  if (usageCount === 1) await kv.expire(usageKey, USAGE_LIMIT_WINDOW)

  if (usageCount > USAGE_LIMIT_MAX) {
    return { ok: false, reason: 'Weekly usage limit exceeded.' }
  }

  return { ok: true }
}
