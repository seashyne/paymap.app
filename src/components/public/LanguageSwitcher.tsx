"use client"

import { usePathname, useSearchParams } from "next/navigation"
import type { SiteLang } from "@/lib/i18n/site"

type Props = {
  currentLang: SiteLang
  label: string
  languages: Record<SiteLang, string>
}

export default function LanguageSwitcher({ currentLang, label, languages }: Props) {
  const pathname = usePathname() || "/"
  const searchParams = useSearchParams()
  const query = searchParams?.toString()
  const returnTo = `${pathname}${query ? `?${query}` : ""}`

  function changeLanguage(lang: string) {
    const url = `/api/site-language?lang=${encodeURIComponent(lang)}&returnTo=${encodeURIComponent(returnTo)}`
    window.location.assign(url)
  }

  return (
    <label className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--text-2)] md:inline-flex">
      <span>{label}</span>
      <select
        value={currentLang}
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-transparent text-[var(--text)] outline-none"
        aria-label={label}
      >
        {Object.entries(languages).map(([code, name]) => (
          <option key={code} value={code} className="bg-slate-900 text-white">
            {name}
          </option>
        ))}
      </select>
    </label>
  )
}
