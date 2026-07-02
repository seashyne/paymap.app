export const dynamic = "force-dynamic"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireApiRole } from "@/lib/authz"
import { ok, badRequest, handleError } from "@/lib/api-response"

const STATUS_VALUES = new Set(["active", "archived"])

export async function GET(req: NextRequest) {
  const auth = await requireApiRole("admin")
  if ("error" in auth) return auth.error

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? ""
  const status = req.nextUrl.searchParams.get("status")?.trim() ?? ""

  const workspaces = await prisma.workspace.findMany({
    where: {
      ...(status && STATUS_VALUES.has(status) ? { status: status as any } : {}),
      ...(q ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
          { type: { equals: q as any } },
          { owner: { email: { contains: q, mode: "insensitive" } } },
          { owner: { name: { contains: q, mode: "insensitive" } } },
        ],
      } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      owner: { select: { id: true, email: true, name: true } },
      _count: { select: { members: true, subscriptions: true } },
    },
  })

  return ok(workspaces)
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireApiRole("admin")
    if ("error" in auth) return auth.error

    const body = await req.json().catch(() => ({}))
    const id = String(body.id ?? "").trim()
    const status = String(body.status ?? "").trim()
    if (!id) return badRequest("Workspace id is required")
    if (!STATUS_VALUES.has(status)) return badRequest("Invalid workspace status")

    const updated = await prisma.workspace.update({
      where: { id },
      data: { status: status as any },
      include: {
        owner: { select: { id: true, email: true, name: true } },
        _count: { select: { members: true, subscriptions: true } },
      },
    })

    await prisma.auditLog.create({ data: { userId: auth.user.id, action: "admin.workspace_status_updated", metadata: { workspaceId: id, status } } }).catch(() => undefined)
    return ok(updated, "Workspace updated")
  } catch (error) {
    return handleError(error)
  }
}
