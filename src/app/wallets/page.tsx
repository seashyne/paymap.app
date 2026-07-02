import { requireModePage } from "@/lib/authz"
import AppFrame, { buildPrimaryNav } from "@/components/layout/AppFrame"
import WalletsClient from "@/components/finance/WalletsClient"
import { mergeUiPreferences } from "@/lib/ui-preferences"
import { getTemplateModuleSurface } from "@/lib/ui-template-modules"
import { TemplateModuleIntro } from "@/components/ui/TemplateModuleSurface"
import { DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { ProductHero, ProductQuickLinks, ProductSection } from "@/components/product/ProductMasterSurface"

export default async function WalletsPage() {
  const user = await requireModePage("personal")
  const uiPreferences = mergeUiPreferences(user.uiPreferences ?? null)
  const surface = getTemplateModuleSurface(uiPreferences.template, "wallets")

  return (
    <AppFrame
      brand="payMap"
      icon="💳"
      version={`${DASHBOARD_VERSION_LABEL} · Wallets`}
      title={surface.title}
      subtitle={surface.description}
      accent={uiPreferences.primaryColor}
      planLabel={user.plan}
      accountMode={(user.accountMode ?? "personal") as "personal" | "business" | "merchant"}
      nav={buildPrimaryNav("wallets")}
    >
      <div className="space-y-6">
        <ProductHero eyebrow="Wallet management" title="Wallet coverage and account mapping" description="ใช้หน้า Wallets เป็น workbench สำหรับบัญชี, cash pockets, transfer structure และการเชื่อมภาพรวมกลับไปที่ personal cockpit โดยยังใช้ logic เดิมทั้งหมดของระบบ." badge="Personal mode" accent={uiPreferences.primaryColor} stats={[{ label: "Template", value: uiPreferences.template, hint: "workspace preset" }, { label: "Bottom nav", value: uiPreferences.showBottomNav ? "On" : "Off", hint: "mobile behavior" }, { label: "Quick actions", value: uiPreferences.showQuickActions ? "On" : "Off", hint: "surface controls" }]} />
        <ProductQuickLinks links={[{ href: "/dashboard", title: "Back to cockpit", description: "กลับไป personal dashboard แบบใหม่พร้อม net worth และ obligations" }, { href: "/reports", title: "See wallet impact in reports", description: "ดูผลของ transaction และ wallet movement ในมุมมองรายงาน" }, { href: "/settings", title: "Tune wallet surface", description: "ปรับ template, colors และ workspace behavior ได้จาก settings" }]} />
        <ProductSection title="Wallet workspace" description="จัดหน้า wallet ให้เป็นส่วนต่อของ personal cockpit: ข้อมูลอยู่ใน panel ที่อ่านง่ายขึ้น, spacing คงมาตรฐานเดียวกับ dashboard และยังไม่เปลี่ยน business logic เดิม">
        <TemplateModuleIntro surface={surface} />
        <WalletsClient template={uiPreferences.template} moduleSurface={surface} />
        </ProductSection>
      </div>
    </AppFrame>
  )
}
