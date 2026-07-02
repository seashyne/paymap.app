import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiRole } from "@/lib/authz"

export const dynamic = "force-dynamic"

export async function GET() {
  const auth = await requireApiRole("admin")
  if ("error" in auth) return auth.error

  const now = new Date()
  const d30 = new Date(now.getTime() - 30 * 86400_000)
  const d7  = new Date(now.getTime() -  7 * 86400_000)
  const d1  = new Date(now.getTime() -      86400_000)

  const [
    totalUsers, newUsers30d, newUsers7d,
    activeUsers30d, activeUsers7d, activeUsers1d,
    byPlan, byMode, byRole,
    totalWorkspaces, totalOrgs,
    totalTransactions, totalWallets,
    totalAuditLogs, recentAudit,
    totalPayroll, totalInvoices, totalSalesOrders,
    activeSubs, totalSubs,
    dbPing,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: d30 } } }),
    prisma.user.count({ where: { createdAt: { gte: d7 } } }),
    prisma.user.count({ where: { lastLoginAt: { gte: d30 } } }),
    prisma.user.count({ where: { lastLoginAt: { gte: d7 } } }),
    prisma.user.count({ where: { lastLoginAt: { gte: d1 } } }),
    prisma.user.groupBy({ by: ["plan"], _count: true }),
    prisma.user.groupBy({ by: ["accountMode"], _count: true }),
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.workspace.count(),
    prisma.organization.count(),
    prisma.transaction.count(),
    prisma.wallet.count(),
    prisma.auditLog.count(),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: { id: true, action: true, createdAt: true, user: { select: { email: true, name: true } } } }),
    prisma.payrollRun.count(),
    prisma.invoice.count(),
    prisma.salesOrder.count(),
    prisma.productSubscription.count({ where: { status: "active" } }),
    prisma.productSubscription.count(),
    prisma.$queryRaw<[{ now: Date }]>`SELECT now()`.then(() => true).catch(() => false),
  ])

  return NextResponse.json({
    ok: true,
    data: {
      generatedAt: now.toISOString(),
      db: dbPing ? "ok" : "error",
      users: {
        total: totalUsers,
        new30d: newUsers30d,
        new7d: newUsers7d,
        active30d: activeUsers30d,
        active7d: activeUsers7d,
        active1d: activeUsers1d,
        byPlan: Object.fromEntries(byPlan.map(r => [r.plan, r._count])),
        byMode: Object.fromEntries(byMode.map(r => [r.accountMode, r._count])),
        byRole: Object.fromEntries(byRole.map(r => [r.role, r._count])),
      },
      workspace: { total: totalWorkspaces, orgs: totalOrgs },
      content: { transactions: totalTransactions, wallets: totalWallets, payroll: totalPayroll, invoices: totalInvoices, salesOrders: totalSalesOrders },
      billing: { activeSubs, totalSubs },
      audit: { total: totalAuditLogs, recent: recentAudit },
    },
  })
}
