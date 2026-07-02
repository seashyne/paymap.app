import Link from "next/link"
import { ArrowRight, Building2, Check, CreditCard, Lock, Sparkles, Store } from "lucide-react"
import { BUSINESS_PRICING, MERCHANT_PRICING } from "@/lib/stripe"
import { getCurrentSession } from "@/lib/session"
import PricingFeatureMatrix from "@/components/subscription/PricingFeatureMatrix"
import PublicShell from "@/components/public/PublicShell"
import { detectSiteLang, getSiteMessages } from "@/lib/i18n/site"
import LocalFirstPricingPage from "@/components/local-first/LocalFirstPricingPage"

export const revalidate = 3600
export const metadata = { title: "Pricing — PayMap" }

const baseSections = [
  {
    key: "business",
    title: "Business",
    color: "#38bdf8",
    icon: Building2,
    plans: [
      { key: "free", price: 0, yearly: 0, name: "Business Free", features: ["Employees + Leave", "Payroll basic", "Invoices Lite", "Business dashboard"], highlight: false },
      { key: "sme", price: BUSINESS_PRICING.sme.thb, yearly: BUSINESS_PRICING.sme.yearlyThb, name: "Business SME", features: ["Accounting", "Reconciliation", "VAT / tax", "Multi-member team"], highlight: true },
      { key: "scale", price: BUSINESS_PRICING.scale.thb, yearly: BUSINESS_PRICING.scale.yearlyThb, name: "Business Scale", features: ["Higher limits", "Analytics", "API", "Automation"], highlight: false },
    ],
  },
  {
    key: "merchant",
    title: "Merchant",
    color: "#f43f5e",
    icon: Store,
    plans: [
      { key: "free", price: 0, yearly: 0, name: "Merchant Free", features: ["Sales basic", "Inventory basic", "1 branch", "Daily dashboard"], highlight: false },
      { key: "starter", price: MERCHANT_PRICING.starter.thb, yearly: MERCHANT_PRICING.starter.yearlyThb, name: "Starter", features: ["More users", "More reports", "Export", "Store setup"], highlight: false },
      { key: "growth", price: MERCHANT_PRICING.growth.thb, yearly: MERCHANT_PRICING.growth.yearlyThb, name: "Growth", features: ["VAT + tax", "Merchant accounting", "Reconciliation", "Supplier workflow"], highlight: true },
    ],
  },
] as const

function cardHref(sectionKey: string, planKey: string, isLoggedIn: boolean) {
  const paid = planKey !== "free"
  if (!isLoggedIn) return `/register?mode=${sectionKey}&plan=${planKey}${paid ? "&trial=1" : ""}`
  return `/billing?product=${sectionKey}&plan=${planKey}${paid ? "&trial=1" : ""}`
}

