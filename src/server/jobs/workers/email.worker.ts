import { pullNextJob } from "@/server/jobs/queue"

export async function runEmailWorker() {
  const job = await pullNextJob()
  if (!job || job.name !== "email.send") return { processed: false }
  console.info("[worker:email]", job)
  return { processed: true, job }
}
