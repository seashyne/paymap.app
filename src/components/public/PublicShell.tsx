import Link from "next/link"
import { ReactNode } from "react"
import { LogoFull, LogoIcon } from "@/components/ui/Logo"
import { APP_VERSION } from "@/lib/app-version"
import { detectSiteLang, getSiteMessages } from "@/lib/i18n/site"
import LanguageSwitcher from "@/components/public/LanguageSwitcher"

type PublicShellProps = {
  children: ReactNode
  eyebrow?: string
  title?: string
  description?: string
  compact?: boolean
  ctaHref?: string
  ctaLabel?: string
}

export default function PublicShell({
  children,
  eyebrow,
  title,
  description,
  compact = false,
  ctaHref = "/register?mode=personal",
  ctaLabel,
}: PublicShellProps) {
  const lang = detectSiteLang()
  const t = getSiteMessages(lang).shell
  const resolvedCtaLabel = ctaLabel ?? t.startFree

  return (
    <div className="public-shell-v72">
      <div className="hero-orb left-[-12rem] top-[-7rem] h-[22rem] w-[22rem] bg-[var(--primary)]" />
      <div className="hero-orb right-[-10rem] top-[2rem] h-[20rem] w-[20rem] bg-[var(--blue)]" />

      <header className="public-header-v72">
        <div className="public-container-v72 flex items-center justify-between gap-4 py-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <LogoFull height={28} className="text-[var(--text)]" />
            <span className="hidden rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-3)] md:inline-flex">
              {lang.toUpperCase()} · Global
            </span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-semibold text-[var(--text-2)] lg:flex">
            <Link href="/pricing">{t.pricing}</Link>
            <Link href="/download">{t.download}</Link>
            <Link href="/help">{t.help}</Link>
            <Link href="/legal">{t.legal}</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher currentLang={lang} label={t.language} languages={t.languages} />
            <Link href="/login" className="public-btn public-btn-ghost">{t.login}</Link>
            <Link href={ctaHref} className="public-btn public-btn-primary">{resolvedCtaLabel}</Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {eyebrow || title || description ? (
          <section className={`public-hero-v72 ${compact ? "public-hero-v72--compact" : ""}`}>
            <div className="public-container-v72">
              <div className="marketing-frame rounded-[28px] px-6 py-7 md:px-8 md:py-9">
                {eyebrow ? <div className="public-eyebrow-v72">{eyebrow}</div> : null}
                {title ? <h1 className="public-title-v72">{title}</h1> : null}
                {description ? <p className="public-copy-v72 max-w-4xl">{description}</p> : null}
              </div>
            </div>
          </section>
        ) : null}

        <section className="public-content-v72">
          <div className="public-container-v72">{children}</div>
        </section>
      </main>

      <footer className="public-footer-v72">
        <div className="public-container-v72 grid gap-8 py-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <LogoIcon size={22} className="text-[var(--text)]" />
              <LogoFull height={24} className="text-[var(--text)]" />
            </Link>
            <p className="mt-3 max-w-md text-sm leading-7 text-[var(--text-2)]">{t.footerBody}</p>
          </div>
          <div>
            <div className="public-footer-title">{t.product}</div>
            <div className="public-footer-links">
              <Link href="/pricing">{t.pricing}</Link>
              <Link href="/download">{t.download}</Link>
              <Link href="/help">{t.gettingStarted}</Link>
            </div>
          </div>
          <div>
            <div className="public-footer-title">{t.support}</div>
            <div className="public-footer-links">
              <Link href="/help">{t.helpCenter}</Link>
              <Link href="/login">{t.login}</Link>
              <Link href="/register?mode=personal">{t.register}</Link>
            </div>
          </div>
          <div>
            <div className="public-footer-title">{t.legal}</div>
            <div className="public-footer-links">
              <Link href="/legal">{t.legalCenter}</Link>
              <Link href="/terms">{t.terms}</Link>
              <Link href="/privacy">{t.privacy}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
