import { pullNextJob } from "@/server/jobs/queue"

export async function runReportWorker() {
  const job = await pullNextJob()
  if (!job || job.name !== "report.generate") return { processed: false }
  console.info("[worker:report]", job)
  return { processed: true, job }
}
