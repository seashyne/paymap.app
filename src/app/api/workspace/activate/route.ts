export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "@/lib/session"
import { normalizeWorkspaceMode, workspacePath } from "@/lib/workspace"

export async function GET(req: NextRequest) {
  const session = await getCurrentSession()
  if (!session) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("next", req.nextUrl.searchParams.get("next") || "/dashboard")
    return NextResponse.redirect(loginUrl)
  }

  const requested = normalizeWorkspaceMode(req.nextUrl.searchParams.get("mode"))
  const accountMode = normalizeWorkspaceMode(session.accountMode || session.workspaceMode)
  const nextPath = req.nextUrl.searchParams.get("next") || workspacePath(accountMode)

  if (requested !== accountMode) {
    const lockedUrl = new URL("/workspace/select", req.url)
    lockedUrl.searchParams.set("requested", requested)
    return NextResponse.redirect(lockedUrl)
  }

  return NextResponse.redirect(new URL(nextPath, req.url))
}
