import { enqueueJob, type JobName } from "@/server/jobs/queue"

export async function dispatchJob(name: JobName, payload: Record<string, unknown>) {
  return enqueueJob(name, payload)
}

export async function processNextJob(job: { name: string; payload: Record<string, unknown>; queuedAt: string }) {
  return dispatchJob(job.name as JobName, job.payload)
}
