// PayMap v5.1 — User Consent API
// POST /api/user/consent — บันทึกการยอมรับ Terms
// GET  /api/user/consent — ตรวจสอบว่ายอมรับแล้วหรือยัง
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { requireApiUser } from "@/lib/authz"
import { prisma } from "@/lib/prisma"
import { ok, handleError } from "@/lib/api-response"
import { TOS_VERSION, PRIVACY_VERSION } from "@/lib/tos-content"

export async function GET() {
  try {
    const auth = await requireApiUser()
    if ("error" in auth) return auth.error

    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        tosAcceptedAt: true,
        tosVersion: true,
        privacyAcceptedAt: true,
        privacyVersion: true,
      },
    })

    const tosOk = user?.tosVersion === TOS_VERSION && !!user?.tosAcceptedAt
    const privacyOk = user?.privacyVersion === PRIVACY_VERSION && !!user?.privacyAcceptedAt

    return ok({
      required: !tosOk || !privacyOk,
      tosOk,
      privacyOk,
      tosVersion: user?.tosVersion ?? null,
      privacyVersion: user?.privacyVersion ?? null,
      tosAcceptedAt: user?.tosAcceptedAt?.toISOString() ?? null,
      privacyAcceptedAt: user?.privacyAcceptedAt?.toISOString() ?? null,
      currentTosVersion: TOS_VERSION,
      currentPrivacyVersion: PRIVACY_VERSION,
    })
  } catch (err: any) {
    return handleError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiUser()
    if ("error" in auth) return auth.error

    const body = await req.json()
    const { acceptTos, acceptPrivacy } = body

    if (!acceptTos || !acceptPrivacy) {
      return NextResponse.json(
        {
          error: "ต้องยอมรับทั้งข้อตกลงการใช้งานและนโยบายความเป็นส่วนตัว",
        },
        { status: 400 }
      )
    }

    const now = new Date()

    await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        tosAcceptedAt: now,
        tosVersion: TOS_VERSION,
        privacyAcceptedAt: now,
        privacyVersion: PRIVACY_VERSION,
      },
    })

    await prisma.auditLog
      .create({
        data: {
          userId: auth.user.id,
          action: "consent_accepted",
          ip: req.headers.get("x-forwarded-for") ?? "unknown",
          userAgent: req.headers.get("user-agent") ?? undefined,
          metadata: {
            tosVersion: TOS_VERSION,
            privacyVersion: PRIVACY_VERSION,
            acceptedAt: now.toISOString(),
          },
        },
      })
      .catch(() => null)

    return ok(
      {
        accepted: true,
        acceptedAt: now.toISOString(),
        tosVersion: TOS_VERSION,
        privacyVersion: PRIVACY_VERSION,
      },
      "ยืนยันการยอมรับข้อตกลงเรียบร้อยแล้ว"
    )
  } catch (err: any) {
    return handleError(err)
  }
}
