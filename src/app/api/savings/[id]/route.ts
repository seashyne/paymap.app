import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireModeUser } from "@/lib/authz";
import { ok, notFound, handleError, zodError } from "@/lib/api-response";

const updateSchema = z.object({
  name:         z.string().min(1).max(80).optional(),
  targetAmount: z.number().positive().optional(),
  icon:         z.string().optional(),
  color:        z.string().optional(),
  deadline:     z.string().datetime().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("personal");
    if ("error" in auth) return auth.error;
    const goal = await prisma.savingsGoal.findFirst({ where: { id: params.id, userId: auth.user.id } });
    if (!goal) return notFound("ไม่พบ Savings Goal");
    const data = updateSchema.parse(await req.json());
    const updated = await prisma.savingsGoal.update({
      where: { id: params.id },
      data: {
        ...(data.name         && { name: data.name }),
        ...(data.targetAmount && { targetAmount: data.targetAmount }),
        ...(data.icon         && { icon: data.icon }),
        ...(data.color        && { color: data.color }),
        ...(data.deadline !== undefined && { deadline: data.deadline ? new Date(data.deadline) : null }),
      },
    });
    return ok({ ...updated, targetAmount: Number(updated.targetAmount), savedAmount: Number(updated.savedAmount) });
  } catch (e: any) {
    if (e?.name === "ZodError") return zodError(e);
    return handleError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireModeUser("personal");
  if ("error" in auth) return auth.error;
  const goal = await prisma.savingsGoal.findFirst({ where: { id: params.id, userId: auth.user.id } });
  if (!goal) return notFound("ไม่พบ Savings Goal");
  await prisma.savingsGoal.delete({ where: { id: params.id } });
  return ok(null, "ลบเป้าหมายสำเร็จ");
}
