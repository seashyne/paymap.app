export const dynamic = "force-dynamic"
import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { ok, handleError, forbidden, notFound } from "@/lib/api-response"
import { requireModeUser, requireOrgAccess } from "@/lib/authz"
import { postPayrollRunToJournal } from "@/lib/accounting/auto-post"

const schema = z.object({ action: z.enum(["approve", "pay", "reopen"]), note: z.string().optional() })

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error
    const run = await prisma.payrollRun.findUnique({ where: { id: params.id } })
    if (!run) return notFound("ไม่พบ payroll run")
    const access = await requireOrgAccess(auth.user.id, run.organizationId)
    if (!access || !["owner","admin","accountant","manager"].includes(access.role)) return forbidden()
    const body = schema.parse(await req.json())
    const data: any = { note: body.note ?? run.note }
    if (body.action === "approve") {
      data.status = "approved"
      data.approvedAt = new Date()
      data.approvedById = auth.user.id
    } else if (body.action === "pay") {
      data.status = "paid"
      data.paidAt = new Date()
    } else {
      data.status = "draft"
      data.approvedAt = null
      data.approvedById = null
      data.paidAt = null
    }
    const updated = await prisma.payrollRun.update({ where: { id: params.id }, data })
    if (body.action === "pay") {
      await postPayrollRunToJournal({
        userId: auth.user.id,
        orgId: run.organizationId,
        payrollRunId: updated.id,
        paidAt: updated.paidAt,
        totalGross: Number(updated.totalGross),
        totalNet: Number(updated.totalNet),
        totalWht: Number(updated.totalWht),
        totalSso: Number(updated.totalSso),
      })
    }
    return ok({ ...updated, totalGross: Number(updated.totalGross), totalNet: Number(updated.totalNet), totalWht: Number(updated.totalWht), totalSso: Number(updated.totalSso) }, "อัปเดต payroll run แล้ว")
  } catch (e) { return handleError(e) }
}
