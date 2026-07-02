export const dynamic = "force-dynamic"
import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireApiUser } from "@/lib/authz"
import { ok, created, handleError, zodError } from "@/lib/api-response"

const CYCLE_MULTIPLIER: Record<string, number> = {
  daily: 30, weekly: 4.33, monthly: 1, quarterly: 1 / 3, yearly: 1 / 12,
}

const createSchema = z.object({
  name: z.string().min(1, "กรุณาระบุชื่อ").max(80),
  amount: z.number().positive("ค่าบริการต้องมากกว่า 0"),
  currency: z.string().min(3).max(8).default("THB"),
  billingCycle: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]).default("monthly"),
  nextBillingAt: z.string().min(10),
  planCode: z.string().max(80).optional().nullable(),
  logo: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  note: z.string().max(200).optional().nullable(),
})

function toMonthly(amount: number, cycle: string): number {
  return amount * (CYCLE_MULTIPLIER[cycle] ?? 1)
}

function serializeSub(sub: any) {
  const amount = Number(sub.amount)
  const now = new Date()
  const daysLeft = Math.ceil((new Date(sub.nextBillingAt).getTime() - now.getTime()) / 86400000)
  return {
    ...sub,
    amount,
    monthlyEquiv: toMonthly(amount, sub.billingCycle),
    daysLeft,
    isDueSoon: daysLeft <= 7 && daysLeft >= 0 && sub.status === "active",
    isOverdue: daysLeft < 0 && ["active", "past_due"].includes(sub.status),
  }
}

export async function GET() {
  const auth = await requireApiUser()
  if ("error" in auth) return auth.error

  const subs = await prisma.subscription.findMany({
    where: { userId: auth.user.id },
    orderBy: [{ status: "asc" }, { nextBillingAt: "asc" }],
  })

  const result = subs.map(serializeSub)
  const totalMonthly = result.filter((s) => ["active", "past_due"].includes(s.status)).reduce((sum, s) => sum + s.monthlyEquiv, 0)
  return ok({ subscriptions: result, totalMonthly })
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiUser()
    if ("error" in auth) return auth.error
    const data = createSchema.parse(await req.json())
    const nextBillingAt = new Date(data.nextBillingAt)
    const sub = await prisma.subscription.create({
      data: {
        userId: auth.user.id,
        name: data.name,
        amount: data.amount,
        currency: data.currency,
        billingCycle: data.billingCycle,
        nextBillingAt,
        planCode: data.planCode ?? null,
        logo: data.logo ?? null,
        color: data.color ?? null,
        note: data.note ?? null,
        startedAt: new Date(),
      },
    })
    return created(serializeSub(sub))
  } catch (e: any) {
    if (e?.name === "ZodError") return zodError(e)
    return handleError(e)
  }
}
