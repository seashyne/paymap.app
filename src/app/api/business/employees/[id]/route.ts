export const dynamic = "force-dynamic"
import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { ok, handleError, forbidden, notFound } from "@/lib/api-response"
import { requireModeUser, requireOrgAccess, canWrite } from "@/lib/authz"

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  baseSalary: z.coerce.number().positive().optional(),
  employmentType: z.enum(["fulltime","parttime","contract","intern"]).optional(),
  status: z.enum(["active","on_leave","resigned","terminated"]).optional(),
  bankName: z.string().nullable().optional(),
  bankAccount: z.string().nullable().optional(),
  taxId: z.string().nullable().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error
    const employee = await prisma.employee.findUnique({ where: { id: params.id } })
    if (!employee || employee.deletedAt) return notFound("ไม่พบพนักงาน")
    const access = await requireOrgAccess(auth.user.id, employee.organizationId)
    if (!access || !canWrite(access.role)) return forbidden()
    const data = updateSchema.parse(await req.json())
    const updated = await prisma.employee.update({ where: { id: params.id }, data })
    return ok({ ...updated, baseSalary: Number(updated.baseSalary) }, "บันทึกพนักงานแล้ว")
  } catch (e) { return handleError(e) }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error
    const employee = await prisma.employee.findUnique({ where: { id: params.id } })
    if (!employee || employee.deletedAt) return notFound("ไม่พบพนักงาน")
    const access = await requireOrgAccess(auth.user.id, employee.organizationId)
    if (!access || !canWrite(access.role)) return forbidden()
    await prisma.employee.update({ where: { id: params.id }, data: { deletedAt: new Date(), status: "terminated" } })
    return ok({ archived: true }, "Archive พนักงานแล้ว")
  } catch (e) { return handleError(e) }
}
