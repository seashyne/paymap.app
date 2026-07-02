export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, created, handleError } from "@/lib/api-response"
import { requireModeUser } from "@/lib/authz"
import { z } from "zod"

const storeSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
  taxId: z.string().optional(),
  vatRegistered: z.boolean().default(false),
  currency: z.string().default("THB"),
  bootstrapStarterKit: z.boolean().default(true),
})

export async function GET() {
  try {
    const auth = await requireModeUser("merchant")
    if ("error" in auth) return auth.error
    const stores = await prisma.store.findMany({ where: { userId: auth.user.id }, orderBy: { createdAt: "asc" } })
    return ok(stores)
  } catch (e) { return handleError(e) }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("merchant")
    if ("error" in auth) return auth.error
    const body = await req.json()
    const parsed = storeSchema.safeParse(body)
    if (!parsed.success) return handleError(parsed.error)

    const existingCount = await prisma.store.count({ where: { userId: auth.user.id } })
    const { bootstrapStarterKit, ...storeInput } = parsed.data

    const store = await prisma.$transaction(async (tx) => {
      const createdStore = await tx.store.create({ data: { ...storeInput, userId: auth.user.id } })

      if (bootstrapStarterKit && existingCount === 0) {
        const starterProducts = [
          { sku: "PM-001", name: "อเมริกาโน่", category: "Beverage", costPrice: 28, salePrice: 55, stockQty: 40, minStockQty: 10 },
          { sku: "PM-002", name: "ครัวซองต์เนยสด", category: "Bakery", costPrice: 22, salePrice: 49, stockQty: 24, minStockQty: 6 },
          { sku: "PM-003", name: "น้ำดื่ม 600ml", category: "Drink", costPrice: 7, salePrice: 15, stockQty: 60, minStockQty: 12 },
        ]

        for (const item of starterProducts) {
          const product = await tx.merchantProduct.create({
            data: {
              storeId: createdStore.id,
              status: "active",
              vatIncluded: true,
              unit: "ชิ้น",
              ...item,
            },
          })

          await tx.inventoryLog.create({
            data: {
              productId: product.id,
              type: "in",
              qty: item.stockQty,
              qtyBefore: 0,
              qtyAfter: item.stockQty,
              costPrice: item.costPrice,
              note: "Starter kit",
            },
          })
        }
      }

      return createdStore
    })

    return created(store, existingCount === 0 ? "สร้างร้านค้าและชุดข้อมูลเริ่มต้นสำเร็จ" : "สร้างร้านค้าสำเร็จ")
  } catch (e) { return handleError(e) }
}
