export const dynamic = "force-dynamic"

import { requireApiFeature } from "@/lib/subscription/api-guard"
import { prisma } from "@/lib/prisma"
import { ok, handleError } from "@/lib/api-response"

export async function GET() {
  try {
    const auth = await requireApiFeature("merchant_vat")
    if ("error" in auth) return auth.error

    const store = await prisma.store.findFirst({ where: { userId: auth.user.id } })
    if (!store) return ok({ reports: [], summary: { totalSalesVat: 0, totalPurchaseVat: 0, totalVatPayable: 0 } })

    const reports = await prisma.vatReport.findMany({ where: { storeId: store.id }, orderBy: [{ year: "desc" }, { month: "desc" }], take: 24 })
    const summary = reports.reduce((acc, report) => {
      acc.totalSalesVat += Number(report.salesVat)
      acc.totalPurchaseVat += Number(report.purchaseVat)
      acc.totalVatPayable += Number(report.vatPayable)
      return acc
    }, { totalSalesVat: 0, totalPurchaseVat: 0, totalVatPayable: 0 })

    return ok({
      reports: reports.map((report) => ({ ...report, salesVat: Number(report.salesVat), purchaseVat: Number(report.purchaseVat), vatPayable: Number(report.vatPayable), totalSales: Number(report.totalSales), totalPurchases: Number(report.totalPurchases) })),
      summary,
    })
  } catch (error) {
    return handleError(error)
  }
}
