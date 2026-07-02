export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireModeUser } from "@/lib/authz"
import { handleError, notFound, ok } from "@/lib/api-response"

const db = prisma as any

const updateSchema = z.object({
  customerCode: z.string().trim().max(40).optional().nullable(),
  name: z.string().trim().min(1).max(160).optional(),
  contactName: z.string().trim().max(120).optional().nullable(),
  email: z.union([z.string().email("อีเมลไม่ถูกต้อง"), z.literal("")]).optional().transform((value) => value || null),
  phone: z.string().trim().max(40).optional().nullable(),
  taxId: z.string().trim().max(40).optional().nullable(),
  branchName: z.string().trim().max(120).optional().nullable(),
  branchCode: z.string().trim().max(40).optional().nullable(),
  address: z.string().trim().max(1000).optional().nullable(),
  paymentTerms: z.number().int().min(0).max(365).optional().nullable(),
  currency: z.string().trim().min(3).max(8).optional(),
  note: z.string().trim().max(1000).optional().nullable(),
  isActive: z.boolean().optional(),
})

async function getOwnedCustomer(customerId: string, userId: string) {
  return db.customer.findFirst({
    where: {
      id: customerId,
      organization: { ownerId: userId },
    },
    include: {
      _count: {
        select: {
          invoices: { where: { deletedAt: null } },
          quotations: true,
        },
      },
    },
  })
}

function serialiseCustomer(customer: any) {
  return {
    ...customer,
    invoiceCount: customer._count?.invoices ?? 0,
    quotationCount: customer._count?.quotations ?? 0,
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error

    const existing = await getOwnedCustomer(params.id, auth.user.id)
    if (!existing || existing.deletedAt) return notFound("ไม่พบลูกค้า")

    const parsed = updateSchema.safeParse(await req.json())
    if (!parsed.success) return handleError(parsed.error)

    const input = parsed.data
    const customer = await db.customer.update({
      where: { id: existing.id },
      data: {
        customerCode: input.customerCode === undefined ? undefined : input.customerCode?.trim() || null,
        name: input.name?.trim(),
        contactName: input.contactName === undefined ? undefined : input.contactName?.trim() || null,
        email: input.email === undefined ? undefined : input.email,
        phone: input.phone === undefined ? undefined : input.phone?.trim() || null,
        taxId: input.taxId === undefined ? undefined : input.taxId?.trim() || null,
        branchName: input.branchName === undefined ? undefined : input.branchName?.trim() || null,
        branchCode: input.branchCode === undefined ? undefined : input.branchCode?.trim() || null,
        address: input.address === undefined ? undefined : input.address?.trim() || null,
        paymentTerms: input.paymentTerms === undefined ? undefined : input.paymentTerms,
        currency: input.currency?.trim(),
        note: input.note === undefined ? undefined : input.note?.trim() || null,
        isActive: input.isActive,
      },
      include: {
        _count: {
          select: {
            invoices: { where: { deletedAt: null } },
            quotations: true,
          },
        },
      },
    })

    return ok({ customer: serialiseCustomer(customer) }, "อัปเดตข้อมูลลูกค้าสำเร็จ")
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error

    const existing = await getOwnedCustomer(params.id, auth.user.id)
    if (!existing || existing.deletedAt) return notFound("ไม่พบลูกค้า")

    const customer = await db.customer.update({
      where: { id: existing.id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            invoices: { where: { deletedAt: null } },
            quotations: true,
          },
        },
      },
    })

    return ok({ customer: serialiseCustomer(customer) }, "เก็บถาวรลูกค้าเรียบร้อย")
  } catch (error) {
    return handleError(error)
  }
}
