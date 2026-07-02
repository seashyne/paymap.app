export const dynamic = "force-dynamic"
import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { ok, handleError, notFound, badRequest } from "@/lib/api-response"
import { requireModeUser } from "@/lib/authz"

const schema = z.object({ status: z.enum(["confirmed", "cancelled"]).optional(), note: z.string().nullable().optional(), customerName: z.string().nullable().optional(), customerPhone: z.string().nullable().optional() })

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("merchant")
    if ("error" in auth) return auth.error
    const order = await prisma.salesOrder.findFirst({ where: { id: params.id, store: { userId: auth.user.id } }, include: { items: true } })
    if (!order) return notFound("ไม่พบ order")
    const data = schema.parse(await req.json())
    if (data.status === "cancelled" && order.status !== "cancelled") {
      await prisma.$transaction(async (tx) => {
        await tx.salesOrder.update({ where: { id: params.id }, data: { status: "cancelled", note: data.note ?? order.note, customerName: data.customerName ?? order.customerName, customerPhone: data.customerPhone ?? order.customerPhone } })
        for (const item of order.items) {
          const product = await tx.merchantProduct.findUnique({ where: { id: item.productId } })
          if (!product) continue
          const after = product.stockQty + item.qty
          await tx.merchantProduct.update({ where: { id: item.productId }, data: { stockQty: after } })
          await tx.inventoryLog.create({ data: { productId: item.productId, type: "return", qty: item.qty, qtyBefore: product.stockQty, qtyAfter: after, refType: "sale_void", refId: order.id, note: `Void ${order.orderNo}` } })
        }
      })
      return ok({ cancelled: true }, "Cancel order และคืน stock แล้ว")
    }
    const updated = await prisma.salesOrder.update({ where: { id: params.id }, data: { ...data } })
    return ok({ ...updated, subtotal: Number(updated.subtotal), vatAmount: Number(updated.vatAmount), totalAmount: Number(updated.totalAmount) }, "อัปเดต order แล้ว")
  } catch (e) { return handleError(e) }
}
