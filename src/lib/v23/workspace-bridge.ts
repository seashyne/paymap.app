
import { prisma } from "@/lib/prisma"
import type { CurrentUser } from "@/lib/authz"
import { getWorkspaceRegistryItem, type WorkspaceType } from "@/lib/v23/workspace-registry"

export type ResolvedWorkspace = {
  slug: string
  name: string
  type: WorkspaceType
  href: string
  source: "virtual" | "organization" | "store"
  plan: string
  meta?: Record<string, unknown>
}

function userSlug(type: WorkspaceType, userId: string) {
  return `${type}-${userId.slice(0, 8)}`
}

export function buildVirtualWorkspace(type: WorkspaceType, user: Pick<CurrentUser, "id" | "name" | "plan" | "productSubscriptions">): ResolvedWorkspace {
  const reg = getWorkspaceRegistryItem(type)
  const sub = user.productSubscriptions.find((s) => s.product === type && s.status === "active")
  return {
    slug: userSlug(type, user.id),
    name: type === "personal" ? `${user.name || "My"} Finance` : reg.label,
    type,
    href: `/w/${userSlug(type, user.id)}/dashboard`,
    source: "virtual",
    plan: sub?.planTier ?? (type === "personal" ? user.plan : "free"),
  }
}

export async function listUserWorkspaces(user: Pick<CurrentUser, "id" | "name" | "plan" | "productSubscriptions">) {
  const merchantPlan = user.productSubscriptions.find((s) => s.product === "merchant" && s.status === "active")?.planTier ?? "free"
  const businessPlan = user.productSubscriptions.find((s) => s.product === "business" && s.status === "active")?.planTier ?? "free"

  const [organizations, stores] = await Promise.all([
    prisma.organization.findMany({
      where: { OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }] },
      select: { id: true, slug: true, name: true, plan: true, _count: { select: { employees: true, members: true } } },
      orderBy: { createdAt: "asc" },
      take: 20,
    }),
    // Multi-workspace: user can have multiple stores (one per merchant workspace)
    prisma.store.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: "asc" },
      take: 20,
    }),
  ])

  const personal = buildVirtualWorkspace("personal", user)

  // Merchant workspaces — one per store
  const merchantWorkspaces: ResolvedWorkspace[] = stores.length > 0
    ? stores.map((store) => ({
        slug: `merchant-${store.id.slice(0, 8)}`,
        name: store.name,
        type: "merchant" as const,
        href: `/w/merchant-${store.id.slice(0, 8)}/dashboard`,
        source: "store" as const,
        plan: merchantPlan,
        meta: { storeId: store.id },
      }))
    : [buildVirtualWorkspace("merchant", user)]

  // Business workspaces — one per organization
  const businessWorkspaces: ResolvedWorkspace[] = organizations.length > 0
    ? organizations.map((org) => ({
        slug: org.slug,
        name: org.name,
        type: "business" as const,
        href: `/w/${org.slug}/dashboard`,
        source: "organization" as const,
        plan: businessPlan,
        meta: { organizationId: org.id, employees: org._count.employees },
      }))
    : [buildVirtualWorkspace("business", user)]

  return [personal, ...merchantWorkspaces, ...businessWorkspaces]
}

export async function resolveWorkspaceSlug(user: Pick<CurrentUser, "id" | "name" | "plan" | "productSubscriptions">, slug: string): Promise<ResolvedWorkspace | null> {
  const workspaces = await listUserWorkspaces(user)
  return workspaces.find((w) => w.slug === slug) ?? null
}

// Get the store for a given merchant workspace slug (for dashboard queries)
export async function resolveStoreFromSlug(userId: string, slug: string): Promise<string | null> {
  // slug format: merchant-{storeId.slice(0,8)}
  if (!slug.startsWith("merchant-")) return null
  const prefix = slug.replace("merchant-", "")
  const store = await prisma.store.findFirst({
    where: { userId, id: { startsWith: prefix } },
    select: { id: true },
  })
  return store?.id ?? null
}

// Get organization from workspace slug
export async function resolveOrgFromSlug(userId: string, slug: string) {
  return prisma.organization.findFirst({
    where: { slug, OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
  })
}
