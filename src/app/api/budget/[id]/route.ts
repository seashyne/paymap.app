import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModeUser } from "@/lib/authz";
import { ok, notFound, handleError } from "@/lib/api-response";

// DELETE /api/budget/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireModeUser("personal");
  if ("error" in auth) return auth.error;
  try {
    const budget = await prisma.budget.findFirst({
      where: { id: params.id, userId: auth.user.id },
    });
    if (!budget) return notFound("ไม่พบ Budget");
    await prisma.budget.delete({ where: { id: params.id } });
    return ok(null, "ลบ Budget สำเร็จ");
  } catch (e) { return handleError(e); }
}
