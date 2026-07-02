export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireModeUser } from "@/lib/authz"

function makeSlug(name: string, suffix: string) {
  const base = name.toLowerCase()
    .replace(/[^a-z0-9ก-๙\s]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 30) || "pay"
  return `${base}-${suffix}`
}

async function uniqueSlug(base: string): Promise<string> {
  let candidate = base, i = 1
  while (await prisma.payProfile.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${i++}`
  }
  return candidate
}

// GET — ดึง pay profile ของ workspace นี้
export async function GET(req: NextRequest) {
  const auth = await requireModeUser("personal")
  if ("error" in auth) return auth.error

  const mode = req.nextUrl.searchParams.get("mode") ?? auth.user.accountMode
  const workspaceType = mode === "business" || mode === "merchant" ? mode : "personal"

  const profile = await prisma.payProfile.findFirst({
    where: { userId: auth.user.id, workspaceType: workspaceType as any },
  })

  return NextResponse.json({ profile })
}

// POST — สร้าง pay profile ใหม่
export async function POST(req: NextRequest) {
  const auth = await requireModeUser("personal")
  if ("error" in auth) return auth.error

  const body = await req.json().catch(() => ({}))
  const workspaceType = (body.workspaceType === "business" || body.workspaceType === "merchant")
    ? body.workspaceType : "personal"

  // 1 user + 1 mode = 1 profile max
  const exists = await prisma.payProfile.findFirst({
    where: { userId: auth.user.id, workspaceType: workspaceType as any },
  })
  if (exists) return NextResponse.json({ error: "มี Pay Profile ของโหมดนี้แล้ว", profile: exists }, { status: 409 })

  const displayName = String(body.displayName || auth.user.name || "").trim()
  if (!displayName) return NextResponse.json({ error: "กรุณากรอกชื่อ" }, { status: 400 })

  // validate promptpay
  if (body.promptpayId) {
    const pid = String(body.promptpayId).replace(/[-\s]/g, "")
    if (!/^\d{10,13}$/.test(pid)) {
      return NextResponse.json({ error: "PromptPay ID ต้องเป็นเบอร์โทร 10 หลัก หรือเลขบัตร/นิติบุคคล 13 หลัก" }, { status: 400 })
    }
  }

  const slug = await uniqueSlug(makeSlug(displayName, auth.user.id.slice(0, 6)))

  const profile = await prisma.payProfile.create({
    data: {
      userId: auth.user.id,
      workspaceType: workspaceType as any,
      organizationId: body.organizationId ?? null,
      storeId: body.storeId ?? null,
      slug,
      displayName,
      bio: body.bio ? String(body.bio).slice(0, 200) : null,
      avatarUrl: body.avatarUrl ?? null,
      coverColor:     body.coverColor     ?? "#7c3aed",
      coverStyle:     body.coverStyle     ?? "color",
      coverGradient:  body.coverGradient  ?? null,
      coverImageUrl:  body.coverImageUrl  ?? null,
      coverPattern:   body.coverPattern   ?? null,
      frameStyle:     body.frameStyle     ?? "rounded",
      frameColor:     body.frameColor     ?? null,
      frameGradient:  body.frameGradient  ?? null,
      fontStyle:      body.fontStyle      ?? "default",
      layoutStyle:    body.layoutStyle    ?? "center",
      badgeText:      body.badgeText      ?? null,
      badgeColor:     body.badgeColor     ?? null,
      promptpayId: body.promptpayId ? String(body.promptpayId).replace(/[-\s]/g, "") : null,
      promptpayType: body.promptpayType ?? null,
      bankAccount: body.bankAccount ?? null,
      bankName: body.bankName ?? null,
      presetAmounts: Array.isArray(body.presetAmounts) ? body.presetAmounts.filter((n: any) => typeof n === "number" && n > 0) : [],
      currency: body.currency ?? "THB",
      allowCustom: body.allowCustom !== false,
      requestNote: !!body.requestNote,
    },
  })

  return NextResponse.json({ profile }, { status: 201 })
}

// PATCH — แก้ไข pay profile
export async function PATCH(req: NextRequest) {
  const auth = await requireModeUser("personal")
  if ("error" in auth) return auth.error

  const body = await req.json().catch(() => ({}))
  const workspaceType = (body.workspaceType === "business" || body.workspaceType === "merchant")
    ? body.workspaceType : "personal"

  const existing = await prisma.payProfile.findFirst({
    where: { userId: auth.user.id, workspaceType: workspaceType as any },
  })
  if (!existing) return NextResponse.json({ error: "ไม่พบ Pay Profile" }, { status: 404 })

  if (body.promptpayId) {
    const pid = String(body.promptpayId).replace(/[-\s]/g, "")
    if (!/^\d{10,13}$/.test(pid)) {
      return NextResponse.json({ error: "PromptPay ID ไม่ถูกต้อง" }, { status: 400 })
    }
  }

  const updated = await prisma.payProfile.update({
    where: { id: existing.id },
    data: {
      displayName: body.displayName ? String(body.displayName).trim() : undefined,
      bio: body.bio !== undefined ? (body.bio ? String(body.bio).slice(0, 200) : null) : undefined,
      avatarUrl: body.avatarUrl !== undefined ? body.avatarUrl : undefined,
      coverColor:    body.coverColor    ?? undefined,
      coverStyle:    body.coverStyle    ?? undefined,
      coverGradient: body.coverGradient !== undefined ? body.coverGradient : undefined,
      coverImageUrl: body.coverImageUrl !== undefined ? body.coverImageUrl : undefined,
      coverPattern:  body.coverPattern  !== undefined ? body.coverPattern  : undefined,
      frameStyle:    body.frameStyle    ?? undefined,
      frameColor:    body.frameColor    !== undefined ? body.frameColor    : undefined,
      frameGradient: body.frameGradient !== undefined ? body.frameGradient : undefined,
      fontStyle:     body.fontStyle     ?? undefined,
      layoutStyle:   body.layoutStyle   ?? undefined,
      badgeText:     body.badgeText     !== undefined ? body.badgeText     : undefined,
      badgeColor:    body.badgeColor    !== undefined ? body.badgeColor    : undefined,
      promptpayId: body.promptpayId !== undefined ? (body.promptpayId ? String(body.promptpayId).replace(/[-\s]/g, "") : null) : undefined,
      promptpayType: body.promptpayType !== undefined ? body.promptpayType : undefined,
      bankAccount: body.bankAccount !== undefined ? body.bankAccount : undefined,
      bankName: body.bankName !== undefined ? body.bankName : undefined,
      presetAmounts: Array.isArray(body.presetAmounts) ? body.presetAmounts.filter((n: any) => typeof n === "number" && n > 0) : undefined,
      allowCustom: body.allowCustom !== undefined ? !!body.allowCustom : undefined,
      requestNote: body.requestNote !== undefined ? !!body.requestNote : undefined,
      isActive: body.isActive !== undefined ? !!body.isActive : undefined,
      updatedAt: new Date(),
    },
  })

  return NextResponse.json({ profile: updated })
}
