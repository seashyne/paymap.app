import Link from "next/link"
import { ArrowRight, FileCheck2, Lock, ShieldCheck } from "lucide-react"
import PublicShell from "@/components/public/PublicShell"
import { detectSiteLang, getSiteMessages } from "@/lib/i18n/site"

export const revalidate = 3600
export const metadata = { title: "Legal Center — PayMap" }

export default function LegalCenterPage() {
  const lang = detectSiteLang()
  const t = getSiteMessages(lang).legal
  const cards = [
    { key: "terms", href: "/terms", icon: FileCheck2, accent: "#8b5cf6" },
    { key: "privacy", href: "/privacy", icon: Lock, accent: "#38bdf8" },
    { key: "consent", href: "/settings/legal", icon: ShieldCheck, accent: "#10b981" },
  ] as const

  return (
    <PublicShell eyebrow={t.eyebrow} title={t.title} description={t.description} ctaHref="/help" ctaLabel={t.cta}>
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          const local = t.cards[card.key]
          return (
            <Link key={card.href} href={card.href} className="public-panel-v72 group transition-transform hover:-translate-y-0.5">
              <div className="public-mode-icon-v72" style={{ background: `${card.accent}18`, color: card.accent, borderColor: `${card.accent}33` }}>
                <Icon size={20} />
              </div>
              <h2 className="mt-5 text-2xl font-black">{local.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--text-2)]">{local.desc}</p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold" style={{ color: card.accent }}>{t.open} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></div>
            </Link>
          )
        })}
      </div>
    </PublicShell>
  )
}
