export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireModeUser } from "@/lib/authz"
import { handleError, notFound, ok } from "@/lib/api-response"
import { z } from "zod"

const patchSchema = z.object({
  customerName: z.string().min(1).max(120).optional(),
  customerEmail: z.string().email().nullable().optional(),
  note: z.string().max(1000).nullable().optional(),
  dueDate: z.string().nullable().optional(),
  status: z.enum(["draft", "issued", "paid", "partial", "overdue", "cancelled", "refunded"]).optional(),
})

async function getInvoice(userId: string, id: string) {
  return prisma.invoice.findFirst({
    where: { id, deletedAt: null, organization: { ownerId: userId } },
    include: { items: true, payments: true, organization: true },
  })
}

function serialise(invoice: any) {
  const paid = invoice.payments.reduce((sum: number, payment: any) => sum + Number(payment.amount), 0)
  return {
    ...invoice,
    subtotal: Number(invoice.subtotal),
    taxAmount: Number(invoice.taxAmount),
    totalAmount: Number(invoice.totalAmount),
    paidAmount: paid,
    balanceDue: Number(invoice.totalAmount) - paid,
    items: invoice.items.map((item: any) => ({ ...item, quantity: Number(item.quantity), unitPrice: Number(item.unitPrice), taxRate: Number(item.taxRate), lineTotal: Number(item.lineTotal) })),
    payments: invoice.payments.map((payment: any) => ({ ...payment, amount: Number(payment.amount) })),
  }
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error
    const invoice = await getInvoice(auth.user.id, params.id)
    if (!invoice) return notFound("ไม่พบ invoice")
    return ok({ invoice: serialise(invoice) })
  } catch (error) {
    return handleError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error
    const current = await getInvoice(auth.user.id, params.id)
    if (!current) return notFound("ไม่พบ invoice")

    const input = patchSchema.parse(await req.json())
    const invoice = await prisma.invoice.update({
      where: { id: current.id },
      data: {
        ...(input.customerName !== undefined ? { customerName: input.customerName } : {}),
        ...(input.customerEmail !== undefined ? { customerEmail: input.customerEmail } : {}),
        ...(input.note !== undefined ? { note: input.note } : {}),
        ...(input.dueDate !== undefined ? { dueDate: input.dueDate ? new Date(input.dueDate) : null } : {}),
        ...(input.status !== undefined ? { status: input.status, ...(input.status === "issued" && !current.issuedAt ? { issuedAt: new Date() } : {}) } : {}),
      },
      include: { items: true, payments: true, organization: true },
    })

    return ok({ invoice: serialise(invoice) }, "อัปเดต invoice แล้ว")
  } catch (error) {
    return handleError(error)
  }
}
