export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession, getSessionCookieOptions } from "@/server/auth/session"
import { switchWorkspaceAccount } from "@/features/auth/server/auth-service"

export async function POST(req: NextRequest) {
  const session = await getCurrentSession()
  const result = await switchWorkspaceAccount(session, await req.json().catch(() => ({})))
  if (!result.ok) return NextResponse.json({ error: result.error, ...(result.extra ?? {}) }, { status: result.status })

  const cookie = getSessionCookieOptions()
  const response = NextResponse.json({ ok: true, mode: result.data.mode, redirectTo: result.data.redirectTo })
  response.cookies.set(cookie.name, result.data.jwt, cookie.options)
  return response
}
