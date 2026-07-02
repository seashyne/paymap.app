export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireModeUser } from "@/lib/authz"

export async function PATCH(req: NextRequest) {
  const auth = await requireModeUser("personal")
  if ("error" in auth) return auth.error

  const body = await req.json().catch(() => ({}))
  const workspaceType = typeof body.workspaceType === "string" ? body.workspaceType : auth.user.accountMode

  const data: Record<string, string | null> = {}
  for (const key of ["avatarUrl", "coverImageUrl"]) {
    if (key in body) data[key] = body[key] ? String(body[key]).trim() : null
  }

  const profile = await prisma.payProfile.findFirst({ where: { userId: auth.user.id, workspaceType } })
  if (!profile) return NextResponse.json({ error: "Pay Profile not found" }, { status: 404 })

  const updated = await prisma.payProfile.update({
    where: { id: profile.id },
    data,
    select: { id: true, workspaceType: true, avatarUrl: true, coverImageUrl: true },
  })

  return NextResponse.json({ ok: true, profile: updated, message: "อัปเดตรูป Pay Profile สำเร็จ" })
}
