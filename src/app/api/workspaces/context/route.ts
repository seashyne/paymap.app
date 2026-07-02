export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getCurrentSession } from "@/server/auth/session"
import { buildWorkspaceContext } from "@/features/workspace/server/workspace-service"

export async function GET() {
  const session = await getCurrentSession()
  const context = await buildWorkspaceContext(session)
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return NextResponse.json({ ok: true, data: context })
}
