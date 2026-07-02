export const DESKTOP_ONLY_MIN_WIDTH = 1180

export const DESKTOP_ONLY_EXEMPT_PREFIXES = [
  "/download",
  "/api/",
  "/_next",
  "/favicon",
  "/logo",
  "/images/",
  "/icons/",
]

export function isDesktopBlockedUserAgent(userAgent: string | null | undefined) {
  const ua = userAgent ?? ""
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(ua)
}

export function isDesktopExemptPath(pathname: string) {
  return DESKTOP_ONLY_EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}
