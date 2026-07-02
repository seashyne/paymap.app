export const dynamic = "force-dynamic"
// v24.0: Installment System API
import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { ok, created, handleError, zodError } from "@/lib/api-response"
import { requireModeUser } from "@/lib/authz"

const createSchema = z.object({
  name:          z.string().min(1).max(100),
  totalAmount:   z.coerce.number().positive(),
  downPayment:   z.coerce.number().min(0).default(0),
  monthlyAmount: z.coerce.number().positive(),
  totalMonths:   z.coerce.number().int().positive(),
  interestRate:  z.coerce.number().min(0).default(0),
  currency:      z.string().length(3).default("THB"),
  startDate:     z.string().min(10),
  icon:          z.string().optional(),
  color:         z.string().optional(),
  note:          z.string().optional(),
})

export async function GET(req: NextRequest) {
  const auth = await requireModeUser("personal")
  if ("error" in auth) return auth.error

  const sp     = req.nextUrl.searchParams
  const status = sp.get("status") as "active" | "completed" | "cancelled" | null

  const items = await prisma.installment.findMany({
    where: { userId: auth.user.id, ...(status ? { status } : {}) },
    orderBy: { nextDueDate: "asc" },
    include: { payments: { orderBy: { paidAt: "desc" }, take: 5 } },
  })

  return ok(items.map(i => ({
    ...i,
    totalAmount:   Number(i.totalAmount),
    downPayment:   Number(i.downPayment),
    monthlyAmount: Number(i.monthlyAmount),
    interestRate:  Number(i.interestRate),
    remainingAmount: Number(i.totalAmount) - Number(i.downPayment) - (i.paidMonths * Number(i.monthlyAmount)),
    progressPercent: Math.round((i.paidMonths / i.totalMonths) * 100),
  })))
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("personal")
    if ("error" in auth) return auth.error

    const data = createSchema.parse(await req.json())
    const startDate = new Date(data.startDate)
    // nextDueDate = start + 1 month
    const nextDueDate = new Date(startDate)
    nextDueDate.setMonth(nextDueDate.getMonth() + 1)

    const item = await prisma.installment.create({
      data: {
        userId:        auth.user.id,
        name:          data.name,
        totalAmount:   data.totalAmount,
        downPayment:   data.downPayment,
        monthlyAmount: data.monthlyAmount,
        totalMonths:   data.totalMonths,
        interestRate:  data.interestRate,
        currency:      data.currency,
        startDate,
        nextDueDate,
        icon:  data.icon  ?? "📱",
        color: data.color ?? "#f59e0b",
        note:  data.note  ?? null,
      },
    })
    return created(item, "เพิ่มรายการผ่อนชำระแล้ว")
  } catch (e: any) {
    if (e?.name === "ZodError") return zodError(e)
    return handleError(e)
  }
}
