// PayMap v5 — Worker Trigger API
// POST /api/worker — enqueue or drain background jobs
// Protected by CRON_SECRET or session (admin)
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { enqueueJob, startWorker, getJobStatus, type JobType } from "@/lib/queue/worker"
import { getCurrentSession } from "@/lib/session"

export async function POST(req: NextRequest) {
  // Allow cron trigger or admin session
  const cronSecret = req.headers.get("x-cron-secret")
  if (cronSecret !== process.env.CRON_SECRET) {
    const session = await getCurrentSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const body = await req.json().catch(() => ({}))
  const { action, type, payload } = body

  if (action === "drain") {
    await startWorker()
    return NextResponse.json({ ok: true, message: "Worker drained" })
  }

  if (action === "enqueue" && type) {
    const jobId = await enqueueJob(type as JobType, payload ?? {})
    return NextResponse.json({ ok: true, jobId })
  }

  return NextResponse.json({ error: "action must be 'enqueue' or 'drain'" }, { status: 400 })
}

export async function GET(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret")
  if (cronSecret !== process.env.CRON_SECRET) {
    const session = await getCurrentSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get("jobId")
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 })

  const job = await getJobStatus(jobId)
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 })
  return NextResponse.json({ job })
}
