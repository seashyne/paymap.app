import { prisma } from "@/lib/prisma"
import { calculatePayroll, formatPayslipData } from "@/lib/business/payroll"
import { logModuleEvent } from "@/modules/platform/observability/log"

export async function getPayrollOpsService(userId: string) {
  const org = await prisma.organization.findFirst({ where: { ownerId: userId } })
  if (!org) return { employees: [], payrollRun: null, yearToDateWht: 0 }

  const [employees, payrollRun, yearToDate] = await Promise.all([
    prisma.employee.findMany({ where: { organizationId: org.id, status: "active", deletedAt: null }, orderBy: { name: "asc" }, take: 25 }),
    prisma.payrollRun.findFirst({ where: { organizationId: org.id }, orderBy: [{ year: "desc" }, { month: "desc" }], include: { items: { include: { employee: true } } } }),
    prisma.payrollItem.aggregate({ where: { payrollRun: { organizationId: org.id, year: new Date().getFullYear() } }, _sum: { whtAmount: true } }),
  ])

  logModuleEvent("payroll", "ops.loaded", { userId, orgId: org.id, employeeCount: employees.length })

  return {
    payrollRun: payrollRun ? {
      id: payrollRun.id,
      month: payrollRun.month,
      year: payrollRun.year,
      status: payrollRun.status,
      totalGross: Number(payrollRun.totalGross),
      totalNet: Number(payrollRun.totalNet),
      totalWht: Number(payrollRun.totalWht),
      totalSso: Number(payrollRun.totalSso),
    } : null,
    yearToDateWht: Number(yearToDate._sum.whtAmount ?? 0),
    employees: employees.map((employee) => {
      const payroll = calculatePayroll({ baseSalary: Number(employee.baseSalary) })
      return {
        id: employee.id,
        name: employee.name,
        position: employee.position,
        department: employee.department,
        baseSalary: Number(employee.baseSalary),
        netSalary: payroll.netSalary,
        ssoEmployee: payroll.ssoEmployee,
        whtAmount: payroll.whtAmount,
        payslipPreview: formatPayslipData(employee, payroll, { month: new Date().getMonth() + 1, year: new Date().getFullYear() }),
      }
    }),
  }
}
