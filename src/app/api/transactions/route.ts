export const dynamic = "force-dynamic"
import { NextRequest } from "next/server"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { ok, handleError, zodError, badRequest } from "@/lib/api-response"
import { requireModeUser, getPersonalPlan } from "@/lib/authz"
import { checkPlanLimit, type PlanKey } from "@/lib/stripe"
import { pushNotification } from "@/lib/notify"

const createSchema = z.object({
  type:       z.enum(["income","expense"]),
  amount:     z.coerce.number().positive(),
  currency:   z.string().length(3).default("THB"),
  categoryId: z.string().cuid().optional().nullable(),
  note:       z.string().max(250).optional().nullable(),
  happenedAt: z.string().min(10),
})

export async function GET(req: NextRequest) {
  const auth = await requireModeUser("personal")
  if ("error" in auth) return auth.error

  const sp    = req.nextUrl.searchParams
  const limit = Math.min(Number(sp.get("limit") ?? 50), 200)
  const year  = sp.get("year")  ? Number(sp.get("year"))  : null
  const month = sp.get("month") ? Number(sp.get("month")) : null
  const type  = sp.get("type") as "income"|"expense"|null

  const dateFilter = year && month
    ? { happenedAt: { gte: new Date(year,month-1,1), lte: new Date(year,month,0,23,59,59) } }
    : year ? { happenedAt: { gte: new Date(year,0,1), lte: new Date(year,11,31,23,59,59) } }
    : {}

  const items = await prisma.transaction.findMany({
    // v1.9: exclude soft-deleted
    where: { 
      userId: auth.user.id, 
      deletedAt: null, 
      ...(type ? { type } : {}), 
      ...dateFilter 
    },
    orderBy: [{ happenedAt:"desc" },{ createdAt:"desc" }],
    
    take: limit,
    include: { category: { select: { id:true, name:true, type:true, color:true, icon:true } } },
  })
  return ok(items.map((i: (typeof items)[number]) => ({ ...i, amount: Number(i.amount), amountUsd: i.amountUsd ? Number(i.amountUsd) : null })))
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("personal")
    if ("error" in auth) return auth.error

    // Plan limit check — free = 50/month
    const now = new Date()
    const countThisMonth = await prisma.transaction.count({
      where: { userId: auth.user.id, happenedAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } },
    })
    const personalPlan = getPersonalPlan(auth.user)
    const limitCheck = checkPlanLimit(personalPlan, "transactions", countThisMonth)
    if (!limitCheck.allowed)
      return badRequest(`แพลน ${personalPlan} ใช้ได้ ${limitCheck.limit} รายการ/เดือน — อัปเกรดเป็น Pro เพื่อเพิ่มเพดานการใช้งาน`)

    const data = createSchema.parse(await req.json())
    if (data.categoryId) {
      const cat = await prisma.category.findFirst({ where: { id: data.categoryId, userId: auth.user.id } })
      if (!cat) return badRequest("หมวดหมู่ไม่ถูกต้อง")
    }

    const created = await prisma.transaction.create({
      data: {
        userId: auth.user.id, type: data.type,
        amount: data.amount,
        currency: data.currency.toUpperCase(),
        categoryId: data.categoryId ?? null,
        note: data.note ?? null,
        happenedAt: new Date(data.happenedAt),
      },
      include: { category: { select: { id:true, name:true, type:true, color:true, icon:true } } },
    })
    // v1.7: Check if expense causes budget overflow → push notification
    if (created.type === "expense" && created.categoryId) {
      try {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const budget = await prisma.budget.findFirst({
          where: { userId: auth.user.id, categoryId: created.categoryId, month: now.getMonth()+1, year: now.getFullYear() },
          include: { category: { select: { name: true } } },
        })
        if (budget) {
          const spent = await prisma.transaction.aggregate({
            where: { userId: auth.user.id, categoryId: created.categoryId, type: "expense", happenedAt: { gte: startOfMonth } },
            _sum: { amount: true },
          })
          const totalSpent = Number(spent._sum.amount ?? 0)
          const limit = Number(budget.limitAmount)
          const pct = limit > 0 ? Math.round((totalSpent / limit) * 100) : 0
          if (pct >= 80) {
            pushNotification({
              userId: auth.user.id,
              type: "budget_alert",
              title: pct >= 100 ? `🚨 Budget "${budget.category?.name}" เกินแล้ว!` : `⚠️ Budget "${budget.category?.name}" ใกล้เต็ม (${pct}%)`,
              body: `ใช้ไป ฿${totalSpent.toLocaleString()} จาก ฿${limit.toLocaleString()}`,
              payload: { budgetId: budget.id, percent: pct, categoryId: budget.categoryId },
            }).catch(() => {})
          }
        }
      } catch {} // Non-blocking — never fail the transaction
    }

    return ok({ ...created, amount: Number(created.amount) }, "เพิ่มรายการสำเร็จ")
  } catch (e: any) {
    if (e?.name === "ZodError") return zodError(e)
    return handleError(e)
  }
}
