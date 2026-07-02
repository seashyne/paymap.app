// PayMap v5 — Background Queue / Worker
// Simple in-process job queue with Redis persistence (optional)
// Jobs: payroll calculation, report generation, email batch, reconciliation

import { getRedis } from "@/lib/redis"

export type JobType =
  | "payroll_calculate"
  | "report_generate"
  | "email_batch"
  | "reconcile_bank"
  | "journal_auto"
  | "export_csv"

export interface Job {
  id: string
  type: JobType
  payload: Record<string, unknown>
  createdAt: string
  status: "pending" | "processing" | "done" | "failed"
  error?: string
}

const QUEUE_KEY = "paymap:jobs:queue"
const RESULT_PREFIX = "paymap:jobs:result:"

/** Enqueue a job — persists to Redis if available, else in-memory */
const memQueue: Job[] = []

export async function enqueueJob(type: JobType, payload: Record<string, unknown>): Promise<string> {
  const job: Job = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    payload,
    createdAt: new Date().toISOString(),
    status: "pending",
  }

  const redis = await getRedis().catch(() => null)
  if (redis) {
    await redis.lpush(QUEUE_KEY, JSON.stringify(job))
  } else {
    memQueue.push(job)
  }

  console.log(`[Queue] Enqueued ${job.type} (${job.id})`)
  return job.id
}

/** Poll next job from queue (used by worker loop or serverless trigger) */
export async function dequeueJob(): Promise<Job | null> {
  const redis = await getRedis().catch(() => null)
  if (redis) {
    const raw = await redis.rpop(QUEUE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Job
  }
  return memQueue.pop() ?? null
}

/** Save job result */
export async function saveJobResult(job: Job): Promise<void> {
  const redis = await getRedis().catch(() => null)
  if (redis) {
    await redis.setex(RESULT_PREFIX + job.id, 3600 * 24, JSON.stringify(job))
  }
}

/** Get job status */
export async function getJobStatus(jobId: string): Promise<Job | null> {
  const redis = await getRedis().catch(() => null)
  if (redis) {
    const raw = await redis.get(RESULT_PREFIX + jobId)
    if (!raw) return null
    return JSON.parse(raw) as Job
  }
  return null
}

/** Job handlers map */
const handlers: Partial<Record<JobType, (payload: Record<string, unknown>) => Promise<void>>> = {}

export function registerJobHandler(type: JobType, handler: (payload: Record<string, unknown>) => Promise<void>) {
  handlers[type] = handler
}

/** Process one job */
export async function processJob(job: Job): Promise<void> {
  const handler = handlers[job.type]
  if (!handler) {
    console.warn(`[Worker] No handler for job type: ${job.type}`)
    return
  }

  job.status = "processing"
  try {
    await handler(job.payload)
    job.status = "done"
    console.log(`[Worker] Done: ${job.type} (${job.id})`)
  } catch (err: any) {
    job.status = "failed"
    job.error = err?.message ?? String(err)
    console.error(`[Worker] Failed: ${job.type} (${job.id}) — ${job.error}`)
  }

  await saveJobResult(job)
}

/** Start worker loop — processes all pending jobs */
export async function startWorker(): Promise<void> {
  console.log("[Worker] Background worker started")
  while (true) {
    const job = await dequeueJob()
    if (!job) break
    await processJob(job)
  }
  console.log("[Worker] Queue drained")
}
