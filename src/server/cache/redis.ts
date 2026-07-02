import Redis from "ioredis"

let client: Redis | null = null

function createRedisClient() {
  const url = process.env.REDIS_URL?.trim()
  if (!url) return null
  const instance = new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
  })
  instance.on("error", (error) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[redis]", error.message)
    }
  })
  instance.connect().catch(() => {})
  return instance
}

export function getRedis() {
  if (!client) client = createRedisClient()
  return client
}
