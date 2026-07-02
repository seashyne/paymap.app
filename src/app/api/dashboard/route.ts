export const dynamic = "force-dynamic"
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModeUser } from "@/lib/authz";
import { ok, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest) {
  try {
    const auth = await requireModeUser("personal");
    if ("error" in auth) return auth.error;

    const now = new Date();

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const [incomeAgg, expenseAgg, budgetAgg, goals, subscriptions] =
      await Promise.all([
        prisma.transaction.aggregate({
          where: {
            userId: auth.user.id,
            type: "income",
            happenedAt: { gte: monthStart, lte: monthEnd },
          },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: {
            userId: auth.user.id,
            type: "expense",
            happenedAt: { gte: monthStart, lte: monthEnd },
          },
          _sum: { amount: true },
        }),
        prisma.budget.aggregate({
          where: {
            userId: auth.user.id,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
          },
          _sum: { limitAmount: true },
        }),
        prisma.savingsGoal.findMany({
          where: { userId: auth.user.id },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.subscription.findMany({
          where: { userId: auth.user.id },
          orderBy: { nextBillingAt: "asc" },
          take: 5,
        }),
      ]);

    type GoalItem = (typeof goals)[number];
    type SubscriptionItem = (typeof subscriptions)[number];

    const monthlyIncome = Number(incomeAgg._sum.amount ?? 0);
    const monthlyExpense = Number(expenseAgg._sum.amount ?? 0);
    const monthlyBudget = Number(budgetAgg._sum.limitAmount ?? 0);
    const monthlyRemaining = monthlyIncome - monthlyExpense;

    const months = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

        return prisma.transaction
          .groupBy({
            by: ["type"],
            where: {
              userId: auth.user.id,
              happenedAt: { gte: start, lte: end },
            },
            _sum: { amount: true },
          })
          .then((rows) => ({
            month: `${d.toLocaleString("th-TH", {
              month: "short",
            })} ${d.getFullYear() + 543}`,
            income:
              rows.find((r) => r.type === "income")?._sum.amount?.toNumber() ?? 0,
            expense:
              rows.find((r) => r.type === "expense")?._sum.amount?.toNumber() ?? 0,
          }));
      })
    );

    const savingsGoals = goals.map((g: GoalItem) => ({
      ...g,
      targetAmount: Number(g.targetAmount),
      savedAmount: Number(g.savedAmount),
      progress:
        Number(g.targetAmount) > 0
          ? Math.round((Number(g.savedAmount) / Number(g.targetAmount)) * 100)
          : 0,
    }));

    const upcomingSubscriptions = subscriptions.map((s: SubscriptionItem) => ({
      ...s,
      amount: Number(s.amount),
    }));

    return ok({
      summary: {
        income: monthlyIncome,
        expense: monthlyExpense,
        budget: monthlyBudget,
        remaining: monthlyRemaining,
      },
      chart: months,
      savingsGoals,
      subscriptions: upcomingSubscriptions,
    });
  } catch (e: unknown) {
    return handleError(e);
  }
}
