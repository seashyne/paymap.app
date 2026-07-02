export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { getSessionCookieOptions } from "@/server/auth/session"
import { loginWithPassword } from "@/features/auth/server/auth-service"

export async function POST(req: NextRequest) {
  try {
    const result = await loginWithPassword(await req.json().catch(() => ({})), req)
    if (!result.ok) return NextResponse.json({ error: result.error, ...(result.extra ?? {}) }, { status: result.status })
    const cookie = getSessionCookieOptions()
    const response = NextResponse.json({ ok: true, redirectTo: result.data.redirectTo, user: result.data.user })
    response.cookies.set(cookie.name, result.data.jwt, cookie.options)
    return response
  } catch (err: any) {
    console.error("[login] error:", err?.message ?? err)
    return NextResponse.json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 })
  }
}
