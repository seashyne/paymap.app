import { detectSiteLang } from "@/lib/i18n/site"
import { getWorkspaceMessages } from "@/lib/i18n/workspace"
import AppFrame from "@/components/layout/AppFrame"
import { requireModePage } from "@/lib/authz"
import { getCurrentSession, normalizeAccountMode } from "@/lib/session"
import { DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { getCurrentPlan } from "@/lib/subscription/current-plan"
import ReconciliationWorkbench from "@/shared/components/workbench/ReconciliationWorkbench"
import FeatureLocked from "@/components/subscription/FeatureLocked"
import { getFeatureRequirementLabel, getUpgradeHref, hasFeatureAccess } from "@/lib/subscription/feature-gate"
import { WorkbenchHero, KpiStrip } from "@/components/workbench/WorkbenchPageShell"

export const metadata = { title: "Merchant Reconciliation — PayMap" }

export default async function MerchantReconciliationPage() {
  const user = await requireModePage("merchant")
  const session = await getCurrentSession()
  const currentPlan = getCurrentPlan(user, "merchant")
  const locked = !hasFeatureAccess(user, "merchant_reconciliation")
  const nav = [
    { href: "/merchant", label: "Overview", accent: "#fb7185", active: false },
    { href: "/merchant/sales", label: "Sales", accent: "#fb7185", active: false },
    { href: "/merchant/inventory", label: "Inventory", accent: "#8b5cf6", active: false },
    { href: "/merchant/accounting", label: "Accounting", accent: "#14b8a6", active: false },
    { href: "/merchant/reconciliation", label: "Reconciliation", accent: "#22c55e", active: true },
  ]
  return (
    <AppFrame brand="payMap Merchant" icon="📥" version={`${DASHBOARD_VERSION_LABEL} · Merchant Reconciliation`} title="Merchant Reconciliation" subtitle="กระทบยอด statement, sales และ transaction ledger ของร้าน" accent="#22c55e" planLabel={locked ? "Growth required" : currentPlan} accountMode={normalizeAccountMode(session?.accountMode ?? user.accountMode)} nav={nav}>
      <div className="space-y-6">
        <WorkbenchHero eyebrow="Merchant reconciliation" title="กระทบยอดยอดขายของร้านในหน้าที่อ่านง่ายและลื่นขึ้น" subtitle="ลดคำอธิบายที่ไม่จำเป็น แล้วทำให้ทีมร้านเข้ามาตรวจ settlement, matching และ export ได้ไวขึ้นโดยไม่รู้สึกว่าเป็นหน้ารุ่นเก่า" accent="#22c55e" />
        <KpiStrip items={[
          { label: "Plan", value: locked ? "Growth required" : String(currentPlan), hint: locked ? "ต้องอัปเกรดเพื่อใช้งาน" : "พร้อมใช้งาน" },
          { label: "Scope", value: "Sales + statement + ledger", hint: "จับคู่ก่อนปิดงวด" },
        ]} />
        {locked ? <FeatureLocked title="Merchant Reconciliation ต้องใช้ Merchant Growth" description="matching engine สำหรับร้าน, settlement checks และ CSV approval workflow เปิดให้ใน Merchant Growth ขึ้นไป" requirement={getFeatureRequirementLabel("merchant_reconciliation")} upgradeHref={getUpgradeHref(user, "merchant_reconciliation")} /> : <ReconciliationWorkbench />}
      </div>
    </AppFrame>
  )
}
