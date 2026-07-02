// v24.0: Loan Tracking Page
import { requireModePage } from "@/lib/authz"
import AppFrame from "@/components/layout/AppFrame"
import { DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { ProductHero, ProductQuickLinks, ProductSection } from "@/components/product/ProductMasterSurface"
import LoansClient from "@/components/finance/LoansClient"
import { Users } from "lucide-react"

export default async function LoansPage() {
  await requireModePage("personal")
  return (
    <AppFrame
      brand="payMap" icon="🤝" version={`${DASHBOARD_VERSION_LABEL} · Loans`}
      title="ยืม-ให้ยืม" subtitle="ติดตามเงินที่ให้ยืมและเงินที่ยืมคนอื่น"
      accent="#6366f1"
      nav={[
        { href: "/dashboard", label: "Dashboard", icon: Users, accent: "#6366f1", active: false },
        { href: "/loans",     label: "ยืม-ให้ยืม", icon: Users, accent: "#6366f1", active: true },
      ]}
    >
      <div className="space-y-6">
        <ProductHero eyebrow="Loan tracking" title="ยืม-ให้ยืม" description="ตามหนี้, เงินให้ยืม และสถานะ collection ในจังหวะการอ่านที่ดีขึ้น" badge="พร้อมใช้งาน" accent="#6366f1" />
        <ProductQuickLinks links={[{ href: "/dashboard", title: "Back to dashboard", description: "กลับไปภาพรวมก่อนจัดการ debt flows" }, { href: "/wallets", title: "Linked wallets", description: "ดูบัญชีที่ใช้จ่ายหรือรับชำระหนี้" }, { href: "/reports", title: "Debt reports", description: "เชื่อมภาพรวมการชำระหนี้เข้ากับ report center" }]} />
        <ProductSection title="Focused module surface" description="ยกระดับ page shell ให้เป็น product module ที่อ่านง่ายขึ้น โดยยังใช้ logic เดิมของ client component เหมือนเดิม">
      <LoansClient />
        </ProductSection>
      </div>
    </AppFrame>
  )
}
