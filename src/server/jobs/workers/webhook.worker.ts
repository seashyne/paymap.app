import { pullNextJob } from "@/server/jobs/queue"

export async function runWebhookWorker() {
  const job = await pullNextJob()
  if (!job || job.name !== "webhook.retry") return { processed: false }
  console.info("[worker:webhook]", job)
  return { processed: true, job }
}
