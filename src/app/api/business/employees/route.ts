// v1.4: Employees scoped to org membership (owner OR member can read, canWrite to write)
export const dynamic = "force-dynamic"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, handleError, forbidden, badRequest } from "@/lib/api-response"
import { requireModeUser, requireOrgAccess, canWrite } from "@/lib/authz"
import { z } from "zod"

const employeeSchema = z.object({
  organizationId: z.string().min(1),
  name:           z.string().min(1, "ชื่อพนักงานจำเป็น"),
  email:          z.string().email().optional().nullable(),
  phone:          z.string().optional().nullable(),
  position:       z.string().optional().nullable(),
  department:     z.string().optional().nullable(),
  employmentType: z.enum(["fulltime","parttime","contract","intern"]).default("fulltime"),
  startDate:      z.string().transform(d => new Date(d)),
  baseSalary:     z.number().positive("เงินเดือนต้องมากกว่า 0"),
  currency:       z.string().default("THB"),
  taxId:          z.string().optional().nullable(),
  socialSecId:    z.string().optional().nullable(),
  bankAccount:    z.string().optional().nullable(),
  bankName:       z.string().optional().nullable(),
})

export async function GET(req: NextRequest) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error
    const orgId = new URL(req.url).searchParams.get("organizationId")
    if (!orgId) return ok([])

    // v1.4: any org member can read employees
    const access = await requireOrgAccess(auth.user.id, orgId)
    if (!access) return forbidden()

    const employees = await prisma.employee.findMany({
      where: { organizationId: orgId, deletedAt: null },  // v1.9
      orderBy: [{ status: "asc" }, { name: "asc" }],
    })
    return ok(employees.map(e => ({ ...e, baseSalary: Number(e.baseSalary) })))
  } catch(e) { return handleError(e) }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error
    const body = await req.json()
    const parsed = employeeSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง")

    // v1.4: must have write permission
    const access = await requireOrgAccess(auth.user.id, parsed.data.organizationId)
    if (!access) return forbidden()
    if (!canWrite(access.role)) return forbidden()

    const emp = await prisma.employee.create({ data: parsed.data })
    return ok({ ...emp, baseSalary: Number(emp.baseSalary) })
  } catch(e) { return handleError(e) }
}
