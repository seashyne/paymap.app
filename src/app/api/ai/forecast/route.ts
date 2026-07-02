// v1.8: Smart Budget Forecast
// วิเคราะห์ pattern การใช้จ่ายจริง + project สิ้นเดือน ไม่ต้องใช้ AI API (pure math)
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireApiUser();
    if ("error" in auth) return auth.error;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysLeft = daysInMonth - dayOfMonth;

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    // Pull 3 months of history for trend analysis
    const start3m = new Date(year, month - 4, 1);

    const [currentTx, historicTx, budgets, goals, subs] = await Promise.all([
      // This month transactions
      prisma.transaction.findMany({
        where: { userId: auth.user.id,
          deletedAt: null, happenedAt: { gte: startOfMonth, lte: endOfMonth } },
        include: { category: { select: { id: true, name: true, color: true } } },
      }),
      // Last 3 months for trend
      prisma.transaction.findMany({
        where: {
          userId: auth.user.id,
          deletedAt: null,
          happenedAt: { gte: start3m, lt: startOfMonth },
          type: "expense",
        },
        include: { category: { select: { id: true, name: true, color: true } } },
      }),
      prisma.budget.findMany({
        where: { userId: auth.user.id, year, month },
        include: { category: { select: { id: true, name: true, color: true } } },
      }),
      prisma.savingsGoal.findMany({ where: { userId: auth.user.id } }),
      prisma.subscription.findMany({ where: { userId: auth.user.id, status: "active" } }),
    ]);

    const currentIncome = currentTx
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + Number(t.amount), 0);

    const currentExpense = currentTx
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount), 0);

    // Daily spending rate this month
    const dailyRate = dayOfMonth > 0 ? currentExpense / dayOfMonth : 0;

    // Historic average by category (last 3 months)
    type CatGroup = Record<
      string,
      { total: number; count: number; name: string; color: string | null }
    >;

    const histByCat: CatGroup = {};
    for (const tx of historicTx) {
      const catId = tx.categoryId ?? "__none__";
      if (!histByCat[catId]) {
        histByCat[catId] = {
          total: 0,
          count: 0,
          name: tx.category?.name ?? "ไม่ระบุ",
          color: tx.category?.color ?? null,
        };
      }
      histByCat[catId].total += Number(tx.amount);
      histByCat[catId].count += 1;
    }

    // Forecast per category
    const forecasts = budgets.map((b) => {
      const catId = b.categoryId;

      const spentSoFar = currentTx
        .filter((t) => t.type === "expense" && t.categoryId === catId)
        .reduce((s, t) => s + Number(t.amount), 0);

      // Historic monthly avg for this category
      const hist = histByCat[catId];
      const histMonthlyAvg = hist ? hist.total / 3 : 0;

      // Weighted projection: 70% rate-based + 30% historic
      const projectedFromRate = spentSoFar + dailyRate * daysLeft * (spentSoFar > 0 ? 1 : 0);
      const projectedTotal =
        histMonthlyAvg > 0
          ? projectedFromRate * 0.7 + histMonthlyAvg * 0.3
          : projectedFromRate;

      const limit = Number(b.limitAmount);
      const pct = limit > 0 ? Math.round((spentSoFar / limit) * 100) : 0;
      const projPct = limit > 0 ? Math.round((projectedTotal / limit) * 100) : 0;

      return {
        categoryId: catId,
        categoryName: b.category.name,
        color: b.category.color ?? "#8b5cf6",
        limit,
        spentSoFar,
        projectedTotal: Math.round(projectedTotal),
        remainingBudget: Math.max(0, limit - spentSoFar),
        pct,
        projPct,
        status: projPct >= 100 ? "over" : projPct >= 85 ? "warning" : "ok",
        histMonthlyAvg: Math.round(histMonthlyAvg),
      };
    });

    // Monthly subscription load
    const cycleM: Record<string, number> = {
      daily: 30,
      weekly: 4.33,
      monthly: 1,
      quarterly: 1 / 3,
      yearly: 1 / 12,
    };

    const monthlySubCost = subs.reduce(
      (s, sub) => s + Number(sub.amount) * (cycleM[sub.billingCycle] ?? 1),
      0
    );

    // End-of-month projection
    const projectedExpense = currentExpense + dailyRate * daysLeft;
    const projectedBalance = currentIncome - projectedExpense;

    // Savings goal progress this month
    const goalsWithProgress = goals.map((g) => ({
      id: g.id,
      name: g.name,
      target: Number(g.targetAmount),
      saved: Number(g.savedAmount),
      pct:
        Number(g.targetAmount) > 0
          ? Math.round((Number(g.savedAmount) / Number(g.targetAmount)) * 100)
          : 0,
    }));

    // AI-style text insight (rule-based, no API call needed)
    const insights: string[] = [];
    const overBudget = forecasts.filter((f) => f.status === "over");
    const warnBudget = forecasts.filter((f) => f.status === "warning");

    if (overBudget.length > 0) {
      insights.push(
        `⚠️ ${overBudget.map((f) => f.categoryName).join(", ")} มีแนวโน้มเกิน budget สิ้นเดือนนี้`
      );
    }

    if (warnBudget.length > 0) {
      insights.push(`⚡ ${warnBudget.map((f) => f.categoryName).join(", ")} ใกล้เต็ม budget`);
    }

    if (projectedBalance > 0) {
      const saveable = Math.round(projectedBalance * 0.5);
      if (saveable > 0) {
        insights.push(
          `💡 คาดว่าจะเหลือ ฿${projectedBalance.toLocaleString()} — ลองโอนเพิ่มไปกองทุน ฿${saveable.toLocaleString()}`
        );
      }
    }

    if (currentIncome > 0 && monthlySubCost > currentIncome * 0.2) {
      insights.push(
        `📦 Subscription รวม ฿${Math.round(monthlySubCost).toLocaleString()}/เดือน (${Math.round(
          (monthlySubCost / currentIncome) * 100
        )}% ของรายรับ) — สูงกว่า 20% ที่แนะนำ`
      );
    }

    return ok({
      period: { year, month, dayOfMonth, daysInMonth, daysLeft },
      current: {
        income: currentIncome,
        expense: currentExpense,
        balance: currentIncome - currentExpense,
      },
      projected: {
        expense: Math.round(projectedExpense),
        balance: Math.round(projectedBalance),
        dailyRate: Math.round(dailyRate),
      },
      budgetForecasts: forecasts,
      monthlySubCost: Math.round(monthlySubCost),
      goals: goalsWithProgress,
      insights,
    });
  } catch (e) {
    return handleError(e);
  }
}