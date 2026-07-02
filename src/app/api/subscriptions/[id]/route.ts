import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireApiUser } from "@/lib/authz"
import { ok, notFound, handleError, zodError } from "@/lib/api-response"

const updateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().min(3).max(8).optional(),
  billingCycle: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]).optional(),
  nextBillingAt: z.string().min(10).optional(),
  logo: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  note: z.string().max(200).nullable().optional(),
  planCode: z.string().max(80).nullable().optional(),
  status: z.enum(["active", "paused", "cancelled", "past_due", "expired"]).optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  action: z.enum(["pause", "resume", "cancel", "expire"]).optional(),
})

function nextCycle(date: Date, cycle: string) {
  const next = new Date(date)
  if (cycle === "daily") next.setDate(next.getDate() + 1)
  else if (cycle === "weekly") next.setDate(next.getDate() + 7)
  else if (cycle === "monthly") next.setMonth(next.getMonth() + 1)
  else if (cycle === "quarterly") next.setMonth(next.getMonth() + 3)
  else if (cycle === "yearly") next.setFullYear(next.getFullYear() + 1)
  return next
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireApiUser()
    if ("error" in auth) return auth.error
    const sub = await prisma.subscription.findFirst({ where: { id: params.id, userId: auth.user.id } })
    if (!sub) return notFound("ไม่พบ Subscription")
    const data = updateSchema.parse(await req.json())

    let status = data.status ?? sub.status
    let cancelAtPeriodEnd = data.cancelAtPeriodEnd ?? sub.cancelAtPeriodEnd
    let cancelledAt = sub.cancelledAt
    let endedAt = sub.endedAt
    let nextBillingAt = data.nextBillingAt ? new Date(data.nextBillingAt) : sub.nextBillingAt

    if (data.action === "pause") {
      status = "paused"
    }
    if (data.action === "resume") {
      status = "active"
      cancelAtPeriodEnd = false
      cancelledAt = null
      endedAt = null
      if (nextBillingAt < new Date()) nextBillingAt = nextCycle(new Date(), data.billingCycle ?? sub.billingCycle)
    }
    if (data.action === "cancel") {
      status = "cancelled"
      cancelAtPeriodEnd = true
      cancelledAt = new Date()
      endedAt = sub.nextBillingAt
    }
    if (data.action === "expire") {
      status = "expired"
      endedAt = new Date()
    }

    const updated = await prisma.subscription.update({
      where: { id: params.id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.amount !== undefined ? { amount: data.amount } : {}),
        ...(data.currency !== undefined ? { currency: data.currency } : {}),
        ...(data.billingCycle !== undefined ? { billingCycle: data.billingCycle } : {}),
        ...(data.logo !== undefined ? { logo: data.logo } : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
        ...(data.note !== undefined ? { note: data.note } : {}),
        ...(data.planCode !== undefined ? { planCode: data.planCode } : {}),
        nextBillingAt,
        status,
        cancelAtPeriodEnd,
        cancelledAt,
        endedAt,
      },
    })
    return ok({ ...updated, amount: Number(updated.amount) })
  } catch (e: any) {
    if (e?.name === "ZodError") return zodError(e)
    return handleError(e)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireApiUser()
  if ("error" in auth) return auth.error
  const sub = await prisma.subscription.findFirst({ where: { id: params.id, userId: auth.user.id } })
  if (!sub) return notFound("ไม่พบ Subscription")
  await prisma.subscription.update({
    where: { id: params.id },
    data: { status: "cancelled", cancelAtPeriodEnd: true, cancelledAt: new Date(), endedAt: sub.nextBillingAt },
  })
  return ok(null, "ยกเลิก Subscription สำเร็จ")
}
