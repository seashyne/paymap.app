import { detectSiteLang } from "@/lib/i18n/site"
import { getWorkspaceMessages } from "@/lib/i18n/workspace"
import AppFrame from "@/components/layout/AppFrame"
import { WorkbenchHero, KpiStrip } from "@/components/workbench/WorkbenchPageShell"
import { requireModePage } from "@/lib/authz"
import { getCurrentSession, normalizeAccountMode } from "@/lib/session"
import { DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { getCurrentPlan } from "@/lib/subscription/current-plan"
import InvoiceWorkbench from "@/shared/components/workbench/InvoiceWorkbench"
import { prisma } from "@/lib/prisma"
import BusinessWorkspaceSetupNotice from "@/components/business/BusinessWorkspaceSetupNotice"

export const metadata = { title: "Business Invoices — PayMap" }

const db = prisma as any

export default async function BusinessInvoicesPage() {
  const user = await requireModePage("business")
  const lang = detectSiteLang()
  const wm = getWorkspaceMessages(lang)
  const session = await getCurrentSession()
  const currentPlan = getCurrentPlan(user, "business")
  const org = await db.organization.findFirst({
    where: { ownerId: user.id },
    include: { _count: { select: { invoices: true, customers: true } } },
  }) as { name?: string; _count?: { invoices?: number; customers?: number } } | null

  const nav = [
    { href: "/business", label: wm.common.overview, accent: "#38bdf8", active: false },
    { href: "/business/customers", label: "Customers", accent: "#fb7185", active: false },
    { href: "/business/inventory", label: "Inventory", accent: "#a855f7", active: false },
    { href: "/business/payroll", label: wm.common.payroll, accent: "#38bdf8", active: false },
    { href: "/business/accounting", label: wm.common.accounting, accent: "#14b8a6", active: false },
    { href: "/business/invoices", label: wm.common.invoices, accent: "#f59e0b", active: true },
    { href: "/business/reconciliation", label: wm.common.reconciliation, accent: "#22c55e", active: false },
  ]

  return (
    <AppFrame brand="payMap Business" icon="🧾" version={`${DASHBOARD_VERSION_LABEL} · Invoices`} title={wm.business.invoicesPage.title} subtitle={wm.business.invoicesPage.subtitle} accent="#f59e0b" planLabel={currentPlan} accountMode={normalizeAccountMode(session?.accountMode ?? user.accountMode)} nav={nav}>
      <div className="space-y-6">
        <WorkbenchHero eyebrow="Business invoices" title="รวม invoice registry, payment และ collection ไว้หน้าเดียว" subtitle="ตัดภาษาหน้าเก่าออก ให้ทีมงานหรือเจ้าของธุรกิจเข้ามาแล้วสร้าง invoice ได้ทันที พร้อมเห็นยอดค้างรับและสถานะการจ่ายอย่างชัดเจน" accent="#f59e0b" />
        <KpiStrip items={[
          { label: "Workspace", value: org?.name ?? "Not setup", hint: "องค์กรที่ใช้งานอยู่" },
          { label: "Customers", value: String(org?._count?.customers ?? 0), hint: "ทะเบียนลูกค้ากลาง" },
          { label: wm.common.invoices, value: String(org?._count?.invoices ?? 0), hint: "จำนวนเอกสารทั้งหมด" },
          { label: "Plan", value: String(currentPlan), hint: "แพ็กเกจที่ใช้งานอยู่" },
        ]} />
        {org ? <InvoiceWorkbench /> : <BusinessWorkspaceSetupNotice title="ยังไม่มี invoice workspace สำหรับธุรกิจนี้" body="ต้องมี organization ก่อน จึงจะเริ่มออก invoice, ใช้ customer master และติดตามยอดค้างรับได้" />}
      </div>
    </AppFrame>
  )
}
