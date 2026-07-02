export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/authz"
import { createCheckoutSession } from "@/features/billing/server/billing-service"

export async function POST(req: NextRequest) {
  const auth = await requireApiUser()
  if ("error" in auth) return auth.error
  try {
    const result = await createCheckoutSession(auth.user, await req.json().catch(() => ({})))
    if (!result.ok) return NextResponse.json({ error: result.error, ...(result as any).extra }, { status: result.status })
    return NextResponse.json(result.data)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "สร้าง checkout session ไม่สำเร็จ" }, { status: 500 })
  }
}
