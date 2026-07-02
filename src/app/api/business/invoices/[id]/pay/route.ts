export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireModeUser } from "@/lib/authz"
import { created, handleError, notFound } from "@/lib/api-response"
import { z } from "zod"

const schema = z.object({
  amount: z.number().positive(),
  method: z.string().min(1).max(50).default("bank_transfer"),
  reference: z.string().max(120).optional().nullable(),
  note: z.string().max(500).optional().nullable(),
  paidAt: z.string().optional().nullable(),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error
    const input = schema.parse(await req.json())

    const invoice = await prisma.invoice.findFirst({
      where: { id: params.id, deletedAt: null, organization: { ownerId: auth.user.id } },
      include: { payments: true },
    })
    if (!invoice) return notFound("ไม่พบ invoice")

    const payment = await prisma.invoicePayment.create({
      data: {
        invoiceId: invoice.id,
        amount: input.amount,
        method: input.method,
        reference: input.reference ?? null,
        note: input.note ?? null,
        paidAt: input.paidAt ? new Date(input.paidAt) : new Date(),
      },
    })

    const paidAmount = invoice.payments.reduce((sum, item) => sum + Number(item.amount), 0) + input.amount
    const total = Number(invoice.totalAmount)
    const status = paidAmount >= total ? "paid" : "partial"
    await prisma.invoice.update({ where: { id: invoice.id }, data: { status, paidAt: status === "paid" ? payment.paidAt : null } })

    return created({ payment: { ...payment, amount: Number(payment.amount) }, status }, "บันทึกรับชำระแล้ว")
  } catch (error) {
    return handleError(error)
  }
}
