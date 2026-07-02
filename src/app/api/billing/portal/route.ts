export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/authz"
import { openBillingPortal } from "@/features/billing/server/billing-service"

export async function POST(_req: NextRequest) {
  const auth = await requireApiUser()
  if ("error" in auth) return auth.error
  try {
    const result = await openBillingPortal(auth.user.id)
    return NextResponse.json({ ok: true, data: result.data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "เปิด billing portal ไม่สำเร็จ" }, { status: 500 })
  }
}
