// v24.0: Investment Tracker Page
import { requireModePage } from "@/lib/authz"
import AppFrame from "@/components/layout/AppFrame"
import { DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { ProductHero, ProductQuickLinks, ProductSection } from "@/components/product/ProductMasterSurface"
import InvestmentsClient from "@/components/finance/InvestmentsClient"
import { TrendingUp } from "lucide-react"

export default async function InvestmentsPage() {
  await requireModePage("personal")
  return (
    <AppFrame
      brand="payMap" icon="📈" version={`${DASHBOARD_VERSION_LABEL} · Investments`}
      title="Investment Tracker" subtitle="ติดตามพอร์ตหุ้น กองทุน Crypto และ ETF"
      accent="#14b8a6"
      nav={[
        { href: "/dashboard",   label: "Dashboard",   icon: TrendingUp, accent: "#14b8a6", active: false },
        { href: "/investments", label: "การลงทุน",     icon: TrendingUp, accent: "#14b8a6", active: true },
      ]}
    >
      <div className="space-y-6">
        <ProductHero eyebrow="Investment workspace" title="Investment Tracker" description="จัดหน้า investment tracker ให้กลายเป็น surface ที่อ่านง่ายและ premium ขึ้น" badge="พร้อมใช้งาน" accent="#14b8a6" />
        <ProductQuickLinks links={[{ href: "/dashboard", title: "Back to dashboard", description: "กลับไปภาพรวม personal finance ก่อน" }, { href: "/networth", title: "Open net worth", description: "ดูผลของพอร์ตต่อฐานะสุทธิ" }, { href: "/reports", title: "Performance reports", description: "เชื่อมข้อมูลการลงทุนกับรายงานรวม" }]} />
        <ProductSection title="Focused module surface" description="ยกระดับ page shell ให้เป็น product module ที่อ่านง่ายขึ้น โดยยังใช้ logic เดิมของ client component เหมือนเดิม">
      <InvestmentsClient />
        </ProductSection>
      </div>
    </AppFrame>
  )
}
