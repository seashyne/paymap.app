import { NextRequest, NextResponse } from "next/server"
import { getSessionCookieOptions } from "@/server/auth/session"
import { createSessionFromFirebase } from "@/features/auth/server/auth-service"

export async function POST(req: NextRequest) {
  try {
    const result = await createSessionFromFirebase(await req.json().catch(() => ({})), req)
    if (!result.ok) return NextResponse.json({ error: result.error, ...(result.extra ?? {}) }, { status: result.status })
    const cookie = getSessionCookieOptions()
    const response = NextResponse.json({ ok: true, ...result.data })
    response.cookies.set(cookie.name, result.data.jwt, cookie.options)
    return response
  } catch (error) {
    console.error("[firebase-session]", error)
    return NextResponse.json({ error: "ยืนยันตัวตนกับ Firebase ไม่สำเร็จ" }, { status: 401 })
  }
}
