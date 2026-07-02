import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function startOfMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

function currentYearMonth() {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

export const getLandingStatsCached = unstable_cache(
  async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const [userCount, activeCount] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.user.count({ where: { lastLoginAt: { gte: thirtyDaysAgo } } }).catch(() => 0),
    ])

    return { userCount, activeCount }
  },
  ["landing-stats"],
  { revalidate: 3600, tags: ["landing-stats"] },
)

export async function getMerchantDashboardSnapshot(storeId: string) {
  const today = startOfToday()
  const monthStart = startOfMonth()

  return unstable_cache(
    async () => {
      const [todaySales, lowStockCount, monthSales, inventoryItems, topProductsRaw] = await Promise.all([
        prisma.salesOrder.aggregate({
          where: { storeId, soldAt: { gte: today }, status: { not: "cancelled" } },
          _sum: { totalAmount: true },
          _count: { id: true },
        }),
        prisma.merchantProduct.count({ where: { storeId, status: "active", stockQty: { lte: 10 } } }),
        prisma.salesOrder.aggregate({
          where: { storeId, soldAt: { gte: monthStart }, status: { not: "cancelled" } },
          _sum: { totalAmount: true, vatAmount: true },
          _count: { id: true },
        }),
        prisma.merchantProduct.findMany({
          where: { storeId },
          orderBy: [{ stockQty: "asc" }, { createdAt: "desc" }],
          take: 8,
          select: { id: true, name: true, sku: true, salePrice: true, stockQty: true, minStockQty: true, category: true, status: true },
        }),
        prisma.salesItem.groupBy({
          by: ["productId"],
          where: { order: { storeId, soldAt: { gte: monthStart } } },
          _sum: { qty: true, lineTotal: true },
          orderBy: { _sum: { lineTotal: "desc" } },
          take: 5,
        }),
      ])

      const topProductIds = topProductsRaw.map((p) => p.productId)
      const productNames = topProductIds.length > 0
        ? await prisma.merchantProduct.findMany({ where: { id: { in: topProductIds } }, select: { id: true, name: true, sku: true } })
        : []
      const nameMap = new Map(productNames.map((p) => [p.id, p]))

      return {
        todaySales: { total: Number(todaySales._sum.totalAmount ?? 0), orders: todaySales._count.id ?? 0 },
        monthSales: {
          total: Number(monthSales._sum.totalAmount ?? 0),
          vat: Number(monthSales._sum.vatAmount ?? 0),
          orders: monthSales._count.id ?? 0,
        },
        lowStockCount,
        inventoryItems: inventoryItems.map((item) => ({ ...item, salePrice: Number(item.salePrice) })),
        topProducts: topProductsRaw.map((p) => ({
          productId: p.productId,
          name: (nameMap.get(p.productId) as any)?.name ?? p.productId.slice(-8),
          sku: (nameMap.get(p.productId) as any)?.sku ?? null,
          qty: p._sum.qty ?? 0,
          revenue: Number(p._sum.lineTotal ?? 0),
        })),
      }
    },
    ["merchant-dashboard", storeId],
    { revalidate: 60, tags: [`merchant-dashboard:${storeId}`] },
  )()
}

export async function getBusinessDashboardSnapshot(organizationId: string) {
  const { year, month } = currentYearMonth()

  return unstable_cache(
    async () => {
      const [org, payrollRun, pendingLeaves] = await Promise.all([
        prisma.organization.findUnique({
          where: { id: organizationId },
          include: {
            employees: { where: { status: "active" }, select: { id: true, name: true, position: true, department: true, baseSalary: true, status: true } },
            _count: { select: { employees: true } },
          },
        }),
        prisma.payrollRun.findFirst({ where: { organizationId, month, year } }),
        prisma.leaveRequest.count({ where: { organizationId, status: "pending" } }),
      ])

      if (!org) return null

      return {
        org: {
          id: org.id,
          name: org.name,
          employees: org.employees.map((e) => ({ ...e, baseSalary: Number(e.baseSalary) })),
          employeeCount: org._count.employees,
        },
        payrollRun: payrollRun
          ? {
              ...payrollRun,
              totalGross: Number(payrollRun.totalGross),
              totalNet: Number(payrollRun.totalNet),
              totalWht: payrollRun.totalWht != null ? Number(payrollRun.totalWht) : null,
              totalSso: payrollRun.totalSso != null ? Number(payrollRun.totalSso) : null,
            }
          : null,
        pendingLeaves,
      }
    },
    ["business-dashboard", organizationId],
    { revalidate: 60, tags: [`business-dashboard:${organizationId}`] },
  )()
}
