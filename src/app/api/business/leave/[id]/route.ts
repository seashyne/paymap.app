export const dynamic = "force-dynamic"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, handleError, forbidden, notFound, badRequest } from "@/lib/api-response"
import { requireModeUser, requireOrgAccess } from "@/lib/authz"
import { pushNotification } from "@/lib/notify"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error
    const body = await req.json()
    const leave = await prisma.leaveRequest.findUnique({ where: { id: params.id } })
    if (!leave) return notFound("ไม่พบรายการ")
    const access = await requireOrgAccess(auth.user.id, leave.organizationId)
    if (!access) return forbidden()
    if (!["owner","admin","manager"].includes(access.role)) return forbidden()
    const nextStatus = body.status
    if (!["approved","rejected","pending"].includes(nextStatus)) return badRequest("สถานะไม่ถูกต้อง")
    const updated = await prisma.leaveRequest.update({
      where: { id: params.id },
      data: {
        status: nextStatus,
        note: body.note,
        rejectedReason: nextStatus === "rejected" ? (body.rejectedReason ?? body.note ?? null) : null,
        approvedAt: nextStatus === "approved" ? new Date() : null,
        approvedById: nextStatus === "approved" ? auth.user.id : null,
      },
    })
    pushNotification({
      userId: auth.user.id,
      type: "approval_required",
      title: nextStatus === "approved" ? "✅ ใบลาได้รับการอนุมัติ" : nextStatus === "rejected" ? "❌ ใบลาถูกปฏิเสธ" : "⏳ ใบลาถูกเปิดใหม่",
      body: `Leave request ${params.id.slice(-6)} — ${nextStatus}`,
      payload: { leaveId: params.id, status: nextStatus },
    }).catch(() => {})
    return ok(updated)
  } catch(e) { return handleError(e) }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error
    const leave = await prisma.leaveRequest.findUnique({ where: { id: params.id } })
    if (!leave) return notFound("ไม่พบรายการ")
    const access = await requireOrgAccess(auth.user.id, leave.organizationId)
    if (!access || !["owner","admin"].includes(access.role)) return forbidden()
    await prisma.leaveRequest.delete({ where: { id: params.id } })
    return ok({ deleted: true })
  } catch(e) { return handleError(e) }
}
