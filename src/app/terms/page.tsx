import type { Metadata } from "next"
import PublicShell from "@/components/public/PublicShell"
import { detectSiteLang, getSiteMessages } from "@/lib/i18n/site"
import {
  TOS_SECTIONS,
  PRIVACY_SECTIONS,
  APP_FULL_NAME,
  TOS_VERSION,
  PRIVACY_VERSION,
  TOS_EFFECTIVE,
  SUPPORT_EMAIL,
  COMPANY_NAME,
} from "@/lib/tos-content"

export const revalidate = 3600

export const metadata: Metadata = {
  title: `Terms of Service — ${APP_FULL_NAME}`,
  description: `Terms of Service และ Privacy Policy ของ ${APP_FULL_NAME}`,
}

function SectionBlock({ s }: { s: { id: string; title: string; titleEN: string; content: string; important?: boolean } }) {
  return (
    <section id={s.id} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-5">
      <h3 className="flex items-center gap-2 text-lg font-bold" style={{ color: s.important ? "var(--primary)" : "var(--text)" }}>
        {s.important ? <span>⚠️</span> : null}
        {s.title}
        <span className="text-xs font-normal text-[var(--text-3)]">{s.titleEN}</span>
      </h3>
      <div className="mt-3 whitespace-pre-line border-l-[3px] border-[var(--border)] pl-4 text-sm leading-8 text-[var(--text-2)]">
        {s.content}
      </div>
    </section>
  )
}

export default function TermsPage() {
  const lang = detectSiteLang()
  const t = getSiteMessages(lang).legal.termsPage
  const badges = [
    { label: "TOS Version", value: `v${TOS_VERSION}` },
    { label: "Privacy Version", value: `v${PRIVACY_VERSION}` },
    { label: t.effective, value: new Date(TOS_EFFECTIVE).toLocaleDateString(lang === "en" ? "en-US" : "th-TH", { year: "numeric", month: "long", day: "numeric" }) },
    { label: t.provider, value: COMPANY_NAME },
  ]

  return (
    <PublicShell
      eyebrow={t.eyebrow}
      title={t.title}
      description={`${APP_FULL_NAME} — ${t.description}`}
      ctaHref={`mailto:${SUPPORT_EMAIL}`}
      ctaLabel={t.contact}
    >
      <div className="space-y-8">
        <section className="public-panel-v72 public-panel-v72-soft">
          <div className="flex flex-wrap gap-3">
            {badges.map((badge) => (
              <div key={badge.label} className="public-chip-v72">
                <span className="text-[var(--text-3)]">{badge.label}:</span>
                <strong className="text-[var(--text)]">{badge.value}</strong>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <a href="#tos" className="rounded-[20px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-semibold">{t.tos}</a>
            <a href="#privacy" className="rounded-[20px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-semibold">{t.privacy}</a>
          </div>
        </section>

        <section id="tos" className="public-panel-v72">
          <div className="public-section-label">Terms of Service</div>
          <h2 className="mt-2 text-2xl font-black">{t.tos}</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--text-2)]">{t.legalIntro} {COMPANY_NAME}</p>
          <div className="mt-6 space-y-4">
            {TOS_SECTIONS.map((s) => (
              <div key={s.id} id={`tos-${s.id}`}>
                <SectionBlock s={s} />
              </div>
            ))}
          </div>
        </section>

        <section id="privacy" className="public-panel-v72">
          <div className="public-section-label">Privacy Policy</div>
          <h2 className="mt-2 text-2xl font-black">{t.privacy}</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--text-2)]">{t.privacyIntro}</p>
          <div className="mt-6 space-y-4">
            {PRIVACY_SECTIONS.map((s) => (
              <div key={s.id} id={`priv-${s.id}`}>
                <SectionBlock s={s} />
              </div>
            ))}
          </div>
        </section>

        <section className="public-panel-v72 text-center">
          <div className="text-xl font-black">{t.questions}</div>
          <p className="mt-2 text-sm leading-7 text-[var(--text-2)]">{t.supportBody}</p>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="public-btn public-btn-primary mt-5 inline-flex">{t.contact} {SUPPORT_EMAIL}</a>
        </section>
      </div>
    </PublicShell>
  )
}
