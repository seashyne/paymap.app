import { prisma } from "@/server/db/prisma"
import { getOrSet } from "@/server/cache/cache-service"

export async function getPersonalDashboardReadModel(userId: string, currency = "THB") {
  return getOrSet(`dashboard:read-model:${userId}`, 60, async () => {
    const recentThreshold = new Date()
    recentThreshold.setDate(recentThreshold.getDate() - 30)

    const [wallets, transactions, notifications, unreadNotifications] = await Promise.all([
      prisma.wallet.findMany({ where: { userId, isArchived: false }, select: { id: true, balance: true, currency: true } }),
      prisma.transaction.findMany({
        where: { userId, deletedAt: null },
        select: { id: true, happenedAt: true, type: true, amount: true, note: true, category: { select: { name: true, color: true } } },
        orderBy: { happenedAt: "desc" },
        take: 50,
      }),
      prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 12 }),
      prisma.notification.count({ where: { userId, readAt: null } }),
    ])

    const totalBalance = wallets.reduce((sum, wallet) => sum + Number(wallet.balance ?? 0), 0)
    const recentCount = transactions.filter((item) => item.happenedAt >= recentThreshold).length

    return {
      totalBalance,
      walletCount: wallets.length,
      currency: wallets[0]?.currency ?? currency,
      recentTransactions: transactions.map((item) => ({
        id: item.id,
        type: item.type,
        amount: Number(item.amount ?? 0),
        note: item.note ?? null,
        happenedAt: item.happenedAt,
        category: item.category ? { name: item.category.name, color: item.category.color ?? null } : null,
      })),
      recentCount,
      notifications: notifications.map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        type: item.type,
        readAt: item.readAt,
        createdAt: item.createdAt,
      })),
      unreadNotifications,
    }
  })
}
