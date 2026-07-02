import { createBullWorker } from "@/server/jobs/bullmq-queue"
import { processNextJob } from "@/server/jobs/job-dispatcher"

const worker = createBullWorker(async (job) => {
  await processNextJob({ name: job.name as any, payload: job.data, queuedAt: new Date().toISOString() })
})

if (!worker) {
  console.warn("[jobs] REDIS_URL is not configured. Falling back to app-managed queue only.")
} else {
  console.log("[jobs] BullMQ worker is running")
}
