import AppFrame from "@/components/layout/AppFrame"
import ModuleGrid from "@/shared/components/dashboard/ModuleGrid"
import { WorkbenchHero, KpiStrip } from "@/components/workbench/WorkbenchPageShell"
import { requireModePage } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { getCurrentSession, normalizeAccountMode } from "@/lib/session"
import { DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { getCurrentPlan } from "@/lib/subscription/current-plan"
import { BookOpen, Landmark, Receipt, ScrollText } from "lucide-react"
import MerchantAccountingWorkbench from "@/components/dashboard-v521/MerchantAccountingWorkbench"
import { detectSiteLang } from "@/lib/i18n/site"
import { getWorkspaceMessages } from "@/lib/i18n/workspace"
import FeatureLocked from "@/components/subscription/FeatureLocked"
import { getFeatureRequirementLabel, getUpgradeHref, hasFeatureAccess } from "@/lib/subscription/feature-gate"

export const metadata = { title: "Merchant Accounting — PayMap" }

export default async function MerchantAccountingPage() {
  const user = await requireModePage("merchant")
  const lang = detectSiteLang()
  const wm = getWorkspaceMessages(lang)
  const session = await getCurrentSession()
  const currentPlan = getCurrentPlan(user, "merchant")
  const [accounts, journals, store, accountList] = await Promise.all([
    prisma.chartOfAccount.count({ where: { userId: user.id } }),
    prisma.journalEntry.count({ where: { userId: user.id } }),
    prisma.store.findFirst({ where: { userId: user.id }, include: { _count: { select: { salesOrders: true, products: true } } } }),
    prisma.chartOfAccount.findMany({ where: { userId: user.id }, orderBy: { code: "asc" }, take: 30 }),
  ])
  const locked = !hasFeatureAccess(user, "merchant_accounting")
  const nav = [
    { href: "/merchant", label: "Overview", accent: "#fb7185", active: false },
    { href: "/merchant/sales", label: "Sales", accent: "#fb7185", active: false },
    { href: "/merchant/inventory", label: "Inventory", accent: "#8b5cf6", active: false },
    { href: "/merchant/accounting", label: "Accounting", accent: "#14b8a6", active: true },
    { href: "/merchant/reconciliation", label: "Reconciliation", accent: "#22c55e", active: false },
  ]
  return (
    <AppFrame brand="payMap Merchant" icon="🏬" version={`${DASHBOARD_VERSION_LABEL} · Merchant Accounting`} title={wm.merchant.accounting.title} subtitle={wm.merchant.accounting.subtitle} accent="#14b8a6" planLabel={locked ? "Growth required" : currentPlan} accountMode={normalizeAccountMode(session?.accountMode ?? user.accountMode)} nav={nav}>
      <div className="space-y-6">
        <WorkbenchHero eyebrow="Merchant accounting" title="เชื่อม sales, VAT และ statements ของร้านให้ใช้งานง่ายขึ้น" subtitle="เปลี่ยนหน้ารุ่นเก่าที่ดูเป็นเครื่องมือภายใน ให้เหลือข้อมูลสำคัญและทางลัดที่ผู้ใช้ร้านเข้าใจได้ทันที ทั้งเรื่อง journal, VAT report และงบการเงิน" accent="#14b8a6" />
        <KpiStrip items={[
          { label: "Chart of accounts", value: String(accounts), hint: "บัญชีพร้อมใช้งาน" },
          { label: "Journal entries", value: String(journals), hint: "รายการที่โพสต์แล้ว" },
          { label: "Store volume", value: String(store?._count.salesOrders ?? 0), hint: "จำนวนรายการขาย" },
          { label: "Plan", value: locked ? "Growth required" : String(currentPlan), hint: locked ? "ต้องอัปเกรดเพื่อใช้งาน" : "พร้อมใช้งาน" },
        ]} />
        {locked ? <FeatureLocked title="Merchant Accounting ต้องใช้ Merchant Growth" description="ร้านเริ่มต้นยังขายสินค้าและจัดการสต็อกได้ แต่การต่อยอดขายเข้าบัญชี, VAT report และ financial statements จะปลดล็อกใน Merchant Growth ขึ้นไป" requirement={getFeatureRequirementLabel("merchant_accounting")} upgradeHref={getUpgradeHref(user, "merchant_accounting")} /> : <>
          <MerchantAccountingWorkbench storeId={store?.id ?? null} accounts={accountList} />
          <ModuleGrid title="Merchant accounting modules" subtitle="ทางลัดสำหรับงานบัญชีร้านที่เชื่อมกับยอดขายจริง" items={[
            { href: "/api/accounting/journal", label: "Journal posting", description: "บันทึก journal สำหรับยอดขายและภาษีของร้าน", icon: BookOpen, accent: "#14b8a6", stats: [{ label: "Entries", value: String(journals) }, { label: "Mode", value: "Merchant" }] },
            { href: "/api/tax/vat-report", label: "VAT report", description: "สร้าง VAT report และ tax summary ของร้าน", icon: ScrollText, accent: "#fb7185", stats: [{ label: "VAT", value: "Ready" }, { label: "Plan", value: "Growth+" }] },
            { href: "/reports/financial", label: "Statements", description: "ดูงบการเงินจากข้อมูลการขายและต้นทุน", icon: Landmark, accent: "#22c55e", stats: [{ label: "Reports", value: "3 core" }, { label: "Version", value: "พร้อมใช้งาน" }] },
            { href: "/merchant/sales", label: "Sales source", description: "ลงลึกยอดขายและเอกสารต้นทางของร้าน", icon: Receipt, accent: "#8b5cf6", stats: [{ label: "Sales", value: String(store?._count.salesOrders ?? 0) }, { label: "Products", value: String(store?._count.products ?? 0) }] },
          ]} />
        </>}
      </div>
    </AppFrame>
  )
}
