export const dynamic = "force-dynamic"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiUser } from "@/lib/authz"
import { mergeUiPreferences, sanitizeUiPreferences } from "@/lib/ui-preferences"
import { createAuditLog } from "@/lib/auth-helpers"

export async function GET() {
  const auth = await requireApiUser()
  if ("error" in auth) return auth.error

  const user = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: { uiPreferences: true },
  })

  return NextResponse.json({ preferences: mergeUiPreferences(user?.uiPreferences) })
}

export async function PATCH(req: NextRequest) {
  const auth = await requireApiUser()
  if ("error" in auth) return auth.error

  const body = await req.json().catch(() => ({}))
  const existing = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: { uiPreferences: true },
  })
  const mergedInput = { ...mergeUiPreferences(existing?.uiPreferences), ...(body && typeof body === "object" ? body : {}) }
  const nextPrefs = sanitizeUiPreferences(mergedInput)

  const user = await prisma.user.update({
    where: { id: auth.user.id },
    data: { uiPreferences: nextPrefs as any },
    select: { uiPreferences: true },
  })

  cookies().set("paymap-theme", nextPrefs.themeMode, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" })

  await createAuditLog(auth.user.id, "ui_preferences_update", req)
  return NextResponse.json({ preferences: mergeUiPreferences(user.uiPreferences), message: "บันทึกการตั้งค่า UI สำเร็จ" })
}
