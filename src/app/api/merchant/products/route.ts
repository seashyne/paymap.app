export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, created, handleError } from "@/lib/api-response"
import { requireModeUser } from "@/lib/authz"
import { z } from "zod"

const productSchema = z.object({
  storeId: z.string(),
  name: z.string().min(1, "ชื่อสินค้าจำเป็น"),
  sku: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  costPrice: z.number().min(0),
  salePrice: z.number().positive("ราคาขายต้องมากกว่า 0"),
  vatIncluded: z.boolean().default(true),
  stockQty: z.number().int().min(0).default(0),
  minStockQty: z.number().int().min(0).default(5),
  unit: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  try {
    const auth = await requireModeUser("merchant")
    if ("error" in auth) return auth.error
    const { searchParams } = new URL(req.url)
    const storeId = searchParams.get("storeId")
    if (!storeId) return ok([])
    const store = await prisma.store.findFirst({ where: { id: storeId, userId: auth.user.id } })
    if (!store) return ok([])

    const lowStock = searchParams.get("lowStock") === "true"
    const products = await prisma.merchantProduct.findMany({
      where: { storeId, status: "active", ...(lowStock ? { stockQty: { lte: 10 } } : {}) },
      orderBy: { name: "asc" },
    })
    return ok(products.map((p) => ({ ...p, costPrice: Number(p.costPrice), salePrice: Number(p.salePrice) })))
  } catch (e) { return handleError(e) }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("merchant")
    if ("error" in auth) return auth.error
    const body = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) return handleError(parsed.error)
    const store = await prisma.store.findFirst({ where: { id: parsed.data.storeId, userId: auth.user.id } })
    if (!store) return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 })

    const product = await prisma.merchantProduct.create({ data: { ...parsed.data, status: "active" } })

    if (parsed.data.stockQty > 0) {
      await prisma.inventoryLog.create({
        data: { productId: product.id, type: "in", qty: parsed.data.stockQty, qtyBefore: 0, qtyAfter: parsed.data.stockQty, note: "Initial stock", costPrice: parsed.data.costPrice },
      })
    }

    return created({ ...product, costPrice: Number(product.costPrice), salePrice: Number(product.salePrice) }, "เพิ่มสินค้าสำเร็จ")
  } catch (e) { return handleError(e) }
}
