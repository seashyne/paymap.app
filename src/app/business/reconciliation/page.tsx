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

export const metadata = { title: "Business Reconciliation — PayMap" }

export default async function BusinessReconciliationPage() {
  const user = await requireModePage("business")
  const lang = detectSiteLang()
  const wm = getWorkspaceMessages(lang)
  const session = await getCurrentSession()
  const currentPlan = getCurrentPlan(user, "business")
  const locked = !hasFeatureAccess(user, "business_reconciliation")
  const nav = [
    { href: "/business", label: wm.common.overview, accent: "#38bdf8", active: false },
    { href: "/business/payroll", label: wm.common.payroll, accent: "#38bdf8", active: false },
    { href: "/business/accounting", label: wm.common.accounting, accent: "#14b8a6", active: false },
    { href: "/business/invoices", label: wm.common.invoices, accent: "#f59e0b", active: false },
    { href: "/business/reconciliation", label: wm.common.reconciliation, accent: "#22c55e", active: true },
  ]
  return (
    <AppFrame brand="payMap Business" icon="🧮" version={`${DASHBOARD_VERSION_LABEL} · Reconciliation`} title={wm.business.reconciliationPage.title} subtitle={wm.business.reconciliationPage.subtitle} accent="#22c55e" planLabel={locked ? "SME required" : currentPlan} accountMode={normalizeAccountMode(session?.accountMode ?? user.accountMode)} nav={nav}>
      <div className="space-y-6">
        <WorkbenchHero eyebrow="Business reconciliation" title="ลดหน้าที่ดูเป็นเครื่องมือภายใน แล้วทำให้ทีมใช้งานได้จริง" subtitle="ใช้หน้ากระทบยอดเพื่อตรวจ statement, จับคู่กับ invoice และเตรียมข้อมูลสำหรับปิดงวด โดยภาษาบนหน้าจะสั้นลงและชี้งานชัดขึ้น" accent="#22c55e" />
        <KpiStrip items={[
          { label: "Plan", value: locked ? "SME required" : String(currentPlan), hint: locked ? "ต้องอัปเกรดเพื่อใช้งาน" : "พร้อมใช้งาน" },
          { label: "Scope", value: "Statement + invoice + ledger", hint: "ตรวจครบก่อน close" },
        ]} />
        {locked ? <FeatureLocked title="Business Reconciliation ต้องใช้ Business SME" description="การกระทบยอด statement, matching engine และ approval workflow ถูกเปิดให้ธุรกิจที่เริ่มต้องการปิดงวดอย่างจริงจังใน Business SME ขึ้นไป" requirement={getFeatureRequirementLabel("business_reconciliation")} upgradeHref={getUpgradeHref(user, "business_reconciliation")} /> : <ReconciliationWorkbench />}
      </div>
    </AppFrame>
  )
}
