import { NextRequest } from "next/server"
import { PATCH } from "@/app/api/subscriptions/[id]/route"

export async function POST(req: NextRequest) {
  const { id, planCode, amount, billingCycle } = await req.json()
  return PATCH(new NextRequest(req.url, { method: "PATCH", body: JSON.stringify({ planCode, amount, billingCycle, action: "resume" }), headers: req.headers }), { params: { id } })
}
