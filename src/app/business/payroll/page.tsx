import AppFrame from "@/components/layout/AppFrame"
import ModuleGrid from "@/shared/components/dashboard/ModuleGrid"
import { requireModePage } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { getCurrentSession, normalizeAccountMode } from "@/lib/session"
import { DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { getCurrentPlan } from "@/lib/subscription/current-plan"
import { CalendarClock, FileSpreadsheet, Landmark, Users } from "lucide-react"
import BusinessPayrollWorkbench from "@/components/dashboard-v521/BusinessPayrollWorkbench"
import { detectSiteLang } from "@/lib/i18n/site"
import { getWorkspaceMessages } from "@/lib/i18n/workspace"
import { ProductHero, ProductQuickLinks, ProductSection } from "@/components/product/ProductMasterSurface"

export const metadata = { title: "Business Payroll — PayMap" }

export default async function BusinessPayrollPage() {
  const user = await requireModePage("business")
  const lang = detectSiteLang()
  const wm = getWorkspaceMessages(lang)
  const session = await getCurrentSession()
  const org = await prisma.organization.findFirst({ where: { ownerId: user.id } })
  const year = new Date().getFullYear()
  const month = new Date().getMonth() + 1
  const [employeeCount, pendingLeave, payrollRun, latestRuns, employees, pendingLeaves] = org ? await Promise.all([
    prisma.employee.count({ where: { organizationId: org.id, status: "active", deletedAt: null } }),
    prisma.leaveRequest.count({ where: { organizationId: org.id, status: "pending" } }),
    prisma.payrollRun.findFirst({ where: { organizationId: org.id, year, month } }),
    prisma.payrollRun.findMany({ where: { organizationId: org.id }, orderBy: [{ year: "desc" }, { month: "desc" }], take: 6 }),
    prisma.employee.findMany({ where: { organizationId: org.id, deletedAt: null }, orderBy: { name: "asc" }, select: { id: true, name: true, position: true, department: true, baseSalary: true } }),
    prisma.leaveRequest.findMany({ where: { organizationId: org.id }, include: { employee: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 8 }),
  ]) : [0, 0, null, [], [], []]

  const currentPlan = getCurrentPlan(user, "business")

  const nav = [
    { href: "/business", label: wm.common.overview, accent: "#38bdf8", active: false },
    { href: "/business/payroll", label: wm.common.payroll, accent: "#38bdf8", active: true },
    { href: "/business/accounting", label: wm.common.accounting, accent: "#14b8a6", active: false },
    { href: "/reports/financial", label: wm.common.reports, accent: "#14b8a6", active: false },
    { href: "/settings/legal", label: wm.common.legalCenter, accent: "#8b5cf6", active: false },
  ]

  return (
    <AppFrame
      brand="payMap Business"
      icon="💼"
      version={`${DASHBOARD_VERSION_LABEL} · Payroll`}
      title={wm.business.payrollPage.title}
      subtitle={wm.business.payrollPage.subtitle}
      accent="#38bdf8"
      planLabel={currentPlan}
      accountMode={normalizeAccountMode(session?.accountMode ?? "business")}
      nav={nav}
    >
      <div className="space-y-6">
        <ProductHero eyebrow="Business payroll" title="Business payroll operating cockpit" description="หน้า payroll ของ PayMap Business ถูกจัดใหม่เป็น operation cockpit สำหรับพนักงาน, การลา และ payroll close โดยใช้ข้อมูลจริงจาก organization เดิมของคุณทั้งหมด" badge="Business mode" accent="#38bdf8" stats={[{ label: "Employees", value: String(employeeCount), hint: "active roster" }, { label: "Pending leave", value: String(pendingLeave), hint: "approval queue" }, { label: "Current run", value: payrollRun ? payrollRun.status : wm.common.setup, hint: `${month}/${year}` }]} />
        <ProductQuickLinks links={[
          { href: "/business", title: "Back to business overview", description: "กลับไปดู cashflow, customers และ status ของทั้ง workspace ธุรกิจ" },
          { href: "/business/accounting", title: "Open accounting follow-up", description: "ต่อ payroll เข้าสู่ journal, ledger และ month-end close" },
          { href: "/reports", title: "Open reports center", description: "ดู payroll impact เทียบกับ personal และ merchant ใน reports center" },
        ]} />
        <ProductSection title={wm.business.payrollPage.moduleTitle} description={wm.business.payrollPage.moduleBody}>
          <ModuleGrid
            title="Payroll operations"
            subtitle="ทางลัดงานที่ใช้จริงในโหมดธุรกิจ โดยซ่อน API-only ออกจาก flow หลักแล้ว"
            items={[
              { href: "/api/business/employees", label: "Employees API", description: "จัดการ employee master data เพื่อให้ payroll และ leave ทำงานครบ", icon: Users, accent: "#38bdf8", stats: [{ label: "Active", value: String(employeeCount) }, { label: "Org", value: org?.name ?? "Not setup" }] },
              { href: "/api/business/leave", label: "Leave requests", description: "ดูและอนุมัติคำขอลาหรือเชื่อมไป approval workflow", icon: CalendarClock, accent: "#8b5cf6", stats: [{ label: "Pending", value: String(pendingLeave) }, { label: "Policy", value: "Ready" }] },
              { href: "/api/business/payroll", label: "Run payroll", description: "เริ่มหรืออัปเดต payroll run ของเดือนปัจจุบันจาก route production", icon: FileSpreadsheet, accent: "#22c55e", stats: [{ label: "Month", value: `${month}/${year}` }, { label: "Status", value: payrollRun?.status ?? "draft" }] },
              { href: "/business/accounting", label: "Post to accounting", description: "ตรวจ journal / ledger หลัง payroll เพื่อปิดงวดรายเดือน", icon: Landmark, accent: "#14b8a6", stats: [{ label: "Journal", value: "Connected" }, { label: "Reports", value: "v5.3" }] },
            ]}
          />
        </ProductSection>
        <ProductSection title="Payroll workbench" description="ตัวทำงานหลักด้านล่างเชื่อมฐานข้อมูลจริงและจัด flow ให้เหมือน cockpit สำหรับ desktop">
          <BusinessPayrollWorkbench
            organizationId={org?.id ?? null}
            employees={employees.map((employee) => ({ ...employee, baseSalary: Number(employee.baseSalary) }))}
            latestRuns={latestRuns.map((run) => ({ ...run, totalGross: Number(run.totalGross), totalNet: Number(run.totalNet) }))}
            pendingLeaves={pendingLeaves.map((leave) => ({ id: leave.id, employeeName: leave.employee.name, leaveType: leave.leaveType, days: Number(leave.days), status: leave.status, note: leave.note, reason: leave.reason }))}
          />
        </ProductSection>
        <ProductSection title="Recent payroll runs" description="ประวัติ payroll run ล่าสุดสำหรับ review รอบเดือน">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {latestRuns.length ? latestRuns.map((run) => (
              <div key={run.id} className="soft-panel rounded-[24px] p-4">
                <div className="text-sm text-[var(--text-3)]">{run.month}/{run.year}</div>
                <div className="mt-1 text-lg font-bold capitalize">{run.status}</div>
                <div className="mt-2 text-sm text-[var(--text-2)]">Gross {Number(run.totalGross).toLocaleString("th-TH")} · Net {Number(run.totalNet).toLocaleString("th-TH")}</div>
              </div>
            )) : <div className="text-sm text-[var(--text-3)]">ยังไม่มี payroll run</div>}
          </div>
        </ProductSection>
      </div>
    </AppFrame>
  )
}
