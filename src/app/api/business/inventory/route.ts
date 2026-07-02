export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireModeUser } from "@/lib/authz"
import { handleError, notFound, ok } from "@/lib/api-response"
import { getOwnedBusinessOrg } from "@/lib/business-org"

const db = prisma as any

const adjustSchema = z.object({
  productId: z.string().min(1),
  warehouseId: z.string().min(1),
  movement: z.enum(["in", "out", "adjust", "return"]),
  qty: z.number().int().min(0),
  unitCost: z.number().min(0).optional().nullable(),
  note: z.string().trim().max(400).optional().nullable(),
})

export async function GET() {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error

    const org = await getOwnedBusinessOrg(auth.user.id)
    if (!org) return notFound("ยังไม่มีองค์กรสำหรับ inventory")

    const [balances, recent] = await Promise.all([
      db.inventoryBalance.findMany({
        where: { warehouse: { organizationId: org.id, deletedAt: null }, product: { deletedAt: null } },
        include: {
          product: { select: { id: true, name: true, sku: true, reorderPoint: true, unit: true } },
          warehouse: { select: { id: true, name: true, code: true } },
        },
        orderBy: [{ warehouse: { name: "asc" } }, { product: { name: "asc" } }],
      }),
      db.inventoryMovementLog.findMany({
        where: { warehouse: { organizationId: org.id, deletedAt: null }, product: { deletedAt: null } },
        include: {
          product: { select: { id: true, name: true, sku: true, unit: true } },
          warehouse: { select: { id: true, name: true, code: true } },
        },
        orderBy: { movedAt: "desc" },
        take: 12,
      }),
    ])

    const lowStock = balances.filter((balance: any) => balance.qtyOnHand <= balance.product.reorderPoint)

    return ok({
      balances: balances.map((balance: any) => ({
        ...balance,
        avgCost: Number(balance.avgCost),
      })),
      lowStock,
      recent: recent.map((movement: any) => ({
        ...movement,
        unitCost: movement.unitCost == null ? null : Number(movement.unitCost),
      })),
    })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error

    const org = await getOwnedBusinessOrg(auth.user.id)
    if (!org) return notFound("ยังไม่มีองค์กรสำหรับ inventory")

    const parsed = adjustSchema.safeParse(await req.json())
    if (!parsed.success) return handleError(parsed.error)

    const input = parsed.data
    const [product, warehouse] = await Promise.all([
      db.product.findFirst({ where: { id: input.productId, organizationId: org.id, deletedAt: null } }),
      db.warehouse.findFirst({ where: { id: input.warehouseId, organizationId: org.id, deletedAt: null, isActive: true } }),
    ])

    if (!product) return notFound("ไม่พบสินค้า")
    if (!warehouse) return notFound("ไม่พบคลังสินค้า")

    const result = await db.$transaction(async (tx: any) => {
      const balance = await tx.inventoryBalance.findUnique({
        where: { productId_warehouseId: { productId: product.id, warehouseId: warehouse.id } },
      })

      const qtyBefore = balance?.qtyOnHand ?? 0
      const qtyAfter = input.movement === "adjust"
        ? input.qty
        : ["in", "return"].includes(input.movement)
          ? qtyBefore + input.qty
          : qtyBefore - input.qty

      if (qtyAfter < 0) {
        throw new Error("สต็อกไม่พอสำหรับการตัดออก")
      }

      const nextAvgCost = input.unitCost != null
        ? input.unitCost
        : balance?.avgCost ?? product.costPrice

      await tx.inventoryBalance.upsert({
        where: { productId_warehouseId: { productId: product.id, warehouseId: warehouse.id } },
        create: {
          productId: product.id,
          warehouseId: warehouse.id,
          qtyOnHand: qtyAfter,
          avgCost: nextAvgCost,
        },
        update: {
          qtyOnHand: qtyAfter,
          avgCost: nextAvgCost,
        },
      })

      const movement = await tx.inventoryMovementLog.create({
        data: {
          productId: product.id,
          warehouseId: warehouse.id,
          movement: input.movement,
          qty: input.qty,
          qtyBefore,
          qtyAfter,
          unitCost: input.unitCost ?? null,
          note: input.note?.trim() || null,
        },
      })

      return { movement, qtyBefore, qtyAfter }
    })

    return ok({
      productId: product.id,
      warehouseId: warehouse.id,
      movement: result.movement,
      qtyBefore: result.qtyBefore,
      qtyAfter: result.qtyAfter,
    }, "บันทึกการเคลื่อนไหวสต็อกเรียบร้อย")
  } catch (error) {
    return handleError(error)
  }
}
