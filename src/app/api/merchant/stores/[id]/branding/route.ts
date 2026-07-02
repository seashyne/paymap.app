import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireModeUser } from "@/lib/authz"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireModeUser("merchant")
  if ("error" in auth) return auth.error

  const store = await prisma.store.findFirst({ where: { id: params.id, userId: auth.user.id } })
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const data: Record<string, string | null> = {}
  for (const key of ["logoUrl", "bannerUrl", "themeColor", "backgroundUrl"]) {
    if (key in body) data[key] = body[key] ? String(body[key]).trim() : null
  }

  const updated = await prisma.store.update({
    where: { id: params.id },
    data,
    select: { id: true, name: true, logoUrl: true, bannerUrl: true, themeColor: true, backgroundUrl: true },
  })

  return NextResponse.json({ ok: true, store: updated, message: "อัปเดตภาพร้านสำเร็จ" })
}
