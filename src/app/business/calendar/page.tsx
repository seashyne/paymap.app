import PlannerPersistenceClient from "@/components/planner/PlannerPersistenceClient"
import { CalendarClock, CreditCard, FileText, Landmark, PlaneTakeoff } from "lucide-react"
import { redirect } from "next/navigation"
import { requireModePage } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { getCurrentSession } from "@/lib/session"
import AppFrame from "@/components/layout/AppFrame"
import { APP_VERSION, DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { ProductHero, ProductQuickLinks, ProductSection } from "@/components/product/ProductMasterSurface"
import { PlannerEmpty, PlannerListCard, PlannerMetric } from "@/components/planner/PlannerSurface"

function formatCurrency(value: number, currency = "THB") {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency, maximumFractionDigits: 0 }).format(value)
}
function formatDate(value: Date | null | undefined) {
  return value ? new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(value) : "—"
}

export default async function BusinessCalendarPage() {
  const user = await requireModePage("business")
  const session = await getCurrentSession()
  if ((session?.accountMode ?? session?.workspaceMode ?? "personal") !== "business") redirect("/workspace/select?requested=business")

  const organization = await prisma.organization.findFirst({ where: { ownerId: user.id }, select: { id: true, name: true } })
  if (!organization) redirect("/business")

  const now = new Date()
  const [payrollRuns, invoices, leaveRequests] = await Promise.all([
    prisma.payrollRun.findMany({
      where: { organizationId: organization.id },
      orderBy: [{ year: "asc" }, { month: "asc" }],
      take: 6,
      select: { id: true, month: true, year: true, status: true, totalNet: true, paidAt: true, employeeCount: true, note: true },
    }),
    prisma.invoice.findMany({
      where: { organizationId: organization.id, dueDate: { not: null }, deletedAt: null },
      orderBy: { dueDate: "asc" },
      take: 8,
      select: { id: true, number: true, customerName: true, totalAmount: true, currency: true, dueDate: true, status: true, note: true },
    }),
    prisma.leaveRequest.findMany({
      where: { organizationId: organization.id, status: "pending" },
      orderBy: { startDate: "asc" },
      take: 6,
      select: { id: true, leaveType: true, startDate: true, endDate: true, days: true, note: true, employee: { select: { name: true } } },
    }),
  ])

  const pendingInvoices = invoices.filter((item) => item.status !== "paid")
  const unpaidValue = pendingInvoices.reduce((sum, item) => sum + Number(item.totalAmount), 0)
  const nextPayroll = payrollRuns.find((item) => item.status !== "paid")

  const nav = [
    { href: "/business", label: "Overview", icon: Landmark, accent: "#38bdf8", active: false },
    { href: "/business/calendar", label: "Calendar", icon: CalendarClock, accent: "#0f766e", active: true },
    { href: "/reports/financial", label: "Reports", icon: FileText, accent: "#14b8a6", active: false },
    { href: "/settings", label: "Settings", icon: CreditCard, accent: "#f59e0b", active: false },
  ]

  return (
    <AppFrame
      brand="payMap Business"
      icon="▣"
      version={`${DASHBOARD_VERSION_LABEL} · Business Calendar`}
      title="Business operations calendar"
      subtitle={`รวม payroll, invoice due date และ leave approval ไว้ในจุดเดียว · v${APP_VERSION}`}
      accent="#0f766e"
      planLabel={String(user.plan ?? "free")}
      accountMode="business"
      nav={nav}
    >
      <div className="space-y-6">
        <ProductHero
          eyebrow="Planner pack"
          title="Business operations calendar"
          description="ใช้มุมมองนี้เป็นโต๊ะควบคุมงานธุรกิจประจำสัปดาห์ โดยดึงวันสำคัญจาก payroll, invoices และ leave requests ที่มีอยู่แล้วในระบบ"
          badge="พร้อมใช้งาน"
          accent="#0f766e"
          stats={[
            { label: "Pending invoices", value: String(pendingInvoices.length), hint: formatCurrency(unpaidValue) },
            { label: "Pending leaves", value: String(leaveRequests.length), hint: "need approval" },
            { label: "Next payroll", value: nextPayroll ? `${nextPayroll.month}/${nextPayroll.year}` : "—", hint: nextPayroll ? `${nextPayroll.employeeCount} employees` : "no pending payroll" },
          ]}
        />

        <ProductQuickLinks links={[
          { href: "/business", title: "Back to business overview", description: "กลับไปดู dashboard หลักขององค์กร" },
          { href: "/business/payroll", title: "Open payroll", description: "เข้าไปจัดการ payroll run และสถานะการจ่ายเงิน" },
          { href: "/reports/financial", title: "Financial reports", description: "เช็กรายงานรายรับ-รายจ่ายและภาพรวมงบการเงิน" },
        ]} />

        <ProductSection title="Operations snapshot" description={`สรุปสิ่งที่ทีมต้องจัดการในองค์กร ${organization.name}`}>
          <div className="grid gap-4 md:grid-cols-3">
            <PlannerMetric label="Open invoice value" value={formatCurrency(unpaidValue)} hint={`${pendingInvoices.length} invoices not paid`} />
            <PlannerMetric label="Pending leave approvals" value={String(leaveRequests.length)} hint="HR action required" />
            <PlannerMetric label="Upcoming payroll runs" value={String(payrollRuns.filter((item) => item.status !== "paid").length)} hint="draft / approved / processing" />
          </div>
        </ProductSection>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <PlannerListCard title="Upcoming business dates" description="เหตุการณ์ที่ต้องตัดสินใจหรือจ่ายเงินจริงในระยะใกล้" actionHref="/business" actionLabel="Open workspace">
            <div className="space-y-3">
              {nextPayroll || pendingInvoices.length || leaveRequests.length ? (
                [
                  ...payrollRuns.map((item) => ({
                    key: item.id,
                    title: `Payroll ${item.month}/${item.year}`,
                    date: new Date(item.year, item.month - 1, 25),
                    meta: item.status,
                    amount: formatCurrency(Number(item.totalNet)),
                    note: item.note,
                  })),
                  ...pendingInvoices.map((item) => ({
                    key: item.id,
                    title: `${item.number} · ${item.customerName}`,
                    date: item.dueDate ?? now,
                    meta: `Invoice ${item.status}`,
                    amount: formatCurrency(Number(item.totalAmount), item.currency),
                    note: item.note,
                  })),
                  ...leaveRequests.map((item) => ({
                    key: item.id,
                    title: `${item.employee.name} · ${item.leaveType}`,
                    date: item.startDate,
                    meta: `Leave ${Number(item.days)} day(s)`,
                    amount: `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`,
                    note: item.note,
                  })),
                ]
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 10)
                  .map((item) => (
                    <div key={item.key} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-[var(--text-1)]">{item.title}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--text-3)]">{item.meta}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-[var(--text-1)]">{item.amount}</div>
                          <div className="text-xs text-[var(--text-3)]">{formatDate(item.date)}</div>
                        </div>
                      </div>
                      {item.note ? <div className="mt-2 text-sm text-[var(--text-2)]">{item.note}</div> : null}
                    </div>
                  ))
              ) : (
                <PlannerEmpty title="ยังไม่มีรายการที่ planner ดึงมาแสดง" description="เมื่อมี invoice due date, payroll run หรือ leave request planner จะจัดเป็น timeline ให้ทันที" />
              )}
            </div>
          </PlannerListCard>

          <PlannerListCard title="Approval & team notes" description="ดู item ที่มี note หรือมีผลกับตารางทำงานของทีม">
            <div className="space-y-3">
              {leaveRequests.length ? leaveRequests.map((item) => (
                <div key={item.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-[var(--text-1)]">{item.employee.name}</div>
                    <div className="text-xs text-[var(--text-3)]">{formatDate(item.startDate)}</div>
                  </div>
                  <div className="mt-1 text-sm text-[var(--text-2)]">{item.leaveType} · {Number(item.days)} day(s)</div>
                  <div className="mt-2 text-sm text-[var(--text-2)]">{item.note || "No additional note"}</div>
                </div>
              )) : <PlannerEmpty title="ไม่มี leave request ที่รออนุมัติ" description="ทีมยังไม่มีรายการลางานที่ค้างการตัดสินใจ" />}
            </div>
          </PlannerListCard>
        </div>


        <ProductSection title="My planner items" description="เพิ่มงาน, โน้ต และ reminder ของ PayMap เองได้จากหน้านี้ และบันทึกลงฐานข้อมูลจริง">
          <PlannerPersistenceClient workspace="business" />
        </ProductSection>
      </div>
    </AppFrame>
  )
}
