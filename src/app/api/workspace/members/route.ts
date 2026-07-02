// v1.3: Manage workspace members — invite, list, remove
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiUser } from "@/lib/authz"
import { ok, created, handleError } from "@/lib/api-response"
import { sendWorkspaceInviteEmail } from "@/lib/email"

// GET /api/workspace/members?orgId=xxx
export async function GET(req: NextRequest) {
  try {
    const auth = await requireApiUser()
    if ("error" in auth) return auth.error

    const orgId = req.nextUrl.searchParams.get("orgId")
    if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 })

    // Check caller is member
    const myMembership = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId: auth.user.id } },
    })
    if (!myMembership) return NextResponse.json({ error: "Not a member" }, { status: 403 })

    const members = await prisma.organizationMember.findMany({
      where: { organizationId: orgId },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
      orderBy: { joinedAt: "asc" },
    })

    return ok({
      members: members.map((m) => ({
        id:       m.id,
        role:     m.role,
        title:    m.title,
        joinedAt: m.joinedAt,
        user:     m.user,
      })),
    })
  } catch (e) { return handleError(e) }
}

// POST /api/workspace/members — invite by email
export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiUser()
    if ("error" in auth) return auth.error

    const { orgId, email, role = "member", title } = await req.json()
    if (!orgId || !email) return NextResponse.json({ error: "orgId และ email จำเป็น" }, { status: 400 })

    // Caller must be owner or admin
    const myMembership = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId: auth.user.id } },
    })
    if (!myMembership || !["owner", "admin"].includes(myMembership.role)) {
      return NextResponse.json({ error: "ต้องเป็น owner หรือ admin" }, { status: 403 })
    }

    const targetUser = await prisma.user.findFirst({
      where: { email: email.toLowerCase().trim() },
      orderBy: { createdAt: "asc" },
    })
    if (!targetUser) return NextResponse.json({ error: "ไม่พบผู้ใช้ที่มี email นี้ในระบบ" }, { status: 404 })

    const existing = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId: targetUser.id } },
    })
    if (existing) return NextResponse.json({ error: "ผู้ใช้นี้เป็นสมาชิกอยู่แล้ว" }, { status: 409 })

    const member = await prisma.organizationMember.create({
      data: { organizationId: orgId, userId: targetUser.id, role, title },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    })

    // v1.4: Send invite email (non-blocking)
    sendWorkspaceInviteEmail(targetUser.email, targetUser.name, `org:${orgId}`, auth.user.name, role).catch(console.error)

    return created({
      member: { id: member.id, role: member.role, title: member.title, user: member.user },
    }, `เพิ่ม ${targetUser.name} เข้า workspace สำเร็จ`)
  } catch (e) { return handleError(e) }
}

// PATCH /api/workspace/members — change role
export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireApiUser()
    if ("error" in auth) return auth.error

    const { memberId, orgId, role, title } = await req.json()
    if (!memberId || !orgId) return NextResponse.json({ error: "memberId และ orgId จำเป็น" }, { status: 400 })

    const myMembership = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId: auth.user.id } },
    })
    if (!myMembership || !["owner", "admin"].includes(myMembership.role)) {
      return NextResponse.json({ error: "ต้องเป็น owner หรือ admin" }, { status: 403 })
    }

    const updated = await prisma.organizationMember.update({
      where: { id: memberId },
      data: { ...(role && { role }), ...(title !== undefined && { title }) },
      include: { user: { select: { id: true, name: true, email: true } } },
    })

    return ok({ member: updated })
  } catch (e) { return handleError(e) }
}

// DELETE /api/workspace/members?memberId=xxx&orgId=xxx
export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireApiUser()
    if ("error" in auth) return auth.error

    const memberId = req.nextUrl.searchParams.get("memberId")
    const orgId    = req.nextUrl.searchParams.get("orgId")
    if (!memberId || !orgId) return NextResponse.json({ error: "memberId และ orgId จำเป็น" }, { status: 400 })

    const myMembership = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId: auth.user.id } },
    })
    if (!myMembership || !["owner", "admin"].includes(myMembership.role)) {
      return NextResponse.json({ error: "ต้องเป็น owner หรือ admin" }, { status: 403 })
    }

    // Cannot remove self if owner
    const target = await prisma.organizationMember.findUnique({ where: { id: memberId } })
    if (target?.userId === auth.user.id && myMembership.role === "owner") {
      return NextResponse.json({ error: "Owner ไม่สามารถออกจาก workspace ได้" }, { status: 400 })
    }

    await prisma.organizationMember.delete({ where: { id: memberId } })
    return ok({ deleted: true })
  } catch (e) { return handleError(e) }
}
