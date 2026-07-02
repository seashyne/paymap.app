// v24.0: Installments Page
import { requireModePage } from "@/lib/authz"
import AppFrame from "@/components/layout/AppFrame"
import { DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { ProductHero, ProductQuickLinks, ProductSection } from "@/components/product/ProductMasterSurface"
import InstallmentsClient from "@/components/finance/InstallmentsClient"
import { CreditCard } from "lucide-react"

export default async function InstallmentsPage() {
  await requireModePage("personal")
  return (
    <AppFrame
      brand="payMap" icon="📱" version={`${DASHBOARD_VERSION_LABEL} · Installments`}
      title="ผ่อนชำระ" subtitle="ติดตามการผ่อนมือถือ รถ บัตรเครดิต และสินค้าต่างๆ"
      accent="#f59e0b"
      nav={[
        { href: "/dashboard",    label: "Dashboard", icon: CreditCard, accent: "#f59e0b", active: false },
        { href: "/installments", label: "ผ่อนชำระ",  icon: CreditCard, accent: "#f59e0b", active: true },
      ]}
    >
      <div className="space-y-6">
        <ProductHero eyebrow="Installment planner" title="ผ่อนชำระ" description="คุมภาระผ่อนชำระและภาระรายเดือนใน layout ที่พร้อมใช้งานบนจอใหญ่" badge="พร้อมใช้งาน" accent="#f59e0b" />
        <ProductQuickLinks links={[{ href: "/dashboard", title: "Back to dashboard", description: "เช็กผลของค่างวดต่อภาพรวมรายเดือน" }, { href: "/wallets", title: "Funding wallets", description: "ดู wallet ที่ใช้ตัดค่างวดประจำ" }, { href: "/reports", title: "Monthly reports", description: "เปรียบเทียบค่างวดกับรายจ่ายรวม" }]} />
        <ProductSection title="Focused module surface" description="ยกระดับ page shell ให้เป็น product module ที่อ่านง่ายขึ้น โดยยังใช้ logic เดิมของ client component เหมือนเดิม">
      <InstallmentsClient />
        </ProductSection>
      </div>
    </AppFrame>
  )
}
