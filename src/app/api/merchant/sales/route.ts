export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, created, handleError } from "@/lib/api-response"
import { requireModeUser } from "@/lib/authz"
import { z } from "zod"
import { bootstrapDomainEvents } from "@/modules/platform/events/bootstrap"
import { createMerchantSaleService } from "@/modules/merchant-sales/application/create-sale.service"

const saleItemSchema = z.object({
  productId: z.string(),
  qty: z.number().int().positive(),
  salePrice: z.number().positive(),
})

const saleSchema = z.object({
  storeId: z.string(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  paymentMethod: z.enum(["cash", "qr", "transfer", "card"]).default("cash"),
  items: z.array(saleItemSchema).min(1),
  note: z.string().optional(),
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

    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const orders = await prisma.salesOrder.findMany({
      where: { storeId, soldAt: { gte: start } },
      include: { items: { include: { product: { select: { name: true, sku: true } } } } },
      orderBy: { soldAt: "desc" },
      take: 100,
    })
    return ok(orders.map((order) => ({ ...order, subtotal: Number(order.subtotal), vatAmount: Number(order.vatAmount), totalAmount: Number(order.totalAmount) })))
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    bootstrapDomainEvents()
    const auth = await requireModeUser("merchant")
    if ("error" in auth) return auth.error
    const parsed = saleSchema.parse(await req.json())

    const { order } = await createMerchantSaleService({
      userId: auth.user.id,
      storeId: parsed.storeId,
      customerName: parsed.customerName,
      customerPhone: parsed.customerPhone,
      paymentMethod: parsed.paymentMethod,
      items: parsed.items,
      note: parsed.note,
    })

    return created(
      { ...order, subtotal: Number(order.subtotal), vatAmount: Number(order.vatAmount), totalAmount: Number(order.totalAmount) },
      "บันทึกการขายสำเร็จและ sync accounting ผ่าน event แล้ว"
    )
  } catch (error) {
    return handleError(error)
  }
}
