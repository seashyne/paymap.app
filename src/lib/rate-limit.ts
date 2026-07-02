import { getRedis } from "@/lib/redis";

type Result = { allowed: boolean; remaining: number; resetAt: Date };
const memory = new Map<string, { count: number; resetAt: number }>();

function fallback(key: string, limit: number, windowMs: number): Result {
  const now = Date.now();
  const current = memory.get(key);
  if (!current || current.resetAt < now) {
    memory.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: new Date(now + windowMs) };
  }
  current.count += 1;
  memory.set(key, current);
  return {
    allowed: current.count <= limit,
    remaining: Math.max(limit - current.count, 0),
    resetAt: new Date(current.resetAt),
  };
}

let _redisWarnedAt = 0;

export async function checkRateLimit(key: string, limit = 5, windowMs = 900000): Promise<Result> {
  const client = await getRedis().catch(() => null);
  if (!client) {
    // v3.1: warn that in-memory rate limiting does not scale across serverless instances
    if (process.env.NODE_ENV === "production") {
      const now = Date.now();
      if (now - _redisWarnedAt > 60_000) {
        _redisWarnedAt = now;
        console.warn("[RateLimit] Redis unavailable — using in-memory fallback. Rate limits will NOT be shared across instances. Set REDIS_URL to fix.");
      }
    }
    return fallback(key, limit, windowMs);
  }

  const bucket = `ratelimit:${key}`;
  const hits = await client.incr(bucket);
  if (hits === 1) await client.pexpire(bucket, windowMs);
  const ttl = await client.pttl(bucket);
  const resetAt = new Date(Date.now() + Math.max(ttl, 0));
  return {
    allowed: hits <= limit,
    remaining: Math.max(limit - hits, 0),
    resetAt,
  };
}
