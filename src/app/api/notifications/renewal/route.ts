// v2.3.1-fix: Check subscriptions due in 7 days and send reminder emails
// Called by Vercel cron (GET) — protected by CRON_SECRET header
// Fix: (1) export GET for Vercel cron, (2) dedup via renewalNotifiedAt, (3) bypass handled in middleware
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendSubscriptionRenewalEmail } from "@/lib/email"

async function handleRenewal(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret")
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  // Start of today — used to avoid re-sending if already notified today
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Find subscriptions billing in next 7 days that haven't been notified today
  const subs = await prisma.subscription.findMany({
    where: {
      status: "active",
      nextBillingAt: { gte: now, lte: in7Days },
      OR: [
        { renewalNotifiedAt: null },
        { renewalNotifiedAt: { lt: todayStart } },
      ],
    },
    include: { user: { select: { name: true, email: true, currency: true } } },
    take: 100,
  })

  let sent = 0
  for (const sub of subs) {
    try {
      const dateStr = sub.nextBillingAt
        ? new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(sub.nextBillingAt)
        : "ไม่ระบุ"
      await sendSubscriptionRenewalEmail(
        sub.user.email, sub.user.name,
        sub.name, Number(sub.amount), dateStr, sub.currency ?? sub.user.currency ?? "THB"
      )
      // Mark as notified so we don't re-send today
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { renewalNotifiedAt: now },
      })
      sent++
    } catch (err) {
      console.error(`[renewal] failed for sub ${sub.id}:`, err)
    }
  }

  return NextResponse.json({ ok: true, sent, total: subs.length })
}

// Vercel cron sends GET — must export GET
export async function GET(req: NextRequest) {
  return handleRenewal(req)
}

// Keep POST for manual / CI triggers
export async function POST(req: NextRequest) {
  return handleRenewal(req)
}
