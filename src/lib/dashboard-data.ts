import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/stripe";
import { getCurrentSession } from "@/lib/session";
import { buildFinancialHealthScore, buildMonthlySummary, buildSpendingInsights, detectRecurringTransactions, suggestCategory } from "@/lib/finance-intelligence";

export type WorkspaceKind = "personal" | "business" | "enterprise";

export async function buildDashboardProps(user: {
  id: string;
  name: string;
  email: string;
  plan: string;
  currency?: string | null;
  locale?: string | null;
  country?: string | null;
  timezone?: string | null;
  productSubscriptions?: Array<{
    product: string;
    planTier: string;
    status: string;
  }>;
}) {
  const session = await getCurrentSession();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const locale = {
    currency: session?.currency ?? user.currency ?? "THB",
    locale: session?.locale ?? user.locale ?? "th-TH",
    country: session?.country ?? user.country ?? "TH",
    timezone: session?.timezone ?? user.timezone ?? "Asia/Bangkok",
  };

  const [
    monthlyAgg,
    // allTimeAgg removed — use 24-month window to avoid full table scan
    last24MonthsAgg,
    categorySpend,
    last6Months,
    recentTx,
    budgets,
    savingsGoals,
    subscriptions,
    categories,
  ] = await Promise.all([
    prisma.transaction.groupBy({ by: ["type"], where: { userId: user.id, deletedAt: null, happenedAt: { gte: startOfMonth, lte: endOfMonth } }, _sum: { amount: true } }),
    // v1.8: cap to 24 months — avoids full table scan, still covers practical range
    prisma.transaction.groupBy({ by: ["type"], where: { userId: user.id, deletedAt: null, happenedAt: { gte: new Date(year - 2, month - 1, 1) } }, _sum: { amount: true } }),
    prisma.transaction.groupBy({ by: ["categoryId"], where: { userId: user.id, deletedAt: null, type: "expense", happenedAt: { gte: startOfMonth, lte: endOfMonth } }, _sum: { amount: true }, orderBy: { _sum: { amount: "desc" } }, take: 8 }),
    // v1.8: single query for 6-month chart (was 6 separate queries)
    prisma.transaction.findMany({
      where: { userId: user.id, deletedAt: null, happenedAt: { gte: new Date(year, month - 7, 1) } },
      select: { type: true, amount: true, happenedAt: true },
    }).then(rows => {
      const bucket = new Map<number, { income: number; expense: number }>()
      for (const row of rows) {
        const d = new Date(row.happenedAt)
        const key = d.getFullYear() * 100 + d.getMonth()
        const current = bucket.get(key) ?? { income: 0, expense: 0 }
        if (row.type === "income") current.income += Number(row.amount)
        else current.expense += Number(row.amount)
        bucket.set(key, current)
      }

      return Array.from({ length: 6 }, (_, i) => {
        const d = new Date(year, month - 1 - i, 1)
        const key = d.getFullYear() * 100 + d.getMonth()
        const value = bucket.get(key) ?? { income: 0, expense: 0 }
        return {
          month: `${d.toLocaleString(locale.locale, { month: "short" })} ${d.getFullYear()}`,
          income: value.income,
          expense: value.expense,
        }
      }).reverse()
    }),
    prisma.transaction.findMany({ where: { userId: user.id, deletedAt: null }, include: { category: { select: { name: true, color: true, icon: true } } }, orderBy: [{ happenedAt: "desc" }, { createdAt: "desc" }], take: 50 }),  // v1.9
    prisma.budget.findMany({ where: { userId: user.id, year, month }, include: { category: { select: { name: true, color: true, icon: true } } } }),
    prisma.savingsGoal.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.subscription.findMany({ where: { userId: user.id, status: "active" }, orderBy: { nextBillingAt: "asc" } }),
    prisma.category.findMany({ where: { userId: user.id }, orderBy: [{ type: "asc" }, { name: "asc" }] }),
  ]);

  const monthIncome = Number(monthlyAgg.find((r) => r.type === "income")?._sum.amount ?? 0);
  const monthExpense = Number(monthlyAgg.find((r) => r.type === "expense")?._sum.amount ?? 0);
  const allBalance = Number(last24MonthsAgg.find((r) => r.type === "income")?._sum.amount ?? 0) - Number(last24MonthsAgg.find((r) => r.type === "expense")?._sum.amount ?? 0);

  const spentByCat = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { userId: user.id, type: "expense", happenedAt: { gte: startOfMonth, lte: endOfMonth }, categoryId: { in: budgets.map((b) => b.categoryId) } },
    _sum: { amount: true },
  });
  const spentMap = new Map<string | null, number>(spentByCat.map((s) => [s.categoryId, Number(s._sum.amount ?? 0)]));

  const catMap = new Map(categories.map((c) => [c.id, c]));

  const cycleM: Record<string, number> = { daily: 30, weekly: 4.33, monthly: 1, quarterly: 1 / 3, yearly: 1 / 12 };
  const monthlySubCost = subscriptions.reduce((s, sub) => s + Number(sub.amount) * (cycleM[sub.billingCycle] ?? 1), 0);
  const subNow = new Date();
  const personalSub = user.productSubscriptions?.find((s) => s.product === "personal" && s.status === "active")
  const resolvedPlan = personalSub?.planTier === "pro" || personalSub?.planTier === "family" ? personalSub.planTier : user.plan
  const planLimits = PLAN_LIMITS[resolvedPlan as keyof typeof PLAN_LIMITS];
  const dueSoon = subscriptions.filter((s) => {
    const days = Math.ceil((new Date(s.nextBillingAt).getTime() - subNow.getTime()) / 86400000);
    return days >= 0 && days <= 7;
  }).length;
  const recurringDetections = detectRecurringTransactions(recentTx.map((tx) => ({ note: tx.note, amount: Number(tx.amount), happenedAt: tx.happenedAt })));
  const topCategory = categorySpend[0] ? {
    name: (catMap.get(categorySpend[0].categoryId ?? '') as any)?.name ?? 'ไม่ระบุ',
    amount: Number(categorySpend[0]._sum.amount ?? 0),
  } : null;
  const health = buildFinancialHealthScore({
    monthIncome,
    monthExpense,
    recurringMonthlyCost: monthlySubCost,
    budgetOverCount: (budgets as any[]).filter((b) => (spentMap.get(b.categoryId) ?? 0) > Number(b.limitAmount)).length,
    activeGoals: savingsGoals.length,
  });
  const insights = buildSpendingInsights({ monthIncome, monthExpense, topCategory, recurringMonthlyCost: monthlySubCost, dueSoon, recurringDetections });
  const monthlySummary = buildMonthlySummary({ monthIncome, monthExpense, score: health.score, dueSoon, topCategory });
  const smartCategories = recentTx.slice(0, 8).map((tx) => ({ id: tx.id, note: tx.note, suggested: suggestCategory(tx.note) })).filter((item) => item.suggested);

  return {
    user: { name: user.name, email: user.email, plan: user.plan },
    locale,
    planLimits: {
      budgets: planLimits.budgets,
      goals: planLimits.goals,
      export: planLimits.export,
      multiCurrency: planLimits.multiCurrency,
    },
    year,
    month,
    stats: {
      monthIncome,
      monthExpense,
      monthBalance: monthIncome - monthExpense,
      allBalance,
      savingsRate: monthIncome > 0 ? Math.round(((monthIncome - monthExpense) / monthIncome) * 100) : 0,
    },
    cashflow: last6Months.reverse(),
    donut: categorySpend.map((c) => ({
      categoryId: c.categoryId,
      name: (catMap.get(c.categoryId ?? "") as any)?.name ?? "ไม่ระบุ",
      color: (catMap.get(c.categoryId ?? "") as any)?.color ?? "#64748b",
      amount: Number(c._sum.amount ?? 0),
    })),
    recentTransactions: recentTx.map((tx) => ({ ...tx, amount: Number(tx.amount) })),
    budgets: (budgets as any[]).map((b) => ({
      ...b,
      limitAmount: Number(b.limitAmount),
      spent: spentMap.get(b.categoryId) ?? 0,
      percent: Math.min(100, Math.round(((spentMap.get(b.categoryId) ?? 0) / Number(b.limitAmount)) * 100)),
    })),
    savingsGoals: (savingsGoals as any[]).map((g) => ({
      ...g,
      targetAmount: Number(g.targetAmount),
      savedAmount: Number(g.savedAmount),
      percent: Math.min(100, Math.round((Number(g.savedAmount) / Number(g.targetAmount)) * 100)),
    })),
    subscriptions: {
      items: subscriptions.map((s) => ({ ...s, amount: Number(s.amount) })),
      monthlyTotal: Math.round(monthlySubCost),
      dueSoon,
    },
    intelligence: {
      health,
      insights,
      recurringDetections,
      monthlySummary,
      smartCategories,
    },
    // v0.8: business/merchant data loaded in dedicated pages (/business, /merchant)
    categories: categories.map((c) => ({ ...c })),
  };
}
