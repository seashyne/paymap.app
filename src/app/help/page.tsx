import Link from "next/link"
import { ArrowRight, BadgeHelp, CreditCard, FileText, LifeBuoy, Lock, Receipt, ShieldCheck, Wallet } from "lucide-react"
import PublicShell from "@/components/public/PublicShell"
import { detectSiteLang, getSiteMessages } from "@/lib/i18n/site"

export const revalidate = 3600
export const metadata = { title: "Help Center — PayMap" }

export default function HelpPage() {
  const lang = detectSiteLang()
  const t = getSiteMessages(lang).help
  const sections = [
    { key: "gettingStarted", icon: Wallet },
    { key: "billing", icon: CreditCard },
    { key: "security", icon: ShieldCheck },
  ] as const
  const quickLinks = [
    { href: "/pricing", label: t.quickLinkLabels.pricing, icon: CreditCard },
    { href: "/billing", label: t.quickLinkLabels.billing, icon: Receipt },
    { href: "/terms", label: t.quickLinkLabels.terms, icon: FileText },
    { href: "/privacy", label: t.quickLinkLabels.privacy, icon: Lock },
  ]

  return (
    <PublicShell eyebrow={t.eyebrow} title={t.title} description={t.description} ctaHref="/register?mode=business" ctaLabel={t.cta}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.8fr)]">
        <div className="space-y-6">
          {sections.map((section) => {
            const Icon = section.icon
            const local = t.sections[section.key]
            return (
              <section key={section.key} className="public-panel-v72">
                <div className="flex items-center gap-3">
                  <div className="public-mode-icon-v72 text-[var(--primary)]"><Icon size={18} /></div>
                  <div>
                    <div className="public-section-label">{t.helpTopic}</div>
                    <h2 className="text-2xl font-black">{local.title}</h2>
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  {local.items.map(([q, a]) => (
                    <div key={q} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                      <div className="font-bold">{q}</div>
                      <div className="mt-1 text-sm leading-7 text-[var(--text-2)]">{a}</div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        <aside className="space-y-6 min-w-0">
          <section className="public-panel-v72 public-panel-v72-soft">
            <div className="flex items-center gap-3">
              <div className="public-mode-icon-v72 text-[var(--primary)]"><BadgeHelp size={18} /></div>
              <div>
                <div className="public-section-label">{t.quickLinks}</div>
                <h2 className="text-xl font-black">{t.commonLinks}</h2>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {quickLinks.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href} className="flex items-center justify-between rounded-[20px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-semibold hover:bg-[var(--surface-3)]">
                    <span className="flex items-center gap-3 min-w-0"><Icon size={16} className="shrink-0 text-[var(--primary)]" /> <span className="truncate">{item.label}</span></span>
                    <ArrowRight size={14} className="shrink-0 text-[var(--text-3)]" />
                  </Link>
                )
              })}
            </div>
          </section>

          <section className="public-panel-v72 border-emerald-400/20 bg-emerald-400/10 text-emerald-100">
            <div className="flex items-center gap-3">
              <div className="public-mode-icon-v72 border-emerald-300/25 bg-emerald-400/15 text-emerald-200"><LifeBuoy size={18} /></div>
              <div>
                <div className="public-section-label text-emerald-200/70">{t.fastPath}</div>
                <h2 className="text-xl font-black">{t.fastest}</h2>
              </div>
            </div>
            <div className="mt-4 text-sm leading-7">{t.fastestBody}</div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/register?mode=business" className="public-btn public-btn-primary bg-emerald-500">{t.cta}</Link>
              <Link href="/pricing" className="public-btn public-btn-ghost border-emerald-300/30 bg-transparent text-emerald-100">{t.viewPlans}</Link>
            </div>
          </section>
        </aside>
      </div>
    </PublicShell>
  )
}
