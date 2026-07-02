type RateLimitResult = { allowed: boolean; remaining: number; resetAt: Date }

const memory = new Map<string, { count: number; resetAt: number }>()

function hit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const existing = memory.get(key)
  if (!existing || existing.resetAt < now) {
    memory.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: new Date(now + windowMs) }
  }
  existing.count += 1
  memory.set(key, existing)
  return { allowed: existing.count <= limit, remaining: Math.max(limit - existing.count, 0), resetAt: new Date(existing.resetAt) }
}

export async function enforcePublicRateLimit(key: string, pathname: string) {
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) return hit(`page:${key}`, 120, 60_000)
  if (pathname.startsWith("/api/billing/")) return hit(`billing:${key}`, 45, 60_000)
  if (pathname.startsWith("/api/notifications")) return hit(`notifications:${key}`, 90, 60_000)
  if (pathname.startsWith("/api/realtime/stream")) return hit(`stream:${key}`, 30, 60_000)
  return { allowed: true, remaining: 9999, resetAt: new Date(Date.now() + 60_000) }
}
