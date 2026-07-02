import AppFrame from "@/components/layout/AppFrame"
import { BarChart3, CreditCard, LayoutGrid, Settings, Wallet } from "lucide-react"
import { requireModePage } from "@/lib/authz"
import { getCurrentPlan } from "@/lib/subscription/current-plan"
import { AnalyticsWorkspace } from "@/components/v15/workspace-kit"
import { ProductHero, ProductQuickLinks, ProductSection } from "@/components/product/ProductMasterSurface"

export default async function AnalyticsPage() {
  const user = await requireModePage("personal")
  const rows = [
    { id: 1, metric: "Revenue efficiency", owner: "Business", status: "Healthy", trend: "+12%", score: 96 },
    { id: 2, metric: "POS latency", owner: "Merchant", status: "Healthy", trend: "38ms", score: 94 },
    { id: 3, metric: "Cash buffer", owner: "Personal", status: "Watch", trend: "-4%", score: 82 },
    { id: 4, metric: "Collections", owner: "Business", status: "Review", trend: "12 overdue", score: 78 },
  ]
  return (
    <AppFrame
      brand="PayMap"
      icon="◈"
      version="PayMap 15 · Analytics"
      title="Analytics"
      subtitle="Cross-context analytics with signal registry, trends and AI commentary"
      accent="#14b8a6"
      planLabel={String(getCurrentPlan(user, user.accountMode))}
      accountMode={user.accountMode as any}
      nav={[
        { href: "/dashboard", label: "Overview", icon: LayoutGrid, accent: "#8b5cf6", active: false },
        { href: "/wallets", label: "Wallets", icon: Wallet, accent: "#8b5cf6", active: false },
        { href: "/analytics", label: "Analytics", icon: BarChart3, accent: "#14b8a6", active: true },
        { href: "/billing", label: "Billing", icon: CreditCard, accent: "#22c55e", active: false },
        { href: "/settings", label: "Settings", icon: Settings, accent: "#f59e0b", active: false },
      ]}
    >
      <div className="space-y-6">
        <ProductHero eyebrow="Analytics center" title="Signal registry and cross-workspace trends" description="Analytics ถูกวางให้เป็นห้องอ่านสัญญาณของ PayMap ทั้ง personal, business และ merchant แต่ยังคง visual language เดียวกับ cockpit ฝั่ง personal เพื่อให้การสลับหน้ารู้สึกลื่นและเป็นระบบเดียวกัน." badge="Insights mode" accent="#14b8a6" stats={[{ label: "Signals", value: "24", hint: "curated KPIs" }, { label: "Realtime", value: "Enabled", hint: "streaming ready" }, { label: "Forecast", value: "Strong", hint: "high confidence" }]} />
        <ProductQuickLinks links={[{ href: "/dashboard", title: "Back to personal cockpit", description: "กลับไป overview หลักของผู้ใช้ทั่วไปพร้อม spending trends และ quick actions" }, { href: "/reports", title: "Open reports center", description: "ดู report blocks ที่รวม personal, merchant และ business ไว้ในหน้าเดียว" }, { href: "/billing", title: "Review plan and access", description: "เช็กสิทธิ์การใช้งานและ package ของ analytics surfaces" }]} />
        <ProductSection title="Analytics workspace" description="หน้า analytics ถูกหุ้มใหม่ให้ spacing, card language และ hierarchy เดินทางเดียวกับหน้าหลักของ PayMap">
          <AnalyticsWorkspace rows={rows} />
        </ProductSection>
      </div>
    </AppFrame>
  )
}
