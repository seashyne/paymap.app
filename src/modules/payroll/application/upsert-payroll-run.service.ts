import { prisma } from "@/lib/prisma"
import { calculatePayroll } from "@/lib/business/payroll"
import { publishDomainEvent } from "@/modules/platform/events/bus"
import { DOMAIN_EVENTS } from "@/modules/platform/events/catalog"

export async function upsertPayrollRunService(params: {
  organizationId: string
  month: number
  year: number
  userId: string
  overrides?: Record<string, {
    otHours?: number
    bonus?: number
    commission?: number
    allowance?: number
    otherDeductions?: number
    annualIncome?: number
  }>
}) {
  const employees = await prisma.employee.findMany({
    where: { organizationId: params.organizationId, status: "active", deletedAt: null },
    orderBy: { createdAt: "asc" },
  })

  if (!employees.length) {
    throw new Error("ยังไม่มีพนักงาน active สำหรับรัน payroll")
  }

  const overrides = params.overrides ?? {}
  const items = employees.map((employee) => {
    const override = overrides[employee.id] ?? {}
    const payroll = calculatePayroll({
      baseSalary: Number(employee.baseSalary),
      otHours: override.otHours ?? 0,
      bonus: override.bonus ?? 0,
      commission: override.commission ?? 0,
      allowance: override.allowance ?? 0,
      otherDeductions: override.otherDeductions ?? 0,
      annualIncome: override.annualIncome,
    })

    return {
      employeeId: employee.id,
      baseSalary: payroll.baseSalary,
      otHours: override.otHours ?? 0,
      otAmount: payroll.otAmount,
      bonus: payroll.bonus,
      commission: payroll.commission,
      allowance: payroll.allowance,
      gross: payroll.grossSalary,
      wht: payroll.whtAmount,
      ssoEmployee: payroll.ssoEmployee,
      net: payroll.netSalary,
    }
  })

  const totalGross = items.reduce((sum, item) => sum + item.gross, 0)
  const totalNet = items.reduce((sum, item) => sum + item.net, 0)
  const totalWht = items.reduce((sum, item) => sum + item.wht, 0)
  const totalSso = items.reduce((sum, item) => sum + item.ssoEmployee, 0)

  const existingRun = await prisma.payrollRun.findUnique({
    where: {
      organizationId_month_year: {
        organizationId: params.organizationId,
        month: params.month,
        year: params.year,
      },
    },
    select: { id: true, status: true, paidAt: true },
  })

  const run = existingRun
    ? await prisma.payrollRun.update({
        where: { id: existingRun.id },
        data: {
          totalGross,
          totalNet,
          totalWht,
          totalSso,
          employeeCount: employees.length,
          status: existingRun.status === "paid" ? "approved" : existingRun.status,
          items: {
            deleteMany: {},
            create: items.map((item) => ({
              employeeId: item.employeeId,
              baseSalary: item.baseSalary,
              otHours: item.otHours,
              otAmount: item.otAmount,
              bonus: item.bonus,
              commission: item.commission,
              allowance: item.allowance,
              grossSalary: item.gross,
              whtAmount: item.wht,
              ssoEmployee: item.ssoEmployee,
              netSalary: item.net,
            })),
          },
        },
      })
    : await prisma.payrollRun.create({
        data: {
          organizationId: params.organizationId,
          month: params.month,
          year: params.year,
          totalGross,
          totalNet,
          totalWht,
          totalSso,
          employeeCount: employees.length,
          items: {
            create: items.map((item) => ({
              employeeId: item.employeeId,
              baseSalary: item.baseSalary,
              otHours: item.otHours,
              otAmount: item.otAmount,
              bonus: item.bonus,
              commission: item.commission,
              allowance: item.allowance,
              grossSalary: item.gross,
              whtAmount: item.wht,
              ssoEmployee: item.ssoEmployee,
              netSalary: item.net,
            })),
          },
        },
      })

  await publishDomainEvent(DOMAIN_EVENTS.payrollRunUpserted, {
    userId: params.userId,
    orgId: params.organizationId,
    payrollRunId: run.id,
    month: params.month,
    year: params.year,
    totalGross,
    totalNet,
    totalWht,
    totalSso,
    employeeCount: employees.length,
  })

  if (run.status === "paid") {
    await publishDomainEvent(DOMAIN_EVENTS.payrollRunPosted, {
      userId: params.userId,
      orgId: params.organizationId,
      payrollRunId: run.id,
      paidAt: run.paidAt?.toISOString() ?? null,
      totalGross,
      totalNet,
      totalWht,
      totalSso,
    })
  }

  return {
    run,
    existingRun,
    totals: { totalGross, totalNet, totalWht, totalSso, employeeCount: employees.length },
  }
}
