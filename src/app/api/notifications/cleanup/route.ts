// v1.9: Notification cleanup — called by cron or health-check
// POST /api/notifications/cleanup  (requires x-cron-secret header in all environments)
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, handleError } from "@/lib/api-response"

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-cron-secret")
    const cronSecret = process.env.CRON_SECRET
    // v3.1: enforce secret in all environments, not just production
    if (!cronSecret || secret !== cronSecret) {
      return new Response("Unauthorized", { status: 401 })
    }
    const { count } = await prisma.notification.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
    return ok({ deleted: count, at: new Date().toISOString() })
  } catch (e) {
    return handleError(e)
  }
}
