export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireModeUser } from "@/lib/authz"
import { badRequest, created, handleError, notFound, ok } from "@/lib/api-response"
import { getOwnedBusinessOrg } from "@/lib/business-org"

const db = prisma as any

const customerSchema = z.object({
  customerCode: z.string().trim().max(40).optional().nullable(),
  name: z.string().trim().min(1, "ชื่อลูกค้าจำเป็น").max(160),
  contactName: z.string().trim().max(120).optional().nullable(),
  email: z.union([z.string().email("อีเมลไม่ถูกต้อง"), z.literal("")]).optional().transform((value) => value || null),
  phone: z.string().trim().max(40).optional().nullable(),
  taxId: z.string().trim().max(40).optional().nullable(),
  branchName: z.string().trim().max(120).optional().nullable(),
  branchCode: z.string().trim().max(40).optional().nullable(),
  address: z.string().trim().max(1000).optional().nullable(),
  paymentTerms: z.number().int().min(0).max(365).optional().nullable(),
  currency: z.string().trim().min(3).max(8).default("THB"),
  note: z.string().trim().max(1000).optional().nullable(),
})

function serialiseCustomer(customer: any) {
  return {
    ...customer,
    invoiceCount: customer._count?.invoices ?? 0,
    quotationCount: customer._count?.quotations ?? 0,
  }
}

export async function GET() {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error

    const org = await getOwnedBusinessOrg(auth.user.id)
    if (!org) return notFound("ยังไม่มีองค์กรสำหรับ customer master")

    const customers = await db.customer.findMany({
      where: { organizationId: org.id, deletedAt: null },
      include: {
        _count: {
          select: {
            invoices: { where: { deletedAt: null } },
            quotations: true,
          },
        },
      },
      orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    })

    const summary = customers.reduce((acc, customer) => {
      acc.count += 1
      if (customer.isActive) acc.active += 1
      if (customer.email || customer.phone) acc.contactable += 1
      return acc
    }, { count: 0, active: 0, contactable: 0 })

    return ok({ items: customers.map(serialiseCustomer), summary })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error

    const org = await getOwnedBusinessOrg(auth.user.id)
    if (!org) return notFound("ยังไม่มีองค์กรสำหรับ customer master")

    const parsed = customerSchema.safeParse(await req.json())
    if (!parsed.success) return handleError(parsed.error)

    const input = parsed.data
    const normalizedCode = input.customerCode?.trim() || null

    if (!normalizedCode && !input.email && !input.phone && !input.taxId) {
      return badRequest("ควรมีข้อมูลอ้างอิงลูกค้าอย่างน้อย 1 รายการ เช่น อีเมล เบอร์โทร หรือเลขภาษี")
    }

    const customer = await db.customer.create({
      data: {
        organizationId: org.id,
        customerCode: normalizedCode,
        name: input.name,
        contactName: input.contactName?.trim() || null,
        email: input.email,
        phone: input.phone?.trim() || null,
        taxId: input.taxId?.trim() || null,
        branchName: input.branchName?.trim() || null,
        branchCode: input.branchCode?.trim() || null,
        address: input.address?.trim() || null,
        paymentTerms: input.paymentTerms ?? 30,
        currency: input.currency,
        note: input.note?.trim() || null,
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

    return created({ customer: serialiseCustomer(customer) }, "เพิ่มลูกค้าเข้าระบบสำเร็จ")
  } catch (error) {
    return handleError(error)
  }
}
