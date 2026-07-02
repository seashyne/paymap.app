export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/authz"
import { getUsageSummary } from "@/server/billing/usage-limits"

export async function GET(req: NextRequest) {
  const auth = await requireApiUser()
  if ("error" in auth) return auth.error
  const mode = (req.nextUrl.searchParams.get("mode") ?? auth.user.accountMode) as "personal" | "business" | "merchant"
  const planTier = auth.user.productSubscriptions.find((item) => item.product === mode && item.status === "active")?.planTier ?? "free"
  const data = await getUsageSummary(auth.user.id, mode, planTier)
  return NextResponse.json({ ok: true, data })
}
