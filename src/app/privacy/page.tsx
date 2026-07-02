import PublicShell from "@/components/public/PublicShell"
import { detectSiteLang, getSiteMessages } from "@/lib/i18n/site"

export const revalidate = 3600
export const metadata = { title: "Privacy Policy — PayMap" }

export default function PrivacyPage() {
  const lang = detectSiteLang()
  const t = getSiteMessages(lang).legal.privacyPage

  return (
    <PublicShell eyebrow={t.eyebrow} title={t.title} description={t.description} ctaHref="/terms" ctaLabel={t.readTerms}>
      <div className="public-panel-v72 public-legal-prose-v72">
        {t.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
    </PublicShell>
  )
}
