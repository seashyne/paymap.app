// v1.4: Family workspace API — create, list families
export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, created, handleError } from "@/lib/api-response"
import { requireModeUser } from "@/lib/authz"

export async function GET() {
  try {
    const auth = await requireModeUser("personal")
    if ("error" in auth) return auth.error

    const [ownedFamilies, memberFamilies] = await Promise.all([
      prisma.family.findMany({
        where: { ownerId: auth.user.id },
        include: {
          members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
          _count: { select: { budgets: true } },
        },
      }),
      prisma.familyMember.findMany({
        where: { userId: auth.user.id },
        include: {
          family: {
            include: {
              members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
              _count: { select: { budgets: true } },
            },
          },
        },
      }),
    ])

    const families = [
      ...ownedFamilies.map(f => ({
        id: f.id, name: f.name, currency: f.currency, myRole: "owner",
        members: f.members.map(m => ({ id: m.id, role: m.role, nickname: m.nickname, user: m.user })),
        budgetCount: f._count.budgets, createdAt: f.createdAt,
      })),
      ...memberFamilies
        .filter(m => !ownedFamilies.find(f => f.id === m.familyId))
        .map(m => ({
          id: m.family.id, name: m.family.name, currency: m.family.currency, myRole: m.role,
          members: m.family.members.map(mm => ({ id: mm.id, role: mm.role, nickname: mm.nickname, user: mm.user })),
          budgetCount: m.family._count.budgets, createdAt: m.family.createdAt,
        })),
    ]

    return ok({ families })
  } catch (e) { return handleError(e) }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireModeUser("personal")
    if ("error" in auth) return auth.error
    const { name, currency = "THB" } = await req.json()
    if (!name?.trim()) return NextResponse.json({ error: "ต้องระบุชื่อครอบครัว" }, { status: 400 })

    const family = await prisma.family.create({
      data: {
        name: name.trim(), ownerId: auth.user.id, currency,
        members: { create: { userId: auth.user.id, role: "owner" } },
      },
    })
    return created({ family: { id: family.id, name: family.name } }, "สร้าง Family Workspace สำเร็จ")
  } catch (e) { return handleError(e) }
}
