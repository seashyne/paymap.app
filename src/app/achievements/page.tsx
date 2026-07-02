// v24.0: Achievements / Gamification Page
import { requireModePage } from "@/lib/authz"
import AppFrame from "@/components/layout/AppFrame"
import { DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { ProductHero, ProductQuickLinks, ProductSection } from "@/components/product/ProductMasterSurface"
import AchievementsClient from "@/components/finance/AchievementsClient"
import { Trophy } from "lucide-react"

export default async function AchievementsPage() {
  await requireModePage("personal")
  return (
    <AppFrame
      brand="payMap" icon="🏆" version={`${DASHBOARD_VERSION_LABEL} · Achievements`}
      title="Achievements" subtitle="XP, Level, ความสำเร็จ และสถิติการออมของคุณ"
      accent="#f59e0b"
      nav={[
        { href: "/dashboard",    label: "Dashboard",    icon: Trophy, accent: "#f59e0b", active: false },
        { href: "/achievements", label: "Achievements",  icon: Trophy, accent: "#f59e0b", active: true },
      ]}
    >
      <div className="space-y-6">
        <ProductHero eyebrow="Progress tracking" title="Achievements" description="รวมความสำเร็จ, level และ milestone ให้ดูเหมือน product surface เต็มรูปแบบ" badge="พร้อมใช้งาน" accent="#f59e0b" />
        <ProductQuickLinks links={[{ href: "/dashboard", title: "Back to dashboard", description: "กลับไปหน้า overview และ quick actions" }, { href: "/wallets", title: "Wallet progress", description: "ดูฐานข้อมูลที่ช่วยปลด achievement ต่าง ๆ" }, { href: "/reports", title: "Review performance", description: "ดูภาพรวมตัวเลขที่ผลักดัน achievement" }]} />
        <ProductSection title="Focused module surface" description="ยกระดับ page shell ให้เป็น product module ที่อ่านง่ายขึ้น โดยยังใช้ logic เดิมของ client component เหมือนเดิม">
      <AchievementsClient />
        </ProductSection>
      </div>
    </AppFrame>
  )
}
