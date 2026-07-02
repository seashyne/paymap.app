import { requireUser } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import BillingClient from "@/components/billing/BillingClient"
import BillingHistoryPanel from "@/components/billing/BillingHistoryPanel"
import AppFrame, { buildPrimaryNav } from "@/components/layout/AppFrame"
import { DASHBOARD_VERSION_LABEL } from "@/lib/app-version"
import { getCurrentPlan } from "@/lib/subscription/current-plan"
import { mergeUiPreferences } from "@/lib/ui-preferences"
import { getTemplateModuleSurface } from "@/lib/ui-template-modules"
import { TemplateModuleIntro } from "@/components/ui/TemplateModuleSurface"
import { ProductHero, ProductQuickLinks, ProductSection } from "@/components/product/ProductMasterSurface"
import { detectSiteLang } from "@/lib/i18n/site"
import { getAppMessages } from "@/lib/i18n/app"

export default async function BillingPage() {
  const user = await requireUser()
  const lang = detectSiteLang()
  const t = getAppMessages(lang)
  const uiPreferences = mergeUiPreferences(user.uiPreferences ?? null)
  const surface = getTemplateModuleSurface(uiPreferences.template, "billing")

  const allAccounts = await prisma.user.findMany({
    where: { email: user.email },
    select: { accountMode: true },
  })
  const availableModes = allAccounts.map(a => a.accountMode) as ("personal" | "business" | "merchant")[]
  const currentPlan = getCurrentPlan(user, user.accountMode ?? "personal")

  return (
    <AppFrame
      brand="payMap"
      icon="₿"
      version={`${DASHBOARD_VERSION_LABEL} · ${t.billing.title}`}
      title={t.billing.title}
      subtitle={t.billing.subtitle}
      accent={uiPreferences.primaryColor}
      planLabel={currentPlan}
      accountMode={(user.accountMode ?? "personal") as "personal" | "business" | "merchant"}
      nav={buildPrimaryNav("billing", lang)}
    >
      <div className="space-y-6">
        <ProductHero eyebrow={t.billing.eyebrow} title={t.billing.title} description={t.billing.heroDescription} badge={t.common.launchReady} accent={uiPreferences.primaryColor} stats={[{ label: t.billing.stats.plan, value: String(currentPlan), hint: t.common.activeWorkspace }, { label: t.billing.stats.modes, value: String(availableModes.length), hint: "accounts on this email" }, { label: t.billing.stats.stripe, value: user.stripeCustomerId ? t.common.linked : t.common.notLinked, hint: "customer status" }]} />
        <ProductQuickLinks links={[{ href: "/pricing", title: t.billing.quickLinks.pricing[0], description: t.billing.quickLinks.pricing[1] }, { href: "/settings", title: t.billing.quickLinks.settings[0], description: t.billing.quickLinks.settings[1] }, { href: "/reports", title: t.billing.quickLinks.reports[0], description: t.billing.quickLinks.reports[1] }]} />
        <ProductSection title={t.billing.section[0]} description={t.billing.section[1]}>
        <TemplateModuleIntro surface={surface} />
        <BillingClient
          plan={currentPlan}
          accountMode={(user.accountMode ?? "personal") as "personal" | "business" | "merchant"}
          availableModes={availableModes}
          productSubscriptions={user.productSubscriptions.map(s => ({
            product: s.product,
            planTier: s.planTier,
            status: s.status,
            currentPeriodEnd: s.currentPeriodEnd,
          }))}
          stripeCustomerId={user.stripeCustomerId}
          moduleSurface={surface}
          lang={lang}
        />
        </ProductSection>
        <BillingHistoryPanel />
      </div>
    </AppFrame>
  )
}
