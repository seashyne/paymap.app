// v24.0: Financial Simulation Page
import { requireModePage } from "@/lib/authz"
import { mergeUiPreferences } from "@/lib/ui-preferences"
import AppFrame from "@/components/layout/AppFrame"
import { DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { ProductHero, ProductQuickLinks, ProductSection } from "@/components/product/ProductMasterSurface"
import SimulationClient from "@/components/finance/SimulationClient"
import { Calculator } from "lucide-react"

export default async function SimulationPage() {
  const user = await requireModePage("personal")
  const uiPreferences = mergeUiPreferences((user as any).uiPreferences)
  return (
    <AppFrame
      brand="payMap" icon="🔮" version={`${DASHBOARD_VERSION_LABEL} · Simulation`}
      title="จำลองอนาคต" subtitle="ถ้าออมเดือนละ X ปีที่ Y คุณจะมีเงินเท่าไหร่?"
      accent="#6366f1"
      nav={[
        { href: "/dashboard",  label: "Dashboard",    icon: Calculator, accent: "#6366f1", active: false },
        { href: "/simulation", label: "จำลองอนาคต",   icon: Calculator, accent: "#6366f1", active: true },
      ]}
    >
      <div className="space-y-6">
        <ProductHero eyebrow="Financial simulation" title="จำลองอนาคต" description="จำลองอนาคตการเงิน, การออม และ scenario planning ในหน้าที่ดูคมและใช้งานง่ายกว่าเดิม" badge="พร้อมใช้งาน" accent="#6366f1" />
        <ProductQuickLinks links={[{ href: "/dashboard", title: "Dashboard", description: "กลับไปหน้า overview ก่อนสร้าง scenario" }, { href: "/networth", title: "Open net worth", description: "ใช้ฐานะปัจจุบันประกอบการจำลองอนาคต" }, { href: "/reports", title: "Review reports", description: "ดูผลย้อนหลังเพื่อใช้ตั้งสมมติฐาน" }]} />
        <ProductSection title="Focused module surface" description="ยกระดับ page shell ให้เป็น product module ที่อ่านง่ายขึ้น โดยยังใช้ logic เดิมของ client component เหมือนเดิม">
      <SimulationClient showCharts={uiPreferences.showCharts} />
        </ProductSection>
      </div>
    </AppFrame>
  )
}
