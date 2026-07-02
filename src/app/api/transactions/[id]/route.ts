import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, handleError, zodError, notFound, badRequest } from "@/lib/api-response";
import { requireModeUser } from "@/lib/authz";

const updateSchema = z.object({
  type: z.enum(["income", "expense"]).optional(),
  amount: z.coerce.number().positive().optional(),
  categoryId: z.string().cuid().nullable().optional(),
  note: z.string().max(250).nullable().optional(),
  happenedAt: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("personal");
    if ("error" in auth) return auth.error;

    const existing = await prisma.transaction.findFirst({ where: { id: params.id, userId: auth.user.id } });
    if (!existing) return notFound("ไม่พบรายการ");

    const data = updateSchema.parse(await req.json());
    const type = data.type ?? existing.type;
    if (data.categoryId) {
      const category = await prisma.category.findFirst({ where: { id: data.categoryId, userId: auth.user.id, type } });
      if (!category) return badRequest("หมวดหมู่ไม่ถูกต้อง");
    }

    const updated = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        ...(data.type ? { type: data.type } : {}),
        ...(typeof data.amount === "number" ? { amount: data.amount } : {}),
        ...(data.note !== undefined ? { note: data.note } : {}),
        ...(data.happenedAt ? { happenedAt: new Date(data.happenedAt) } : {}),
        ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
      },
      include: { category: { select: { id: true, name: true, type: true, color: true } } },
    });

    return ok({ ...updated, amount: Number(updated.amount) }, "อัปเดตรายการสำเร็จ");
  } catch (error) {
    if (error instanceof z.ZodError) return zodError(error);
    return handleError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("personal");
    if ("error" in auth) return auth.error;

    // v1.9: soft delete — never hard-delete financial records
    const existing = await prisma.transaction.findFirst({ where: { id: params.id, userId: auth.user.id, deletedAt: null } });
    if (!existing) return notFound("ไม่พบรายการ");

    await prisma.transaction.update({ where: { id: params.id }, data: { deletedAt: new Date() } });
    return ok(undefined, "ลบรายการสำเร็จ");
  } catch (error) {
    return handleError(error);
  }
}
