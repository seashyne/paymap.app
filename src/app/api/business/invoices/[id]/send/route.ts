export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireModeUser } from "@/lib/authz"
import { ok, handleError, notFound } from "@/lib/api-response"

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error
    const invoice = await prisma.invoice.findFirst({
      where: { id: params.id, deletedAt: null, organization: { ownerId: auth.user.id } },
    })
    if (!invoice) return notFound("ไม่พบ invoice")

    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: invoice.status === "draft" ? "issued" : invoice.status, issuedAt: invoice.issuedAt ?? new Date() },
    })

    return ok({ invoiceId: updated.id, status: updated.status }, "เปลี่ยนสถานะเป็น issued แล้ว")
  } catch (error) {
    return handleError(error)
  }
}