async function LegacyPricingPage({ searchParams }: { searchParams?: { focus?: string; feature?: string } }) {
  const session = await getCurrentSession()
  const isLoggedIn = !!session
  const focus = searchParams?.focus
  const feature = searchParams?.feature
  const lang = detectSiteLang()
  const t = getSiteMessages(lang).pricing

  return (
    <PublicShell
      eyebrow={t.eyebrow}
      title={t.title}
      description={t.description}
      ctaHref={isLoggedIn ? "/billing" : "/register?mode=business"}
      ctaLabel={isLoggedIn ? t.ctaLoggedIn : t.ctaLoggedOut}
    >
      {feature ? (
        <div className="public-inline-alert-v72 mb-8 border-amber-400/30 bg-amber-500/10 text-amber-200">
          <Lock size={16} className="mt-0.5 shrink-0" />
          <span>{t.featureAlert.replace("{feature}", feature)}</span>
        </div>
      ) : null}

      <div className="space-y-8">
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="public-panel-v72">
            <div className="public-section-label">ERP Lite first</div>
            <h2 className="mt-2 text-2xl font-black">Start with the operating workflow that replaces Excel</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">PayMap focuses on SME workflows: invoice, stock, sales, cashflow, VAT, and reports without the weight of a full ERP.</p>
          </div>
          <div className="public-panel-v72">
            <div className="public-section-label">Business setup</div>
            <h2 className="mt-2 text-2xl font-black">Use Business for invoice, customers, accounting, and payroll</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">Good for service businesses and small teams that need cleaner receivables and operating reports.</p>
          </div>
          <div className="public-panel-v72">
            <div className="public-section-label">Store setup</div>
            <h2 className="mt-2 text-2xl font-black">Use Merchant for POS, sales, stock, and VAT</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">Good for shops that need a lighter system for counter work and daily close.</p>
          </div>
        </section>
        {baseSections.filter((s) => !focus || s.key === focus || (focus === "enterprise" && s.key === "business")).map((section) => {
          const Icon = section.icon
          const localSection = t.sections[section.key as keyof typeof t.sections]
          return (
            <section key={section.key} className="public-panel-v72">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="public-mode-icon-v72" style={{ color: section.color, background: `${section.color}16`, borderColor: `${section.color}33` }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="public-section-label">{section.key} {t.workspaceLabel}</div>
                    <h2 className="text-3xl font-black" style={{ color: section.color }}>{section.title}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--text-2)]">{localSection.subtitle}</p>
                  </div>
                </div>
                <div className="public-chip-v72"><Sparkles size={13} /> {t.simpleBadge}</div>
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-3">
                {section.plans.map((plan) => {
                  const localPlan = localSection.plans[plan.key as keyof typeof localSection.plans]
                  return (
                    <div key={plan.key} className={`public-price-card-v72 ${plan.highlight ? "is-highlight" : ""}`} style={{ borderColor: plan.highlight ? `${section.color}55` : undefined, background: plan.highlight ? `linear-gradient(180deg, ${section.color}14, var(--card))` : undefined }}>
                      {plan.highlight ? <div className="public-price-badge-v72" style={{ background: section.color }}>{t.recommended}</div> : null}
                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-3)]">{plan.name}</div>
                      <div className="mt-4 flex items-end gap-1">
                        <span className="text-4xl font-black">{plan.price === 0 ? t.freeForever : `฿${plan.price.toLocaleString(lang === "en" ? "en-US" : "th-TH")}`}</span>
                        <span className="pb-2 text-xs text-[var(--text-3)]">{plan.price === 0 ? t.forever : t.perMonth}</span>
                      </div>
                      {plan.yearly ? <div className="mt-1 text-xs text-[var(--text-3)]">{t.yearly} ฿{plan.yearly.toLocaleString(lang === "en" ? "en-US" : "th-TH")}</div> : null}
                      <p className="mt-4 text-sm leading-7 text-[var(--text-2)]">{localPlan.desc}</p>
                      <div className="mt-5 space-y-2 text-sm text-[var(--text-2)]">
                        {plan.features.map((f) => (
                          <div key={f} className="flex items-start gap-2"><Check size={14} className="mt-1 shrink-0" style={{ color: section.color }} /> <span>{f}</span></div>
                        ))}
                      </div>
                      <Link href={cardHref(section.key, plan.key, isLoggedIn)} className="public-btn public-btn-primary mt-6 inline-flex w-full items-center justify-center gap-2" style={{ background: section.color }}>
                        {localPlan.cta} <ArrowRight size={14} />
                      </Link>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}

        <section className="public-panel-v72">
          <div className="flex flex-col gap-4 rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="public-section-label">Choose the workflow</div>
              <h2 className="mt-2 text-2xl font-black">Not sure which setup to start with?</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--text-2)]">Start Business if you sell by invoice. Start Merchant if you sell from a counter and need stock control.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/for-business" className="public-btn public-btn-ghost">Explore Business</Link>
              <Link href="/for-merchants" className="public-btn public-btn-ghost">Explore Merchant</Link>
            </div>
          </div>
        </section>

        <section className="public-panel-v72">
          <div className="flex items-center gap-3">
            <div className="public-mode-icon-v72"><CreditCard size={18} /></div>
            <div>
              <div className="public-section-label">{t.matrixEyebrow}</div>
              <h2 className="text-2xl font-black">{t.matrixTitle}</h2>
            </div>
          </div>
          <div className="mt-6 overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4 md:p-6">
            <PricingFeatureMatrix />
          </div>
        </section>
      </div>
    </PublicShell>
  )
}

export default LocalFirstPricingPage
