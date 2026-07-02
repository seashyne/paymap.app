export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { requireApiRole } from "@/lib/authz"
import { getSessionDebugInfo } from "@/lib/session"
import { prisma } from "@/lib/prisma"

// GET /api/auth/debug — ใช้ diagnose login issues เท่านั้น
// แสดงข้อมูล session + สถานะ .env ที่จำเป็น (ไม่เปิดเผย secret)
export async function GET(req: NextRequest) {
  const auth = await requireApiRole("admin")
  if ("error" in auth) return auth.error

  const debug = await getSessionDebugInfo()
  const checks = {
    AUTH_SECRET: !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
    DATABASE_URL: !!process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV ?? "undefined",
    REDIS_URL: !!process.env.REDIS_URL,
  }

  // DB connectivity
  let dbOk = false
  let userCount = 0
  try {
    userCount = await prisma.user.count()
    dbOk = true
  } catch {}

  return NextResponse.json({
    session: debug,
    env: checks,
    db: { connected: dbOk, userCount },
    timestamp: new Date().toISOString(),
  })
}
