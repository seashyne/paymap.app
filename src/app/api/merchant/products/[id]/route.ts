import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, handleError, notFound, badRequest, zodError } from "@/lib/api-response";
import { requireModeUser } from "@/lib/authz";

const updateSchema = z.object({
  name: z.string().min(1, "ชื่อสินค้าจำเป็น").optional(),
  sku: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  costPrice: z.coerce.number().min(0).optional(),
  salePrice: z.coerce.number().positive("ราคาขายต้องมากกว่า 0").optional(),
  stockQty: z.coerce.number().int().min(0).optional(),
  minStockQty: z.coerce.number().int().min(0).optional(),
  unit: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  vatIncluded: z.boolean().optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("merchant");
    if ("error" in auth) return auth.error;

    const existing = await prisma.merchantProduct.findFirst({
      where: { id: params.id, store: { userId: auth.user.id } },
    });
    if (!existing) return notFound("ไม่พบสินค้า");

    const data = updateSchema.parse(await req.json());
    const updated = await prisma.merchantProduct.update({
      where: { id: params.id },
      data,
    });

    return ok({ ...updated, costPrice: Number(updated.costPrice), salePrice: Number(updated.salePrice) }, "บันทึกสินค้าสำเร็จ");
  } catch (error) {
    if (error instanceof z.ZodError) return zodError(error);
    return handleError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("merchant");
    if ("error" in auth) return auth.error;

    const existing = await prisma.merchantProduct.findFirst({
      where: { id: params.id, store: { userId: auth.user.id } },
    });
    if (!existing) return notFound("ไม่พบสินค้า");
    if (existing.stockQty > 0) return badRequest("ลบสินค้าไม่ได้เมื่อยังมีสต็อกคงเหลือ");

    await prisma.merchantProduct.update({ where: { id: params.id }, data: { status: "archived" } });
    return ok(undefined, "ย้ายสินค้าไปยัง archived แล้ว");
  } catch (error) {
    return handleError(error);
  }
}
