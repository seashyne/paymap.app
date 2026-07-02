import { NextRequest } from "next/server"
import { PATCH } from "@/app/api/subscriptions/[id]/route"

export async function POST(req: NextRequest) {
  const { id } = await req.json()
  return PATCH(new NextRequest(req.url, { method: "PATCH", body: JSON.stringify({ action: "resume" }), headers: req.headers }), { params: { id } })
}
