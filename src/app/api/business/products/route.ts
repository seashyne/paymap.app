export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireModeUser } from "@/lib/authz"
import { created, handleError, notFound, ok } from "@/lib/api-response"
import { getOwnedBusinessOrg } from "@/lib/business-org"

const db = prisma as any

const productSchema = z.object({
  sku: z.string().trim().max(60).optional().nullable(),
  name: z.string().trim().min(1, "ชื่อสินค้าจำเป็น").max(160),
  description: z.string().trim().max(1000).optional().nullable(),
  category: z.string().trim().max(80).optional().nullable(),
  unit: z.string().trim().max(40).optional().nullable(),
  barcode: z.string().trim().max(80).optional().nullable(),
  costPrice: z.number().min(0),
  salePrice: z.number().min(0),
  vatRate: z.number().min(0).max(100).default(7),
  reorderPoint: z.number().int().min(0).default(0),
  currency: z.string().trim().min(3).max(8).default("THB"),
  initialWarehouseId: z.string().optional().nullable(),
  initialQty: z.number().int().min(0).default(0),
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

export async function GET() {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error

    const org = await getOwnedBusinessOrg(auth.user.id)
    if (!org) return notFound("ยังไม่มีองค์กรสำหรับ product master")

    const products = await db.product.findMany({
      where: { organizationId: org.id, deletedAt: null },
      include: {
        balances: {
          include: { warehouse: { select: { id: true, name: true, code: true } } },
          orderBy: { warehouse: { name: "asc" } },
        },
      },
      orderBy: [{ status: "asc" }, { name: "asc" }],
    })

    const summary = products.reduce((acc: any, product: any) => {
      const totalQty = product.balances?.reduce((sum: number, balance: any) => sum + Number(balance.qtyOnHand), 0) ?? 0
      acc.count += 1
      acc.qty += totalQty
      if (product.status === "active") acc.active += 1
      if (totalQty <= product.reorderPoint) acc.lowStock += 1
      return acc
    }, { count: 0, active: 0, qty: 0, lowStock: 0 })

    return ok({ items: products.map(serialiseProduct), summary })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error

    const org = await getOwnedBusinessOrg(auth.user.id)
    if (!org) return notFound("ยังไม่มีองค์กรสำหรับ product master")

    const parsed = productSchema.safeParse(await req.json())
    if (!parsed.success) return handleError(parsed.error)

    const input = parsed.data
    const initialWarehouse = input.initialWarehouseId
      ? await db.warehouse.findFirst({
          where: { id: input.initialWarehouseId, organizationId: org.id, deletedAt: null, isActive: true },
        })
      : null

    if (input.initialWarehouseId && !initialWarehouse) {
      return notFound("ไม่พบคลังสินค้าที่เลือก")
    }

    const product = await db.$transaction(async (tx: any) => {
      const createdProduct = await tx.product.create({
        data: {
          organizationId: org.id,
          sku: input.sku?.trim() || null,
          name: input.name,
          description: input.description?.trim() || null,
          category: input.category?.trim() || null,
          unit: input.unit?.trim() || "ชิ้น",
          barcode: input.barcode?.trim() || null,
          costPrice: input.costPrice,
          salePrice: input.salePrice,
          vatRate: input.vatRate,
          reorderPoint: input.reorderPoint,
          currency: input.currency,
          status: "active",
        },
      })

      if (initialWarehouse && input.initialQty > 0) {
        await tx.inventoryBalance.create({
          data: {
            productId: createdProduct.id,
            warehouseId: initialWarehouse.id,
            qtyOnHand: input.initialQty,
            avgCost: input.costPrice,
          },
        })
        await tx.inventoryMovementLog.create({
          data: {
            productId: createdProduct.id,
            warehouseId: initialWarehouse.id,
            movement: "in",
            qty: input.initialQty,
            qtyBefore: 0,
            qtyAfter: input.initialQty,
            unitCost: input.costPrice,
            note: "Initial stock",
          },
        })
      }

      return tx.product.findUnique({
        where: { id: createdProduct.id },
        include: {
          balances: {
            include: { warehouse: { select: { id: true, name: true, code: true } } },
            orderBy: { warehouse: { name: "asc" } },
          },
        },
      })
    })

    return created({ product: serialiseProduct(product) }, "เพิ่มสินค้าเรียบร้อย")
  } catch (error) {
    return handleError(error)
  }
}
