import AppFrame from "@/components/layout/AppFrame"
import ModuleGrid from "@/shared/components/dashboard/ModuleGrid"
import { WorkbenchHero, KpiStrip } from "@/components/workbench/WorkbenchPageShell"
import { requireModePage } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { getCurrentSession, normalizeAccountMode } from "@/lib/session"
import { DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { getCurrentPlan } from "@/lib/subscription/current-plan"
import { BookOpen, FileStack, Landmark, Receipt } from "lucide-react"
import BusinessAccountingWorkbench from "@/components/dashboard-v521/BusinessAccountingWorkbench"
import FeatureLocked from "@/components/subscription/FeatureLocked"
import { getFeatureRequirementLabel, getUpgradeHref, hasFeatureAccess } from "@/lib/subscription/feature-gate"
import { detectSiteLang } from "@/lib/i18n/site"
import { getWorkspaceMessages } from "@/lib/i18n/workspace"

export const metadata = { title: "Business Accounting — PayMap" }

export default async function BusinessAccountingPage() {
  const user = await requireModePage("business")
  const lang = detectSiteLang()
  const wm = getWorkspaceMessages(lang)
  const session = await getCurrentSession()
  const currentPlan = getCurrentPlan(user, "business")
  const [accounts, journals, invoices, accountList] = await Promise.all([
    prisma.chartOfAccount.count({ where: { userId: user.id } }),
    prisma.journalEntry.count({ where: { userId: user.id } }),
    prisma.organization.findFirst({ where: { ownerId: user.id }, include: { _count: { select: { invoices: true } } } }),
    prisma.chartOfAccount.findMany({ where: { userId: user.id }, orderBy: { code: "asc" }, take: 30 }),
  ])
  const locked = !hasFeatureAccess(user, "business_accounting")
  const nav = [
    { href: "/business", label: wm.common.overview, accent: "#38bdf8", active: false },
    { href: "/business/payroll", label: wm.common.payroll, accent: "#38bdf8", active: false },
    { href: "/business/accounting", label: wm.common.accounting, accent: "#14b8a6", active: true },
    { href: "/business/invoices", label: wm.common.invoices, accent: "#f59e0b", active: false },
    { href: "/business/reconciliation", label: wm.common.reconciliation, accent: "#22c55e", active: false },
  ]

  return (
    <AppFrame brand="payMap Business" icon="📘" version={`${DASHBOARD_VERSION_LABEL} · Accounting`} title={wm.business.accounting.title} subtitle={wm.business.accounting.subtitle} accent="#14b8a6" planLabel={locked ? "SME required" : currentPlan} accountMode={normalizeAccountMode(session?.accountMode ?? user.accountMode)} nav={nav}>
      <div className="space-y-6">
        <WorkbenchHero eyebrow={wm.business.accounting.title} title={wm.business.accounting.heroTitle} subtitle={wm.business.accounting.heroBody} accent="#14b8a6" />
        <KpiStrip items={[
          { label: "Chart of accounts", value: String(accounts), hint: "บัญชีพร้อมใช้งาน" },
          { label: "Journal entries", value: String(journals), hint: "รายการที่โพสต์แล้ว" },
          { label: wm.common.invoices, value: String(invoices?._count.invoices ?? 0), hint: "ต้นทาง receivable" },
          { label: "Plan", value: locked ? "SME required" : String(currentPlan), hint: locked ? "อัปเกรดเพื่อใช้งานเต็ม" : "พร้อมใช้งาน" },
        ]} />

        {locked ? (
          <FeatureLocked title={wm.business.accounting.lockTitle} description={wm.business.accounting.lockBody} requirement={getFeatureRequirementLabel("business_accounting")} upgradeHref={getUpgradeHref(user, "business_accounting")}>
            <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <div className="text-sm text-[var(--text-3)]">เมื่ออัปเกรดแล้วจะได้</div>
              <ul className="mt-3 space-y-2 text-sm text-[var(--text-2)]">
                <li>• Chart of accounts แบบพร้อมใช้งานจริง</li>
                <li>• Journal posting และ ledger drill-down</li>
                <li>• Trial balance และงบการเงิน 3 ชุดหลัก</li>
                <li>• ปิดงวดและต่อเข้ากับ reconciliation / tax workflow</li>
              </ul>
            </div>
          </FeatureLocked>
        ) : (
          <>
            <BusinessAccountingWorkbench accounts={accountList} />
            <ModuleGrid title={wm.business.accounting.moduleTitle} subtitle={wm.business.accounting.moduleBody} items={[
              { href: "/api/accounting/journal", label: "Journal posting", description: "บันทึกหรืออ่าน journal entries จาก accounting engine", icon: BookOpen, accent: "#14b8a6", stats: [{ label: "Entries", value: String(journals) }, { label: "Mode", value: "Business" }] },
              { href: "/api/accounting/ledger", label: "Ledger detail", description: "ตรวจ movement ของบัญชีและใช้เป็นฐานสำหรับ reconciliation", icon: FileStack, accent: "#38bdf8", stats: [{ label: "Accounts", value: String(accounts) }, { label: "Status", value: "Live" }] },
              { href: "/business/invoices", label: "Invoice registry", description: "เชื่อม receivable และ payment tracking เข้ากับ accounting cycle", icon: Receipt, accent: "#f59e0b", stats: [{ label: wm.common.invoices, value: String(invoices?._count.invoices ?? 0) }, { label: "AR", value: "Live" }] },
              { href: "/reports/financial", label: "Financial statements", description: "ดู P&L, balance sheet และ cash flow จากข้อมูลชุดเดียวกัน", icon: Landmark, accent: "#22c55e", stats: [{ label: "Reports", value: "3 core" }, { label: "Close", value: "Ready" }] },
            ]} />
          </>
        )}
      </div>
    </AppFrame>
  )
}
