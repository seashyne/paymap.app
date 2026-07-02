import { normalizeLang, type SiteLang } from "@/lib/i18n/site"

export function getClientSiteLang(fallback: SiteLang = "en"): SiteLang {
  if (typeof document !== "undefined") {
    const cookie = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("paymap-lang="))
    const fromCookie = normalizeLang(cookie?.split("=")[1] ?? null)
    if (fromCookie) return fromCookie
  }

  if (typeof navigator !== "undefined") {
    const fromNavigator = normalizeLang(navigator.language)
    if (fromNavigator) return fromNavigator
  }

  return fallback
}
