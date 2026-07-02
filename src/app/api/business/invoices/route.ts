export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireModeUser } from "@/lib/authz"
import { created, handleError, notFound, ok } from "@/lib/api-response"
import { getOwnedBusinessOrg } from "@/lib/business-org"
import { z } from "zod"

const db = prisma as any

const itemSchema = z.object({
  description: z.string().min(1).max(200),
  quantity: z.number().positive().default(1),
  unitPrice: z.number().nonnegative(),
  taxRate: z.number().min(0).max(100).default(0),
})

const createSchema = z.object({
  customerId: z.string().min(1).optional().nullable(),
  customerName: z.string().min(1).max(120).optional(),
  customerEmail: z.string().email().optional().nullable(),
  currency: z.string().min(3).max(8).default("THB"),
  note: z.string().max(1000).optional().nullable(),
  dueDate: z.string().optional().nullable(),
  issueNow: z.boolean().default(true),
  items: z.array(itemSchema).min(1),
}).superRefine((value, ctx) => {
  if (!value.customerId && !value.customerName?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["customerName"],
      message: "กรุณาเลือกลูกค้าหรือระบุชื่อลูกค้า",
    })
  }
})

function serialiseInvoice(invoice: any) {
  const paid = invoice.payments?.reduce((sum: number, payment: any) => sum + Number(payment.amount), 0) ?? 0
  return {
    ...invoice,
    subtotal: Number(invoice.subtotal),
    taxAmount: Number(invoice.taxAmount),
    totalAmount: Number(invoice.totalAmount),
    paidAmount: paid,
    balanceDue: Number(invoice.totalAmount) - paid,
    items: (invoice.items ?? []).map((item: any) => ({
      ...item,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      taxRate: Number(item.taxRate),
      lineTotal: Number(item.lineTotal),
    })),
    payments: (invoice.payments ?? []).map((payment: any) => ({
      ...payment,
      amount: Number(payment.amount),
    })),
  }
}

export async function GET() {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error

    const org = await getOwnedBusinessOrg(auth.user.id)
    if (!org) return notFound("ยังไม่มีองค์กรสำหรับออกใบแจ้งหนี้")

    const invoices = await db.invoice.findMany({
      where: { organizationId: org.id, deletedAt: null },
      include: { items: true, payments: true, customer: true },
      orderBy: { createdAt: "desc" },
    })

    const summary = invoices.reduce((acc, invoice) => {
      const total = Number(invoice.totalAmount)
      const paid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
      acc.count += 1
      acc.total += total
      acc.paid += paid
      acc.outstanding += Math.max(0, total - paid)
      if (["issued", "partial", "overdue"].includes(invoice.status)) acc.open += 1
      return acc
    }, { count: 0, total: 0, paid: 0, outstanding: 0, open: 0 })

    return ok({ items: invoices.map(serialiseInvoice), summary })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error

    const org = await getOwnedBusinessOrg(auth.user.id)
    if (!org) return notFound("ยังไม่มีองค์กรสำหรับออกใบแจ้งหนี้")

    const input = createSchema.parse(await req.json())
    const customer = input.customerId
      ? await db.customer.findFirst({
          where: { id: input.customerId, organizationId: org.id, deletedAt: null, isActive: true },
        })
      : null

    if (input.customerId && !customer) {
      return notFound("ไม่พบลูกค้าใน customer master")
    }

    const resolvedCustomerName = customer?.name ?? input.customerName?.trim() ?? ""
    const resolvedCustomerEmail = customer?.email ?? input.customerEmail ?? null
    const subtotal = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const taxAmount = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice * (item.taxRate / 100), 0)
    const totalAmount = subtotal + taxAmount
    const sequence = (await db.invoice.count({ where: { organizationId: org.id } })) + 1
    const number = `INV-${new Date().getFullYear()}-${String(sequence).padStart(4, "0")}`
    const issuedAt = input.issueNow ? new Date() : null

    const invoice = await db.invoice.create({
      data: {
        organizationId: org.id,
        customerId: customer?.id ?? null,
        number,
        customerName: resolvedCustomerName,
        customerEmail: resolvedCustomerEmail,
        status: input.issueNow ? "issued" : "draft",
        currency: input.currency,
        subtotal,
        taxAmount,
        totalAmount,
        note: input.note ?? null,
        issuedAt,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        items: {
          create: input.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            lineTotal: item.quantity * item.unitPrice * (1 + item.taxRate / 100),
          })),
        },
      },
      include: { items: true, payments: true, customer: true },
    })

    return created({ invoice: serialiseInvoice(invoice) }, "สร้างใบแจ้งหนี้สำเร็จ")
  } catch (error) {
    return handleError(error)
  }
}
