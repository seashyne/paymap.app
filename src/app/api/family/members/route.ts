// v1.4: Family members management
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, created, handleError, forbidden } from "@/lib/api-response"
import { requireModeUser } from "@/lib/authz"
import { sendFamilyInviteEmail } from "@/lib/email"

async function getFamilyAccess(userId: string, familyId: string) {
  const family = await prisma.family.findUnique({ where: { id: familyId } })
  if (!family) return null
  if (family.ownerId === userId) return "owner"
  const m = await prisma.familyMember.findUnique({
    where: { familyId_userId: { familyId, userId } },
  })
  return m?.role ?? null
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("personal")
    if ("error" in auth) return auth.error
    const { familyId, email, role = "adult", nickname } = await req.json()
    if (!familyId || !email) return NextResponse.json({ error: "familyId และ email จำเป็น" }, { status: 400 })

    const access = await getFamilyAccess(auth.user.id, familyId)
    if (!access || !["owner","spouse"].includes(access)) return forbidden()

    const target = await prisma.user.findFirst({
      where: { email: email.toLowerCase().trim() },
      orderBy: { createdAt: "asc" },
    })
    if (!target) return NextResponse.json({ error: "ไม่พบผู้ใช้ email นี้ในระบบ" }, { status: 404 })

    const existing = await prisma.familyMember.findUnique({
      where: { familyId_userId: { familyId, userId: target.id } },
    })
    if (existing) return NextResponse.json({ error: "ผู้ใช้นี้อยู่ใน family แล้ว" }, { status: 409 })

    const member = await prisma.familyMember.create({
      data: { familyId, userId: target.id, role, nickname },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    })
    // v1.4: Send family invite email (non-blocking)
    sendFamilyInviteEmail(target.email, target.name, familyId, auth.user.name, role).catch(console.error)
    return created({ member: { id: member.id, role: member.role, nickname: member.nickname, user: member.user } }, `เพิ่ม ${target.name} เข้า family สำเร็จ`)
  } catch (e) { return handleError(e) }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireModeUser("personal")
    if ("error" in auth) return auth.error
    const memberId = req.nextUrl.searchParams.get("memberId")
    const familyId = req.nextUrl.searchParams.get("familyId")
    if (!memberId || !familyId) return NextResponse.json({ error: "ต้องระบุ memberId และ familyId" }, { status: 400 })

    const access = await getFamilyAccess(auth.user.id, familyId)
    if (!access || !["owner","spouse"].includes(access)) return forbidden()

    await prisma.familyMember.delete({ where: { id: memberId } })
    return ok({ deleted: true })
  } catch (e) { return handleError(e) }
}
