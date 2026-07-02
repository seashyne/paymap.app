import AppFrame from "@/components/layout/AppFrame"
import { WorkbenchHero, KpiStrip } from "@/components/workbench/WorkbenchPageShell"
import { requireModePage } from "@/lib/authz"
import { getCurrentSession, normalizeAccountMode } from "@/lib/session"
import { DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { getCurrentPlan } from "@/lib/subscription/current-plan"
import { prisma } from "@/lib/prisma"
import { getOwnedBusinessOrg } from "@/lib/business-org"
import CustomerWorkbench from "@/shared/components/workbench/CustomerWorkbench"
import BusinessWorkspaceSetupNotice from "@/components/business/BusinessWorkspaceSetupNotice"

const db = prisma as any

export const metadata = { title: "Business Customers — PayMap" }

export default async function BusinessCustomersPage() {
  const user = await requireModePage("business")
  const session = await getCurrentSession()
  const currentPlan = getCurrentPlan(user, "business")
  const org = await getOwnedBusinessOrg(user.id)
  const [customerCount, activeCount, invoiceCount] = org ? await Promise.all([
    db.customer.count({ where: { organizationId: org.id, deletedAt: null } }),
    db.customer.count({ where: { organizationId: org.id, deletedAt: null, isActive: true } }),
    db.invoice.count({ where: { organizationId: org.id, deletedAt: null } }),
  ]) : [0, 0, 0]

  const nav = [
    { href: "/business", label: "Overview", accent: "#38bdf8", active: false },
    { href: "/business/customers", label: "Customers", accent: "#fb7185", active: true },
    { href: "/business/inventory", label: "Inventory", accent: "#a855f7", active: false },
    { href: "/business/invoices", label: "Invoices", accent: "#f59e0b", active: false },
    { href: "/business/accounting", label: "Accounting", accent: "#14b8a6", active: false },
    { href: "/business/reconciliation", label: "Reconciliation", accent: "#22c55e", active: false },
  ]

  return (
    <AppFrame
      brand="payMap Business"
      icon="🤝"
      version={`${DASHBOARD_VERSION_LABEL} · Customers`}
      title="Customer master"
      subtitle="ย้ายข้อมูลลูกค้าออกจากการพิมพ์สดใน invoice มาเป็น master data กลางของธุรกิจ"
      accent="#fb7185"
      planLabel={currentPlan}
      accountMode={normalizeAccountMode(session?.accountMode ?? user.accountMode)}
      nav={nav}
    >
      <div className="space-y-6">
        <WorkbenchHero
          eyebrow="Business CRM foundation"
          title="เริ่ม ERP core จากทะเบียนลูกค้าที่ใช้งานกับเอกสารขายได้จริง"
          subtitle="หน้าเดียวสำหรับเก็บชื่อลูกค้า ข้อมูลติดต่อ ข้อมูลภาษี เครดิตเทอม และทำให้ทีมออก invoice จากข้อมูลชุดเดียวกัน"
          accent="#fb7185"
        />
        <KpiStrip items={[
          { label: "Workspace", value: org?.name ?? "Not setup", hint: "องค์กรธุรกิจที่กำลังใช้งาน" },
          { label: "Customers", value: String(customerCount), hint: "รายการใน master data" },
          { label: "Active", value: String(activeCount), hint: "พร้อมใช้งานต่อกับ invoice" },
          { label: "Invoices", value: String(invoiceCount), hint: "เอกสารขายที่พร้อมเชื่อมต่อ" },
        ]} />
        {org ? <CustomerWorkbench /> : <BusinessWorkspaceSetupNotice title="ยังไม่มี customer master สำหรับ workspace นี้" body="ต้องมี organization ก่อน จึงจะเริ่มเก็บทะเบียนลูกค้า อีเมลภาษี และใช้ข้อมูลชุดเดียวกันต่อกับ invoice ได้" />}
      </div>
    </AppFrame>
  )
}
