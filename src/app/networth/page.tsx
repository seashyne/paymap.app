// v24.0: Net Worth Page
import { requireModePage } from "@/lib/authz"
import { mergeUiPreferences } from "@/lib/ui-preferences"
import AppFrame from "@/components/layout/AppFrame"
import { DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { ProductHero, ProductQuickLinks, ProductSection } from "@/components/product/ProductMasterSurface"
import NetWorthClient from "@/components/finance/NetWorthClient"
import { TrendingUp } from "lucide-react"

export default async function NetWorthPage() {
  const user = await requireModePage("personal")
  const uiPreferences = mergeUiPreferences((user as any).uiPreferences)
  return (
    <AppFrame
      brand="payMap" icon="💎" version={`${DASHBOARD_VERSION_LABEL} · Net Worth`}
      title="Net Worth" subtitle="ทรัพย์สิน - หนี้สิน = ความมั่งคั่งสุทธิของคุณ"
      accent="#22c55e"
      nav={[
        { href: "/dashboard", label: "Dashboard", icon: TrendingUp, accent: "#22c55e", active: false },
        { href: "/networth",  label: "Net Worth",  icon: TrendingUp, accent: "#22c55e", active: true },
      ]}
    >
      <div className="space-y-6">
        <ProductHero eyebrow="Wealth tracking" title="Net Worth" description="มองความมั่งคั่งสุทธิและ movement ของสินทรัพย์กับหนี้ในรูปแบบที่อ่านง่ายขึ้นบน desktop" badge="พร้อมใช้งาน" accent="#22c55e" />
        <ProductQuickLinks links={[{ href: "/dashboard", title: "Dashboard", description: "กลับไปหน้า overview และ daily command surface" }, { href: "/reports", title: "Open reports", description: "ดูผลของ asset/liability ในภาพรวมการเงิน" }, { href: "/simulation", title: "Run simulations", description: "เชื่อมการคาดการณ์กับฐานะปัจจุบันของคุณ" }]} />
        <ProductSection title="Focused module surface" description="ยกระดับ page shell ให้เป็น product module ที่อ่านง่ายขึ้น โดยยังใช้ logic เดิมของ client component เหมือนเดิม">
      <NetWorthClient showCharts={uiPreferences.showCharts} />
        </ProductSection>
      </div>
    </AppFrame>
  )
}
