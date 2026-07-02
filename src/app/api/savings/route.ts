export const dynamic = "force-dynamic"
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getPersonalPlan, requireModeUser } from "@/lib/authz";
import { ok, created, handleError, zodError, badRequest } from "@/lib/api-response";
import { PLAN_LIMITS, type PlanKey } from "@/lib/stripe";

const createSchema = z.object({
  name:         z.string().min(1, "กรุณาระบุชื่อเป้าหมาย").max(80),
  targetAmount: z.number().positive("ยอดเป้าหมายต้องมากกว่า 0"),
  icon:         z.string().optional().default("🎯"),
  color:        z.string().optional().default("#f59e0b"),
  deadline:     z.string().datetime().optional().nullable(),
});

export async function GET(_req: NextRequest) {
  const auth = await requireModeUser("personal");
  if ("error" in auth) return auth.error;

  const goals = await prisma.savingsGoal.findMany({
    where:   { userId: auth.user.id },
    include: { deposits: { orderBy: { createdAt: "desc" }, take: 5 } },
    orderBy: { createdAt: "desc" },
  });

  type GoalItem = (typeof goals)[number];

  // v0.4: include limit info for UI
  const limits = PLAN_LIMITS[getPersonalPlan(auth.user)];
  return ok({
    items: goals.map((g: GoalItem) => ({
      ...g,
      targetAmount: Number(g.targetAmount),
      savedAmount:  Number(g.savedAmount),
      percent:      Math.min(100, Math.round((Number(g.savedAmount) / Number(g.targetAmount)) * 100)),
      remaining:    Math.max(0, Number(g.targetAmount) - Number(g.savedAmount)),
      deposits:     g.deposits.map((d: GoalItem["deposits"][number]) => ({ ...d, amount: Number(d.amount) })),
    })),
    count:  goals.length,
    limit:  limits.goals,
    canAdd: goals.length < limits.goals,
  });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("personal");
    if ("error" in auth) return auth.error;

    // v0.4: plan limit check — free = 2 goals
    const currentCount = await prisma.savingsGoal.count({ where: { userId: auth.user.id } });
    const limits = PLAN_LIMITS[getPersonalPlan(auth.user)];
    if (currentCount >= limits.goals) {
      return badRequest(
        `แพลนปัจจุบันสร้างเป้าหมายได้ ${limits.goals} เป้า — อัปเกรดเป็น Pro เพื่อเพิ่มเพดานการใช้งาน`
      );
    }

    const data = createSchema.parse(await req.json());
    const goal = await prisma.savingsGoal.create({
      data: {
        userId:       auth.user.id,
        name:         data.name,
        targetAmount: data.targetAmount,
        icon:         data.icon,
        color:        data.color,
        deadline:     data.deadline ? new Date(data.deadline) : null,
      },
    });
    return created({ ...goal, targetAmount: Number(goal.targetAmount), savedAmount: 0, percent: 0 });
  } catch (e: any) {
    if (e?.name === "ZodError") return zodError(e);
    return handleError(e);
  }
}
