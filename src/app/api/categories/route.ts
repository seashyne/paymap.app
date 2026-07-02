export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireModeUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { ok, handleError } from "@/lib/api-response";

const createSchema = z.object({
  name:  z.string().min(1).max(50),
  type:  z.enum(["income","expense"]),
  icon:  z.string().optional().nullable(),
  color: z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  const auth = await requireModeUser("personal");
  if ("error" in auth) return auth.error;

  const type = req.nextUrl.searchParams.get("type") as "income" | "expense" | null;

  const categories = await prisma.category.findMany({
    where: { userId: auth.user.id, ...(type ? { type } : {}) },
    orderBy: [{ type: "asc" }, { name: "asc" }],
    select: { id: true, name: true, type: true, color: true, icon: true, isSystem: true },
  });

  return ok(categories);
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("personal");
    if ("error" in auth) return auth.error;
    const data = createSchema.parse(await req.json());
    const cat = await prisma.category.create({
      data: { userId: auth.user.id, name: data.name, type: data.type, icon: data.icon ?? null, color: data.color ?? null, isSystem: false },
      select: { id: true, name: true, type: true, color: true, icon: true, isSystem: true },
    });
    return ok(cat);
  } catch (e: any) {
    return handleError(e);
  }
}
