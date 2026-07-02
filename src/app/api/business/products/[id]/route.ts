export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireModeUser } from "@/lib/authz"
import { handleError, notFound, ok } from "@/lib/api-response"

const db = prisma as any

const updateSchema = z.object({
  sku: z.string().trim().max(60).optional().nullable(),
  name: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  category: z.string().trim().max(80).optional().nullable(),
  unit: z.string().trim().max(40).optional().nullable(),
  barcode: z.string().trim().max(80).optional().nullable(),
  costPrice: z.number().min(0).optional(),
  salePrice: z.number().min(0).optional(),
  vatRate: z.number().min(0).max(100).optional(),
  reorderPoint: z.number().int().min(0).optional(),
  currency: z.string().trim().min(3).max(8).optional(),
  status: z.enum(["active", "archived"]).optional(),
})

function serialiseProduct(product: any) {
  return {
    ...product,
    costPrice: Number(product.costPrice),
    salePrice: Number(product.salePrice),
    vatRate: Number(product.vatRate),
    totalQty: product.balances?.reduce((sum: number, balance: any) => sum + Number(balance.qtyOnHand), 0) ?? 0,
  }
}

async function getOwnedProduct(id: string, userId: string) {
  return db.product.findFirst({
    where: {
      id,
      organization: { ownerId: userId },
    },
    include: {
      balances: {
        include: { warehouse: { select: { id: true, name: true, code: true } } },
        orderBy: { warehouse: { name: "asc" } },
      },
    },
  })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error

    const existing = await getOwnedProduct(params.id, auth.user.id)
    if (!existing || existing.deletedAt) return notFound("ไม่พบสินค้า")

    const parsed = updateSchema.safeParse(await req.json())
    if (!parsed.success) return handleError(parsed.error)

    const product = await db.product.update({
      where: { id: existing.id },
      data: {
        sku: parsed.data.sku === undefined ? undefined : parsed.data.sku?.trim() || null,
        name: parsed.data.name?.trim(),
        description: parsed.data.description === undefined ? undefined : parsed.data.description?.trim() || null,
        category: parsed.data.category === undefined ? undefined : parsed.data.category?.trim() || null,
        unit: parsed.data.unit === undefined ? undefined : parsed.data.unit?.trim() || null,
        barcode: parsed.data.barcode === undefined ? undefined : parsed.data.barcode?.trim() || null,
        costPrice: parsed.data.costPrice,
        salePrice: parsed.data.salePrice,
        vatRate: parsed.data.vatRate,
        reorderPoint: parsed.data.reorderPoint,
        currency: parsed.data.currency?.trim(),
        status: parsed.data.status,
      },
      include: {
        balances: {
          include: { warehouse: { select: { id: true, name: true, code: true } } },
          orderBy: { warehouse: { name: "asc" } },
        },
      },
    })

    return ok({ product: serialiseProduct(product) }, "อัปเดตสินค้าเรียบร้อย")
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error

    const existing = await getOwnedProduct(params.id, auth.user.id)
    if (!existing || existing.deletedAt) return notFound("ไม่พบสินค้า")

    const product = await db.product.update({
      where: { id: existing.id },
      data: {
        status: "archived",
        deletedAt: new Date(),
      },
      include: {
        balances: {
          include: { warehouse: { select: { id: true, name: true, code: true } } },
          orderBy: { warehouse: { name: "asc" } },
        },
      },
    })

    return ok({ product: serialiseProduct(product) }, "เก็บถาวรสินค้าเรียบร้อย")
  } catch (error) {
    return handleError(error)
  }
}
