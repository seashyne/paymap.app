
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/authz"
import { resolveWorkspaceSlug } from "@/lib/v23/workspace-bridge"

export async function POST(req: NextRequest) {
  const auth = await requireApiUser()
  if ("error" in auth) return auth.error
  const body = await req.json().catch(() => ({}))
  const slug = typeof body?.slug === "string" ? body.slug : ""
  if (!slug) return NextResponse.json({ error: "slug is required" }, { status: 400 })
  const workspace = await resolveWorkspaceSlug(auth.user, slug)
  if (!workspace) return NextResponse.json({ error: "workspace not found" }, { status: 404 })
  return NextResponse.json({ workspace, redirectTo: workspace.href })
}
