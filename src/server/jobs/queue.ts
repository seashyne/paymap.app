import { getRedis } from "@/server/cache/redis"
import { getBullQueue } from "@/server/jobs/bullmq-queue"

export type JobName = "email.send" | "report.generate" | "webhook.retry" | "analytics.flush" | "realtime.broadcast" | "notification.send"

type JobPayload = Record<string, unknown>
const queueKey = "paymap:jobs"
const memoryQueue: Array<{ name: JobName; payload: JobPayload; queuedAt: string }> = []

export async function enqueueJob(name: JobName, payload: JobPayload) {
  const job = { name, payload, queuedAt: new Date().toISOString() }
  const bull = getBullQueue()
  if (bull) {
    await bull.add(name, payload, { removeOnComplete: 100, removeOnFail: 1000 }).catch(() => undefined)
    return { ok: true as const, job, driver: "bullmq" as const }
  }

  const redis = getRedis()
  if (redis) {
    await redis.rpush(queueKey, JSON.stringify(job)).catch(() => undefined)
    return { ok: true as const, job, driver: "redis-list" as const }
  }

  memoryQueue.push(job)
  return { ok: true as const, job, driver: "memory" as const }
}

export async function pullNextJob() {
  const redis = getRedis()
  if (redis) {
    const raw = await redis.lpop(queueKey).catch(() => null)
    return raw ? JSON.parse(raw) : null
  }
  return memoryQueue.shift() ?? null
}
