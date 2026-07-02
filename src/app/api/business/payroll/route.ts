export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, handleError, forbidden, badRequest } from "@/lib/api-response"
import { requireModeUser, requireOrgAccess } from "@/lib/authz"
import { sendPayrollCompletedEmail } from "@/lib/email"
import { pushNotification } from "@/lib/notify"
import { z } from "zod"
import { bootstrapDomainEvents } from "@/modules/platform/events/bootstrap"
import { upsertPayrollRunService } from "@/modules/payroll/application/upsert-payroll-run.service"

const runSchema = z.object({
  organizationId: z.string(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020),
  overrides: z
    .record(
      z.object({
        otHours: z.number().optional(),
        bonus: z.number().optional(),
        commission: z.number().optional(),
        allowance: z.number().optional(),
        otherDeductions: z.number().optional(),
        annualIncome: z.number().optional(),
      })
    )
    .optional(),
})

export async function GET(req: NextRequest) {
  try {
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error

    const orgId = new URL(req.url).searchParams.get("organizationId")
    if (!orgId) return ok([])

    const access = await requireOrgAccess(auth.user.id, orgId)
    if (!access) return forbidden()

    const runs = await prisma.payrollRun.findMany({
      where: { organizationId: orgId },
      include: { items: { include: { employee: { select: { name: true, position: true } } } } },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 12,
    })

    return ok(
      runs.map((run) => ({
        ...run,
        totalGross: Number(run.totalGross),
        totalNet: Number(run.totalNet),
        totalWht: Number(run.totalWht),
        totalSso: Number(run.totalSso),
        items: run.items.map((item) => ({
          ...item,
          baseSalary: Number(item.baseSalary),
          otAmount: Number(item.otAmount),
          bonus: Number(item.bonus),
          commission: Number(item.commission),
          allowance: Number(item.allowance),
          grossSalary: Number(item.grossSalary),
          netSalary: Number(item.netSalary),
          whtAmount: Number(item.whtAmount),
          ssoEmployee: Number(item.ssoEmployee),
        })),
      }))
    )
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    bootstrapDomainEvents()
    const auth = await requireModeUser("business")
    if ("error" in auth) return auth.error

    const parsed = runSchema.safeParse(await req.json())
    if (!parsed.success) {
      return badRequest(parsed.error.errors[0]?.message ?? "ข้อมูลไม่ถูกต้อง")
    }

    const access = await requireOrgAccess(auth.user.id, parsed.data.organizationId)
    if (!access) return forbidden()
    if (!["owner", "admin", "accountant"].includes(access.role)) return forbidden()

    const { run, existingRun, totals } = await upsertPayrollRunService({
      organizationId: parsed.data.organizationId,
      month: parsed.data.month,
      year: parsed.data.year,
      userId: auth.user.id,
      overrides: parsed.data.overrides,
    })

    const monthLabel = `${parsed.data.month}/${parsed.data.year}`
    pushNotification({
      userId: auth.user.id,
      type: "monthly_report",
      title: `✅ Payroll ${monthLabel} เสร็จสิ้น`,
      body: `${totals.employeeCount} คน — Net ฿${totals.totalNet.toLocaleString()}`,
      payload: { runId: run.id, month: parsed.data.month, year: parsed.data.year },
    }).catch(() => {})

    sendPayrollCompletedEmail(auth.user.email, auth.user.name, access.org.id, monthLabel, totals.totalNet, totals.employeeCount).catch(console.error)

    return ok(
      {
        id: run.id,
        totalGross: totals.totalGross,
        totalNet: totals.totalNet,
        totalWht: totals.totalWht,
        totalSso: totals.totalSso,
        employeeCount: totals.employeeCount,
        status: run.status,
        replacedExisting: Boolean(existingRun),
      },
      existingRun ? "อัปเดต payroll run เดิมแล้ว" : "สร้าง payroll run สำเร็จ"
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes("ยังไม่มีพนักงาน active")) {
      return badRequest(error.message)
    }
    return handleError(error)
  }
}
