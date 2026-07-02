
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiUser } from "@/lib/authz"
import { listUserWorkspaces } from "@/lib/v23/workspace-bridge"

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
  const auth = await requireApiUser()
  if ("error" in auth) return auth.error
  const workspaces = await listUserWorkspaces(auth.user)
  return NextResponse.json({ workspaces })
}

export async function POST(req: NextRequest) {
  const auth = await requireApiUser()
  if ("error" in auth) return auth.error

  const body = await req.json().catch(() => ({}))
  const type = body?.type === "merchant" || body?.type === "business" ? body.type : "personal"
  const name = String(body?.name || "").trim()

  if (type === "personal") {
    const workspaces = await listUserWorkspaces(auth.user)
    const personal = workspaces.find((w) => w.type === "personal")
    return NextResponse.json({ workspace: personal, created: false })
  }

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 })
  }

  const slug = await uniqueSlug(slugify(String(body?.slug || name)))
  const org = await prisma.organization.create({
    data: {
      name,
      slug,
      ownerId: auth.user.id,
      baseCurrency: String(body?.currency || "THB"),
      country: String(body?.country || "TH"),
      members: { create: { userId: auth.user.id, role: "owner" } },
    },
  })

  if (type === "merchant") {
    // Merchant workspace = a Store (not an organization)
    const store = await prisma.store.create({
      data: {
        userId: auth.user.id,
        name,
        currency: String(body?.currency || "THB"),
        vatRegistered: false,
      },
    })
    const storeSlug = `merchant-${store.id.slice(0, 8)}`
    return NextResponse.json({
      created: true,
      workspace: {
        slug: storeSlug,
        name: store.name,
        type: "merchant",
        href: `/w/${storeSlug}/dashboard`,
        source: "store",
        plan: "free",
      },
    }, { status: 201 })
  }

  return NextResponse.json({
    created: true,
    workspace: {
      slug: org.slug,
      name: org.name,
      type,
      href: `/w/${org.slug}/dashboard`,
      source: "organization",
      plan: "free",
    },
  }, { status: 201 })
}
