import AppFrame from "@/components/layout/AppFrame"
import { getCurrentSession } from "@/lib/session"
import { DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { ProductHero, ProductQuickLinks, ProductSection } from "@/components/product/ProductMasterSurface"
import TaxWorkbench from "@/components/tax/TaxWorkbench"

export const metadata = { title: "Tax Workspace — PayMap" }

export default async function TaxPage() {
  const session = await getCurrentSession()
  return (
    <AppFrame
      brand="payMap Tax"
      icon="🧾"
      version={`${DASHBOARD_VERSION_LABEL} · Tax`}
      title="Multi-country Tax Workspace"
      subtitle="คำนวณภาษีเชิงปฏิบัติสำหรับหลายประเทศ พร้อมอธิบาย deduction / effective rate / estimator note"
      accent="#f59e0b"
      planLabel="Tax"
      accountMode={(session?.accountMode ?? "personal") as "personal" | "business" | "merchant"}
      nav={[
        { href: "/dashboard", label: "Dashboard", accent: "#7c3aed", active: false },
        { href: "/tax", label: "Tax", accent: "#f59e0b", active: true },
        { href: "/reports/financial", label: "Financial Reports", accent: "#14b8a6", active: false },
        { href: "/settings/legal", label: "Legal Center", accent: "#8b5cf6", active: false },
      ]}
    >
      <div className="space-y-6">
        <ProductHero eyebrow="Tax workspace" title="Multi-country Tax Workspace" description="ทำ tax surface ให้ดูเป็น product module จริงขึ้นสำหรับคนที่ทำงานบน desktop" badge="พร้อมใช้งาน" accent="#f59e0b" />
        <ProductQuickLinks links={[{ href: "/dashboard", title: "Back to dashboard", description: "กลับไปภาพรวมก่อนเริ่ม tax planning" }, { href: "/reports/financial", title: "Financial reports", description: "ใช้รายงานการเงินประกอบการคำนวณภาษี" }, { href: "/settings/legal", title: "Legal center", description: "ตรวจ consent และข้อมูล policy ที่เกี่ยวข้อง" }]} />
        <ProductSection title="Focused module surface" description="ยกระดับ page shell ให้เป็น product module ที่อ่านง่ายขึ้น โดยยังใช้ logic เดิมของ client component เหมือนเดิม">
      <TaxWorkbench />
        </ProductSection>
      </div>
    </AppFrame>
  )
}
