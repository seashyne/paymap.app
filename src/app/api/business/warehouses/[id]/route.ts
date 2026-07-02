export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireModeUser } from "@/lib/authz"
import { handleError, notFound, ok } from "@/lib/api-response"

const db = prisma as any

const updateSchema = z.object({
  code: z.string().trim().max(40).optional().nullable(),
  name: z.string().trim().min(1).max(160).optional(),
  address: z.string().trim().max(1000).optional().nullable(),
  note: z.string().trim().max(1000).optional().nullable(),
  isActive: z.boolean().optional(),
})

async function getOwnedWarehouse(id: string, userId: string) {
  return db.warehouse.findFirst({
    where: {
      id,
      organization: { ownerId: userId },
    },
    include: { _count: { select: { balances: true, movements: true } } },
  })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error

    const existing = await getOwnedWarehouse(params.id, auth.user.id)
    if (!existing || existing.deletedAt) return notFound("ไม่พบคลังสินค้า")

    const parsed = updateSchema.safeParse(await req.json())
    if (!parsed.success) return handleError(parsed.error)

    const warehouse = await db.warehouse.update({
      where: { id: existing.id },
      data: {
        code: parsed.data.code === undefined ? undefined : parsed.data.code?.trim() || null,
        name: parsed.data.name?.trim(),
        address: parsed.data.address === undefined ? undefined : parsed.data.address?.trim() || null,
        note: parsed.data.note === undefined ? undefined : parsed.data.note?.trim() || null,
        isActive: parsed.data.isActive,
      },
      include: { _count: { select: { balances: true, movements: true } } },
    })

    return ok({
      warehouse: {
        ...warehouse,
        productCount: warehouse._count?.balances ?? 0,
        movementCount: warehouse._count?.movements ?? 0,
      },
    }, "อัปเดตคลังสินค้าเรียบร้อย")
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error

    const existing = await getOwnedWarehouse(params.id, auth.user.id)
    if (!existing || existing.deletedAt) return notFound("ไม่พบคลังสินค้า")

    const warehouse = await db.warehouse.update({
      where: { id: existing.id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
      include: { _count: { select: { balances: true, movements: true } } },
    })

    return ok({
      warehouse: {
        ...warehouse,
        productCount: warehouse._count?.balances ?? 0,
        movementCount: warehouse._count?.movements ?? 0,
      },
    }, "เก็บถาวรคลังสินค้าเรียบร้อย")
  } catch (error) {
    return handleError(error)
  }
}
