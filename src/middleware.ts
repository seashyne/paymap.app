import { NextRequest, NextResponse } from "next/server"
import { verifySession, getSessionCookieName, shouldRenewSession, signSession, getSessionCookieOptions } from "@/lib/session"
import { normalizeWorkspaceMode, workspacePath } from "@/lib/workspace"

import { authPages, publicPages, protectedPaths } from "@/middleware/auth"
import { requestedWorkspace } from "@/middleware/workspace"
import { enforcePublicRateLimit } from "@/server/rate-limit/policies"
import { isDesktopBlockedUserAgent, isDesktopExemptPath } from "@/lib/desktop-only"

const legacySaasWebPaths = ["/business", "/merchant", "/enterprise", "/for-business", "/for-merchants", "/admin/saas"]

function isLegacySaasWebPath(pathname: string) {
  return legacySaasWebPaths.some((path) => pathname === path || pathname.startsWith(path + "/"))
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(getSessionCookieName())?.value
  const session = await verifySession(token)
  const { pathname, search } = req.nextUrl

  if (isLegacySaasWebPath(pathname)) {
    const url = new URL("/download", req.url)
    url.searchParams.set("legacy", "saas")
    url.searchParams.set("from", pathname + search)
    return NextResponse.redirect(url)
  }

  if (!isDesktopExemptPath(pathname) && isDesktopBlockedUserAgent(req.headers.get("user-agent"))) {
    const url = new URL("/download", req.url)
    url.searchParams.set("desktop", "1")
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  if (pathname === "/api/stripe/webhook" || pathname === "/api/notifications/renewal") return NextResponse.next()

  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous"
  const limited = await enforcePublicRateLimit(clientIp, pathname)
  if (!limited.allowed) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Too many requests", retryAfter: limited.resetAt.toISOString() }, { status: 429 })
    }
    return NextResponse.redirect(new URL("/login?rateLimited=1", req.url))
  }

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))
  if (isProtected && !session) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // Public pages bypass auth
    const isPublicPage = publicPages.some(p => pathname.startsWith(p))
    if (isPublicPage) return NextResponse.next()

    const url = new URL("/login", req.url)
    url.searchParams.set("next", pathname + search)
    return NextResponse.redirect(url)
  }

  if (!session) return NextResponse.next()

  const accountMode = normalizeWorkspaceMode(session.accountMode || session.workspaceMode)

  if (authPages.some((page) => pathname === page || pathname.startsWith(page + "/"))) {
    return NextResponse.redirect(new URL(workspacePath(accountMode), req.url))
  }

  if ((pathname.startsWith("/admin") || pathname.startsWith("/dashboard/admin") || pathname.startsWith("/api/admin") || pathname.startsWith("/enterprise")) && session.role !== "admin" && !pathname.startsWith("/api/enterprise")) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.redirect(new URL(workspacePath(accountMode), req.url))
  }

  const routeWorkspace = requestedWorkspace(pathname)
  // Admin role can access all modes for system inspection — skip mode lock
  if (routeWorkspace && accountMode !== routeWorkspace && session.role !== "admin") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: `บัญชีนี้ถูกล็อกเป็นโหมด ${accountMode} — ไม่สามารถเข้าถึงโหมด ${routeWorkspace} ได้` },
        { status: 403 }
      )
    }
    return NextResponse.redirect(new URL(workspacePath(accountMode) + "?locked=" + routeWorkspace, req.url))
  }

  if (!session.isDemo && shouldRenewSession(session)) {
    const newToken = await signSession({ ...session, accountMode })
    const res = NextResponse.next()
    const cookie = getSessionCookieOptions()
    res.cookies.set(cookie.name, newToken, cookie.options)
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/wallets/:path*", "/transactions/:path*", "/settings/:path*", "/profile/:path*", "/billing/:path*",
    "/business/:path*", "/merchant/:path*", "/reports/:path*", "/analytics/:path*",
    "/for-business/:path*", "/for-merchants/:path*",
    "/loans/:path*", "/networth/:path*", "/investments/:path*", "/installments/:path*",
    "/simulation/:path*", "/achievements/:path*", "/tax/:path*", "/planner/:path*",
    "/onboarding/:path*", "/workspace/:path*", "/enterprise/:path*", "/admin/:path*",
    "/api/user/:path*", "/api/transactions/:path*", "/api/categories/:path*",
    "/api/admin/:path*", "/api/budget/:path*", "/api/savings/:path*",
    "/api/subscriptions/:path*", "/api/tax/:path*", "/api/export/:path*",
    "/api/billing/:path*", "/api/personal/:path*", "/api/business/:path*",
    "/api/merchant/:path*", "/api/insights/:path*", "/api/workspace/:path*", "/api/workspaces/:path*",
    "/api/family/:path*", "/api/enterprise/:path*",
    "/api/ai/:path*", "/api/notifications/:path*", "/api/search/:path*", "/api/promptpay/:path*", "/api/pay-profile/:path*",
    // v24.0 API routes
    "/api/loans/:path*", "/api/networth/:path*", "/api/investments/:path*",
    "/api/installments/:path*", "/api/wallets/:path*", "/api/gamification/:path*",
    // v5
    "/api/accounting/:path*", "/api/planner/:path*",
    // v14 bugfix: reconciliation API routes were unprotected (BUG-004)
    "/api/reconciliation/:path*",
    "/login", "/register",
    "/terms", "/privacy",
  ],
}
