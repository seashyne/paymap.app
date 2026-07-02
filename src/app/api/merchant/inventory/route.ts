export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, handleError } from "@/lib/api-response"
import { requireModeUser } from "@/lib/authz"
import { z } from "zod"

const adjustSchema = z.object({
  productId: z.string(),
  type:      z.enum(["in","out","adjust","return"]),
  qty:       z.number().int(),
  costPrice: z.number().optional(),
  note:      z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const auth = await requireModeUser("merchant")
    if ("error" in auth) return auth.error
    const { searchParams } = new URL(req.url)
    const storeId = searchParams.get("storeId")
    if (!storeId) return ok([])
    // Low-stock summary
    const lowStock = await prisma.merchantProduct.findMany({
      where: { storeId, status: "active" },
      select: { id: true, name: true, sku: true, stockQty: true, minStockQty: true, unit: true },
      orderBy: { stockQty: "asc" },
    })
    return ok({ lowStock: lowStock.filter(p => p.stockQty <= p.minStockQty), all: lowStock })
  } catch(e) { return handleError(e) }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("merchant")
    if ("error" in auth) return auth.error
    const body = await req.json()
    const parsed = adjustSchema.safeParse(body)
    if (!parsed.success) return handleError(parsed.error)

    const product = await prisma.merchantProduct.findFirst({ where: { id: parsed.data.productId, store: { userId: auth.user.id } } })
    if (!product) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })

    const qtyBefore = product.stockQty
    const delta = ["in","return"].includes(parsed.data.type) ? parsed.data.qty : -parsed.data.qty
    const qtyAfter = parsed.data.type === "adjust" ? parsed.data.qty : qtyBefore + delta

    await prisma.$transaction([
      prisma.merchantProduct.update({ where: { id: product.id }, data: { stockQty: qtyAfter } }),
      prisma.inventoryLog.create({ data: { productId: product.id, type: parsed.data.type, qty: parsed.data.qty, qtyBefore, qtyAfter, costPrice: parsed.data.costPrice, note: parsed.data.note } }),
    ])

    return ok({ productId: product.id, qtyBefore, qtyAfter, adjustment: parsed.data })
  } catch(e) { return handleError(e) }
}
