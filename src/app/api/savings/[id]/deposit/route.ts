import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireModeUser } from "@/lib/authz";
import { ok, notFound, handleError, zodError, badRequest } from "@/lib/api-response";

const depositSchema = z.object({
  amount: z.number().positive("จำนวนต้องมากกว่า 0"),
  note:   z.string().max(200).optional().nullable(),
});

// POST /api/savings/[id]/deposit — ฝากเงินเข้าเป้าหมาย
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("personal");
    if ("error" in auth) return auth.error;

    const goal = await prisma.savingsGoal.findFirst({ where: { id: params.id, userId: auth.user.id } });
    if (!goal) return notFound("ไม่พบ Savings Goal");
    if (goal.completedAt) return badRequest("เป้าหมายนี้สำเร็จแล้ว");

    const data       = depositSchema.parse(await req.json());
    const newSaved   = Number(goal.savedAmount) + data.amount;
    const isComplete = newSaved >= Number(goal.targetAmount);

    const [deposit] = await prisma.$transaction([
      prisma.savingsDeposit.create({
        data: { goalId: params.id, amount: data.amount, note: data.note ?? null },
      }),
      prisma.savingsGoal.update({
        where: { id: params.id },
        data: {
          savedAmount: newSaved,
          ...(isComplete && { completedAt: new Date() }),
        },
      }),
    ]);

    return ok({ deposit: { ...deposit, amount: Number(deposit.amount) }, completed: isComplete },
      isComplete ? "🎉 บรรลุเป้าหมายแล้ว!" : "ฝากเงินสำเร็จ");
  } catch (e: any) {
    if (e?.name === "ZodError") return zodError(e);
    return handleError(e);
  }
}
