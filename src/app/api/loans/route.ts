export const dynamic = "force-dynamic"
// v24.0: Loan Tracking API
import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { ok, created, handleError, zodError } from "@/lib/api-response"
import { requireModeUser } from "@/lib/authz"

const createSchema = z.object({
  personName: z.string().min(1).max(100),
  direction:  z.enum(["lent","borrowed"]),
  amount:     z.coerce.number().positive(),
  currency:   z.string().length(3).default("THB"),
  dueDate:    z.string().optional(),
  note:       z.string().optional(),
})

export async function GET(req: NextRequest) {
  const auth = await requireModeUser("personal")
  if ("error" in auth) return auth.error

  const sp     = req.nextUrl.searchParams
  const status = sp.get("status")

  const loans = await prisma.loan.findMany({
    where: { userId: auth.user.id, ...(status ? { status: status as any } : {}) },
    orderBy: { createdAt: "desc" },
    include: { repayments: { orderBy: { paidAt: "desc" } } },
  })

  const now = new Date()
  return ok(loans.map(l => ({
    ...l,
    amount:    Number(l.amount),
    remaining: Number(l.remaining),
    isOverdue: l.status === "active" && l.dueDate && l.dueDate < now,
    paidAmount: Number(l.amount) - Number(l.remaining),
    progressPercent: Math.round(((Number(l.amount) - Number(l.remaining)) / Number(l.amount)) * 100),
  })))
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("personal")
    if ("error" in auth) return auth.error

    const data = createSchema.parse(await req.json())
    const loan = await prisma.loan.create({
      data: {
        userId:     auth.user.id,
        personName: data.personName,
        direction:  data.direction,
        amount:     data.amount,
        remaining:  data.amount, // initially same as amount
        currency:   data.currency,
        dueDate:    data.dueDate ? new Date(data.dueDate) : null,
        note:       data.note ?? null,
      },
    })
    return created({ ...loan, amount: Number(loan.amount), remaining: Number(loan.remaining) }, "บันทึกรายการยืม-ให้ยืมแล้ว")
  } catch (e: any) {
    if (e?.name === "ZodError") return zodError(e)
    return handleError(e)
  }
}
