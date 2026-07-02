import { getRedis } from "./redis"

type CacheValue = string | number | boolean | Record<string, unknown> | unknown[] | null

const memoryCache = new Map<string, { expiresAt: number; value: string }>()

function getMemory(key: string) {
  const hit = memoryCache.get(key)
  if (!hit) return null
  if (Date.now() > hit.expiresAt) {
    memoryCache.delete(key)
    return null
  }
  return hit.value
}

function setMemory(key: string, value: string, ttlSeconds: number) {
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
}

export async function cacheGet<T = unknown>(key: string): Promise<T | null> {
  const redis = getRedis()
  const raw = redis ? await redis.get(key).catch(() => null) : getMemory(key)
  if (!raw) return null
  return JSON.parse(raw) as T
}

export async function cacheSet(key: string, value: CacheValue, ttlSeconds = 60) {
  const payload = JSON.stringify(value)
  const redis = getRedis()
  if (redis) {
    await redis.set(key, payload, "EX", ttlSeconds).catch(() => undefined)
    return
  }
  setMemory(key, payload, ttlSeconds)
}

export async function cacheDelete(key: string) {
  const redis = getRedis()
  if (redis) {
    await redis.del(key).catch(() => undefined)
  }
  memoryCache.delete(key)
}

export async function getOrSet<T>(key: string, ttlSeconds: number, producer: () => Promise<T>): Promise<T> {
  const cached = await cacheGet<T>(key)
  if (cached !== null) return cached
  const value = await producer()
  await cacheSet(key, value as CacheValue, ttlSeconds)
  return value
}
