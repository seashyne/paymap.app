import { prisma } from "@/server/db/prisma"
import type { CurrentUser } from "@/lib/authz"
import { createPlannerEntrySchema } from "@/features/planner/schemas/planner-schemas"
import { eventBus } from "@/server/events/event-bus"
import { auditLog } from "@/server/audit/audit-service"
import { realtime } from "@/server/realtime/realtime-service"
import { cacheDelete } from "@/server/cache/cache-service"

function resolveWorkspace(user: Pick<CurrentUser, "role" | "accountMode">, requested?: string | null) {
  if (user.role === "admin") return requested === "business" || requested === "merchant" ? requested : "personal"
  return user.accountMode
}

export async function listPlannerEntries(user: Pick<CurrentUser, "id" | "role" | "accountMode">, requestedWorkspace?: string | null) {
  const workspace = resolveWorkspace(user, requestedWorkspace)
  return prisma.plannerEntry.findMany({
    where: { userId: user.id, workspace, status: { not: "archived" } },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
    take: 50,
  })
}

export async function createPlannerEntry(user: Pick<CurrentUser, "id" | "role" | "accountMode">, input: unknown) {
  const data = createPlannerEntrySchema.parse(input)
  const workspace = user.role === "admin" ? data.workspace : user.accountMode
  const item = await prisma.plannerEntry.create({
    data: {
      userId: user.id,
      workspace,
      kind: data.kind,
      title: data.title,
      content: data.content || null,
      dueAt: data.dueAt ? new Date(data.dueAt) : null,
      priority: data.priority,
      relatedPath: data.relatedPath || null,
    },
  })
  await cacheDelete(`planner:${user.id}:${workspace}`)
  eventBus.emit("planner.entry_created", { userId: user.id, workspaceId: workspace, entryId: item.id, title: item.title })
  realtime.publish(`workspace:${workspace}`, { type: "planner.entry_created", entryId: item.id, title: item.title, workspaceId: workspace })
  await auditLog({ actorId: user.id, workspaceId: workspace, action: "planner.create", metadata: { entryId: item.id, kind: item.kind } })
  return item
}
