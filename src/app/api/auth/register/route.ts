import { NextRequest, NextResponse } from "next/server"
import { getSessionCookieOptions } from "@/server/auth/session"
import { registerWithPassword } from "@/features/auth/server/auth-service"

export async function POST(req: NextRequest) {
  try {
    const result = await registerWithPassword(await req.json().catch(() => ({})), req)
    if (!result.ok) return NextResponse.json({ error: result.error, ...(result.extra ?? {}) }, { status: result.status })
    const cookie = getSessionCookieOptions()
    const response = NextResponse.json({
      message: result.data.message,
      userId: result.data.userId,
      autoLoggedIn: true,
      redirectTo: result.data.redirectTo,
      accountMode: result.data.accountMode,
    }, { status: 201 })
    response.cookies.set(cookie.name, result.data.jwt, cookie.options)
    return response
  } catch (err: any) {
    console.error("[Register API]", err)
    return NextResponse.json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 })
  }
}
