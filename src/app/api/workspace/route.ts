export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiUser } from "@/lib/authz"
import { ok, created, handleError } from "@/lib/api-response"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ก-๙\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || `workspace-${Date.now()}`
}

async function uniqueSlug(base: string) {
  let candidate = base
  let index = 1
  while (await prisma.organization.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${index++}`
  }
  return candidate
}

export async function GET() {
  try {
    const auth = await requireApiUser()
    if ("error" in auth) return auth.error

    const memberships = await prisma.organizationMember.findMany({
      where: { userId: auth.user.id },
      include: {
        organization: {
          include: {
            members: { select: { id: true, role: true, user: { select: { id: true, name: true, image: true } } } },
            teams: { select: { id: true, name: true } },
          },
        },
      },
    })

    const workspaces = memberships.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      myRole: m.role,
      members: m.organization.members.length,
      teams: m.organization.teams.length,
      plan: m.organization.plan,
      currency: m.organization.baseCurrency,
    }))

    const ownedOrgs = await prisma.organization.findMany({
      where: { ownerId: auth.user.id, NOT: { members: { some: { userId: auth.user.id } } } },
      select: { id: true, name: true, slug: true, plan: true, baseCurrency: true, _count: { select: { members: true, teams: true } } },
    })

    const ownedWorkspaces = ownedOrgs.map((o) => ({
      id: o.id, name: o.name, slug: o.slug, myRole: "owner" as const,
      members: o._count.members, teams: o._count.teams,
      plan: o.plan, currency: o.baseCurrency,
    }))

    return ok({ workspaces: [...workspaces, ...ownedWorkspaces] })
  } catch (e) { return handleError(e) }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiUser()
    if ("error" in auth) return auth.error

    const body = await req.json()
    const { name, slug, currency = "THB", country = "TH" } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: "ต้องระบุชื่อองค์กร" }, { status: 400 })
    }

    const baseSlug = slugify(slug?.trim() || name.trim())
    const cleanSlug = await uniqueSlug(baseSlug)

    const org = await prisma.organization.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        ownerId: auth.user.id,
        baseCurrency: currency,
        country,
        members: {
          create: { userId: auth.user.id, role: "owner" },
        },
      },
    })

    return created({ workspace: { id: org.id, name: org.name, slug: org.slug, myRole: "owner" } }, "สร้าง workspace สำเร็จ")
  } catch (e) { return handleError(e) }
}
