export const dynamic = "force-dynamic"
import { z } from "zod"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiUser } from "@/lib/authz"
import { createAuditLog } from "@/lib/auth-helpers"

const profileSchema = z.object({
  name: z.string().trim().min(1, "กรุณากรอกชื่อ").max(120).optional(),
  image: z.union([z.string().trim().url("URL รูปภาพไม่ถูกต้อง").max(500), z.literal(""), z.null()]).optional(),
  displayName: z.union([z.string().trim().max(120), z.literal(""), z.null()]).optional(),
  bio: z.union([z.string().trim().max(300), z.literal(""), z.null()]).optional(),
  phone: z.union([z.string().trim().max(30).regex(/^[0-9+()\-\s]*$/, "เบอร์โทรไม่ถูกต้อง"), z.literal(""), z.null()]).optional(),
  website: z.union([z.string().trim().max(500), z.literal(""), z.null()]).optional(),
  username: z.union([z.string().trim().regex(/^[a-z0-9_]{3,30}$/, "username ใช้ได้เฉพาะ a-z 0-9 _ ยาว 3-30 ตัว"), z.literal(""), z.null()]).optional(),
  country: z.union([z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "country ต้องเป็นรหัสประเทศ 2 ตัว"), z.literal(""), z.null()]).optional(),
  currency: z.union([z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, "currency ต้องเป็นรหัสสกุลเงิน 3 ตัว"), z.literal(""), z.null()]).optional(),
  locale: z.union([z.string().trim().regex(/^[a-z]{2,3}(?:-[A-Z][a-zA-Z]{1,7})?$/, "locale ไม่ถูกต้อง"), z.literal(""), z.null()]).optional(),
  timezone: z.union([z.string().trim().min(3).max(100).refine((value) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: value })
      return true
    } catch {
      return false
    }
  }, "timezone ไม่ถูกต้อง"), z.literal(""), z.null()]).optional(),
})

function normalizeNullable(value: string | null | undefined) {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export async function GET() {
  const auth = await requireApiUser()
  if ("error" in auth) return auth.error
  const user = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: {
      id: true, name: true, email: true, image: true, plan: true, role: true,
      emailVerified: true, provider: true, accountMode: true,
      displayName: true, username: true, bio: true, phone: true, website: true,
      country: true, currency: true, locale: true, timezone: true,
    },
  })
  return NextResponse.json({ user })
}

export async function PATCH(req: NextRequest) {
  const auth = await requireApiUser()
  if ("error" in auth) return auth.error

  const body = await req.json().catch(() => ({}))
  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "ข้อมูลโปรไฟล์ไม่ถูกต้อง" }, { status: 400 })
  }

  const input = parsed.data
  const data: Record<string, string | null> = {}
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue
    data[key] = typeof value === "string" ? normalizeNullable(value) : value
  }

  if (data.website && !/^https?:\/\//i.test(data.website)) {
    data.website = `https://${data.website}`
  }

  if (data.image && !/^https?:\/\//i.test(data.image)) {
    return NextResponse.json({ error: "URL รูปภาพไม่ถูกต้อง" }, { status: 400 })
  }

  if (data.username) {
    const exists = await prisma.user.findFirst({
      where: { username: data.username, id: { not: auth.user.id } },
    })
    if (exists) return NextResponse.json({ error: "username นี้ถูกใช้แล้ว" }, { status: 409 })
  }

  const user = await prisma.user.update({
    where: { id: auth.user.id },
    data,
    select: {
      id: true, name: true, email: true, image: true, plan: true,
      displayName: true, username: true, bio: true, phone: true, website: true,
      country: true, currency: true, locale: true, timezone: true,
    },
  })

  await createAuditLog(auth.user.id, "profile_update", req)
  return NextResponse.json({ user, message: "อัปเดตโปรไฟล์สำเร็จ" })
}
