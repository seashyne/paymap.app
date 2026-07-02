export function requestedWorkspace(pathname: string) {
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) return "admin" as const
  if (pathname.startsWith("/business") || pathname.startsWith("/api/business") || pathname.startsWith("/w/")) return "business" as const
  if (pathname.startsWith("/merchant") || pathname.startsWith("/api/merchant")) return "merchant" as const
  if (
    pathname.startsWith("/wallets") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/loans") ||
    pathname.startsWith("/networth") ||
    pathname.startsWith("/investments") ||
    pathname.startsWith("/installments") ||
    pathname.startsWith("/tax") ||
    pathname.startsWith("/simulation") ||
    pathname.startsWith("/achievements") ||
    pathname.startsWith("/planner") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/billing") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/workspace") ||
    pathname.startsWith("/api/personal") ||
    pathname.startsWith("/api/wallets") ||
    pathname.startsWith("/api/planner")
  ) return "personal" as const
  return null
}
