export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { requireApiFeature } from "@/lib/subscription/api-guard"
import { prisma } from "@/lib/prisma"
import { ok, handleError } from "@/lib/api-response"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireApiFeature("business_tax_advanced")
    if ("error" in auth) return auth.error
    const url = new URL(req.url)
    const year = Number(url.searchParams.get("year") ?? new Date().getFullYear())

    const [income, expense, store] = await Promise.all([
      prisma.transaction.aggregate({ where: { userId: auth.user.id, type: "income", happenedAt: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31, 23, 59, 59) } }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { userId: auth.user.id, type: "expense", happenedAt: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31, 23, 59, 59) } }, _sum: { amount: true } }),
      prisma.store.findFirst({ where: { userId: auth.user.id }, include: { vatReports: { where: { year }, orderBy: { month: "asc" } } } }),
    ])

    const vatPayable = (store?.vatReports ?? []).reduce((sum, item) => sum + Number(item.vatPayable), 0)

    return ok({
      year,
      income: Number(income._sum.amount ?? 0),
      expenses: Number(expense._sum.amount ?? 0),
      estimatedProfit: Number(income._sum.amount ?? 0) - Number(expense._sum.amount ?? 0),
      vatPayable,
      monthlyVat: (store?.vatReports ?? []).map((item) => ({ month: item.month, vatPayable: Number(item.vatPayable) })),
      note: "Preview only — ตรวจสอบกับนักบัญชีหรือนักภาษีก่อนยื่นจริง",
    })
  } catch (error) {
    return handleError(error)
  }
}
