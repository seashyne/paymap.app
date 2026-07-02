import { Queue, Worker } from "bullmq"
import type { Job } from "bullmq"

export type QueueJobName = "email.send" | "report.generate" | "webhook.retry" | "analytics.flush" | "realtime.broadcast" | "notification.send"
export type QueueJobPayload = Record<string, unknown>

function getConnection() {
  if (!process.env.REDIS_URL) return null
  return { connection: { url: process.env.REDIS_URL } }
}

export function getBullQueue() {
  const cfg = getConnection()
  if (!cfg) return null
  return new Queue<QueueJobPayload>("paymap", cfg)
}

export function createBullWorker(processor: (job: Job<QueueJobPayload>) => Promise<unknown>) {
  const cfg = getConnection()
  if (!cfg) return null
  return new Worker<QueueJobPayload>("paymap", processor, cfg)
}
