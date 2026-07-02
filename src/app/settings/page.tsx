import AppFrame, { buildPrimaryNav } from "@/components/layout/AppFrame"
import { requireUser } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { getCurrentPlan } from "@/lib/subscription/current-plan"
import { mergeUiPreferences } from "@/lib/ui-preferences"
import { getTemplateModuleSurface } from "@/lib/ui-template-modules"
import { detectSiteLang } from "@/lib/i18n/site"
import { ProductHero, ProductQuickLinks, ProductSection } from "@/components/product/ProductMasterSurface"
import { TemplateModuleIntro } from "@/components/ui/TemplateModuleSurface"
import SettingsClient from "./SettingsClient"

export default async function SettingsPage({ searchParams }: { searchParams?: { tab?: string } }) {
  const user = await requireUser()
  const lang = detectSiteLang()
  const detailedUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      productSubscriptions: { select: { product: true, planTier: true, status: true, currentPeriodEnd: true } },
      stripeSubscription: { select: { plan: true, status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true } },
    },
  })

  if (!detailedUser) return null

  const uiPreferences = mergeUiPreferences(detailedUser.uiPreferences ?? null)
  const surface = getTemplateModuleSurface(uiPreferences.template, "settings")
  const currentPlan = getCurrentPlan(detailedUser as any, detailedUser.accountMode)
  const initialTab = searchParams?.tab === "data" ? "data" : undefined

  return (
    <AppFrame
      brand="PayMap"
      icon="◈"
      version="PayMap 15 · Settings Hub"
      title={surface.title}
      subtitle={surface.description}
      accent={uiPreferences.primaryColor}
      planLabel={String(currentPlan)}
      accountMode={detailedUser.accountMode as any}
      nav={buildPrimaryNav("settings", lang)}
    >
      <div className="space-y-6">
        <ProductHero
          eyebrow={surface.eyebrow}
          title={surface.title}
          description={surface.description}
          badge="Workspace control"
          accent={uiPreferences.primaryColor}
          stats={[
            { label: "Template", value: uiPreferences.template, hint: "current shell preset" },
            { label: "Default page", value: uiPreferences.defaultPage, hint: "start destination" },
            { label: "Quick actions", value: uiPreferences.showQuickActions ? "Enabled" : "Off", hint: "desktop shell" },
          ]}
        />

        <ProductQuickLinks
          links={[
            { href: "/dashboard", title: "Back to workspace", description: "กลับไปหน้าหลักโดยยังใช้ shell และ preferences ชุดเดิม" },
            { href: "/billing", title: "Billing and plans", description: "จัดการแพ็กเกจ สิทธิ์ และการต่ออายุจากเส้นทางเดียวกัน" },
            { href: "/settings/pay-profile", title: "Pay profile", description: "ตั้งค่าหน้ารับเงินและ public profile ที่ผู้ใช้ภายนอกเห็น" },
          ]}
        />

        <ProductSection title="Settings hub overview" description="เก็บ intro และ settings ที่แก้ไขได้จริงไว้ในหน้าเดียว ไม่แยกเป็นหน้าโชว์อย่างเดียว">
          <TemplateModuleIntro surface={surface} />
          <SettingsClient
            lang={lang}
            initialTab={initialTab}
            moduleSurface={surface}
            user={{
              name: detailedUser.name ?? "",
              email: detailedUser.email ?? "",
              plan: String(currentPlan),
              provider: detailedUser.provider ?? null,
              image: detailedUser.image ?? null,
              accountMode: detailedUser.accountMode as "personal" | "business" | "merchant",
              country: detailedUser.country ?? "TH",
              currency: detailedUser.currency ?? "THB",
              locale: detailedUser.locale ?? "th-TH",
              timezone: detailedUser.timezone ?? "Asia/Bangkok",
              emailVerified: detailedUser.emailVerified ?? null,
              createdAt: detailedUser.createdAt,
              loginCount: detailedUser.loginCount ?? 0,
              lastLoginAt: detailedUser.lastLoginAt ?? null,
              displayName: detailedUser.displayName ?? null,
              username: detailedUser.username ?? null,
              bio: detailedUser.bio ?? null,
              phone: detailedUser.phone ?? null,
              website: detailedUser.website ?? null,
              uiPreferences,
              stripeSubscription: detailedUser.stripeSubscription ? {
                plan: detailedUser.stripeSubscription.plan,
                status: detailedUser.stripeSubscription.status,
                currentPeriodEnd: detailedUser.stripeSubscription.currentPeriodEnd,
                cancelAtPeriodEnd: detailedUser.stripeSubscription.cancelAtPeriodEnd,
              } : null,
              productSubscriptions: detailedUser.productSubscriptions.map((item) => ({
                product: item.product,
                planTier: item.planTier,
                status: item.status,
                currentPeriodEnd: item.currentPeriodEnd ?? null,
              })),
            }}
          />
        </ProductSection>
      </div>
    </AppFrame>
  )
}
