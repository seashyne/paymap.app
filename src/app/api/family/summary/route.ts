// v1.4: Family financial summary — aggregate all members' transactions
export const dynamic = "force-dynamic"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, handleError, forbidden } from "@/lib/api-response"
import { requireModeUser } from "@/lib/authz"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireModeUser("personal")
    if ("error" in auth) return auth.error
    const familyId = new URL(req.url).searchParams.get("familyId")
    if (!familyId) return ok({ summary: null })

    // Check membership
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: { members: { include: { user: { select: { id: true, name: true, image: true } } } } },
    })
    if (!family) return forbidden()
    const isMember = family.ownerId === auth.user.id || family.members.some(m => m.userId === auth.user.id)
    if (!isMember) return forbidden()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const memberIds = family.members.map(m => m.userId)

    // Aggregate transactions for all family members this month
    const [incomeRows, expenseRows] = await Promise.all([
      prisma.transaction.groupBy({
        by: ["userId"],
        where: { userId: { in: memberIds }, type: "income", happenedAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ["userId"],
        where: { userId: { in: memberIds }, type: "expense", happenedAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
    ])

    // Per-member breakdown
    const memberSummary = family.members.map(m => {
      const income  = Number(incomeRows.find(r => r.userId === m.userId)?._sum.amount ?? 0)
      const expense = Number(expenseRows.find(r => r.userId === m.userId)?._sum.amount ?? 0)
      return { memberId: m.id, userId: m.userId, name: m.user.name, image: m.user.image, role: m.role, nickname: m.nickname, income, expense, net: income - expense }
    })

    const totalIncome  = memberSummary.reduce((s, m) => s + m.income, 0)
    const totalExpense = memberSummary.reduce((s, m) => s + m.expense, 0)

    // Shared budgets
    const budgets = await prisma.familyBudget.findMany({
      where: { familyId, month: now.getMonth() + 1, year: now.getFullYear() },
    })

    return ok({
      summary: {
        familyName: family.name,
        currency: family.currency,
        totalIncome, totalExpense, net: totalIncome - totalExpense,
        memberSummary,
        budgets: budgets.map(b => ({ ...b, amount: Number(b.amount) })),
        month: now.getMonth() + 1, year: now.getFullYear(),
      }
    })
  } catch (e) { return handleError(e) }
}
