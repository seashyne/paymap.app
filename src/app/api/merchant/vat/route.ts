export const dynamic = "force-dynamic"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, handleError } from "@/lib/api-response"
import { requireModeUser } from "@/lib/authz"
import { buildVatReport } from "@/lib/merchant/vat"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireModeUser("merchant")
    if ("error" in auth) return auth.error
    const { searchParams } = new URL(req.url)
    const storeId = searchParams.get("storeId")
    const now = new Date()
    const month = Number(searchParams.get("month") ?? now.getMonth() + 1)
    const year  = Number(searchParams.get("year")  ?? now.getFullYear())
    if (!storeId) return ok(null)
    const store = await prisma.store.findFirst({ where: { id: storeId, userId: auth.user.id } })
    if (!store) return ok(null)

    const start = new Date(year, month - 1, 1)
    const end   = new Date(year, month, 0, 23, 59, 59)

    const [sales, purchases] = await Promise.all([
      prisma.salesOrder.findMany({ where: { storeId, soldAt: { gte: start, lte: end }, status: { not: "cancelled" } }, select: { totalAmount: true, vatAmount: true } }),
      prisma.purchaseOrder.findMany({ where: { storeId, orderedAt: { gte: start, lte: end }, status: { not: "cancelled" } }, select: { totalAmount: true, vatAmount: true } }),
    ])

    const report = buildVatReport(month, year,
      sales.map(s => ({ totalAmount: Number(s.totalAmount), vatAmount: Number(s.vatAmount) })),
      purchases.map(p => ({ totalAmount: Number(p.totalAmount), vatAmount: Number(p.vatAmount) })),
    )

    // Upsert to DB
    await prisma.vatReport.upsert({
      where: { storeId_month_year: { storeId, month, year } },
      update: { ...report },
      create: { storeId, ...report },
    })

    return ok(report)
  } catch(e) { return handleError(e) }
}
